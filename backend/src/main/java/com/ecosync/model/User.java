package com.ecosync.model;

import java.util.List;

public class User {

    private Long id;
    private String name;
    private String email;
    private String password;
    private String city;
    private List<String> preferredSports;

    public User() {}

    public User(Long id, String name, String email, String password, String city, List<String> preferredSports) {
        this.id = id;
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
}
