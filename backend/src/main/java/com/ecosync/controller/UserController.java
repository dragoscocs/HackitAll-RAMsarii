package com.ecosync.controller;

import com.ecosync.model.User;
import com.ecosync.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
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

    /** Update entire user profile */
    @PutMapping("/{userId}")
    public ResponseEntity<User> updateProfile(@PathVariable Long userId, @RequestBody User profileData) {
        return userRepository.findById(userId).map(user -> {
            if (profileData.getName() != null) user.setName(profileData.getName());
            if (profileData.getCity() != null) user.setCity(profileData.getCity());
            if (profileData.getPreferredSports() != null) user.setPreferredSports(profileData.getPreferredSports());
            if (profileData.getWorkSchedule() != null) user.setWorkSchedule(profileData.getWorkSchedule());
            if (profileData.getUserPersonaPrompt() != null) user.setUserPersonaPrompt(profileData.getUserPersonaPrompt());
            if (profileData.getUserHealthLimits() != null) user.setUserHealthLimits(profileData.getUserHealthLimits());
            
            User saved = userRepository.save(user);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Returns the last 6 months of match activity for the XOY chart.
     * The current month uses the real matchesThisMonth value.
     * Previous months are seeded deterministically from the userId so they're stable.
     */
    @GetMapping("/{userId}/match-history")
    public ResponseEntity<?> getMatchHistory(@PathVariable Long userId) {
        return userRepository.findById(userId).map(user -> {
            LocalDate today = LocalDate.now();
            List<Map<String, Object>> history = new ArrayList<>();

            // Seed based on userId for deterministic "historical" data
            long seed = userId * 31L;
            int[] pseudoRandom = {
                (int)(seed % 5) + 2,
                (int)((seed * 7) % 6) + 1,
                (int)((seed * 13) % 8) + 3,
                (int)((seed * 17) % 7) + 2,
                (int)((seed * 23) % 9) + 1
            };

            for (int i = 5; i >= 1; i--) {
                LocalDate month = today.minusMonths(i);
                String label = month.getMonth().getDisplayName(TextStyle.SHORT, new Locale("ro", "RO"));
                history.add(Map.of(
                    "month", label,
                    "matches", pseudoRandom[5 - i]
                ));
            }

            // Current month — real data
            String currentLabel = today.getMonth().getDisplayName(TextStyle.SHORT, new Locale("ro", "RO"));
            history.add(Map.of(
                "month", currentLabel,
                "matches", user.getMatchesThisMonth()
            ));

            return ResponseEntity.ok(history);
        }).orElse(ResponseEntity.notFound().build());
    }
}

