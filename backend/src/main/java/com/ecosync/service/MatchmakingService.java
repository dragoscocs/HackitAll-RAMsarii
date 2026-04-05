package com.ecosync.service;

import com.ecosync.model.Employee;
import com.ecosync.model.MatchResponse;
import com.ecosync.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchmakingService {

    private final AiService aiService;
    private final MockDataService mockDataService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Cache matchmaking results for 5 minutes per (userId, activity)
    private record CacheEntry(List<MatchResponse> results, Instant expiresAt) {
    }

    private final Map<String, CacheEntry> matchCache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_SECONDS = 300;

    public MatchmakingService(AiService aiService,
            MockDataService mockDataService,
            UserRepository userRepository) {
        this.aiService = aiService;
        this.mockDataService = mockDataService;
        this.userRepository = userRepository;
    }

    public List<MatchResponse> findMatches(Long userId, String activity) {
        // ── 1. Resolve requester ─────────────────────────────────────────────
        User requester = userRepository.findById(userId).orElse(null);
        String requesterName = requester != null ? requester.getName() : "Coleg";
        String requesterCity = (requester != null && requester.getCity() != null)
                ? requester.getCity()
                : "București";
        List<String> requesterSports = (requester != null && requester.getPreferredSports() != null)
                ? requester.getPreferredSports()
                : List.of();

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

        if (scored.isEmpty())
            return List.of();

        // ── 4. Ask Gemini to write personalized messages (one call) ──────────
        Map<String, String> messages = generateMessages(requesterName, requesterSports, activity, scored);

        // ── 5. Build response ────────────────────────────────────────────────
        return scored.stream().map(sc -> {
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
    }

    // ── Compatibility algorithm ───────────────────────────────────────────────
    // 55% — candidate has the searched activity
    // 30% — Jaccard similarity of full sport profiles
    // 15% — sport-category overlap (partial match bonus)
    private double computeCompatibility(List<String> requesterSports,
            List<String> candidateSports,
            String activity) {
        if (candidateSports == null)
            candidateSports = List.of();

        Set<String> req = new HashSet<>(requesterSports);
        Set<String> cand = new HashSet<>(candidateSports);

        // Factor 1: has the searched sport?
        double activityMatch = cand.contains(activity) ? 0.55 : 0.0;

        // Factor 2: Jaccard
        Set<String> intersection = new HashSet<>(req);
        intersection.retainAll(cand);
        Set<String> union = new HashSet<>(req);
        union.addAll(cand);
        double jaccard = union.isEmpty() ? 0 : (double) intersection.size() / union.size();

        // Factor 3: category overlap — how many of candidate's sports share a
        // category with any of requester's sports (excluding exact matches)
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
                "You are SyncFit's AI matchmaking engine for a corporate wellness app.\n" +
                        "Employee %s from %s wants to play %s.\n\n" +
                        "%s\n\n" +
                        "Available colleagues:\n%s\n" +
                        "Rank by compatibility considering: shared sports, sport group similarity (e.g., Ping Pong ↔ Padel reflexes, "
                        +
                        "Yoga ↔ Swimming body awareness), age proximity, and personality fit from bios. " +
                        "Write a personalized 1-sentence reason in Romanian that feels natural and human — not robotic. "
                        +
                        "Reference specific details from their profile (age, sport level, bio) when relevant.\n\n" +
                        "Return ONLY valid JSON, no markdown, no extra text:\n" +
                        "{\"matches\": [{\"name\": \"...\", \"city\": \"...\", \"score\": 0.95, \"message\": \"...natural Romanian sentence...\"}]}\n\n"
                        +
                        "Include 3-5 best matches, ranked by compatibility score (0.0-1.0).",
                requesterName, requesterCity, activity,
                cityContext, employeeList.toString());

        String aiJsonResponse = aiService.getMatchmakingRecommendation(prompt);
        List<MatchResponse> results = parseMatchResponses(aiJsonResponse);

        // ── Enrich with city from employee pool (fallback if AI omitted city) ─
        for (MatchResponse mr : results) {
            if (mr.getCity() == null || mr.getCity().isBlank()) {
                pool.stream()
                        .filter(e -> e.getName().equalsIgnoreCase(mr.getMatchedEmployeeName()))
                        .findFirst()
                        .ifPresent(e -> mr.setCity(e.getCity()));
            }
        }

        return results;
    }

    private List<MatchResponse> parseMatchResponses(String json) {
        List<MatchResponse> results = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode matches = root.get("matches");
            if (matches != null && matches.isArray()) {
                for (JsonNode match : matches) {
                    MatchResponse mr = new MatchResponse(
                            match.get("name").asText(),
                            match.get("score").asDouble(),
                            match.get("message").asText());
                    JsonNode cityNode = match.get("city");
                    if (cityNode != null && !cityNode.isNull()) {
                        mr.setCity(cityNode.asText());
                    }
                    results.add(mr);
                }
            }
        } catch (Exception e) {
            results.add(new MatchResponse("Unknown", 0.0, "AI response could not be parsed."));
        }
        return results;
    }
}
