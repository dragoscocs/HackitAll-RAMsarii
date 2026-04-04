package com.ecosync.model;

import jakarta.persistence.*;
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
}
