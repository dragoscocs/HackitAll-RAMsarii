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

    public List<SmartBreak> computeBreaks(int startHour, int endHour, List<MeetingSlot> meetings) {
        List<SmartBreak> resultBreaks = new ArrayList<>();
        
        LocalTime workStart = LocalTime.of(startHour, 0);
        LocalTime workEnd = LocalTime.of(endHour, 0);
        
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
                if (!breakTime.isBefore(workStart) && !breakTime.isAfter(workEnd)) {
                    resultBreaks.add(new SmartBreak(
                            "FATIGUE_RECOVERY",
                            breakTime,
                            "Recuperare post-efort intensiv (" + totalDurationMins + " min continue)"
                    ));
                }
            }
        }

        // Target 6 breaks always
        int neededRegularBreaks = 6 - resultBreaks.size();

        // Calculate free slots for regular breaks
        List<TimeSlot> freeSlots = new ArrayList<>();
        LocalTime cursor = bufferStart;

        for (MeetingSlot m : sortedMeetings) {
            LocalTime mStart = LocalTime.of(m.getStartHour(), m.getStartMinute());
            LocalTime mEnd = LocalTime.of(m.getEndHour(), m.getEndMinute());
            
            if (mStart.isAfter(cursor) && cursor.isBefore(bufferEnd)) {
                LocalTime slotEnd = mStart.isBefore(bufferEnd) ? mStart : bufferEnd;
                long gapMin = ChronoUnit.MINUTES.between(cursor, slotEnd);
                if (gapMin >= 15) {
                    freeSlots.add(new TimeSlot(cursor, slotEnd));
                }
            }
            if (mEnd.isAfter(cursor)) {
                cursor = mEnd;
            }
        }

        if (cursor.isBefore(bufferEnd)) {
            long gapMin = ChronoUnit.MINUTES.between(cursor, bufferEnd);
            if (gapMin >= 15) {
                freeSlots.add(new TimeSlot(cursor, bufferEnd));
            }
        }

        // Distribute neededRegularBreaks over freeSlots
        for (TimeSlot slot : freeSlots) {
            LocalTime slotCursor = slot.start.plusMinutes(5);
            LocalTime maxSlotCursor = slot.end.minusMinutes(5);
            
            while (slotCursor.isBefore(maxSlotCursor) && neededRegularBreaks > 0) {
                if (isValidGap(slotCursor, resultBreaks)) {
                    resultBreaks.add(new SmartBreak(
                            "REGULAR",
                            slotCursor,
                            "Pauză de distribuție activă"
                    ));
                    neededRegularBreaks--;
                    slotCursor = slotCursor.plusMinutes(45);
                } else {
                    slotCursor = slotCursor.plusMinutes(5);
                }
            }
        }

        // Sort breaks chronologically
        resultBreaks.sort(Comparator.comparing(SmartBreak::getTime));
        return resultBreaks;
    }

    private boolean isValidGap(LocalTime proposedTime, List<SmartBreak> currentBreaks) {
        for (SmartBreak b : currentBreaks) {
            long diffMins = Math.abs(ChronoUnit.MINUTES.between(b.getTime(), proposedTime));
            if (diffMins < 45) {
                return false;
            }
        }
        return true;
    }

    public int[] parseWorkSchedule(String workSchedule) {
        if (workSchedule == null || workSchedule.isBlank()) {
            return new int[]{9, 17};
        }
        if ("flexible".equalsIgnoreCase(workSchedule.trim())) {
            return new int[]{9, 18};
        }
        try {
            String[] parts = workSchedule.trim().split("-");
            int start = Integer.parseInt(parts[0].trim());
            int end = Integer.parseInt(parts[1].trim());
            return new int[]{start, end};
        } catch (Exception e) {
            return new int[]{9, 17};
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
