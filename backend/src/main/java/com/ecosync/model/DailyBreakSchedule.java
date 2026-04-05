package com.ecosync.model;

import java.time.LocalTime;
import java.util.List;

public class DailyBreakSchedule {

    private LocalTime workStart;
    private LocalTime workEnd;
    private List<SmartBreak> scheduledBreaks;
    private List<MeetingSlot> meetings;
    private SmartBreak nextBreak;

    public DailyBreakSchedule() {}

    public DailyBreakSchedule(LocalTime workStart, LocalTime workEnd,
                               List<SmartBreak> scheduledBreaks,
                               List<MeetingSlot> meetings,
                               SmartBreak nextBreak) {
        this.workStart            = workStart;
        this.workEnd              = workEnd;
        this.scheduledBreaks      = scheduledBreaks;
        this.meetings             = meetings;
        this.nextBreak            = nextBreak;
    }

    public LocalTime getWorkStart() { return workStart; }
    public void setWorkStart(LocalTime workStart) { this.workStart = workStart; }

    public LocalTime getWorkEnd() { return workEnd; }
    public void setWorkEnd(LocalTime workEnd) { this.workEnd = workEnd; }

    public List<SmartBreak> getScheduledBreaks() { return scheduledBreaks; }
    public void setScheduledBreaks(List<SmartBreak> scheduledBreaks) { this.scheduledBreaks = scheduledBreaks; }

    public List<MeetingSlot> getMeetings() { return meetings; }
    public void setMeetings(List<MeetingSlot> meetings) { this.meetings = meetings; }

    public SmartBreak getNextBreak() { return nextBreak; }
    public void setNextBreak(SmartBreak nextBreak) { this.nextBreak = nextBreak; }
}
