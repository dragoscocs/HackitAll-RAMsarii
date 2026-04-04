package com.ecosync.model;

import java.util.List;

public class AuthResponse {
    private String token;
    private Long userId;
    private String name;
    private String city;
    private List<String> preferredSports;

    public AuthResponse(String token, User user) {
        this.token = token;
        this.userId = user.getId();
        this.name = user.getName();
        this.city = user.getCity();
        this.preferredSports = user.getPreferredSports();
    }

    public String getToken() { return token; }
    public Long getUserId() { return userId; }
    public String getName() { return name; }
    public String getCity() { return city; }
    public List<String> getPreferredSports() { return preferredSports; }
}
