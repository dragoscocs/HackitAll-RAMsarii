package com.ecosync.model;

public class BreakSuggestion {

    private String time;
    private String suggestionText;
    private boolean isAiGenerated;

    public BreakSuggestion() {}

    public BreakSuggestion(String time, String suggestionText, boolean isAiGenerated) {
        this.time = time;
        this.suggestionText = suggestionText;
        this.isAiGenerated = isAiGenerated;
    }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getSuggestionText() { return suggestionText; }
    public void setSuggestionText(String suggestionText) { this.suggestionText = suggestionText; }

    public boolean isAiGenerated() { return isAiGenerated; }
    public void setAiGenerated(boolean aiGenerated) { isAiGenerated = aiGenerated; }
}
