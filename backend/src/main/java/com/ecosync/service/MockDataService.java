package com.ecosync.service;

import com.ecosync.model.Employee;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class MockDataService {

    private final List<Employee> employees = new ArrayList<>();
    private final List<Map<String, String>> dailyCalendar = new ArrayList<>();

    public MockDataService() {
        employees.add(new Employee(1L, "Andrei Popescu",   "Bucharest", List.of("Padel", "Tennis")));
        employees.add(new Employee(2L, "Ioana Ionescu",    "Bucharest", List.of("Ping Pong", "Badminton")));
        employees.add(new Employee(3L, "Alex Mihalcea",    "Cluj",      List.of("Padel", "Football")));
        employees.add(new Employee(4L, "Sofia Constantin", "Bucharest", List.of("Ping Pong", "Yoga")));
        employees.add(new Employee(5L, "Vlad Dumitrescu",  "Iași",      List.of("Tennis", "Cycling")));
        employees.add(new Employee(6L, "Elena Stancu",     "Bucharest", List.of("Badminton", "Padel")));

        dailyCalendar.add(Map.of("start", "09:00", "end", "10:00", "title", "Sprint Planning"));
        dailyCalendar.add(Map.of("start", "10:15", "end", "11:00", "title", "1:1 with Manager"));
        dailyCalendar.add(Map.of("start", "13:00", "end", "14:00", "title", "Architecture Review"));
        dailyCalendar.add(Map.of("start", "15:30", "end", "16:00", "title", "Standup"));
        dailyCalendar.add(Map.of("start", "16:30", "end", "17:30", "title", "Product Demo"));
    }

    public List<Employee> getAllEmployees() { return employees; }

    public Optional<Employee> findById(Long id) {
        return employees.stream().filter(e -> e.getId().equals(id)).findFirst();
    }

    public List<Map<String, String>> getDailyCalendar() { return dailyCalendar; }

    public String findNextBreakSlot() {
        LocalTime now = LocalTime.now();
        for (int i = 0; i < dailyCalendar.size() - 1; i++) {
            LocalTime endOfCurrent = LocalTime.parse(dailyCalendar.get(i).get("end"));
            LocalTime startOfNext  = LocalTime.parse(dailyCalendar.get(i + 1).get("start"));
            long gapMinutes = java.time.Duration.between(endOfCurrent, startOfNext).toMinutes();
            if (gapMinutes >= 15 && endOfCurrent.isAfter(now)) {
                return endOfCurrent.toString();
            }
        }
        return "12:00";
    }
}
