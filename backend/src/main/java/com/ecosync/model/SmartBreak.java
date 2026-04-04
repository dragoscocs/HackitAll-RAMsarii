package com.ecosync.model;

import java.time.LocalTime;

public class SmartBreak {
    private String type;
    private LocalTime time;
    private String reason;

    public SmartBreak() {}

    public SmartBreak(String type, LocalTime time, String reason) {
        this.type = type;
        this.time = time;
        this.reason = reason;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public LocalTime getTime() { return time; }
    public void setTime(LocalTime time) { this.time = time; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    @Override
    public String toString() {
        return "SmartBreak{" +
                "type='" + type + '\'' +
                ", time=" + time +
                ", reason='" + reason + '\'' +
                '}';
    }
}
