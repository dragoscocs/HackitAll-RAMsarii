package com.ecosync.service;

import com.ecosync.model.MatchResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class MatchmakingService {

    private final AiService aiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MatchmakingService(AiService aiService) {
        this.aiService = aiService;
    }

    public List<MatchResponse> findMatches(Long userId, String activity) {
        String prompt = String.format(
                "Find the best sport activity matches for employee with id %d who wants to play %s. " +
                "Use cross-sport reasoning: e.g., Ping Pong players have great reflexes for Padel. " +
                "Return a ranked list with name, match score (0-1), and a personalized explanation.",
                userId, activity
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
