package com.ecosync.service;

import com.ecosync.model.Employee;
import com.ecosync.model.MatchResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MatchmakingService {

    private final AiService aiService;
    private final MockDataService mockDataService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MatchmakingService(AiService aiService, MockDataService mockDataService) {
        this.aiService = aiService;
        this.mockDataService = mockDataService;
    }

    public List<MatchResponse> findMatches(Long userId, String activity) {
        List<Employee> allEmployees = mockDataService.getAllEmployees();
        Optional<Employee> requesterOpt = mockDataService.findById(userId);

        String requesterName = requesterOpt.map(Employee::getName).orElse("Employee");
        String requesterCity = requesterOpt.map(Employee::getCity).orElse("Bucharest");

        StringBuilder employeeList = new StringBuilder();
        for (Employee emp : allEmployees) {
            if (!emp.getId().equals(userId)) {
                employeeList.append(String.format("- %s (%s): sports: %s\n",
                        emp.getName(), emp.getCity(), String.join(", ", emp.getPreferredSports())));
            }
        }

        String prompt = String.format(
                "You are a smart matchmaking AI for a corporate wellness app called EcoSync.\n" +
                "Employee %s from %s wants to play %s.\n\n" +
                "Available colleagues:\n%s\n" +
                "Use cross-sport reasoning (e.g., Ping Pong players have great reflexes for Padel, " +
                "Yoga practitioners have body awareness useful for most sports).\n" +
                "Consider city proximity as a positive factor.\n\n" +
                "Return ONLY valid JSON, no markdown, no extra text:\n" +
                "{\"matches\": [{\"name\": \"...\", \"score\": 0.95, \"message\": \"...personalized 1-sentence explanation...\"}]}\n\n" +
                "Include 2-4 best matches, ranked by compatibility score (0.0-1.0).",
                requesterName, requesterCity, activity, employeeList.toString()
        );

        String aiJsonResponse = aiService.getAiRecommendation(prompt);
        return parseMatchResponses(aiJsonResponse);
    }

    private List<MatchResponse> parseMatchResponses(String json) {
        List<MatchResponse> results = new ArrayList<>();
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode matches = root.get("matches");
            if (matches != null && matches.isArray()) {
                for (JsonNode match : matches) {
                    results.add(new MatchResponse(
                            match.get("name").asText(),
                            match.get("score").asDouble(),
                            match.get("message").asText()
                    ));
                }
            }
        } catch (Exception e) {
            results.add(new MatchResponse("Unknown", 0.0, "AI response could not be parsed."));
        }
        return results;
    }
}
