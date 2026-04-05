package com.ecosync.service;

import com.ecosync.model.MatchResponse;
import com.ecosync.model.User;
import com.ecosync.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class MatchmakingService {

    private final AiService aiService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Cache matchmaking results for 5 minutes per (userId, activity)
    private record CacheEntry(List<MatchResponse> results, Instant expiresAt) {}
    private final Map<String, CacheEntry> matchCache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_SECONDS = 300;

    // Sport categories for partial-match scoring
    private static final Map<String, String> SPORT_CATEGORY;
    static {
        SPORT_CATEGORY = new HashMap<>();
        for (String s : List.of("Padel", "Tennis", "Badminton", "Ping Pong", "Squash"))
            SPORT_CATEGORY.put(s, "RACKET");
        for (String s : List.of("Football", "Basketball", "Volleyball"))
            SPORT_CATEGORY.put(s, "TEAM");
        for (String s : List.of("Running", "Cycling", "Swimming", "Hiking"))
            SPORT_CATEGORY.put(s, "CARDIO");
        for (String s : List.of("Yoga", "Gym", "CrossFit", "Pilates"))
            SPORT_CATEGORY.put(s, "MINDFUL");
        for (String s : List.of("Ski", "Snowboarding"))
            SPORT_CATEGORY.put(s, "WINTER");
    }

    public MatchmakingService(AiService aiService, UserRepository userRepository) {
        this.aiService = aiService;
        this.userRepository = userRepository;
    }

    public List<MatchResponse> findMatches(Long userId, String activity) {
        // ── 0. Cache check ───────────────────────────────────────────────────
        String cacheKey = userId + ":" + activity.toLowerCase();
        CacheEntry cached = matchCache.get(cacheKey);
        if (cached != null && Instant.now().isBefore(cached.expiresAt())) {
            return cached.results();
        }

        // ── 1. Resolve requester ─────────────────────────────────────────────
        User requester = userRepository.findById(userId).orElse(null);
        String requesterName = requester != null ? requester.getName() : "Coleg";
        String requesterCity = (requester != null && requester.getCity() != null)
                ? requester.getCity() : "București";
        List<String> requesterSports = (requester != null && requester.getPreferredSports() != null)
                ? requester.getPreferredSports() : List.of();

        // ── 2. Get candidates from same city ─────────────────────────────────
        List<User> candidates = userRepository.findByCityIgnoreCaseAndIdNot(requesterCity, userId);

        // Fallback: expand to all users if fewer than 2 in city
        if (candidates.size() < 2) {
            candidates = userRepository.findAll().stream()
                    .filter(u -> !u.getId().equals(userId))
                    .collect(Collectors.toList());
        }

        // ── 3. Score each candidate locally ──────────────────────────────────
        List<ScoredCandidate> scored = candidates.stream()
                .map(c -> new ScoredCandidate(c,
                        computeCompatibility(requesterSports, c.getPreferredSports(), activity)))
                .sorted(Comparator.comparingDouble(ScoredCandidate::score).reversed())
                .limit(5)
                .collect(Collectors.toList());

        if (scored.isEmpty()) return List.of();

        // ── 4. Ask Gemini to write personalized messages (one call) ──────────
        Map<String, String> messages = generateMessages(requesterName, requesterSports, activity, scored);

        // ── 5. Build response ────────────────────────────────────────────────
        List<MatchResponse> results = scored.stream().map(sc -> {
            User u = sc.user();
            MatchResponse mr = new MatchResponse(u.getName(), sc.score(), "");
            mr.setCity(u.getCity());
            mr.setSports(u.getPreferredSports());
            mr.setAge(u.getAge());
            mr.setGender(u.getGender());
            mr.setAiCustomMessage(
                    messages.getOrDefault(u.getName(),
                            "Colegi compatibili pentru " + activity + "!"));
            return mr;
        }).collect(Collectors.toList());

        // ── 6. Store in cache ────────────────────────────────────────────────
        matchCache.put(cacheKey, new CacheEntry(results, Instant.now().plusSeconds(CACHE_TTL_SECONDS)));
        return results;
    }

    // ── Compatibility algorithm ───────────────────────────────────────────────
    //  55% — candidate has the searched activity
    //  30% — Jaccard similarity of full sport profiles
    //  15% — sport-category overlap (partial match bonus)
    private double computeCompatibility(List<String> requesterSports,
                                        List<String> candidateSports,
                                        String activity) {
        if (candidateSports == null) candidateSports = List.of();

        Set<String> req  = new HashSet<>(requesterSports);
        Set<String> cand = new HashSet<>(candidateSports);

        // Factor 1: has the searched sport?
        double activityMatch = cand.contains(activity) ? 0.55 : 0.0;

        // Factor 2: Jaccard
        Set<String> intersection = new HashSet<>(req); intersection.retainAll(cand);
        Set<String> union        = new HashSet<>(req); union.addAll(cand);
        double jaccard = union.isEmpty() ? 0 : (double) intersection.size() / union.size();

        // Factor 3: category overlap — how many of candidate's sports share a
        //           category with any of requester's sports (excluding exact matches)
        long categoryMatches = cand.stream()
                .filter(cs -> !req.contains(cs)) // not already counted in jaccard
                .filter(cs -> req.stream().anyMatch(rs -> sameCategory(rs, cs)))
                .count();
        double categoryScore = Math.min(1.0, categoryMatches / 2.0);

        return Math.min(1.0, activityMatch + 0.30 * jaccard + 0.15 * categoryScore);
    }

    private boolean sameCategory(String a, String b) {
        String ca = SPORT_CATEGORY.get(a);
        String cb = SPORT_CATEGORY.get(b);
        return ca != null && ca.equals(cb);
    }

    // ── Ask Gemini for messages for all top-N candidates in one call ──────────
    private Map<String, String> generateMessages(String requesterName,
                                                  List<String> requesterSports,
                                                  String activity,
                                                  List<ScoredCandidate> candidates) {
        StringBuilder candidateList = new StringBuilder();
        for (int i = 0; i < candidates.size(); i++) {
            User u = candidates.get(i).user();
            String profile = String.format("%d. %s (%s%s): sporturi: %s",
                    i + 1,
                    u.getName(),
                    u.getAge() != null ? u.getAge() + "ani, " : "",
                    u.getGender() != null ? u.getGender().equals("F") ? "F" : "M" : "",
                    String.join(", ", u.getPreferredSports() != null ? u.getPreferredSports() : List.of()));
            candidateList.append(profile).append("\n");
        }

        String prompt = String.format(
                "Ești asistentul de matchmaking sportiv SyncFit.\n" +
                "%s (sporturi: %s) caută un partener de %s.\n\n" +
                "Colegi compatibili (deja clasați de algoritm):\n%s\n" +
                "Scrie un mesaj cald, natural, O singură propoziție în română pentru fiecare coleg, " +
                "explicând de ce se potrivesc cu %s pentru %s. " +
                "Menționează sporturile comune sau categoria similară. Fii concis și prietenos, nu robotic.\n\n" +
                "Returnează DOAR JSON valid, fără markdown:\n" +
                "{\"messages\": [{\"name\": \"...\", \"message\": \"...\"}, ...]}\n",
                requesterName, String.join(", ", requesterSports),
                activity, candidateList.toString(),
                requesterName, activity
        );

        String raw = aiService.getAiRecommendation(prompt);
        Map<String, String> result = new HashMap<>();
        try {
            JsonNode root = objectMapper.readTree(raw);
            JsonNode msgs = root.get("messages");
            if (msgs != null && msgs.isArray()) {
                for (JsonNode node : msgs) {
                    String name = node.path("name").asText();
                    String msg  = node.path("message").asText();
                    if (!name.isBlank()) result.put(name, msg);
                }
            }
        } catch (Exception ignored) {}
        return result;
    }

    private record ScoredCandidate(User user, double score) {}
}
