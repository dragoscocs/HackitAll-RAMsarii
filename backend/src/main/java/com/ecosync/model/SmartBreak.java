package com.ecosync.model;

import java.time.LocalTime;

public class SmartBreak {
    private String type;
    private LocalTime time;
    private int durationMinutes;
    private String reason;

    public SmartBreak() {}

    public SmartBreak(String type, LocalTime time, int durationMinutes, String reason) {
        this.type = type;
        this.time = time;
        this.durationMinutes = durationMinutes;
        this.reason = reason;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public LocalTime getTime() { return time; }
    public void setTime(LocalTime time) { this.time = time; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    @Override
    public String toString() {
        return "SmartBreak{" +
                "type='" + type + '\'' +
                ", time=" + time +
                ", durationMinutes=" + durationMinutes +
                ", reason='" + reason + '\'' +
                '}';
    }
}
