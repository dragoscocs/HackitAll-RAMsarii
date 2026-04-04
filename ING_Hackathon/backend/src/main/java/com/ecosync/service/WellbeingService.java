package com.ecosync.service;

import com.ecosync.model.BreakSuggestion;
import org.springframework.stereotype.Service;

@Service
public class WellbeingService {

    private final MockDataService mockDataService;

    public WellbeingService(MockDataService mockDataService) {
        this.mockDataService = mockDataService;
    }

    public BreakSuggestion suggestBreak(Long userId) {
        String breakTime = mockDataService.findNextBreakSlot();

        String suggestion = String.format(
                "You've had back-to-back meetings this morning. " +
                "We found a %s-minute window at %s — perfect for a short walk or a mindful breathing exercise. " +
                "Step away from your screen and recharge!",
                15, breakTime
        );

        return new BreakSuggestion(breakTime, suggestion, true);
    }
}
