package com.ecosync.service;

import com.ecosync.model.AuthResponse;
import com.ecosync.model.User;
import com.ecosync.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final Map<String, Long> sessions = new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void initDemoUsers() {
        if (userRepository.count() > 0) return;

        userRepository.saveAll(List.of(
            new User("Gigel Popescu",    "gigel@ecosync.ro",  "demo123", "Bucharest", List.of("Padel", "Tennis")),
            new User("Ana Ionescu",      "ana@ecosync.ro",    "demo123", "Bucharest", List.of("Ping Pong", "Badminton")),
            new User("Radu Mihalcea",    "radu@ecosync.ro",   "demo123", "Cluj",      List.of("Padel", "Football")),
            new User("Maria Constantin", "maria@ecosync.ro",  "demo123", "Bucharest", List.of("Ping Pong", "Yoga")),
            new User("Bogdan Dumitrescu","bogdan@ecosync.ro", "demo123", "Iași",      List.of("Tennis", "Cycling")),
            new User("Elena Stancu",     "elena@ecosync.ro",  "demo123", "Bucharest", List.of("Badminton", "Padel"))
        ));
    }

    public AuthResponse register(String name, String email, String password, String city, List<String> sports) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email-ul este deja înregistrat.");
        }
        User user = new User(name, email, password, city, sports);
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
}
