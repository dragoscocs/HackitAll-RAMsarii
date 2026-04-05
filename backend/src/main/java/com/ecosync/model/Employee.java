package com.ecosync.model;

import java.util.List;

public class Employee {

    private Long id;
    private String name;
    private String city;
    private List<String> preferredSports;
    private int age;
    private String gender;
    private String role;
    private String bio;

    public Employee() {}

    public Employee(Long id, String name, String city, List<String> preferredSports) {
        this.id = id;
        this.name = name;
        this.city = city;
        this.preferredSports = preferredSports;
    }

    public Employee(Long id, String name, int age, String gender, String city,
                    String role, String bio, List<String> preferredSports) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.city = city;
        this.role = role;
        this.bio = bio;
        this.preferredSports = preferredSports;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public List<String> getPreferredSports() { return preferredSports; }
    public void setPreferredSports(List<String> s) { this.preferredSports = s; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}
