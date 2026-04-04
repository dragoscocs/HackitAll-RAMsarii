package com.ecosync.model;

public class MeetingSlot {
    private int startHour;
    private int startMinute;
    private int endHour;
    private int endMinute;
    private String title;

    public MeetingSlot() {}

    public MeetingSlot(int startHour, int startMinute, int endHour, int endMinute, String title) {
        this.startHour = startHour;
        this.startMinute = startMinute;
        this.endHour = endHour;
        this.endMinute = endMinute;
        this.title = title;
    }

    public int getStartHour() { return startHour; }
    public void setStartHour(int startHour) { this.startHour = startHour; }

    public int getStartMinute() { return startMinute; }
    public void setStartMinute(int startMinute) { this.startMinute = startMinute; }

    public int getEndHour() { return endHour; }
    public void setEndHour(int endHour) { this.endHour = endHour; }

    public int getEndMinute() { return endMinute; }
    public void setEndMinute(int endMinute) { this.endMinute = endMinute; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}
