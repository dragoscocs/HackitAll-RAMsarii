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

        // ── 15 rich demo profiles ───────────────────────────────────────────────
        employees.add(new Employee(101L, "Andrei Popescu",  28, "M", "București",
            "Software Engineer",
            "Joc tenis de 5 ani și am descoperit padelul recent. Prefer meciuri competitive dar prietenești.",
            List.of("Padel", "Tennis", "Squash")));

        employees.add(new Employee(102L, "Maria Ionescu",   32, "F", "București",
            "Product Manager",
            "Alerg semimaratoane și fac yoga zilnic. Caut colegi pentru antrenamente de dimineață.",
            List.of("Yoga", "Running", "Cycling")));

        employees.add(new Employee(103L, "Bogdan Dumitrescu", 25, "M", "București",
            "Data Analyst",
            "Pasionat de fotbal. Organizez meciuri 5vs5 în fiecare vineri seara.",
            List.of("Football", "Basketball", "Running")));

        employees.add(new Employee(104L, "Elena Stancu",    29, "F", "București",
            "UX Designer",
            "Campioană la ping pong pe departament 3 ani la rând. Provocarea e binevenită.",
            List.of("Ping Pong", "Badminton", "Yoga")));

        employees.add(new Employee(105L, "Radu Mihalcea",   35, "M", "București",
            "Engineering Lead",
            "Squash în fiecare dimineață. Nu există zi proastă după 45 de minute pe teren.",
            List.of("Squash", "Padel", "Swimming")));

        employees.add(new Employee(106L, "Cristina Popa",   27, "F", "București",
            "Marketing Specialist",
            "Îmi place să explorez trasee noi. Luna trecută am terminat maratonul din Sibiu — 3h 47min.",
            List.of("Running", "Hiking", "Cycling")));

        employees.add(new Employee(107L, "Victor Nica",     31, "M", "București",
            "Backend Developer",
            "Intermediar la tenis, avansat la squash. Meciuri scurte și intense în pauza de prânz.",
            List.of("Tennis", "Squash", "Badminton")));

        employees.add(new Employee(108L, "Ana Constantin",  24, "F", "București",
            "HR Specialist",
            "Am jucat volei în liceu și vreau să revin la formă. Multă energie și bună dispoziție!",
            List.of("Volleyball", "Badminton", "Running")));

        employees.add(new Employee(109L, "Sorin Munteanu",  38, "M", "București",
            "Senior Architect",
            "Triatlet amator. 50km pe bicicletă în fiecare weekend. Caut colegi pentru group rides.",
            List.of("Cycling", "Running", "Swimming")));

        employees.add(new Employee(110L, "Diana Pop",       26, "F", "București",
            "Content Creator",
            "Instructor de yoga certificat. Organizez sesiuni pe terasa biroului în pauzele de prânz.",
            List.of("Yoga", "Swimming", "Running")));

        employees.add(new Employee(111L, "Alexandru Dima",  22, "M", "București",
            "Junior Developer",
            "Proaspăt angajat, full of energy. Baschet marți și joi după program.",
            List.of("Basketball", "Football", "CrossFit")));

        employees.add(new Employee(112L, "Teodora Iancu",   34, "F", "București",
            "Finance Manager",
            "Înot de performanță în trecut, acum pentru relaxare. Alergări în Parcul Herăstrău.",
            List.of("Swimming", "Running", "Yoga")));

        employees.add(new Employee(113L, "Gabriel Vlad",    29, "M", "București",
            "DevOps Engineer",
            "CrossFit de 3 ori pe săptămână. Caut oameni motivați pentru antrenamente solide.",
            List.of("CrossFit", "Gym", "Football")));

        employees.add(new Employee(114L, "Ioana Luca",      30, "F", "București",
            "Project Manager",
            "Pasionată de munte și natură. Organizez weekenduri la Sinaia și trasee pe Bucegi.",
            List.of("Ski", "Hiking", "Cycling")));

        employees.add(new Employee(115L, "Mihai Mureșan",   33, "M", "București",
            "Product Designer",
            "Am jucat tenis în liga universitară, acum mai relaxat. Padelul e noua mea obsesie.",
            List.of("Tennis", "Padel", "Basketball")));

        // ── Additional employees (other cities) ─────────────────────────────────
        employees.add(new Employee(6L,  "Alex Mihalcea",   "Cluj",       List.of("Padel", "Football")));
        employees.add(new Employee(7L,  "Diana Aldea",     "Cluj",       List.of("Yoga", "Running")));
        employees.add(new Employee(8L,  "Mihai Covrig",    "Cluj",       List.of("Tennis", "Cycling")));
        employees.add(new Employee(9L,  "Raluca Bota",     "Cluj",       List.of("Badminton", "Ping Pong")));
        employees.add(new Employee(10L, "Vlad Dumitrescu", "Iași",       List.of("Tennis", "Cycling")));
        employees.add(new Employee(11L, "Andreea Chirica", "Iași",       List.of("Yoga", "Badminton")));
        employees.add(new Employee(12L, "Cosmin Holban",   "Iași",       List.of("Football", "Running")));
        employees.add(new Employee(13L, "Lucian Popa",     "Timișoara",  List.of("Football", "Running")));
        employees.add(new Employee(14L, "Alina Bălan",     "Timișoara",  List.of("Padel", "Yoga")));
        employees.add(new Employee(15L, "Cristian Negru",  "Timișoara",  List.of("Tennis", "Cycling")));
        employees.add(new Employee(16L, "Radu Moldovan",   "Brașov",     List.of("Ski", "Running")));
        employees.add(new Employee(17L, "Cristina Lungu",  "Brașov",     List.of("Yoga", "Cycling")));
        employees.add(new Employee(18L, "Florin Gherman",  "Brașov",     List.of("Ski", "Football")));
        employees.add(new Employee(19L, "Florin Marin",    "Constanța",  List.of("Padel", "Football")));
        employees.add(new Employee(20L, "Simona Nedelcu",  "Constanța",  List.of("Running", "Tennis")));
        employees.add(new Employee(21L, "Adrian Cojocaru", "Constanța",  List.of("Badminton", "Ping Pong")));
        employees.add(new Employee(22L, "Gabriel Bota",    "Oradea",     List.of("Football", "Padel")));
        employees.add(new Employee(23L, "Laura Crișan",    "Oradea",     List.of("Ping Pong", "Yoga")));
        employees.add(new Employee(24L, "Tiberiu Sas",     "Oradea",     List.of("Tennis", "Running")));
        employees.add(new Employee(25L, "Dănuț Bratu",     "Sibiu",      List.of("Ski", "Football")));
        employees.add(new Employee(26L, "Monica Cârstea",  "Sibiu",      List.of("Yoga", "Tennis")));
        employees.add(new Employee(27L, "Ionel Draghici",  "Sibiu",      List.of("Running", "Cycling")));
        employees.add(new Employee(28L, "Petru Varga",     "Arad",       List.of("Football", "Tennis")));
        employees.add(new Employee(29L, "Ana Suciu",       "Arad",       List.of("Badminton", "Running")));
        employees.add(new Employee(30L, "Cornel Toth",     "Arad",       List.of("Padel", "Cycling")));
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
