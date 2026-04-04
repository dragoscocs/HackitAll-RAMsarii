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

    private final List<Employee>    employees      = new ArrayList<>();
    private final List<MeetingSlot> meetingSlots   = new ArrayList<>();

    public MockDataService() {

        // ── Meeting calendar ─────────────────────────────────────────────────────
        // Three meetings spread through the day → algorithm produces breaks at 11:00 and 14:00
        meetingSlots.add(new MeetingSlot(9,  10, "Sprint Planning"));
        meetingSlots.add(new MeetingSlot(12, 13, "Team Sync"));
        meetingSlots.add(new MeetingSlot(15, 16, "Code Review"));

        // ── Employees ─────────────────────────────────────────────────────────────
        // București
        employees.add(new Employee(1L,  "Andrei Popescu",    "București",             List.of("Padel", "Tennis")));
        employees.add(new Employee(2L,  "Ioana Ionescu",     "București",             List.of("Ping Pong", "Badminton")));
        employees.add(new Employee(3L,  "Sofia Constantin",  "București",             List.of("Yoga", "Running")));
        employees.add(new Employee(4L,  "Elena Stancu",      "București",             List.of("Badminton", "Padel")));
        employees.add(new Employee(5L,  "Mihai Radu",        "București",             List.of("Football", "Cycling")));

        // Cluj
        employees.add(new Employee(6L,  "Alex Mihalcea",     "Cluj",                  List.of("Padel", "Football")));
        employees.add(new Employee(7L,  "Diana Pop",         "Cluj",                  List.of("Yoga", "Running")));
        employees.add(new Employee(8L,  "Mihai Mureșan",     "Cluj",                  List.of("Tennis", "Cycling")));
        employees.add(new Employee(9L,  "Raluca Bota",       "Cluj",                  List.of("Badminton", "Ping Pong")));

        // Iași
        employees.add(new Employee(10L, "Vlad Dumitrescu",   "Iași",                  List.of("Tennis", "Cycling")));
        employees.add(new Employee(11L, "Andreea Chirica",   "Iași",                  List.of("Yoga", "Badminton")));
        employees.add(new Employee(12L, "Cosmin Holban",     "Iași",                  List.of("Football", "Running")));

        // Timișoara
        employees.add(new Employee(13L, "Lucian Popa",       "Timișoara",             List.of("Football", "Running")));
        employees.add(new Employee(14L, "Alina Bălan",       "Timișoara",             List.of("Padel", "Yoga")));
        employees.add(new Employee(15L, "Cristian Negru",    "Timișoara",             List.of("Tennis", "Cycling")));

        // Brașov
        employees.add(new Employee(16L, "Radu Moldovan",     "Brașov",                List.of("Ski", "Running")));
        employees.add(new Employee(17L, "Cristina Lungu",    "Brașov",                List.of("Yoga", "Cycling")));
        employees.add(new Employee(18L, "Florin Gherman",    "Brașov",                List.of("Ski", "Football")));

        // Constanța
        employees.add(new Employee(19L, "Florin Marin",      "Constanța",             List.of("Padel", "Football")));
        employees.add(new Employee(20L, "Simona Nedelcu",    "Constanța",             List.of("Running", "Tennis")));
        employees.add(new Employee(21L, "Adrian Cojocaru",   "Constanța",             List.of("Badminton", "Ping Pong")));

        // Oradea
        employees.add(new Employee(22L, "Gabriel Bota",      "Oradea",                List.of("Football", "Padel")));
        employees.add(new Employee(23L, "Laura Crișan",      "Oradea",                List.of("Ping Pong", "Yoga")));
        employees.add(new Employee(24L, "Tiberiu Sas",       "Oradea",                List.of("Tennis", "Running")));

        // Sibiu
        employees.add(new Employee(25L, "Dănuț Bratu",       "Sibiu",                 List.of("Ski", "Football")));
        employees.add(new Employee(26L, "Monica Cârstea",    "Sibiu",                 List.of("Yoga", "Tennis")));
        employees.add(new Employee(27L, "Ionel Draghici",    "Sibiu",                 List.of("Running", "Cycling")));

        // Arad
        employees.add(new Employee(28L, "Petru Varga",       "Arad",                  List.of("Football", "Tennis")));
        employees.add(new Employee(29L, "Ana Suciu",         "Arad",                  List.of("Badminton", "Running")));
        employees.add(new Employee(30L, "Cornel Toth",       "Arad",                  List.of("Padel", "Cycling")));

        // Pitești
        employees.add(new Employee(31L, "Ionuț Dinu",        "Pitești",               List.of("Padel", "Football")));
        employees.add(new Employee(32L, "Camelia Preda",     "Pitești",               List.of("Yoga", "Cycling")));
        employees.add(new Employee(33L, "Dan Gheorghe",      "Pitești",               List.of("Tennis", "Running")));

        // Satu Mare
        employees.add(new Employee(34L, "Călin Sabău",       "Satu Mare",             List.of("Football", "Ski")));
        employees.add(new Employee(35L, "Adriana Katona",    "Satu Mare",             List.of("Ping Pong", "Badminton")));
        employees.add(new Employee(36L, "Liviu Berinde",     "Satu Mare",             List.of("Running", "Tennis")));

        // Brăila
        employees.add(new Employee(37L, "Marian Tudose",     "Brăila",                List.of("Football", "Running")));
        employees.add(new Employee(38L, "Alina Gheorghiu",   "Brăila",                List.of("Tennis", "Yoga")));
        employees.add(new Employee(39L, "Bogdan Leonte",     "Brăila",                List.of("Padel", "Cycling")));

        // Galați
        employees.add(new Employee(40L, "Costel Ifrim",      "Galați",                List.of("Football", "Padel")));
        employees.add(new Employee(41L, "Roxana Frîncu",     "Galați",                List.of("Running", "Badminton")));
        employees.add(new Employee(42L, "Eugen Stoica",      "Galați",                List.of("Tennis", "Cycling")));

        // Craiova
        employees.add(new Employee(43L, "Sorin Barbu",       "Craiova",               List.of("Football", "Tennis")));
        employees.add(new Employee(44L, "Maria Cojocaru",    "Craiova",               List.of("Yoga", "Running")));
        employees.add(new Employee(45L, "Aurelian Mitu",     "Craiova",               List.of("Padel", "Badminton")));

        // Drobeta Turnu Severin
        employees.add(new Employee(46L, "Florinel Gîrleanu","Drobeta Turnu Severin",  List.of("Football", "Cycling")));
        employees.add(new Employee(47L, "Daniela Radu",     "Drobeta Turnu Severin",  List.of("Running", "Yoga")));
        employees.add(new Employee(48L, "Nicu Popescu",     "Drobeta Turnu Severin",  List.of("Tennis", "Padel")));
    }

    public List<Employee>    getAllEmployees()  { return employees; }
    public List<MeetingSlot> getMeetingSlots()  { return meetingSlots; }

    public Optional<Employee> findById(Long id) {
        return employees.stream().filter(e -> e.getId().equals(id)).findFirst();
    }

    /**
     * Legacy helper: returns the clock-time string of the next free slot after the current hour.
     */
    public String findNextBreakSlot() {
        int currentHour = LocalTime.now().getHour();
        java.util.Set<Integer> blocked = new java.util.HashSet<>();
        for (MeetingSlot m : meetingSlots) {
            for (int h = m.getStartHour(); h < m.getEndHour(); h++) blocked.add(h);
        }
        for (int h = currentHour + 1; h < 18; h++) {
            if (!blocked.contains(h)) return String.format("%02d:00", h);
        }
        return "12:00";
    }
}
