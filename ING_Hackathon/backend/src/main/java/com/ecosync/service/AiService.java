package com.ecosync.service;

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

    public AiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String getAiRecommendation(String prompt) {
        return getMockAiResponse(prompt);
    }

    private String getMockAiResponse(String prompt) {
        if (prompt.toLowerCase().contains("padel")) {
            return """
                    {
                      "matches": [
                        {
                          "name": "Ana Ionescu",
                          "score": 0.87,
                          "message": "Ana plays Ping Pong — her hand-eye coordination and fast reflexes translate perfectly to Padel. You'll have a great game!"
                        },
                        {
                          "name": "Elena Stancu",
                          "score": 0.95,
                          "message": "Elena already plays Padel and Badminton. She's your ideal partner — same city, same energy!"
                        },
                        {
                          "name": "Radu Mihalcea",
                          "score": 0.80,
                          "message": "Radu plays both Padel and Football. His stamina and court awareness make him a solid match."
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
                          "message": "Gigel's Padel background means great racket control. A smooth transition to Tennis!"
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
                      "message": "Maria is a versatile player. Her Ping Pong skills give her excellent reaction time for most racket sports."
                    }
                  ]
                }
                """;
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
}
