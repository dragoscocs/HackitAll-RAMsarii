package com.ecosync.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class AiService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String getChatReply(String userMessage) {
        String fullPrompt = "Ești EcoSync, un asistent de wellbeing corporate prietenos. Răspunde scurt, la obiect, în maxim 2-3 propoziții la următoarea întrebare: " + userMessage;
        try {
            String rawResponse = callGeminiApi(fullPrompt);
            return extractAndCleanJson(rawResponse);
        } catch (Exception e) {
            System.err.println("[ChatError] " + e.getClass().getSimpleName() + ": " + e.getMessage());
            return "Ne pare rău, nu pot răspunde acum. Încearcă din nou!";
        }
    }

    public String getAiRecommendation(String prompt) {
        if (geminiApiKey != null && !geminiApiKey.isEmpty()) {
            try {
                String rawResponse = callGeminiApi(prompt);
                return extractAndCleanJson(rawResponse);
            } catch (Exception e) {
                System.err.println("[AiService] Gemini API error, using fallback: " + e.getMessage());
            }
        }
        return getMockAiResponse(prompt);
    }

    private String extractAndCleanJson(String geminiResponse) throws Exception {
        JsonNode root = objectMapper.readTree(geminiResponse);
        String text = root.path("candidates").get(0)
                          .path("content").path("parts").get(0)
                          .path("text").asText();
        // Strip markdown code fences if Gemini wrapped the JSON
        text = text.replaceAll("(?s)```json\\s*", "")
                   .replaceAll("(?s)```\\s*", "")
                   .trim();
        return text;
    }

    private String callGeminiApi(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text", prompt)
                        })
                }
        );

        return webClient.post()
                .uri(geminiApiUrl + "?key=" + geminiApiKey)
                .header("Content-Type", "application/json")
                .body(Mono.just(requestBody), Map.class)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    private String getMockAiResponse(String prompt) {
        if (prompt.toLowerCase().contains("padel")) {
            return """
                    {
                      "matches": [
                        {
                          "name": "Elena Stancu",
                          "score": 0.95,
                          "message": "Elena plays Padel and Badminton. Same city, same energy — ideal partner!"
                        },
                        {
                          "name": "Ana Ionescu",
                          "score": 0.87,
                          "message": "Ana's Ping Pong reflexes translate perfectly to Padel. You'll click immediately."
                        },
                        {
                          "name": "Radu Mihalcea",
                          "score": 0.80,
                          "message": "Radu plays Padel and Football — great stamina and court awareness."
                        }
                      ]
                    }
                    """;
        }

        if (prompt.toLowerCase().contains("tennis")) {
            return """
                    {
                      "matches": [
                        {
                          "name": "Bogdan Dumitrescu",
                          "score": 0.92,
                          "message": "Bogdan is an avid Tennis player — he'll match your intensity and push your game forward."
                        },
                        {
                          "name": "Gigel Popescu",
                          "score": 0.85,
                          "message": "Gigel's Padel background gives great racket control. Smooth transition to Tennis!"
                        }
                      ]
                    }
                    """;
        }

        return """
                {
                  "matches": [
                    {
                      "name": "Maria Constantin",
                      "score": 0.75,
                      "message": "Maria is versatile. Her Ping Pong skills give excellent reaction time for most sports."
                    }
                  ]
                }
                """;
    }
}
