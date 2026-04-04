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
        employees.add(new Employee(1L, "Andrei Popescu",   "Bucharest", List.of("Padel", "Tennis")));
        employees.add(new Employee(2L, "Ioana Ionescu",    "Bucharest", List.of("Ping Pong", "Badminton")));
        employees.add(new Employee(3L, "Alex Mihalcea",    "Cluj",      List.of("Padel", "Football")));
        employees.add(new Employee(4L, "Sofia Constantin", "Bucharest", List.of("Ping Pong", "Yoga")));
        employees.add(new Employee(5L, "Vlad Dumitrescu",  "Iași",      List.of("Tennis", "Cycling")));
        employees.add(new Employee(6L, "Elena Stancu",     "Bucharest", List.of("Badminton", "Padel")));

        // Demo calendar — expressed as top-of-hour integer ranges.
        // startHour inclusive, endHour exclusive (just like Java time ranges).
        meetingSlots.add(new MeetingSlot(9,  10, "Sprint Planning"));
        meetingSlots.add(new MeetingSlot(10, 11, "1:1 with Manager"));
        meetingSlots.add(new MeetingSlot(13, 14, "Architecture Review"));
        meetingSlots.add(new MeetingSlot(15, 16, "Standup"));
        meetingSlots.add(new MeetingSlot(16, 17, "Product Demo"));
    }

    public List<Employee>    getAllEmployees()  { return employees; }
    public List<MeetingSlot> getMeetingSlots()  { return meetingSlots; }

    public Optional<Employee> findById(Long id) {
        return employees.stream().filter(e -> e.getId().equals(id)).findFirst();
    }

    /**
     * Legacy helper: returns the clock-time string of the next free slot after the current hour.
     * Kept for backward compatibility with WellbeingService.suggestBreak().
     */
    public String findNextBreakSlot() {
        int currentHour = LocalTime.now().getHour();
        // Collect blocked hours from all meetings
        java.util.Set<Integer> blocked = new java.util.HashSet<>();
        for (MeetingSlot m : meetingSlots) {
            for (int h = m.getStartHour(); h < m.getEndHour(); h++) blocked.add(h);
        }
        // Find first hour after now that is not blocked
        for (int h = currentHour + 1; h < 18; h++) {
            if (!blocked.contains(h)) return String.format("%02d:00", h);
        }
        return "12:00"; // ultimate fallback
    }
}
