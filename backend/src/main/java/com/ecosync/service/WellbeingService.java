package com.ecosync.service;

import com.ecosync.model.BreakSuggestion;
import com.ecosync.model.User;
import com.ecosync.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class WellbeingService {

    private final MockDataService mockDataService;
    private final AiService aiService;
    private final UserRepository userRepository;

    public WellbeingService(MockDataService mockDataService, AiService aiService, UserRepository userRepository) {
        this.mockDataService = mockDataService;
        this.aiService = aiService;
        this.userRepository = userRepository;
    }

    public BreakSuggestion suggestBreak(Long userId) {
        String workLocation = userRepository.findById(userId)
            .map(User::getWorkLocation)
            .orElse(null);
        return suggestBreak(userId, workLocation);
    }

    public BreakSuggestion suggestBreak(Long userId, String workLocation) {
        String breakTime = mockDataService.findNextBreakSlot();

        String locationContext;
        if ("HOME".equals(workLocation)) {
            locationContext = "Angajatul lucrează de ACASĂ azi. Sugerează activități potrivite pentru acasă: " +
                "exerciții ușoare în cameră, ieșit pe balcon, stretching la birou de acasă, " +
                "respirații adânci, hidratare, o plimbare scurtă în jur de casă.";
        } else if ("OFFICE".equals(workLocation)) {
            locationContext = "Angajatul lucrează de la BIROU azi. Sugerează activități potrivite pentru birou: " +
                "o plimbare până la terasă, stretching ușor la birou, mers să ia un pahar cu apă, " +
                "exerciții de respirație, o scurtă conversație cu un coleg, privit pe fereastră.";
        } else {
            locationContext = "Sugerează o activitate de relaxare generică, scurtă și eficientă.";
        }

        String prompt = String.format(
            "Ești SyncFit, asistentul AI de wellbeing corporativ. " +
            "Generează o sugestie de pauză personalizată în română, MAX 35 de cuvinte, caldă și motivantă. " +
            "%s " +
            "Ora pauzei: %s. " +
            "Începe direct cu sugestia, fără introduceri.",
            locationContext, breakTime
        );

        String suggestionText = aiService.getAiRecommendation(prompt);
        return new BreakSuggestion(breakTime, suggestionText, true);
    }

    public void recordBreak(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setBreaksTakenToday(user.getBreaksTakenToday() + 1);

            // Update streak
            LocalDate today = LocalDate.now();
            LocalDate lastBreak = user.getLastBreakDate();
            if (lastBreak == null || lastBreak.isBefore(today.minusDays(1))) {
                // First break ever, or streak broken — restart
                user.setCurrentStreak(1);
            } else if (lastBreak.equals(today.minusDays(1))) {
                // Consecutive day — increment streak
                user.setCurrentStreak(user.getCurrentStreak() + 1);
            }
            // If lastBreak == today, streak unchanged (multiple breaks same day)
            user.setLastBreakDate(today);
            userRepository.save(user);
        });
    }
}
