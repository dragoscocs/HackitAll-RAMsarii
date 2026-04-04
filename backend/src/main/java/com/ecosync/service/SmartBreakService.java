package com.ecosync.service;

import com.ecosync.model.MeetingSlot;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * ═══════════════════════════════════════════════════════════════════
 *  SmartBreakService — Core Break Scheduling Algorithm
 * ═══════════════════════════════════════════════════════════════════
 *
 * Business Rules (all enforced):
 *
 *  R1. Breaks are only at EXACT hours (10:00, 11:00 … never 10:15).
 *
 *  R2. No break during the FIRST hour of work.
 *      → If work starts at 09:00, first possible break is 10:00.
 *
 *  R3. No break during the LAST hour of work.
 *      → If work ends at 17:00, last possible break is 16:00.
 *      → The window is: (startHour, endHour) exclusive on both ends.
 *
 *  R4. No break that overlaps a MEETING.
 *      → Hour H is blocked if any meeting covers it:
 *         meetingStartHour <= H < meetingEndHour
 *
 *  R5. At least one break every TWO consecutive work hours.
 *      → If the user has worked 2h without a break (and no meeting),
 *        a break MUST be inserted at the current candidate hour.
 *      → If that hour is blocked by a meeting the "debt" counter
 *        is reset (meeting = forced interruption, satisfies the rule).
 */
@Service
public class SmartBreakService {

    /**
     * Computes the full list of scheduled break hours for a workday.
     *
     * @param startHour  First hour of the workday    (e.g. 9 for 09:00)
     * @param endHour    Last  hour of the workday    (e.g. 17 for 17:00)
     * @param meetings   Today's meeting list (sorted or unsorted — handled internally)
     * @return           Sorted list of integer hours when breaks are scheduled
     */
    public List<Integer> computeBreaks(int startHour, int endHour, List<MeetingSlot> meetings) {

        // ── Guard: need at least 3 hours of work (start+1 … end-1) ─────────
        if (endHour - startHour < 3) {
            return Collections.emptyList();
        }

        // ── 1. Build the set of "blocked" hours (covered by a meeting) ──────
        //    A slot H is blocked if any meeting satisfies: start <= H < end
        Set<Integer> blockedByMeeting = new HashSet<>();
        for (MeetingSlot m : meetings) {
            for (int h = m.getStartHour(); h < m.getEndHour(); h++) {
                blockedByMeeting.add(h);
            }
        }

        // ── 2. Define the candidate window [startHour+1 … endHour-1] ────────
        //    R2: skip startHour   (first hour)
        //    R3: skip endHour-1   (last hour before end) AND endHour itself
        int windowStart = startHour + 1; // earliest possible break hour
        int windowEnd   = endHour - 1;   // latest  possible break hour (inclusive)

        // ── 3. Walk through the window hour by hour ─────────────────────────
        List<Integer> scheduled    = new ArrayList<>();
        int consecutiveWorkHours   = 0; // hours worked without a break or meeting

        for (int h = startHour; h < endHour; h++) {

            boolean inBreakWindow = (h >= windowStart && h <= windowEnd);
            boolean blockedNow    = blockedByMeeting.contains(h);

            if (blockedNow) {
                // ── Meeting hour: natural interruption ───────────────────────
                // Reset the consecutive counter — being in a meeting counts
                // as an interruption (the user is not at their desk).
                consecutiveWorkHours = 0;

            } else {
                // ── Free hour: consider adding a break ──────────────────────
                consecutiveWorkHours++;

                if (inBreakWindow) {
                    // R5: mandatory break after 2 consecutive hours
                    boolean mustBreak = (consecutiveWorkHours >= 2);

                    if (mustBreak) {
                        scheduled.add(h);
                        consecutiveWorkHours = 0; // reset after taking a break
                    }
                }
                // If NOT in window (first or last hour) we simply accumulate
                // but do NOT schedule a break.
            }
        }

        // ── 4. Return sorted list (already chronological from the loop) ─────
        return Collections.unmodifiableList(scheduled);
    }

    /**
     * Parses a workSchedule string ("8-16", "9-17", "10-18", "flexible")
     * into a two-element int array: [startHour, endHour].
     *
     * "flexible" is treated as 9–18 (longest reasonable window).
     */
    public int[] parseWorkSchedule(String workSchedule) {
        if (workSchedule == null || workSchedule.isBlank()) {
            return new int[]{9, 17}; // safe default
        }
        if ("flexible".equalsIgnoreCase(workSchedule.trim())) {
            return new int[]{9, 18};
        }
        try {
            String[] parts = workSchedule.trim().split("-");
            int start = Integer.parseInt(parts[0].trim());
            int end   = Integer.parseInt(parts[1].trim());
            return new int[]{start, end};
        } catch (Exception e) {
            return new int[]{9, 17}; // fallback on parse error
        }
    }

    /**
     * Returns the next scheduled break hour that is >= currentHour.
     * Returns -1 if there are no more breaks today.
     */
    public int findNextBreakHour(List<Integer> scheduledBreaks, int currentHour) {
        return scheduledBreaks.stream()
                .filter(h -> h >= currentHour)
                .findFirst()
                .orElse(-1);
    }

    /**
     * Precalculates the total number of required breaks per day based on a strict 1.5-hour interval.
     * Rules:
     * 1. O pauză este planificată matematic la fiecare 1.5 ore.
     * 2. Nicio pauză în prima oră și în ultima oră (t <= totalHours - 1.0).
     * 3. Totalul trebuie menținut obligatoriu între 2 și 6 pauze.
     */
    public int precalculateNumberOfBreaks(int startHour, int endHour) {
        int totalHours = endHour - startHour;
        
        if (totalHours <= 2) {
            return 2; // Forțați minim 2 conform cerinței
        }

        int breaks = 0;
        // Interval de verificare: 1.5, 3.0, 4.5...
        // Condiție restrânsă: < 1.0 nu va fi atinsă (primul e 1.5)
        // t <= totalHours - 1.0 (evită ultima oră asumată)
        for (double t = 1.5; t <= totalHours - 1.0; t += 1.5) {
            breaks++;
        }

        // Clamp între 2 și 6
        return Math.max(2, Math.min(6, breaks));
    }
}
