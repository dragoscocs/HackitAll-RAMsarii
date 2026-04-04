package com.ecosync.controller;

import com.ecosync.model.MatchResponse;
import com.ecosync.service.MatchmakingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matchmaking")
public class MatchmakingController {

    private final MatchmakingService matchmakingService;

    public MatchmakingController(MatchmakingService matchmakingService) {
        this.matchmakingService = matchmakingService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<MatchResponse>> findMatches(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "Padel") String activity) {

        List<MatchResponse> matches = matchmakingService.findMatches(userId, activity);
        return ResponseEntity.ok(matches);
    }
}
