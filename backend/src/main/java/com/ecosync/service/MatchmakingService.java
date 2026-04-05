package com.ecosync.service;

import com.ecosync.model.Employee;
import com.ecosync.model.MatchResponse;
import com.ecosync.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MatchmakingService {

    private final AiService aiService;
    private final MockDataService mockDataService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MatchmakingService(AiService aiService,
                              MockDataService mockDataService,
                              UserRepository userRepository) {
        this.aiService       = aiService;
        this.mockDataService = mockDataService;
        this.userRepository  = userRepository;
    }

    public List<MatchResponse> findMatches(Long userId, String activity) {
        List<Employee> allEmployees = mockDataService.getAllEmployees();

        // ── Resolve requester info: prefer real DB user, fall back to mock ────
        String requesterName = userRepository.findById(userId)
                .map(u -> u.getName())
                .orElseGet(() -> mockDataService.findById(userId)
                        .map(Employee::getName)
                        .orElse("Coleg"));

        String requesterCity = userRepository.findById(userId)
                .map(u -> u.getCity())
                .orElseGet(() -> mockDataService.findById(userId)
                        .map(Employee::getCity)
                        .orElse("București"));

        // ── Filter pool: same city first, fall back to all if < 2 matches ───
        final String cityKey = requesterCity;
        List<Employee> sameCity = allEmployees.stream()
                .filter(e -> !e.getId().equals(userId))
                .filter(e -> e.getCity().equalsIgnoreCase(cityKey))
                .collect(Collectors.toList());

        List<Employee> pool = sameCity.size() >= 2 ? sameCity
                : allEmployees.stream()
                        .filter(e -> !e.getId().equals(userId))
                        .collect(Collectors.toList());

        // ── Build employee list for the prompt ───────────────────────────────
        StringBuilder employeeList = new StringBuilder();
        for (Employee emp : pool) {
            String ageGender = (emp.getAge() > 0 && emp.getGender() != null)
                    ? emp.getAge() + "yo " + emp.getGender() + ", "
                    : "";
            String role = (emp.getRole() != null) ? emp.getRole() + ", " : "";
            employeeList.append(String.format("- %s (%s%s%s): sports: %s%s\n",
                    emp.getName(), ageGender, role, emp.getCity(),
                    String.join(", ", emp.getPreferredSports()),
                    emp.getBio() != null ? " | bio: " + emp.getBio() : ""));
        }

        String cityContext = sameCity.size() >= 2
                ? String.format("All listed colleagues are from %s — same city as the requester.", requesterCity)
                : String.format("NOTE: Fewer than 2 colleagues from %s were available, so the list includes people from other cities too.", requesterCity);

        String prompt = String.format(
                "You are SyncFit's AI matchmaking engine for a corporate wellness app.\n" +
                "Employee %s from %s wants to play %s.\n\n" +
                "%s\n\n" +
                "Available colleagues:\n%s\n" +
                "Rank by compatibility considering: shared sports, sport group similarity (e.g., Ping Pong ↔ Padel reflexes, " +
                "Yoga ↔ Swimming body awareness), age proximity, and personality fit from bios. " +
                "Write a personalized 1-sentence reason in Romanian that feels natural and human — not robotic. " +
                "Reference specific details from their profile (age, sport level, bio) when relevant.\n\n" +
                "Return ONLY valid JSON, no markdown, no extra text:\n" +
                "{\"matches\": [{\"name\": \"...\", \"city\": \"...\", \"score\": 0.95, \"message\": \"...natural Romanian sentence...\"}]}\n\n" +
                "Include 3-5 best matches, ranked by compatibility score (0.0-1.0).",
                requesterName, requesterCity, activity,
                cityContext, employeeList.toString()
        );

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
                            match.get("message").asText()
                    );
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
