package com.ecosync.service;

import com.ecosync.model.AuthResponse;
import com.ecosync.model.User;
import com.ecosync.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

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
            new User("Andrei Popescu",   "andrei@ecosync.ro",  "demo123", "Bucharest", List.of("Padel", "Tennis")),
            new User("Ioana Ionescu",    "ioana@ecosync.ro",   "demo123", "Bucharest", List.of("Ping Pong", "Badminton")),
            new User("Alex Mihalcea",    "alex@ecosync.ro",    "demo123", "Cluj",      List.of("Padel", "Football")),
            new User("Sofia Constantin", "sofia@ecosync.ro",   "demo123", "Bucharest", List.of("Ping Pong", "Yoga")),
            new User("Vlad Dumitrescu",  "vlad@ecosync.ro",    "demo123", "Iași",      List.of("Tennis", "Cycling")),
            new User("Elena Stancu",     "elena@ecosync.ro",   "demo123", "Bucharest", List.of("Badminton", "Padel"))
        ));
    }

    public AuthResponse register(String name, String email, String password, String city, List<String> sports) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email-ul este deja înregistrat.");
        }
        User saved = userRepository.save(new User(name, email, password, city, sports));
        String token = UUID.randomUUID().toString();
        sessions.put(token, saved.getId());
        return new AuthResponse(token, saved);
    }

    public AuthResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email sau parolă incorectă."));
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Email sau parolă incorectă.");
        }
        String token = UUID.randomUUID().toString();
        sessions.put(token, user.getId());
        return new AuthResponse(token, user);
    }

    public User getUserByToken(String token) {
        Long userId = sessions.get(token);
        if (userId == null) return null;
        return userRepository.findById(userId).orElse(null);
    }
}
