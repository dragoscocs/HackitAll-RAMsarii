import { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { generateCalendarForUser } from '../data/calendarData'

export const MEETING_TYPES_MAP = {
  standup: { label: 'Standup', color: '#34d399', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-300' },
  planning: { label: 'Planning', color: '#818cf8', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30', text: 'text-indigo-300' },
  'one-on-one': { label: '1:1', color: '#a78bfa', bg: 'bg-violet-500/15', border: 'border-violet-500/30', text: 'text-violet-300' },
  team: { label: 'Team Sync', color: '#38bdf8', bg: 'bg-sky-500/15', border: 'border-sky-500/30', text: 'text-sky-300' },
  review: { label: 'Review', color: '#fb923c', bg: 'bg-orange-500/15', border: 'border-orange-500/30', text: 'text-orange-300' },
  'all-hands': { label: 'All Hands', color: '#f472b6', bg: 'bg-pink-500/15', border: 'border-pink-500/30', text: 'text-pink-300' },
  workshop: { label: 'Workshop', color: '#facc15', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', text: 'text-yellow-300' },
  demo: { label: 'Demo', color: '#4ade80', bg: 'bg-green-500/15', border: 'border-green-500/30', text: 'text-green-300' },
}

function getMondayOfCurrentWeek() {
  const today = new Date()
  const dow = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
  monday.setHours(0, 0, 0, 0)
  return monday
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function calcMoodScore(todayEvts, breaksToday) {
  let score = 80
  const totalMin = todayEvts.reduce((s, ev) => s + ev.duration, 0)
  score -= Math.min(20, Math.floor(totalMin / 30) * 2)

  const sorted = [...todayEvts].sort((a, b) => new Date(a.start) - new Date(b.start))
  for (let i = 1; i < sorted.length; i++) {
    const gap = (new Date(sorted[i].start) - new Date(sorted[i - 1].end)) / 60000
    if (gap < 10) score -= 6
    else if (gap < 20) score -= 2
  }

  todayEvts.filter(ev => ['all-hands', 'workshop'].includes(ev.type)).forEach(() => { score -= 4 })
  todayEvts.filter(ev => new Date(ev.end).getHours() >= 17).forEach(() => { score -= 4 })
  todayEvts.filter(ev => ev.type === 'standup').forEach(() => { score += 2 })
  score += breaksToday * 6

  return Math.max(20, Math.min(100, Math.round(score)))
}

function getMoodFactors(todayEvts, breaksToday) {
  const totalMin = todayEvts.reduce((s, ev) => s + ev.duration, 0)
  const sorted = [...todayEvts].sort((a, b) => new Date(a.start) - new Date(b.start))
  let consecutive = 0
  for (let i = 1; i < sorted.length; i++) {
    if ((new Date(sorted[i].start) - new Date(sorted[i - 1].end)) / 60000 < 10) consecutive++
  }
  const heavy = todayEvts.filter(ev => ['all-hands', 'workshop'].includes(ev.type)).length
  const late = todayEvts.filter(ev => new Date(ev.end).getHours() >= 17).length

  return [
    { label: 'Ședințe azi', value: `${(totalMin / 60).toFixed(1)}h`, delta: -Math.min(20, Math.floor(totalMin / 30) * 2), icon: '📅' },
    { label: 'Înapoi-în-înapoi', value: `${consecutive} pauze`, delta: -(consecutive * 4), icon: '⚡' },
    { label: 'Ședințe grele', value: `${heavy} sesiuni`, delta: -(heavy * 4), icon: '🏋️' },
    { label: 'Ședințe târzii', value: `${late} după 17:00`, delta: -(late * 4), icon: '🌙' },
    { label: 'Pauze luate', value: `${breaksToday} pauze`, delta: breaksToday * 6, icon: '🌿' },
  ]
}

function getMoodLabel(score) {
  if (score >= 80) return { text: 'Excelent', color: 'text-emerald-400' }
  if (score >= 65) return { text: 'Bine', color: 'text-sky-400' }
  if (score >= 50) return { text: 'Moderat', color: 'text-amber-400' }
  return { text: 'Obositor', color: 'text-red-400' }
}

function getMoodRecommendation(score) {
  if (score < 50) return 'Ziua ta e destul de intensă. Ia o pauză de 3 minute acum — chiar și o scurtă plimbare îmbunătățește concentrarea cu 20%. Consideră să blochezi timp de focus în calendar.'
  if (score < 65) return 'Ai câteva ședințe înghesuiate. Încearcă să lași 10 minute între ele pentru recuperare mentală. O pauză scurtă de mișcare ar face minuni.'
  if (score >= 80) return 'Zi bine structurată! Continui cu energie bună. Menține ritmul și nu uita să te hidratezi.'
  return 'Zi echilibrată. Ai grijă de pauze regulate și limitează ședințele consecutive.'
}

function calcBreakOpportunities(todayEvts) {
  const today = new Date()
  const DAY_START = new Date(today); DAY_START.setHours(9, 0, 0, 0)
  const DAY_END = new Date(today); DAY_END.setHours(18, 0, 0, 0)

  const sorted = [...todayEvts]
    .map(ev => ({ start: new Date(ev.start), end: new Date(ev.end) }))
    .sort((a, b) => a.start - b.start)

  const slots = []
  let cursor = new Date(DAY_START)

  for (const ev of sorted) {
    if (ev.start > cursor) {
      const gapMin = (ev.start - cursor) / 60000
      if (gapMin >= 15) {
        slots.push({
          startTime: new Date(cursor),
          endTime: new Date(ev.start),
          durationMinutes: Math.round(gapMin),
        })
      }
    }
    if (ev.end > cursor) cursor = new Date(ev.end)
  }

  // Gap after last meeting until end of day
  if (cursor < DAY_END) {
    const gapMin = (DAY_END - cursor) / 60000
    if (gapMin >= 15) {
      slots.push({
        startTime: new Date(cursor),
        endTime: new Date(DAY_END),
        durationMinutes: Math.round(gapMin),
      })
    }
  }

  return slots
}

export function calcSmartBreaks(todayEvts, workSchedule, dateContext = new Date()) {
  const scheduleStr = workSchedule || '9-17'
  const resultBreaks = []

  const [startH, endH] = scheduleStr.split('-').map(Number)
  const workStart = new Date(dateContext); workStart.setHours(startH, 0, 0, 0)
  const workEnd = new Date(dateContext); workEnd.setHours(endH, 0, 0, 0)

  const bufferStart = new Date(workStart.getTime() + 60 * 60 * 1000)
  const bufferEnd = new Date(workEnd.getTime() - 60 * 60 * 1000)

  const sortedMeetings = todayEvts
    .filter(m => new Date(m.end) > workStart && new Date(m.start) < workEnd)
    .sort((a, b) => new Date(a.start) - new Date(b.start))

  // 1. Identify Fatigue Blocks (Continuous meetings with < 5 min gap)
  const fatigueBlocks = []
  if (sortedMeetings.length > 0) {
    let currentBlock = [sortedMeetings[0]]
    for (let i = 1; i < sortedMeetings.length; i++) {
      const prev = currentBlock[currentBlock.length - 1]
      const curr = sortedMeetings[i]
      const gapMin = (new Date(curr.start) - new Date(prev.end)) / 60000

      if (gapMin < 5) currentBlock.push(curr)
      else {
        fatigueBlocks.push([...currentBlock])
        currentBlock = [curr]
      }
    }
    fatigueBlocks.push([...currentBlock])
  }

  // Schedule Priority 1 Breaks: If block duration >= 90 mins
  fatigueBlocks.forEach(block => {
    const blockStart = new Date(block[0].start)
    const blockEnd = new Date(block[block.length - 1].end)
    const totalDurationMins = (blockEnd - blockStart) / 60000

    if (totalDurationMins >= 90) {
      const breakTime = new Date(blockEnd.getTime() + 2 * 60 * 1000)
      if (breakTime >= workStart && breakTime <= workEnd) {
        resultBreaks.push({
          type: 'FATIGUE_RECOVERY',
          time: breakTime,
          durationMinutes: 3,
          reason: 'Recuperare post-efort intensiv'
        })
      }
    }
  })

  // Calculate free slots for breaks (>= 3 min gap)
  const freeSlots = []
  let cursor = bufferStart

  sortedMeetings.forEach(m => {
    const mStart = new Date(m.start)
    if (mStart > cursor && cursor < bufferEnd) {
      const slotEnd = mStart < bufferEnd ? mStart : bufferEnd
      const gapMin = (slotEnd - cursor) / 60000
      if (gapMin >= 3) freeSlots.push({ start: new Date(cursor), end: new Date(slotEnd) })
    }
    if (new Date(m.end) > cursor) cursor = new Date(m.end)
  })

  if (cursor < bufferEnd) {
    const gapMin = (bufferEnd - cursor) / 60000
    if (gapMin >= 3) freeSlots.push({ start: new Date(cursor), end: new Date(bufferEnd) })
  }

  // --- Lunch Scheduling Algorithm ---
  let bestLunchTime = null;
  let bestLunchDiff = Infinity;
  const lunchIdeal = new Date(dateContext); lunchIdeal.setHours(12, 30, 0, 0);
  const lunchMin = new Date(dateContext); lunchMin.setHours(10, 30, 0, 0);
  const lunchMax = new Date(dateContext); lunchMax.setHours(15, 30, 0, 0);

  // Try primary lunch window (10:30 to 15:30)
  for (let slot of freeSlots) {
    const gap = (slot.end - slot.start) / 60000;
    if (gap >= 15) {
      let sCursor = new Date(slot.start);
      const sMax = new Date(slot.end.getTime() - 15 * 60000);
      while (sCursor <= sMax) {
        const sCursorEnd = new Date(sCursor.getTime() + 15 * 60000);
        if (sCursor >= lunchMin && sCursorEnd <= lunchMax) {
          const diff = Math.abs(sCursor - lunchIdeal) / 60000;
          if (diff < bestLunchDiff) {
            bestLunchDiff = diff;
            bestLunchTime = new Date(sCursor);
          }
        }
        sCursor = new Date(sCursor.getTime() + 5 * 60000);
      }
    }
  }

  // If no lunch found in primary bounds, search for earliest possible lunch after 15:30
  if (!bestLunchTime) {
    for (let slot of freeSlots) {
      const gap = (slot.end - slot.start) / 60000;
      if (gap >= 15) {
        let sCursor = new Date(slot.start);
        const sMax = new Date(slot.end.getTime() - 15 * 60000);
        while (sCursor <= sMax) {
          if (sCursor >= lunchMax) { // >= 15:30
            if (!bestLunchTime || sCursor < bestLunchTime) {
              bestLunchTime = new Date(sCursor);
            }
          }
          sCursor = new Date(sCursor.getTime() + 5 * 60000);
        }
      }
    }
  }

  if (bestLunchTime) {
    resultBreaks.push({
      type: 'LUNCH',
      time: bestLunchTime,
      durationMinutes: 15,
      reason: 'Pauză de Masă'
    });
  }

  // Target 6 breaks always
  let neededRegularBreaks = 6 - resultBreaks.length

  const isValidGap = (proposedTime) => resultBreaks.every(b => Math.abs(b.time - proposedTime) / 60000 >= 45)

  // Distribute neededRegularBreaks over freeSlots
  for (let slot of freeSlots) {
    let slotCursor = new Date(slot.start.getTime() + 5 * 60000); // Start 5 mins into the free slot
    // Regular break is 3 min long.
    while (slotCursor <= new Date(slot.end.getTime() - 3 * 60000) && neededRegularBreaks > 0) {
      if (isValidGap(slotCursor)) {
        resultBreaks.push({
          type: 'REGULAR',
          time: new Date(slotCursor),
          durationMinutes: 3,
          reason: 'Pauză scurtă de revigorare'
        })
        neededRegularBreaks--;
        slotCursor = new Date(slotCursor.getTime() + 45 * 60000); // Jump forward 45 minutes
      } else {
        slotCursor = new Date(slotCursor.getTime() + 5 * 60000); // Increment slowly
      }
    }
  }

  return resultBreaks.sort((a, b) => a.time - b.time)
}

const CalendarContext = createContext(null)

export function CalendarProvider({ children }) {
  const userEmail = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('syncfit_user') || '{}')?.email || ''
    } catch {
      return ''
    }
  }, [])

  const baseMonday = useMemo(() => getMondayOfCurrentWeek(), [])

  // All 4 weeks of events, generated once
  const events = useMemo(() => generateCalendarForUser(userEmail, baseMonday), [userEmail, baseMonday])

  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0)
  const [connected, setConnected] = useState(false)
  const [breaksToday, setBreaksToday] = useState(1)

  const nextWeek = () => setSelectedWeekOffset(o => Math.min(3, o + 1))
  const prevWeek = () => setSelectedWeekOffset(o => Math.max(0, o - 1))

  // weekStart = Monday of selected week
  const weekStart = useMemo(() => {
    const d = new Date(baseMonday)
    d.setDate(d.getDate() + selectedWeekOffset * 7)
    return d
  }, [baseMonday, selectedWeekOffset])

  // weekDays = Mon-Fri of selected week
  const weekDays = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      return d
    }), [weekStart])

  // todayEvents = events for the actual today (regardless of selected week)
  const todayEvents = useMemo(() => {
    const today = new Date()
    return events
      .filter(ev => isSameDay(new Date(ev.start), today))
      .sort((a, b) => new Date(a.start) - new Date(b.start))
  }, [events])

  const breakOpportunities = useMemo(() => calcBreakOpportunities(todayEvents), [todayEvents])
  const smartBreaks = useMemo(() => {
    const user = JSON.parse(localStorage.getItem('syncfit_user') || '{}')
    return calcSmartBreaks(todayEvents, user.workSchedule, new Date())
  }, [todayEvents])

  const moodScore = useMemo(() => calcMoodScore(todayEvents, breaksToday), [todayEvents, breaksToday])
  const moodFactors = useMemo(() => getMoodFactors(todayEvents, breaksToday), [todayEvents, breaksToday])
  const moodLabel = useMemo(() => getMoodLabel(moodScore), [moodScore])
  const moodReco = useMemo(() => getMoodRecommendation(moodScore), [moodScore])

  // ── Mood override (set after break slider) ──────────────────────────────
  const [moodOverride, setMoodOverride] = useState(null) // 0-100 | null
  const [pendingAiIntervention, setPendingAiIntervention] = useState(null) // { score, userName, sliderValue } | null

  // ── Morning mood (persisted per day via localStorage + custom event) ────
  const [morningMood, setMorningMoodState] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('syncfit_morning_mood') || 'null')
      if (s?.date === new Date().toDateString()) return s.value // 1–5
    } catch { }
    return null
  })

  useEffect(() => {
    const handler = (e) => setMorningMoodState(e.detail.value)
    window.addEventListener('syncfit:morning-mood', handler)
    return () => window.removeEventListener('syncfit:morning-mood', handler)
  }, [])

  // Called from PausePage after user submits the -5..+5 slider
  // 11 steps (-5..+5): step 0 = 0 pts, step 10 = 100 pts → (value+5)/10 * 100
  const setMoodFromSlider = (sliderValue, userName) => {
    const score = Math.round(((sliderValue + 5) / 10) * 100)
    setMoodOverride(score)
    if (sliderValue <= -2) {
      setPendingAiIntervention({ score, userName: userName ?? 'Coleg', sliderValue })
    }
  }

  const clearAiIntervention = () => setPendingAiIntervention(null)

  const connectMicrosoft = () => setConnected(true)
  const recordBreak = () => setBreaksToday(p => p + 1)

  return (
    <CalendarContext.Provider value={{
      events, connected, connectMicrosoft,
      moodScore, moodFactors, moodLabel, moodReco,
      breaksToday, recordBreak,
      selectedWeekOffset, nextWeek, prevWeek,
      weekStart, weekDays,
      todayEvents, breakOpportunities, smartBreaks,
      moodOverride, setMoodFromSlider,
      morningMood,
      pendingAiIntervention, clearAiIntervention,
    }}>
      {children}
    </CalendarContext.Provider>
  )
}

export const useCalendar = () => useContext(CalendarContext)
