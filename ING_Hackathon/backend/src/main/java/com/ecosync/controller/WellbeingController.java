package com.ecosync.controller;

import com.ecosync.model.BreakSuggestion;
import com.ecosync.service.WellbeingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/breaks")
public class WellbeingController {

    private final WellbeingService wellbeingService;

    public WellbeingController(WellbeingService wellbeingService) {
        this.wellbeingService = wellbeingService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<BreakSuggestion> getBreakSuggestion(@PathVariable Long userId) {
        BreakSuggestion suggestion = wellbeingService.suggestBreak(userId);
        return ResponseEntity.ok(suggestion);
    }
}
