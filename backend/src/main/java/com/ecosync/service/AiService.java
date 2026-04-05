package com.ecosync.service;

import com.ecosync.controller.ChatController.ChatMessage;
import com.ecosync.controller.ChatController.ChatRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import com.ecosync.model.User;
import com.ecosync.model.SmartBreakRequest;
import com.ecosync.model.SmartBreakResponse;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.time.Instant;

@Service
public class AiService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.key.matchmaking:}")
    private String geminiApiKeyMatchmaking;

    @Value("${gemini.api.key.chat:}")
    private String geminiApiKeyChat;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent}")
    private String geminiApiUrl;

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, String> responseCache = new ConcurrentHashMap<>();

    // ── Rate-limit & cache for break suggestions ─────────────────────────────
    private volatile Instant lastGeminiCall = Instant.EPOCH;
    private static final long MIN_CALL_INTERVAL_MS = 5_000; // 5s between calls
    private final Map<String, CachedResponse> breakCache = new ConcurrentHashMap<>();
    private static final long BREAK_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

    private record CachedResponse(String text, long timestamp) {
        boolean isExpired() { return System.currentTimeMillis() - timestamp > BREAK_CACHE_TTL_MS; }
    }

    private static final String BASE_RULES =
            " REGULI: " +
            "1. Răspunde în MAXIM 40 de cuvinte. " +
            "2. Analizează imaginile încărcate SAU răspunde doar despre sport, nutriție, ergonomie. " +
            "3. Refuză politicos orice alt subiect. " +
            "CONTEXT CONVERSAȚIE:";

    private String buildSystemPrompt(User user) {
        String persona = (user != null
                && user.getUserPersonaPrompt() != null
                && !user.getUserPersonaPrompt().isBlank())
                ? user.getUserPersonaPrompt()
                : "Ești SyncFit, asistent AI corporate prietenos.";
        return "SYSTEM: " + persona + BASE_RULES;
    }

    public AiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String getChatReply(ChatRequest request, User user) {
        List<ChatMessage> history = request.history();
        String imageBase64 = request.imageBase64();

        if ((history == null || history.isEmpty()) && (imageBase64 == null || imageBase64.isBlank())) {
            return "Te ajut doar cu wellbeing și sport.";
        }

        if (geminiApiKeyChat == null || geminiApiKeyChat.isBlank()) {
            System.err.println("[ChatError] gemini.api.key.chat is not configured — restart the backend after setting it in application.properties");
            return "Configurare lipsă. Restartează backend-ul.";
        }

        if (imageBase64 != null && !imageBase64.isBlank()) {
            String textPrompt = buildConversationContext(history != null ? history : List.of(), user);
            try {
                return extractAndCleanJson(callGeminiMultimodal(textPrompt, imageBase64, geminiApiKeyChat));
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

        // Cache key includes userId so persona changes take effect immediately
        String cacheKey = (user != null ? user.getId() + ":" : "") + lastUserMessage.toLowerCase().trim();

        if (responseCache.containsKey(cacheKey)) {
            return responseCache.get(cacheKey);
        }

        try {
            String rawResponse = callGeminiApi(buildConversationContext(history, user), null, geminiApiKeyChat);
            String reply = extractAndCleanJson(rawResponse);
            responseCache.put(cacheKey, reply);
            return reply;
        } catch (Exception e) {
            System.err.println("[ChatError] " + e.getClass().getSimpleName() + ": " + e.getMessage());
            return "Ne pare rău, nu pot răspunde acum. Încearcă din nou!";
        }
    }

    private String buildConversationContext(List<ChatMessage> history, User user) {
        StringBuilder context = new StringBuilder(buildSystemPrompt(user)).append("\n");
        for (ChatMessage msg : history) {
            context.append(msg.role().toUpperCase()).append(": ").append(msg.content()).append("\n");
        }
        return context.toString();
    }

    public String getAiRecommendation(String prompt) {
        // ── Check break cache first ──────────────────────────────────────────
        String cacheKey = prompt.length() > 80 ? prompt.substring(0, 80) : prompt;
        CachedResponse cached = breakCache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            System.out.println("[AiService] Break suggestion served from cache (saves 1 prompt)");
            return cached.text();
        }

        if (geminiApiKey != null && !geminiApiKey.isEmpty()) {
            // ── Rate-limit: enforce minimum interval between calls ───────────
            long elapsed = Instant.now().toEpochMilli() - lastGeminiCall.toEpochMilli();
            if (elapsed < MIN_CALL_INTERVAL_MS) {
                System.out.println("[AiService] Rate-limited (" + elapsed + "ms since last call). Using fallback.");
                return getMockAiResponse(prompt);
            }
            try {
                lastGeminiCall = Instant.now();
                String rawResponse = callGeminiApi(prompt);
                String result = extractAndCleanJson(rawResponse);
                // Cache the successful result
                breakCache.put(cacheKey, new CachedResponse(result, System.currentTimeMillis()));
                return result;
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

    public String getMatchmakingRecommendation(String prompt) {
        if (geminiApiKeyMatchmaking != null && !geminiApiKeyMatchmaking.isEmpty()) {
            try {
                String rawResponse = callGeminiApi(prompt, null, geminiApiKeyMatchmaking);
                return extractAndCleanJson(rawResponse);
            } catch (Exception e) {
                System.err.println("[AiService] Matchmaking Gemini API error: " + e.getMessage());
            }
        }
        return getMockAiResponse(prompt);
    }

    private String callGeminiApi(String prompt) {
        return callGeminiApi(prompt, null, geminiApiKey);
    }


    private String callGeminiApi(String prompt, Map<String, Object> generationConfig) {
        return callGeminiApi(prompt, generationConfig, geminiApiKey);
    }

    private String callGeminiApi(String prompt, Map<String, Object> generationConfig, String apiKey) {
        Map<String, Object> requestBody;
        if (generationConfig != null) {
            requestBody = Map.of(
                    "contents", new Object[] { Map.of("parts", new Object[] { Map.of("text", prompt) }) },
                    "generationConfig", generationConfig);
        } else {
            requestBody = Map.of(
                    "contents", new Object[] { Map.of("parts", new Object[] { Map.of("text", prompt) }) });
        }

        return webClient.post()
                .uri(geminiApiUrl + "?key=" + apiKey)
                .header("Content-Type", "application/json")
                .body(Mono.just(requestBody), Map.class)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    public SmartBreakResponse generateSmartBreak(User user, SmartBreakRequest request) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return new SmartBreakResponse("Pauză de Apă", "Timp pentru un pahar cu apă rece. Relaxează-te un minut!", 2,
                    "hydrate");
        }

        String persona = (user.getUserPersonaPrompt() != null && !user.getUserPersonaPrompt().isBlank())
                ? user.getUserPersonaPrompt()
                : "Ești un antrenor de wellbeing empatic și profesionist.";

        String healthLimits = (user.getUserHealthLimits() != null && !user.getUserHealthLimits().isBlank())
                ? user.getUserHealthLimits()
                : "Nicio limitare fizică menționată.";

        String preferredSports = (user.getPreferredSports() != null && !user.getPreferredSports().isEmpty())
                ? String.join(", ", user.getPreferredSports())
                : "Niciun sport preferat setat.";

        String prompt = String.format(
                "SYSTEM INSTRUCTION:\\n" +
                        "You are generating a highly personalized short break for a user working at a desk.\\n" +
                        "TONE/PERSONA (CRITICAL): %s\\n" +
                        "HEALTH LIMITS (ABSOLUTE BOUNDARY, NEVER VIOLATE): %s\\n" +
                        "FAVORITE SPORTS (Try to relate the break to these if possible): %s\\n\\n" +
                        "DYNAMIC CONTEXT:\\n" +
                        "- Current Mood (1=exhausted, 5=energetic): %d\\n" +
                        "- Schedule Context: %s\\n" +
                        "- Local Time: %s\\n\\n" +
                        "TASK: Generate a break recommendation that perfectly matches the persona's tone, fits their energy level (%d), accommodates their schedule context, and strictly respects their health limits.\\n"
                        +
                        "Return the output STRICTLY in Romanian (description_ro) using the exact JSON schema requested.",
                persona, healthLimits, preferredSports, request.currentMood(), request.scheduleContext(),
                request.timeOfDay(), request.currentMood());

        Map<String, Object> schema = Map.of(
                "type", "object",
                "properties", Map.of(
                        "break_title", Map.of("type", "string"),
                        "description_ro", Map.of("type", "string"),
                        "duration_minutes", Map.of("type", "integer"),
                        "activity_type",
                        Map.of("type", "string", "enum",
                                List.of("stretch", "hydrate", "breathe", "walk", "mindfulness"))),
                "required", List.of("break_title", "description_ro", "duration_minutes", "activity_type"));

        Map<String, Object> generationConfig = Map.of(
                "responseMimeType", "application/json",
                "responseSchema", schema);

        try {
            String rawResponse = callGeminiApi(prompt, generationConfig);
            String jsonText = extractAndCleanJson(rawResponse);
            return objectMapper.readValue(jsonText, SmartBreakResponse.class);
        } catch (Exception e) {
            System.err.println("[SmartBreak Error]: " + e.getMessage());
            return new SmartBreakResponse("Respiră Adânc",
                    "Ia o mică pauză și respiră de 10 ori adânc pentru a te deconecta.", 3, "breathe");
        }
    }

    /**
     * Constructs a Gemini multimodal request with both a text prompt and an inline
     * Base64-encoded image.
     * The `parts` array must contain the text part first, followed by the
     * inlineData part,
     * as required by the GenerativeLanguage API spec.
     */
    private String callGeminiMultimodal(String textPrompt, String imageBase64, String apiKey) {
        Map<String, Object> textPart = Map.of("text", textPrompt);
        Map<String, Object> imagePart = Map.of(
                "inlineData", Map.of(
                        "mimeType", "image/jpeg",
                        "data", imageBase64));
        Map<String, Object> requestBody = Map.of(
                "contents", new Object[] {
                        Map.of("parts", new Object[] { textPart, imagePart })
                });
        return webClient.post()
                .uri(geminiApiUrl + "?key=" + apiKey)
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
