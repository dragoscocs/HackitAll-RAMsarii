package com.ecosync.service;

import com.ecosync.model.AuthResponse;
import com.ecosync.model.User;
import com.ecosync.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final SmartBreakService smartBreakService;
    private final Map<String, Long> sessions = new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository, SmartBreakService smartBreakService) {
        this.userRepository   = userRepository;
        this.smartBreakService = smartBreakService;
    }

    @PostConstruct
    public void initDemoUsers() {
        if (userRepository.count() == 0) {
            userRepository.saveAll(List.of(
                new User("Gigel Popescu",    "gigel@ecosync.ro",  "demo123", "București", List.of("Padel", "Tennis")),
                new User("Ana Ionescu",      "ana@ecosync.ro",    "demo123", "București", List.of("Ping Pong", "Badminton")),
                new User("Radu Mihalcea",    "radu@ecosync.ro",   "demo123", "Cluj",      List.of("Padel", "Football")),
                new User("Maria Constantin", "maria@ecosync.ro",  "demo123", "București", List.of("Ping Pong", "Yoga")),
                new User("Bogdan Dumitrescu","bogdan@ecosync.ro", "demo123", "Iași",      List.of("Tennis", "Cycling")),
                new User("Elena Stancu",     "elena@ecosync.ro",  "demo123", "București", List.of("Badminton", "Padel"))
            ));

            userRepository.findByEmail("gigel@ecosync.ro").ifPresent(u -> { applyWorkSchedule(u, "10-18"); userRepository.save(u); });
            userRepository.findByEmail("ana@ecosync.ro").ifPresent(u   -> { applyWorkSchedule(u, "9-17");  userRepository.save(u); });
            userRepository.findByEmail("radu@ecosync.ro").ifPresent(u  -> { applyWorkSchedule(u, "9-17");  userRepository.save(u); });
            userRepository.findByEmail("maria@ecosync.ro").ifPresent(u -> { applyWorkSchedule(u, "9-17");  userRepository.save(u); });
            userRepository.findByEmail("bogdan@ecosync.ro").ifPresent(u-> { applyWorkSchedule(u, "9-17");  userRepository.save(u); });
            userRepository.findByEmail("elena@ecosync.ro").ifPresent(u -> { applyWorkSchedule(u, "9-17");  userRepository.save(u); });
        }

        if (userRepository.findByEmail("andrei@ecosync.ro").isEmpty()) {
            User andrei = new User("Andrei Dumitrescu", "andrei@ecosync.ro", "demo123", "București", List.of("Padel", "Football"));
            applyWorkSchedule(andrei, "8-16");
            userRepository.save(andrei);
        }
    }

    /** Applies workSchedule string and derives workStartTime/workEndTime. */
    public void applyWorkSchedule(User user, String schedule) {
        user.setWorkSchedule(schedule);
        LocalTime[] hours = smartBreakService.parseWorkSchedule(schedule);
        user.setWorkStartTime(hours[0]);
        user.setWorkEndTime(hours[1]);
    }

    public AuthResponse register(String name, String email, String password, String city, List<String> sports, String workSchedule) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email-ul este deja înregistrat.");
        }
        User user = new User(name, email, password, city, sports);
        applyWorkSchedule(user, workSchedule != null ? workSchedule : "9-17");
        user.setLastLoginDate(LocalDate.now());
        // New users always need to set work location
        User saved = userRepository.save(user);
        String token = UUID.randomUUID().toString();
        sessions.put(token, saved.getId());
        AuthResponse response = new AuthResponse(token, saved);
        response.setRequiresWorkLocationSetup(true);
        return response;
    }

    public AuthResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email sau parolă incorectă."));
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Email sau parolă incorectă.");
        }

        LocalDate today = LocalDate.now();
        boolean isNewDay = !today.equals(user.getLastLoginDate());

        if (isNewDay) {
            // Daily reset
            user.setBreaksTakenToday(0);
            user.setWorkLocation(null);
            user.setLastLoginDate(today);

            // Reset matches if new month
            if (user.getLastLoginDate() != null &&
                user.getLastLoginDate().getMonth() != today.getMonth()) {
                user.setMatchesThisMonth(0);
            }

            userRepository.save(user);
        }

        String token = UUID.randomUUID().toString();
        sessions.put(token, user.getId());

        AuthResponse response = new AuthResponse(token, user);
        // Show work location modal if: new day OR location not yet set
        response.setRequiresWorkLocationSetup(isNewDay || user.getWorkLocation() == null);
        return response;
    }

    public User getUserByToken(String token) {
        Long userId = sessions.get(token);
        if (userId == null) return null;
        return userRepository.findById(userId).orElse(null);
    }

    public void setConsent(Long userId, String type, boolean value) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilizator negăsit."));
        switch(type) {
            case "gdpr": user.setGdprConsent(value); break;
            case "criptare": user.setCriptareConsent(value); break;
            case "anspdcp": user.setAnspdcpConsent(value); break;
            default: throw new RuntimeException("Tip consimțământ invalid.");
        }
        userRepository.save(user);
    }
}
