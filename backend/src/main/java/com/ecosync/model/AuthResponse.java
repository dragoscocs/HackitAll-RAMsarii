package com.ecosync.model;

import java.time.LocalTime;
import java.util.List;


public class AuthResponse {
    private String token;
    private Long userId;
    private String name;
    private String city;
    private List<String> preferredSports;

    private String workSchedule;
    private LocalTime workStartTime;
    private LocalTime workEndTime;

    // Daily state
    private boolean requiresWorkLocationSetup;
    private String workLocation;
    private int breaksTakenToday;
    private int currentStreak;
    private int matchesThisMonth;

    // Consents
    private boolean gdprConsent;
    private boolean criptareConsent;
    private boolean anspdcpConsent;

    private String profilePicture;

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
        this.workStartTime   = user.getWorkStartTime();
        this.workEndTime     = user.getWorkEndTime();
        this.gdprConsent     = user.isGdprConsent();
        this.criptareConsent = user.isCriptareConsent();
        this.anspdcpConsent  = user.isAnspdcpConsent();
        this.profilePicture  = user.getProfilePicture();
    }

    public String getWorkSchedule()   { return workSchedule; }
    public LocalTime getWorkStartTime() { return workStartTime; }
    public LocalTime getWorkEndTime()   { return workEndTime; }
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
    
    public String getProfilePicture() { return profilePicture; }

    public boolean isGdprConsent() { return gdprConsent; }
    public boolean isCriptareConsent() { return criptareConsent; }
    public boolean isAnspdcpConsent() { return anspdcpConsent; }
}
