package com.ecosync.service;

import com.ecosync.model.BreakSuggestion;
import com.ecosync.model.DailyBreakSchedule;
import com.ecosync.model.MeetingSlot;
import com.ecosync.model.SmartBreak;
import com.ecosync.model.User;
import com.ecosync.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class WellbeingService {

    private final MockDataService    mockDataService;
    private final AiService          aiService;
    private final UserRepository     userRepository;
    private final SmartBreakService  smartBreakService;

    public WellbeingService(MockDataService mockDataService,
                            AiService aiService,
                            UserRepository userRepository,
                            SmartBreakService smartBreakService) {
        this.mockDataService   = mockDataService;
        this.aiService         = aiService;
        this.userRepository    = userRepository;
        this.smartBreakService = smartBreakService;
    }

    // ── Daily schedule ────────────────────────────────────────────────────────

    public DailyBreakSchedule getDailySchedule(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilizator negăsit: " + userId));

        int startHour = user.getWorkStartHour();
        int endHour   = user.getWorkEndHour();

        List<MeetingSlot> meetings     = mockDataService.getMeetingSlots();
        List<SmartBreak>  smartBreaks  = smartBreakService.computeBreaks(startHour, endHour, meetings);
        
        LocalTime now = LocalTime.now();
        SmartBreak nextBreak = smartBreakService.findNextBreak(smartBreaks, now);

        return new DailyBreakSchedule(startHour, endHour, smartBreaks, meetings, nextBreak);
    }

    // ── Single break suggestion (next break + AI text) ────────────────────────

    public BreakSuggestion suggestBreak(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        return suggestBreak(userId, user != null ? user.getWorkLocation() : null);
    }

    public BreakSuggestion suggestBreak(Long userId, String workLocation) {
        User user = userRepository.findById(userId).orElse(null);
        
        DailyBreakSchedule schedule  = getDailySchedule(userId);
        SmartBreak nextBreak = schedule.getNextBreak();

        String breakTime;
        String breakReason = "Pauză obișnuită";
        if (nextBreak != null) {
            breakTime = nextBreak.getTime().toString();
            breakReason = nextBreak.getReason();
        } else {
            // No more breaks today
            breakTime = mockDataService.findNextBreakSlot();
            breakReason = "Fără pauze pre-planificate; relaxați-vă la liber.";
        }

        String locationContext;
        if ("HOME".equals(workLocation)) {
            locationContext = "Lucrează de ACASĂ.";
        } else if ("OFFICE".equals(workLocation)) {
            locationContext = "Lucrează de la BIROU.";
        } else {
            locationContext = "";
        }

        String personaContext = "";
        String healthContext = "";
        if (user != null) {
            if (user.getUserPersonaPrompt() != null && !user.getUserPersonaPrompt().isBlank()) {
                personaContext = "Profil personalitate: " + user.getUserPersonaPrompt() + ". Adaptează tonul!";
            }
            if (user.getUserHealthLimits() != null && !user.getUserHealthLimits().isBlank()) {
                healthContext = "Limite fizice (CRITIC: Nu le încălca sub nicio formă): " + user.getUserHealthLimits() + ". ";
            }
        }

        String prompt = String.format(
            "Ești SyncFit, asistentul corporativ. " +
            "Sugerează o pauză scurtă în română, MAX 35 cuvinte. " +
            "%s " +
            "Ora: %s. Motiv pauză impus de algoritm: '%s'. " +
            "%s " +
            "%s " +
            "Fii natural. Treci la subiect.",
            locationContext, breakTime, breakReason, personaContext, healthContext
        );

        String suggestionText = aiService.getAiRecommendation(prompt);

        if (suggestionText == null || suggestionText.isBlank() || suggestionText.trim().startsWith("{")) {
            suggestionText = getDefaultSuggestion(workLocation, breakTime);
        }

        return new BreakSuggestion(breakTime, suggestionText, true);
    }

    // ── Record a completed break ──────────────────────────────────────────────

    public void recordBreak(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setBreaksTakenToday(user.getBreaksTakenToday() + 1);

            LocalDate today     = LocalDate.now();
            LocalDate lastBreak = user.getLastBreakDate();
            if (lastBreak == null || lastBreak.isBefore(today.minusDays(1))) {
                user.setCurrentStreak(1);
            } else if (lastBreak.equals(today.minusDays(1))) {
                user.setCurrentStreak(user.getCurrentStreak() + 1);
            }
            user.setLastBreakDate(today);
            userRepository.save(user);
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String getDefaultSuggestion(String workLocation, String breakTime) {
        if ("HOME".equals(workLocation)) {
            return "Ridică-te de la birou, ieși pe balcon câteva minute și respiră aer proaspăt. " +
                   "Câteva întinderi ușoare îți vor relaxa spatele și umerii. Meriti această pauză! 🌿";
        } else if ("OFFICE".equals(workLocation)) {
            return "Fă o scurtă plimbare până la terasă sau la fereastră. Privește în zare, " +
                   "bea un pahar cu apă și schimbă câteva vorbe cu un coleg. Reîncarcă-te! ☕";
        } else {
            return "Depărtează-te de ecran câteva minute. Respiră adânc de 5 ori, " +
                   "întinde-te ușor și hidratează-te. Corpul tău îți mulțumește! 🧘";
        }
    }
}
