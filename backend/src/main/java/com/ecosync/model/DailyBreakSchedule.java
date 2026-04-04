package com.ecosync.model;

import java.util.List;

/**
 * Full daily break schedule returned by GET /api/breaks/{userId}/schedule.
 *
 * Contains:
 *  - scheduledBreakHours: sorted list of exact hours (integers) when breaks are planned
 *  - workStartHour / workEndHour: the user's working window
 *  - meetings: list of today's meeting slots (for frontend timeline rendering)
 *  - nextBreakHour: the upcoming break (>= current hour), or -1 if none left today
 */
public class DailyBreakSchedule {

    private int workStartHour;
    private int workEndHour;
    private List<Integer> scheduledBreakHours;
    private List<MeetingSlot> meetings;
    private int nextBreakHour; // -1 if no more breaks today

    public DailyBreakSchedule() {}

    public DailyBreakSchedule(int workStartHour, int workEndHour,
                               List<Integer> scheduledBreakHours,
                               List<MeetingSlot> meetings,
                               int nextBreakHour) {
        this.workStartHour        = workStartHour;
        this.workEndHour          = workEndHour;
        this.scheduledBreakHours  = scheduledBreakHours;
        this.meetings             = meetings;
        this.nextBreakHour        = nextBreakHour;
    }

    // ── Getters & setters ─────────────────────────────────────────────────────

    public int getWorkStartHour() { return workStartHour; }
    public void setWorkStartHour(int workStartHour) { this.workStartHour = workStartHour; }

    public int getWorkEndHour() { return workEndHour; }
    public void setWorkEndHour(int workEndHour) { this.workEndHour = workEndHour; }

    public List<Integer> getScheduledBreakHours() { return scheduledBreakHours; }
    public void setScheduledBreakHours(List<Integer> scheduledBreakHours) {
        this.scheduledBreakHours = scheduledBreakHours;
    }

    public List<MeetingSlot> getMeetings() { return meetings; }
    public void setMeetings(List<MeetingSlot> meetings) { this.meetings = meetings; }

    public int getNextBreakHour() { return nextBreakHour; }
    public void setNextBreakHour(int nextBreakHour) { this.nextBreakHour = nextBreakHour; }
}
