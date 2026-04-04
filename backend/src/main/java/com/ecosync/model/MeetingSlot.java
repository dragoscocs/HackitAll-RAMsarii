package com.ecosync.model;

/**
 * Represents a single meeting/calendar event for a given day.
 * Used as input to the SmartBreakService algorithm.
 *
 * startHour and endHour are expressed as integers (e.g., 9 = 09:00, 14 = 14:00).
 * This keeps the algorithm simple and ensures "top of the hour" semantics.
 */
public class MeetingSlot {

    private int startHour;   // e.g. 9  = 09:00
    private int endHour;     // e.g. 10 = 10:00
    private String title;

    public MeetingSlot() {}

    public MeetingSlot(int startHour, int endHour, String title) {
        this.startHour = startHour;
        this.endHour   = endHour;
        this.title     = title;
    }

    // ── Getters & setters ─────────────────────────────────────────────────────

    public int getStartHour() { return startHour; }
    public void setStartHour(int startHour) { this.startHour = startHour; }

    public int getEndHour() { return endHour; }
    public void setEndHour(int endHour) { this.endHour = endHour; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}
