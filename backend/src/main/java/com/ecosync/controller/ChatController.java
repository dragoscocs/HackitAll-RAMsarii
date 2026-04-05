package com.ecosync.controller;

import com.ecosync.service.AiService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.ecosync.model.User;
import com.ecosync.model.SmartBreakRequest;
import com.ecosync.model.SmartBreakResponse;
import com.ecosync.repository.UserRepository;
import org.springframework.http.ResponseEntity;

@RestController
@CrossOrigin(origins = "*")
public class ChatController {

    public record ChatMessage(String role, String content) {}
    public record ChatRequest(List<ChatMessage> history, String imageBase64, Long userId) {}

    private final AiService aiService;
    private final UserRepository userRepository;

    public ChatController(AiService aiService, UserRepository userRepository) {
        this.aiService = aiService;
        this.userRepository = userRepository;
    }

    @PostMapping("/api/chat")
    public String chat(@RequestBody ChatRequest request) {
        User user = (request.userId() != null)
                ? userRepository.findById(request.userId()).orElse(null)
                : null;
        return aiService.getChatReply(request, user);
    }

    @PostMapping("/api/ai/smart-break/{userId}")
    public ResponseEntity<SmartBreakResponse> generateSmartBreak(
            @PathVariable Long userId,
            @RequestBody SmartBreakRequest request) {
        
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        SmartBreakResponse response = aiService.generateSmartBreak(user, request);
        return ResponseEntity.ok(response);
    }
}
