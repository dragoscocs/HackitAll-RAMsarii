package com.ecosync.service;

import com.ecosync.model.MeetingSlot;
import com.ecosync.model.SmartBreak;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SmartBreakService {

    public List<SmartBreak> computeBreaks(LocalTime workStart, LocalTime workEnd, List<MeetingSlot> meetings) {
        List<SmartBreak> resultBreaks = new ArrayList<>();
        
        LocalTime bufferStart = workStart.plusHours(1);
        LocalTime bufferEnd = workEnd.minusHours(1);

        // Sort and filter meetings
        List<MeetingSlot> sortedMeetings = meetings.stream()
                .filter(m -> {
                    LocalTime mStart = LocalTime.of(m.getStartHour(), m.getStartMinute());
                    LocalTime mEnd = LocalTime.of(m.getEndHour(), m.getEndMinute());
                    return mEnd.isAfter(workStart) && mStart.isBefore(workEnd);
                })
                .sorted(Comparator.comparing(m -> LocalTime.of(m.getStartHour(), m.getStartMinute())))
                .collect(Collectors.toList());

        // 1. Identify Fatigue Blocks (Continuous meetings with < 5 min gap)
        List<List<MeetingSlot>> fatigueBlocks = new ArrayList<>();
        if (!sortedMeetings.isEmpty()) {
            List<MeetingSlot> currentBlock = new ArrayList<>();
            currentBlock.add(sortedMeetings.get(0));
            
            for (int i = 1; i < sortedMeetings.size(); i++) {
                MeetingSlot prev = currentBlock.get(currentBlock.size() - 1);
                MeetingSlot curr = sortedMeetings.get(i);
                
                LocalTime prevEnd = LocalTime.of(prev.getEndHour(), prev.getEndMinute());
                LocalTime currStart = LocalTime.of(curr.getStartHour(), curr.getStartMinute());
                
                long gapMin = ChronoUnit.MINUTES.between(prevEnd, currStart);
                if (gapMin < 5) {
                    currentBlock.add(curr);
                } else {
                    fatigueBlocks.add(new ArrayList<>(currentBlock));
                    currentBlock = new ArrayList<>();
                    currentBlock.add(curr);
                }
            }
            fatigueBlocks.add(currentBlock);
        }

        // Schedule Priority 1 Breaks: If block duration >= 90 mins
        for (List<MeetingSlot> block : fatigueBlocks) {
            MeetingSlot first = block.get(0);
            MeetingSlot last = block.get(block.size() - 1);
            
            LocalTime blockStart = LocalTime.of(first.getStartHour(), first.getStartMinute());
            LocalTime blockEnd = LocalTime.of(last.getEndHour(), last.getEndMinute());
            
            long totalDurationMins = ChronoUnit.MINUTES.between(blockStart, blockEnd);
            
            if (totalDurationMins >= 90) {
                LocalTime breakTime = blockEnd.plusMinutes(2);
                
                // Look-ahead check: ensure we don't start a fatigue break if another meeting begins immediately
                final LocalTime btFinal = breakTime;
                long gapToNext = sortedMeetings.stream()
                        .filter(m -> {
                            LocalTime mStart = LocalTime.of(m.getStartHour(), m.getStartMinute());
                            return !mStart.isBefore(blockEnd);
                        })
                        .mapToLong(m -> ChronoUnit.MINUTES.between(btFinal, LocalTime.of(m.getStartHour(), m.getStartMinute())))
                        .findFirst()
                        .orElse(10L);

                if (!breakTime.isBefore(workStart) && !breakTime.isAfter(workEnd) && gapToNext >= 3) {
                    resultBreaks.add(new SmartBreak(
                            "FATIGUE_RECOVERY",
                            breakTime,
                            3,
                            "Recuperare post-efort intensiv"
                    ));
                }
            }
        }

        // Calculate free slots for breaks (now looking for >= 3 min gaps instead of 15)
        List<TimeSlot> freeSlots = new ArrayList<>();
        LocalTime cursor = bufferStart;

        for (MeetingSlot m : sortedMeetings) {
            LocalTime mStart = LocalTime.of(m.getStartHour(), m.getStartMinute());
            LocalTime mEnd = LocalTime.of(m.getEndHour(), m.getEndMinute());
            
            if (mStart.isAfter(cursor) && cursor.isBefore(bufferEnd)) {
                LocalTime slotEnd = mStart.isBefore(bufferEnd) ? mStart : bufferEnd;
                long gapMin = ChronoUnit.MINUTES.between(cursor, slotEnd);
                if (gapMin >= 3) {
                    freeSlots.add(new TimeSlot(cursor, slotEnd));
                }
            }
            if (mEnd.isAfter(cursor)) {
                cursor = mEnd;
            }
        }

        if (cursor.isBefore(bufferEnd)) {
            long gapMin = ChronoUnit.MINUTES.between(cursor, bufferEnd);
            if (gapMin >= 3) freeSlots.add(new TimeSlot(cursor, bufferEnd));
        }

        // --- Lunch Scheduling Algorithm ---
        LocalTime bestLunchTime = null;
        long bestLunchDiff = Long.MAX_VALUE;
        LocalTime lunchIdeal = LocalTime.of(12, 30);
        LocalTime lunchMin = LocalTime.of(10, 30);
        LocalTime lunchMax = LocalTime.of(15, 30);

        // Try primary lunch window (10:30 to 15:30)
        for (TimeSlot slot : freeSlots) {
            long gap = ChronoUnit.MINUTES.between(slot.start, slot.end);
            if (gap >= 15) {
                // Find all valid 15-minute start times in this slot
                LocalTime sCursor = slot.start;
                LocalTime sMax = slot.end.minusMinutes(15);
                while (!sCursor.isAfter(sMax)) {
                    if (!sCursor.isBefore(lunchMin) && !sCursor.plusMinutes(15).isAfter(lunchMax)) {
                        long diff = Math.abs(ChronoUnit.MINUTES.between(sCursor, lunchIdeal));
                        
                        // Check if this lunch intersects with any existing fatigue breaks
                        final LocalTime finalSCursor = sCursor;
                        final LocalTime finalSCursorEnd = sCursor.plusMinutes(15);
                        boolean overlaps = resultBreaks.stream().anyMatch(b -> {
                            LocalTime bEnd = b.getTime().plusMinutes(b.getDurationMinutes());
                            return finalSCursor.isBefore(bEnd) && finalSCursorEnd.isAfter(b.getTime());
                        });

                        if (diff < bestLunchDiff && !overlaps) {
                            bestLunchDiff = diff;
                            bestLunchTime = sCursor;
                        }
                    }
                    sCursor = sCursor.plusMinutes(5); // 5 min increments
                }
            }
        }

        // If no lunch found in primary bounds, search for earliest possible lunch after 15:30
        if (bestLunchTime == null) {
            for (TimeSlot slot : freeSlots) {
                long gap = ChronoUnit.MINUTES.between(slot.start, slot.end);
                if (gap >= 15) {
                    LocalTime sCursor = slot.start;
                    LocalTime sMax = slot.end.minusMinutes(15);
                    while (!sCursor.isAfter(sMax)) {
                        if (!sCursor.isBefore(lunchMax)) { // Must be >= 15:30
                             if (bestLunchTime == null || sCursor.isBefore(bestLunchTime)) {
                                 bestLunchTime = sCursor;
                             }
                        }
                        sCursor = sCursor.plusMinutes(5);
                    }
                }
            }
        }

        if (bestLunchTime != null) {
            resultBreaks.add(new SmartBreak("LUNCH", bestLunchTime, 15, "Pauză de Masă"));
        }
        
        // Target 6 breaks always
        int neededRegularBreaks = 6 - resultBreaks.size();

        // Distribute neededRegularBreaks over freeSlots
        for (TimeSlot slot : freeSlots) {
            LocalTime slotCursor = slot.start.plusMinutes(5);
            LocalTime maxSlotCursor = slot.end.minusMinutes(3); // 3 minute regular breaks
            
            while (!slotCursor.isAfter(maxSlotCursor) && neededRegularBreaks > 0) {
                if (isValidGap(slotCursor, resultBreaks)) {
                    resultBreaks.add(new SmartBreak(
                            "REGULAR",
                            slotCursor,
                            3,
                            "Pauză scurtă de revigorare"
                    ));
                    neededRegularBreaks--;
                    slotCursor = slotCursor.plusMinutes(45);
                } else {
                    slotCursor = slotCursor.plusMinutes(5);
                }
            }
        }

        // Sort breaks chronologically
        // Final Safety Filter: Ensure NO break overlaps ANY meeting
        List<SmartBreak> safeBreaks = resultBreaks.stream()
                .filter(brk -> {
                    LocalTime bS = brk.getTime();
                    LocalTime bE = bS.plusMinutes(brk.getDurationMinutes());
                    return sortedMeetings.stream().noneMatch(m -> {
                        LocalTime mS = LocalTime.of(m.getStartHour(), m.getStartMinute());
                        LocalTime mE = LocalTime.of(m.getEndHour(), m.getEndMinute());
                        return bS.isBefore(mE) && bE.isAfter(mS);
                    });
                })
                .sorted(Comparator.comparing(SmartBreak::getTime))
                .collect(Collectors.toList());

        return safeBreaks;
    }

    private boolean isValidGap(LocalTime proposedTime, List<SmartBreak> currentBreaks) {
        for (SmartBreak b : currentBreaks) {
            long diffMins = Math.abs(ChronoUnit.MINUTES.between(b.getTime(), proposedTime));
            // Prevent 3-min breaks from clashing with the 15-min lunch break boundaries
            if (diffMins < 45) {
                return false;
            }
        }
        return true;
    }

    public LocalTime[] parseWorkSchedule(String workSchedule) {
        if (workSchedule == null || workSchedule.isBlank()) {
            return new LocalTime[]{LocalTime.of(9, 0), LocalTime.of(17, 0)};
        }
        if ("flexible".equalsIgnoreCase(workSchedule.trim())) {
            return new LocalTime[]{LocalTime.of(9, 0), LocalTime.of(18, 0)};
        }
        try {
            String clean = workSchedule.trim().replace(" ", "");
            String[] parts = clean.split("-");
            return new LocalTime[]{ parseTime(parts[0]), parseTime(parts[1]) };
        } catch (Exception e) {
            return new LocalTime[]{LocalTime.of(9, 0), LocalTime.of(17, 0)};
        }
    }

    private LocalTime parseTime(String t) {
        if (t.contains(":")) {
            String[] bits = t.split(":");
            return LocalTime.of(Integer.parseInt(bits[0]), Integer.parseInt(bits[1]));
        } else {
            return LocalTime.of(Integer.parseInt(t), 0);
        }
    }

    public SmartBreak findNextBreak(List<SmartBreak> breaks, LocalTime currentTime) {
        return breaks.stream()
                .filter(b -> !b.getTime().isBefore(currentTime))
                .findFirst()
                .orElse(null);
    }

    private static class TimeSlot {
        LocalTime start;
        LocalTime end;
        TimeSlot(LocalTime start, LocalTime end) {
            this.start = start;
            this.end = end;
        }
    }
}
