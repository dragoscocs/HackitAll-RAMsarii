package com.ecosync.model;

import java.util.List;

public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String city;
    private List<String> preferredSports;

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

    private String workSchedule;
    public String getWorkSchedule() { return workSchedule; }
    public void setWorkSchedule(String workSchedule) { this.workSchedule = workSchedule; }
}
