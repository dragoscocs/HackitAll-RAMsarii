package com.ecosync.service;

import com.ecosync.controller.ChatController.ChatMessage;
import com.ecosync.controller.ChatController.ChatRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AiService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, String> responseCache = new ConcurrentHashMap<>();

    private static final String SYSTEM_PROMPT =
        "SYSTEM: Ești EcoSync, asistent AI corporate. " +
        "REGULI: " +
        "1. Răspunde în MAXIM 40 de cuvinte. " +
        "2. Analizează imaginile încărcate SAU răspunde doar despre sport, nutriție, ergonomie. " +
        "3. Refuză politicos orice alt subiect. " +
        "CONTEXT CONVERSAȚIE:";

    public AiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String getChatReply(ChatRequest request) {
        List<ChatMessage> history = request.history();
        String imageBase64 = request.imageBase64();

        if ((history == null || history.isEmpty()) && (imageBase64 == null || imageBase64.isBlank())) {
            return "Te ajut doar cu wellbeing și sport.";
        }

        if (imageBase64 != null && !imageBase64.isBlank()) {
            String textPrompt = buildConversationContext(history != null ? history : List.of());
            try {
                return extractAndCleanJson(callGeminiMultimodal(textPrompt, imageBase64));
            } catch (Exception e) {
                System.err.println("[ChatError-Multimodal] " + e.getClass().getSimpleName() + ": " + e.getMessage());
                return "Ne pare rău, nu pot analiza imaginea acum. Încearcă din nou!";
            }
        }

        String lastUserMessage = history.stream()
            .filter(m -> "user".equals(m.role()))
            .reduce((first, second) -> second)
            .map(ChatMessage::content)
            .orElse("");

        String cacheKey = lastUserMessage.toLowerCase().trim();

        if (responseCache.containsKey(cacheKey)) {
            return responseCache.get(cacheKey);
        }

        try {
            String rawResponse = callGeminiApi(buildConversationContext(history));
            String reply = extractAndCleanJson(rawResponse);
            responseCache.put(cacheKey, reply);
            return reply;
        } catch (Exception e) {
            System.err.println("[ChatError] " + e.getClass().getSimpleName() + ": " + e.getMessage());
            return "Ne pare rău, nu pot răspunde acum. Încearcă din nou!";
        }
    }

    private String buildConversationContext(List<ChatMessage> history) {
        StringBuilder context = new StringBuilder(SYSTEM_PROMPT).append("\n");
        for (ChatMessage msg : history) {
            context.append(msg.role().toUpperCase()).append(": ").append(msg.content()).append("\n");
        }
        return context.toString();
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

    /**
     * Constructs a Gemini multimodal request with both a text prompt and an inline Base64-encoded image.
     * The `parts` array must contain the text part first, followed by the inlineData part,
     * as required by the GenerativeLanguage API spec.
     */
    private String callGeminiMultimodal(String textPrompt, String imageBase64) {
        Map<String, Object> textPart = Map.of("text", textPrompt);
        Map<String, Object> imagePart = Map.of(
            "inlineData", Map.of(
                "mimeType", "image/jpeg",
                "data", imageBase64
            )
        );
        Map<String, Object> requestBody = Map.of(
            "contents", new Object[]{
                Map.of("parts", new Object[]{ textPart, imagePart })
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
