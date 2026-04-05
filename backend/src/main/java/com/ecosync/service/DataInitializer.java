package com.ecosync.service;

import com.ecosync.model.User;
import com.ecosync.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds 15 realistic Bucharest accounts on startup (idempotent — checks by email).
 * Passwords are plain-text like the rest of the demo system.
 * Each user has age, gender, city and a mix of preferred sports so that
 * the AI matchmaking algorithm has real data to score and recommend.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AuthService authService;

    public DataInitializer(UserRepository userRepository, AuthService authService) {
        this.userRepository = userRepository;
        this.authService    = authService;
    }

    @Override
    public void run(String... args) {
        seedUser("Cristina Munteanu",  "cristina.munteanu@ecosync.ro",  26, "F", List.of("Running", "Cycling", "Yoga"),        "9-17");
        seedUser("Vlad Ionescu",       "vlad.ionescu@ecosync.ro",        29, "M", List.of("Football", "Running", "Cycling"),    "10-18");
        seedUser("Ioana Stan",         "ioana.stan@ecosync.ro",          32, "F", List.of("Yoga", "Running", "Badminton"),      "9-17");
        seedUser("Alexandru Dinu",     "alexandru.dinu@ecosync.ro",      25, "M", List.of("Tennis", "Padel", "Badminton"),      "8-16");
        seedUser("Marius Florea",      "marius.florea@ecosync.ro",       34, "M", List.of("Cycling", "Running", "Ski"),         "9-17");
        seedUser("Diana Stoica",       "diana.stoica@ecosync.ro",        24, "F", List.of("Football", "Running", "Yoga"),       "9-17");
        seedUser("Gabriel Niculescu",  "gabriel.niculescu@ecosync.ro",   37, "M", List.of("Football", "Cycling", "Running"),    "10-18");
        seedUser("Roxana Popa",        "roxana.popa@ecosync.ro",         28, "F", List.of("Yoga", "Running", "Badminton"),      "9-17");
        seedUser("Cosmin Marinescu",   "cosmin.marinescu@ecosync.ro",    22, "M", List.of("Football", "Padel", "Running"),      "9-17");
        seedUser("Andreea Dumitru",    "andreea.dumitru@ecosync.ro",     31, "F", List.of("Tennis", "Badminton", "Yoga"),       "9-17");
        seedUser("Stefan Radu",        "stefan.radu@ecosync.ro",         27, "M", List.of("Padel", "Tennis", "Badminton"),      "8-16");
        seedUser("Laura Enache",       "laura.enache@ecosync.ro",        35, "F", List.of("Running", "Yoga", "Cycling"),        "9-17");
        seedUser("Dan Petrescu",       "dan.petrescu@ecosync.ro",        41, "M", List.of("Football", "Ski", "Cycling"),        "8-16");
        seedUser("Irina Sandu",        "irina.sandu@ecosync.ro",         23, "F", List.of("Tennis", "Running", "Badminton"),    "9-17");
        seedUser("Mihai Ionescu",      "mihai.ionescu@ecosync.ro",       30, "M", List.of("Padel", "Football", "Running"),      "10-18");
    }

    private void seedUser(String name, String email, int age, String gender,
                          List<String> sports, String schedule) {
        if (userRepository.findByEmail(email).isPresent()) return;

        User u = new User(name, email, "demo123", "București", sports);
        u.setAge(age);
        u.setGender(gender);
        u.setGdprConsent(true);
        u.setCriptareConsent(true);
        u.setAnspdcpConsent(true);
        authService.applyWorkSchedule(u, schedule);
        userRepository.save(u);
    }
}
