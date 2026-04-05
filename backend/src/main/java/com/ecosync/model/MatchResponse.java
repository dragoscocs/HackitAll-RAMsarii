package com.ecosync.model;

import java.util.List;

public class MatchResponse {

    private String matchedEmployeeName;
    private double matchScore;
    private String aiCustomMessage;
    private String city;
    private List<String> sports;
    private Integer age;
    private String gender;

    public MatchResponse() {}

    public MatchResponse(String matchedEmployeeName, double matchScore, String aiCustomMessage) {
        this.matchedEmployeeName = matchedEmployeeName;
        this.matchScore = matchScore;
        this.aiCustomMessage = aiCustomMessage;
    }

    public String getMatchedEmployeeName() { return matchedEmployeeName; }
    public void setMatchedEmployeeName(String matchedEmployeeName) { this.matchedEmployeeName = matchedEmployeeName; }

    public double getMatchScore() { return matchScore; }
    public void setMatchScore(double matchScore) { this.matchScore = matchScore; }

    public String getAiCustomMessage() { return aiCustomMessage; }
    public void setAiCustomMessage(String aiCustomMessage) { this.aiCustomMessage = aiCustomMessage; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public List<String> getSports() { return sports; }
    public void setSports(List<String> sports) { this.sports = sports; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
}
