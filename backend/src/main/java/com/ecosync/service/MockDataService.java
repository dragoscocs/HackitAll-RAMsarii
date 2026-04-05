package com.ecosync.service;

import com.ecosync.model.Employee;
import com.ecosync.model.MeetingSlot;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MockDataService {

    private final List<Employee>    employees    = new ArrayList<>();
    private final List<MeetingSlot> meetingSlots = new ArrayList<>();

    public MockDataService() {

        // ── Meeting calendar ────────────────────────────────────────────────────
        meetingSlots.add(new MeetingSlot(9,  0, 10, 0, "Sprint Planning"));
        meetingSlots.add(new MeetingSlot(12, 0, 13, 0, "Team Sync"));
        meetingSlots.add(new MeetingSlot(15, 0, 16, 0, "Code Review"));
        // ── Cities & Sports ─────────────────────────────────────────────────────
        String[] cities = {"București", "Cluj-Napoca", "Timișoara", "Brașov", "Iași"};
        String[] sports = {"Padel", "Ping Pong", "Tennis", "Badminton", "Football", "Yoga", "Cycling", "Ski", "Running"};
        String[] roles  = {"Software Engineer", "UX Designer", "Product Manager", "Data Analyst", "HR Specialist", "Marketing Specialist", "DevOps Engineer"};

        String[] firstNames = {"Andrei", "Maria", "Bogdan", "Elena", "Radu", "Cristina", "Victor", "Ana", "Sorin", "Diana", "Alexandru", "Teodora", "Gabriel", "Ioana", "Mihai", "Simona", "Adrian", "Denisa", "Florin", "Anca"};
        String[] lastNames  = {"Popescu", "Ionescu", "Dumitrescu", "Stancu", "Mihalcea", "Popa", "Nica", "Constantin", "Munteanu", "Pop", "Dima", "Iancu", "Vlad", "Luca", "Mureșan", "Radu", "Stoica", "Voicu", "Stan", "Matei"};

        // ── Generate 20 employees per city (Total 100) ──────────────────────────
        long idCounter = 101;
        for (String city : cities) {
            for (int i = 0; i < 20; i++) {
                String name = firstNames[i % firstNames.length] + " " + lastNames[(i + (int)idCounter % 7) % lastNames.length];
                int age = 22 + (int)(Math.random() * 20);
                String gender = (i % 2 == 0) ? "M" : "F";
                String role = roles[(int)(Math.random() * roles.length)];

                List<String> prefSports = new ArrayList<>();
                prefSports.add(sports[(int)(Math.random() * sports.length)]);
                prefSports.add(sports[(int)(Math.random() * sports.length)]);

                String bio = "Pasionat de sport și tehnologie. Îmi place să cunosc oameni noi prin " + prefSports.get(0).toLowerCase() + ".";

                employees.add(new Employee(idCounter++, name, age, gender, city, role, bio, prefSports));
            }
        }
    }

    public List<Employee>    getAllEmployees() { return employees; }
    public List<MeetingSlot> getMeetingSlots() { return meetingSlots; }

    public Optional<Employee> findById(Long id) {
        return employees.stream().filter(e -> e.getId().equals(id)).findFirst();
    }

    public String findNextBreakSlot() {
        int currentHour = LocalTime.now().getHour();
        java.util.Set<Integer> blocked = new java.util.HashSet<>();
        for (MeetingSlot m : meetingSlots) {
            for (int h = m.getStartHour(); h <= m.getEndHour(); h++) blocked.add(h);
        }
        for (int h = currentHour + 1; h < 18; h++) {
            if (!blocked.contains(h)) return String.format("%02d:00", h);
        }
        return "12:00";
    }
}
