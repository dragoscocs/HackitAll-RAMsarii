package com.ecosync.model;

import java.time.LocalTime;
import java.util.List;

public class DailyBreakSchedule {

    private int workStartHour;
    private int workEndHour;
    private List<SmartBreak> scheduledBreaks;
    private List<MeetingSlot> meetings;
    private SmartBreak nextBreak;

    public DailyBreakSchedule() {}

    public DailyBreakSchedule(int workStartHour, int workEndHour,
                               List<SmartBreak> scheduledBreaks,
                               List<MeetingSlot> meetings,
                               SmartBreak nextBreak) {
        this.workStartHour        = workStartHour;
        this.workEndHour          = workEndHour;
        this.scheduledBreaks      = scheduledBreaks;
        this.meetings             = meetings;
        this.nextBreak            = nextBreak;
    }

    public int getWorkStartHour() { return workStartHour; }
    public void setWorkStartHour(int workStartHour) { this.workStartHour = workStartHour; }

    public int getWorkEndHour() { return workEndHour; }
    public void setWorkEndHour(int workEndHour) { this.workEndHour = workEndHour; }

    public List<SmartBreak> getScheduledBreaks() { return scheduledBreaks; }
    public void setScheduledBreaks(List<SmartBreak> scheduledBreaks) { this.scheduledBreaks = scheduledBreaks; }

    public List<MeetingSlot> getMeetings() { return meetings; }
    public void setMeetings(List<MeetingSlot> meetings) { this.meetings = meetings; }

    public SmartBreak getNextBreak() { return nextBreak; }
    public void setNextBreak(SmartBreak nextBreak) { this.nextBreak = nextBreak; }
}
