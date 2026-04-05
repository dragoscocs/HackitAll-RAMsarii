package com.ecosync.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;
    private String city;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_sports", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "sport")
    private List<String> preferredSports = new ArrayList<>();

    private int ecoPoints = 0;
    private int currentStreak = 0;

    // Daily tracking fields
    private String workLocation;          // "HOME" | "OFFICE" | null (not set today)
    @Column(columnDefinition = "integer default 0")
    private Integer breaksTakenToday = 0;
    @Column(columnDefinition = "integer default 0")
    private Integer matchesThisMonth = 0;
    private LocalDate lastLoginDate;
    private LocalDate lastBreakDate;      // last day user took a break (for streak)
    private String workSchedule;

    @Column(columnDefinition = "TEXT")
    private String userPersonaPrompt;

    @Column(columnDefinition = "TEXT")
    private String userHealthLimits;

    private LocalTime workStartTime = LocalTime.of(9, 0);
    private LocalTime workEndTime = LocalTime.of(17, 0);

    // Legal consents
    private boolean gdprConsent = false;
    private boolean criptareConsent = false;
    private boolean anspdcpConsent = false;

    @Column(columnDefinition = "TEXT")
    private String profilePicture;

    public User() {}

    public User(String name, String email, String password, String city, List<String> preferredSports) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.city = city;
        this.preferredSports = preferredSports;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public List<String> getPreferredSports() { return preferredSports; }
    public void setPreferredSports(List<String> preferredSports) { this.preferredSports = preferredSports; }

    public int getEcoPoints() { return ecoPoints; }
    public void setEcoPoints(int ecoPoints) { this.ecoPoints = ecoPoints; }

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public String getWorkLocation() { return workLocation; }
    public void setWorkLocation(String workLocation) { this.workLocation = workLocation; }

    public int getBreaksTakenToday() { return breaksTakenToday != null ? breaksTakenToday : 0; }
    public void setBreaksTakenToday(int breaksTakenToday) { this.breaksTakenToday = breaksTakenToday; }

    public int getMatchesThisMonth() { return matchesThisMonth != null ? matchesThisMonth : 0; }
    public void setMatchesThisMonth(int matchesThisMonth) { this.matchesThisMonth = matchesThisMonth; }

    public LocalDate getLastLoginDate() { return lastLoginDate; }
    public void setLastLoginDate(LocalDate lastLoginDate) { this.lastLoginDate = lastLoginDate; }

    public LocalDate getLastBreakDate() { return lastBreakDate; }
    public void setLastBreakDate(LocalDate lastBreakDate) { this.lastBreakDate = lastBreakDate; }

    public String getWorkSchedule() { return workSchedule; }
    public void setWorkSchedule(String workSchedule) { this.workSchedule = workSchedule; }

    public String getUserPersonaPrompt() { return userPersonaPrompt; }
    public void setUserPersonaPrompt(String userPersonaPrompt) { this.userPersonaPrompt = userPersonaPrompt; }

    public String getUserHealthLimits() { return userHealthLimits; }
    public void setUserHealthLimits(String userHealthLimits) { this.userHealthLimits = userHealthLimits; }

    public LocalTime getWorkStartTime() { return workStartTime != null ? workStartTime : LocalTime.of(9, 0); }
    public void setWorkStartTime(LocalTime workStartTime) { this.workStartTime = workStartTime; }

    public LocalTime getWorkEndTime() { return workEndTime != null ? workEndTime : LocalTime.of(17, 0); }
    public void setWorkEndTime(LocalTime workEndTime) { this.workEndTime = workEndTime; }

    public boolean isGdprConsent() { return gdprConsent; }
    public void setGdprConsent(boolean gdprConsent) { this.gdprConsent = gdprConsent; }

    public boolean isCriptareConsent() { return criptareConsent; }
    public void setCriptareConsent(boolean criptareConsent) { this.criptareConsent = criptareConsent; }

    public boolean isAnspdcpConsent() { return anspdcpConsent; }
    public void setAnspdcpConsent(boolean anspdcpConsent) { this.anspdcpConsent = anspdcpConsent; }

    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
}
