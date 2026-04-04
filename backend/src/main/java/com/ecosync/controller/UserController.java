package com.ecosync.controller;

import com.ecosync.model.User;
import com.ecosync.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** Called after the work-location modal is completed */
    @PostMapping("/{userId}/work-location")
    public ResponseEntity<Map<String, Object>> setWorkLocation(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {

        String location = body.get("workLocation");
        if (!"HOME".equals(location) && !"OFFICE".equals(location)) {
            return ResponseEntity.badRequest().body(Map.of("error", "workLocation must be HOME or OFFICE"));
        }

        userRepository.findById(userId).ifPresent(user -> {
            user.setWorkLocation(location);
            userRepository.save(user);
        });

        return ResponseEntity.ok(Map.of("success", true, "workLocation", location));
    }

    /** Returns real-time stats for the dashboard */
    @GetMapping("/{userId}/stats")
    public ResponseEntity<?> getStats(@PathVariable Long userId) {
        return userRepository.findById(userId)
            .map(user -> ResponseEntity.ok(Map.of(
                "breaksTakenToday", user.getBreaksTakenToday(),
                "currentStreak",    user.getCurrentStreak(),
                "matchesThisMonth", user.getMatchesThisMonth(),
                "workLocation",     user.getWorkLocation() != null ? user.getWorkLocation() : ""
            )))
            .orElse(ResponseEntity.notFound().build());
    }

    /** Increment matchesThisMonth when a user joins/initiates a match */
    @PostMapping("/{userId}/record-match")
    public ResponseEntity<Map<String, Object>> recordMatch(@PathVariable Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setMatchesThisMonth(user.getMatchesThisMonth() + 1);
            userRepository.save(user);
        });
        return ResponseEntity.ok(Map.of("success", true));
    }
}
