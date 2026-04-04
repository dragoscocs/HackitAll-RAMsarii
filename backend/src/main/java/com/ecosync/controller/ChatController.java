package com.ecosync.controller;

import com.ecosync.service.AiService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class ChatController {

    public record ChatMessage(String role, String content) {}
    public record ChatRequest(List<ChatMessage> history, String imageBase64) {}

    private final AiService aiService;

    public ChatController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/api/chat")
    public String chat(@RequestBody ChatRequest request) {
        return aiService.getChatReply(request);
    }
}
