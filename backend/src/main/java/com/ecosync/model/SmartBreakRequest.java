package com.ecosync.model;

public record SmartBreakRequest(
    String scheduleContext,
    int currentMood,
    String timeOfDay
) {}
