package com.ecosync.model;

import java.util.List;

public class AuthResponse {
    private String token;
    private Long userId;
    private String name;
    private String city;
    private List<String> preferredSports;

    private String workSchedule;
    private int workStartHour;
    private int workEndHour;

    // Daily state
    private boolean requiresWorkLocationSetup;
    private String workLocation;
    private int breaksTakenToday;
    private int currentStreak;
    private int matchesThisMonth;

    public AuthResponse(String token, User user) {
        this.token = token;
        this.userId = user.getId();
        this.name = user.getName();
        this.city = user.getCity();
        this.preferredSports = user.getPreferredSports();
        this.workLocation = user.getWorkLocation();
        this.breaksTakenToday = user.getBreaksTakenToday();
        this.currentStreak = user.getCurrentStreak();
        this.matchesThisMonth = user.getMatchesThisMonth();
        this.workSchedule    = user.getWorkSchedule();
        this.workStartHour   = user.getWorkStartHour();
        this.workEndHour     = user.getWorkEndHour();
    }

    public String getWorkSchedule()  { return workSchedule; }
    public int    getWorkStartHour()  { return workStartHour; }
    public int    getWorkEndHour()    { return workEndHour; }
    public String getToken()          { return token; }
    public Long getUserId() { return userId; }
    public String getName() { return name; }
    public String getCity() { return city; }
    public List<String> getPreferredSports() { return preferredSports; }

    public boolean isRequiresWorkLocationSetup() { return requiresWorkLocationSetup; }
    public void setRequiresWorkLocationSetup(boolean requiresWorkLocationSetup) {
        this.requiresWorkLocationSetup = requiresWorkLocationSetup;
    }

    public String getWorkLocation() { return workLocation; }
    public void setWorkLocation(String workLocation) { this.workLocation = workLocation; }

    public int getBreaksTakenToday() { return breaksTakenToday; }
    public int getCurrentStreak() { return currentStreak; }
    public int getMatchesThisMonth() { return matchesThisMonth; }
}
