package com.ecosync.controller;

import com.ecosync.service.AiService;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
public class ChatController {

    public record ChatRequest(String prompt) {}

    private final AiService aiService;

    public ChatController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/api/chat")
    public String chat(@RequestBody ChatRequest request) {
        return aiService.getChatReply(request.prompt());
    }
}
