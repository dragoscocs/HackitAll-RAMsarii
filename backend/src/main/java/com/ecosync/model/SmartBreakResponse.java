package com.ecosync.model;

public record SmartBreakResponse(
    String break_title,
    String description_ro,
    int duration_minutes,
    String activity_type
) {}
