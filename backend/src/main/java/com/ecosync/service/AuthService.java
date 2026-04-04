package com.ecosync.service;

import com.ecosync.model.AuthResponse;
import com.ecosync.model.User;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class AuthService {

    private final Map<String, User> usersByEmail = new ConcurrentHashMap<>();
    private final Map<Long, User> usersById = new ConcurrentHashMap<>();
    private final Map<String, Long> sessions = new ConcurrentHashMap<>(); // token -> userId
    private final AtomicLong idCounter = new AtomicLong(10);

    @PostConstruct
    public void initDemoUsers() {
        // Pre-populate demo accounts matching the mock employees
        createUser(1L, "Gigel Popescu",   "gigel@ecosync.ro",  "demo123", "Bucharest", List.of("Padel", "Tennis"));
        createUser(2L, "Ana Ionescu",     "ana@ecosync.ro",    "demo123", "Bucharest", List.of("Ping Pong", "Badminton"));
        createUser(3L, "Radu Mihalcea",   "radu@ecosync.ro",   "demo123", "Cluj",      List.of("Padel", "Football"));
        createUser(4L, "Maria Constantin","maria@ecosync.ro",  "demo123", "Bucharest", List.of("Ping Pong", "Yoga"));
        createUser(5L, "Bogdan Dumitrescu","bogdan@ecosync.ro","demo123", "Iași",      List.of("Tennis", "Cycling"));
        createUser(6L, "Elena Stancu",    "elena@ecosync.ro",  "demo123", "Bucharest", List.of("Badminton", "Padel"));
    }

    private void createUser(Long id, String name, String email, String password, String city, List<String> sports) {
        User user = new User(id, name, email, password, city, sports);
        usersByEmail.put(email, user);
        usersById.put(id, user);
    }

    public AuthResponse register(String name, String email, String password, String city, List<String> sports) {
        if (usersByEmail.containsKey(email)) {
            throw new RuntimeException("Email-ul este deja înregistrat.");
        }
        Long newId = idCounter.incrementAndGet();
        User user = new User(newId, name, email, password, city, sports);
        usersByEmail.put(email, user);
        usersById.put(newId, user);

        String token = UUID.randomUUID().toString();
        sessions.put(token, newId);
        return new AuthResponse(token, user);
    }

    public AuthResponse login(String email, String password) {
        User user = usersByEmail.get(email);
        if (user == null || !user.getPassword().equals(password)) {
            throw new RuntimeException("Email sau parolă incorectă.");
        }
        String token = UUID.randomUUID().toString();
        sessions.put(token, user.getId());
        return new AuthResponse(token, user);
    }

    public User getUserByToken(String token) {
        Long userId = sessions.get(token);
        if (userId == null) return null;
        return usersById.get(userId);
    }
}
