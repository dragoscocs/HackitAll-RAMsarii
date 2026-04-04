package com.ecosync.controller;

import com.ecosync.model.BreakSuggestion;
import com.ecosync.model.DailyBreakSchedule;
import com.ecosync.service.WellbeingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for all break / wellbeing endpoints.
 *
 * GET  /api/breaks/{userId}          → next break + AI suggestion text  (BreakSuggestion)
 * GET  /api/breaks/{userId}/schedule → full daily break timeline         (DailyBreakSchedule)
 * POST /api/breaks/{userId}/record   → record a completed break
 */
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/breaks")
public class WellbeingController {

    private final WellbeingService wellbeingService;

    public WellbeingController(WellbeingService wellbeingService) {
        this.wellbeingService = wellbeingService;
    }

    /**
     * Returns the next scheduled break time and an AI-generated suggestion text.
     * Used by the SmartBreak card on the Dashboard.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<BreakSuggestion> getBreakSuggestion(@PathVariable Long userId) {
        BreakSuggestion suggestion = wellbeingService.suggestBreak(userId);
        return ResponseEntity.ok(suggestion);
    }

    /**
     * Returns the complete daily break schedule:
     *  - List of scheduled break hours (plain integers, e.g. [11, 13, 15])
     *  - Work window (startHour, endHour)
     *  - Today's meeting list
     *  - The next upcoming break hour (-1 if none left today)
     *
     * Used by SmartBreakTimeline in ProgramPage.
     */
    @GetMapping("/{userId}/schedule")
    public ResponseEntity<DailyBreakSchedule> getDailySchedule(@PathVariable Long userId) {
        DailyBreakSchedule schedule = wellbeingService.getDailySchedule(userId);
        return ResponseEntity.ok(schedule);
    }

    /**
     * Records that the user completed a break — updates streak and daily counter.
     */
    @PostMapping("/{userId}/record")
    public ResponseEntity<Map<String, Object>> recordBreak(@PathVariable Long userId) {
        wellbeingService.recordBreak(userId);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
