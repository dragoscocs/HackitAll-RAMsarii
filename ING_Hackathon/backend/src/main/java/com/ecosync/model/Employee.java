package com.ecosync.model;

import java.util.List;

public class Employee {

    private Long id;
    private String name;
    private String city;
    private List<String> preferredSports;

    public Employee() {}

    public Employee(Long id, String name, String city, List<String> preferredSports) {
        this.id = id;
        this.name = name;
        this.city = city;
        this.preferredSports = preferredSports;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public List<String> getPreferredSports() { return preferredSports; }
    public void setPreferredSports(List<String> preferredSports) { this.preferredSports = preferredSports; }
}
