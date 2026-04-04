import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Calendar, Wifi, WifiOff, Zap,
  ChevronLeft, ChevronRight, Coffee, Leaf,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCalendar, MEETING_TYPES_MAP, calcSmartBreaks } from '../context/CalendarContext'

/* ── Constants ────────────────────────────────────────────────── */
const DAY_START_H = 8
const DAY_END_H   = 19
const SLOT_H      = 56           // px per hour
const TOTAL_H     = (DAY_END_H - DAY_START_H) * SLOT_H
const HOUR_MARKS  = Array.from({ length: DAY_END_H - DAY_START_H + 1 }, (_, i) => DAY_START_H + i)

const DAYS_RO   = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm']
const MONTHS_RO = ['Ian','Feb','Mar','Apr','Mai','Iun','Iul','Aug','Sep','Oct','Nov','Dec']
const DAY_LABELS = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin']

/* ── Helpers ──────────────────────────────────────────────────── */
function fmtTime(date) {
  const d = new Date(date)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function fmtDate(date) {
  const d = new Date(date)
  return `${DAYS_RO[d.getDay()]}, ${d.getDate()} ${MONTHS_RO[d.getMonth()]}`
}

function fmtShortDate(date) {
  const d = new Date(date)
  return `${d.getDate()} ${MONTHS_RO[d.getMonth()]}`
}

function isSameDay(a, b) {
  const da = new Date(a), db = new Date(b)
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth()  === db.getMonth()  &&
    da.getDate()   === db.getDate()
}

function timeToPx(h, m = 0) {
  return ((h - DAY_START_H) + m / 60) * SLOT_H
}

function durationToPx(min) {
  return Math.max(22, (min / 60) * SLOT_H)
}

function getDayLoad(evts, day) {
  const dayEvts = evts.filter(ev => isSameDay(ev.start, day))
  const totalMin = dayEvts.reduce((s, ev) => s + ev.duration, 0)
  return { count: dayEvts.length, totalMin }
}

function loadColor(totalMin) {
  if (totalMin > 240) return { dot: '🔴', text: 'text-red-400',     bg: 'bg-red-500/50 border-red-500/40',             label: 'Intens' }
  if (totalMin > 120) return { dot: '🟡', text: 'text-amber-400',   bg: 'bg-amber-500/35 border-amber-500/30',         label: 'Mediu'  }
  if (totalMin > 30)  return { dot: '🟢', text: 'text-emerald-400', bg: 'bg-emerald-500/25 border-emerald-500/20',     label: 'Ușor'   }
  return                     { dot: '⚪', text: 'text-slate-400',   bg: 'bg-surface-border/30 border-surface-border/20', label: 'Liber'  }
}

/* ── Teams-style Week Calendar ────────────────────────────────── */
function TeamsWeekCalendar({ weekDays, events, workSchedule, isCurrentWeek, nextBreakToday }) {
  const now        = new Date()
  const gridRef    = useRef(null)
  const currentH   = now.getHours()
  const currentM   = now.getMinutes()
  const currentPx  = timeToPx(currentH, currentM)
  const isWorking  = currentH >= DAY_START_H && currentH < DAY_END_H
  const [highlightPulse, setHighlightPulse] = useState(false)

  const currentHDecimal = currentH + currentM / 60

  // Scroll to current time on mount and handle highlight event
  useEffect(() => {
    if (gridRef.current && isCurrentWeek) {
      gridRef.current.scrollTop = Math.max(0, currentPx - 120)
    }

    const highlightHandler = () => {
      setHighlightPulse(true)
      setTimeout(() => setHighlightPulse(false), 1500)
      if (gridRef.current) gridRef.current.scrollTop = Math.max(0, currentPx - 120)
    }
    
    window.addEventListener('highlight-today', highlightHandler)
    return () => window.removeEventListener('highlight-today', highlightHandler)
  }, [isCurrentWeek, currentPx])

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-surface-border/60 bg-surface-card shadow-xl">
      {/* Day headers */}
      <div className="flex border-b border-surface-border/50 bg-zinc-900/60 backdrop-blur-sm">
        {/* Time gutter spacer */}
        <div className="w-[52px] shrink-0 border-r border-surface-border/30 flex items-end justify-center pb-2">
          <span className="text-[9px] text-slate-700 font-medium">GMT+2</span>
        </div>
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, now)
          return (
            <div
              key={i}
              className={`flex-1 flex flex-col items-center py-3 border-r border-surface-border/30 last:border-r-0 transition-colors ${
                isToday ? 'bg-indigo-500/8' : ''
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? 'text-indigo-400' : 'text-slate-500'}`}>
                {DAY_LABELS[i]}
              </span>
              <div className={`mt-1.5 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
                isToday
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-slate-300 hover:bg-surface-border/40'
              }`}>
                {day.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Scrollable time grid */}
      <div ref={gridRef} className="overflow-y-auto" style={{ maxHeight: 548 }}>
        <div className="flex" style={{ height: TOTAL_H }}>

          {/* Time labels */}
          <div className="w-[52px] shrink-0 relative border-r border-surface-border/30 bg-zinc-950/30">
            {HOUR_MARKS.map(h => (
              <div
                key={h}
                className="absolute right-2 -translate-y-1/2 flex items-center"
                style={{ top: timeToPx(h) }}
              >
                <span className="text-[9px] text-slate-600 font-medium tabular-nums whitespace-nowrap">
                  {String(h).padStart(2,'0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIdx) => {
            const isToday = isSameDay(day, now)
            const isPastDay = day < new Date(now.setHours(0,0,0,0))
            
            const dayEvents = events
              .filter(ev => isSameDay(new Date(ev.start), day))
              .sort((a, b) => new Date(a.start) - new Date(b.start))
              
            const rawBreaks = calcSmartBreaks(dayEvents, workSchedule, day)
            
            // Adjust break times to map correctly to this specific day's visual position
            // (calcSmartBreaks normally attaches the current day context to the Date object)
            const scheduledBreaks = rawBreaks.map(b => {
              const adjustedTime = new Date(day)
              adjustedTime.setHours(b.time.getHours(), b.time.getMinutes(), 0, 0)
              return { ...b, time: adjustedTime }
            })

            return (
              <div
                key={dayIdx}
                className={`flex-1 relative border-r border-surface-border/20 last:border-r-0 transition-all duration-700 ${
                  isToday 
                    ? (highlightPulse ? 'bg-indigo-500/20 ring-2 ring-indigo-400/50 shadow-[inset_0_0_30px_rgba(99,102,241,0.25)]' : 'bg-indigo-500/[0.025]')
                    : ''
                }`}
              >
                {/* Hour grid lines */}
                {HOUR_MARKS.map(h => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-surface-border/20"
                    style={{ top: timeToPx(h) }}
                  />
                ))}
                {/* Half-hour lines (subtle) */}
                {HOUR_MARKS.slice(0, -1).map(h => (
                  <div
                    key={`h-${h}`}
                    className="absolute left-0 right-0 border-t border-surface-border/8"
                    style={{ top: timeToPx(h, 30) }}
                  />
                ))}

                {/* Meeting events */}
                {dayEvents.map((ev, i) => {
                  const type   = MEETING_TYPES_MAP[ev.type] ?? MEETING_TYPES_MAP.team
                  const evDate = new Date(ev.start)
                  const top    = timeToPx(evDate.getHours(), evDate.getMinutes())
                  const height = durationToPx(ev.duration)

                  return (
                    <div
                      key={i}
                      title={`${ev.subject}\n${fmtTime(ev.start)} – ${fmtTime(ev.end)}\n${ev.organizer ?? ''}`}
                      className={`absolute inset-x-0.5 rounded-lg border px-2 py-1 overflow-hidden cursor-default hover:brightness-110 hover:z-10 transition-all z-10 group ${type.bg} ${type.border}`}
                      style={{ top: top + 1, height: height - 2 }}
                    >
                      <p className="text-[10px] font-semibold text-white truncate leading-tight">{ev.subject}</p>
                      {height > 36 && (
                        <p className={`text-[8px] mt-0.5 truncate font-medium ${type.text}`}>
                          {fmtTime(ev.start)} – {fmtTime(ev.end)}
                        </p>
                      )}
                      {height > 52 && ev.organizer && (
                        <p className="text-[8px] text-slate-500 truncate mt-0.5">{ev.organizer}</p>
                      )}
                    </div>
                  )
                })}

                {/* AI Break blocks (All Days) */}
                {scheduledBreaks.map((brk, idx) => {
                  const h = brk.time.getHours()
                  const m = brk.time.getMinutes()
                  const breakHDecimal = h + m / 60
                  
                  // A break is past if it's on a past day, or earlier today
                  const isPast = isPastDay || (isToday && breakHDecimal + 0.25 < currentHDecimal)
                  
                  // Only pulse "Next Break" if it's today
                  const isNext = isToday && nextBreakToday && 
                                 h === nextBreakToday.time.getHours() && 
                                 m === nextBreakToday.time.getMinutes()
                  
                  const top    = timeToPx(h, m)
                  const height = Math.max(22, durationToPx(15))

                  return (
                    <div
                      key={`break-${idx}`}
                      title={`Pauză AI: ${brk.reason} — ${fmtTime(brk.time)} (15 min)`}
                      className={`absolute inset-x-0.5 rounded-md border px-1.5 overflow-hidden z-20 transition-all ${
                        isPast
                          ? 'opacity-30 bg-emerald-500/10 border-emerald-500/15'
                          : isNext
                          ? 'bg-emerald-500/25 border-emerald-400/60 ring-1 ring-emerald-400/30 shadow-sm shadow-emerald-500/20'
                          : 'bg-emerald-500/15 border-emerald-500/35'
                      }`}
                      style={{ top: top + 1, height: height - 2 }}
                    >
                      <div className="flex items-center gap-0.5 h-full">
                        <span className="text-[8px]">🌿</span>
                        <span className={`text-[8px] font-bold leading-none ${isNext ? 'text-emerald-200' : 'text-emerald-400'}`}>
                          Pauză AI{isNext ? ' ⚡' : ''}
                        </span>
                      </div>
                    </div>
                  )
                })}

                {/* Current time indicator */}
                {isToday && isWorking && (
                  <div
                    className="absolute left-0 right-0 z-30 pointer-events-none"
                    style={{ top: currentPx }}
                  >
                    <div className="absolute left-0 right-0 h-[2px] bg-red-400/80 shadow-[0_0_6px_rgba(248,113,113,0.5)]" />
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.7)]" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-t border-surface-border/40 bg-zinc-950/30">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-rose-500/70" />
          <span className="text-[10px] text-slate-500 font-medium">Ședință</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60 border border-emerald-500/40" />
          <span className="text-[10px] text-slate-500 font-medium">Pauză AI</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="text-[10px] text-slate-500 font-medium">Acum</span>
        </div>
        <div className="ml-auto flex flex-wrap gap-1.5">
          {Object.entries(MEETING_TYPES_MAP).slice(0, 4).map(([key, val]) => (
            <span key={key} className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md border ${val.bg} ${val.border} ${val.text}`}>
              {val.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── AI Break Schedule Card ───────────────────────────────────── */
function AiBreakScheduleCard({ scheduledBreaks, nextBreak, workSchedule }) {
  const now            = new Date()
  const currentHDec    = now.getHours() + now.getMinutes() / 60
  const isWeekend      = now.getDay() === 0 || now.getDay() === 6

  if (isWeekend) return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-base">🌴</span>
        <h3 className="text-sm font-semibold text-emerald-300">Weekend</h3>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">Pauzele tale AI revin luni. Bucură-te de timp liber!</p>
    </div>
  )

  const scheduleStr = workSchedule || '9-17'
  const [startH, endH] = scheduleStr.split('-').map(Number)
  const workStartHour = startH
  const workEndHour = endH
  const totalHours = workEndHour - workStartHour

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">Pauze AI Azi</h3>
        </div>
        <span className="text-[10px] text-slate-500 font-medium tabular-nums">
          {String(workStartHour).padStart(2,'0')}:00 – {String(workEndHour).padStart(2,'0')}:00
        </span>
      </div>

      {scheduledBreaks.length === 0 ? (
        <p className="text-xs text-slate-500">Nicio pauză programată azi.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {scheduledBreaks.map((brk, idx) => {
            const h = brk.time.getHours()
            const m = brk.time.getMinutes()
            const breakH = h + m / 60
            const isPast = breakH + 0.25 < currentHDec
            const isNext = nextBreak && h === nextBreak.time.getHours() && m === nextBreak.time.getMinutes()
            return (
              <div key={idx} title={brk.reason} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold border transition-all select-none cursor-help ${
                isNext
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/25'
                  : isPast
                  ? 'bg-surface/30 border-white/5 text-slate-600 line-through opacity-50'
                  : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              }`}>
                {isNext && <span className="animate-pulse text-[8px] mr-0.5">⚡</span>}
                {fmtTime(brk.time)}
              </div>
            )
          })}
        </div>
      )}

      {/* Compact horizontal timeline bar */}
      {scheduledBreaks.length > 0 && totalHours > 0 && (
        <div className="flex flex-col gap-1">
          <div className="relative h-2.5 bg-surface-border/25 rounded-full overflow-hidden">
            {scheduledBreaks.map((brk, idx) => {
              const h = brk.time.getHours()
              const m = brk.time.getMinutes()
              const breakH = h + m / 60
              const isPast = breakH + 0.25 < currentHDec
              const isNext = nextBreak && h === nextBreak.time.getHours() && m === nextBreak.time.getMinutes()
              const left   = ((breakH - workStartHour) / totalHours) * 100
              return (
                <div key={`timeline-${idx}`}
                  className={`absolute h-full w-2 -translate-x-1/2 rounded-sm ${
                    isPast ? 'bg-slate-600' :
                    isNext ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]' :
                    'bg-emerald-400'
                  }`}
                  style={{ left: `${left}%` }}
                />
              )
            })}
            {/* Current time needle */}
            {currentHDec >= workStartHour && currentHDec <= workEndHour && (
              <div
                className="absolute h-full w-0.5 bg-sky-400"
                style={{ left: `${((currentHDec - workStartHour) / totalHours) * 100}%` }}
              />
            )}
          </div>
          <div className="flex justify-between text-[8px] text-slate-700 font-medium">
            <span>{String(workStartHour).padStart(2,'0')}:00</span>
            <span>{String(workEndHour).padStart(2,'0')}:00</span>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Break Opportunities Panel ────────────────────────────────── */
function BreakOpportunitiesPanel({ breakOpportunities }) {
  const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6
  if (isWeekend) return null

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/25 flex items-center justify-center">
            <Coffee className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">Ferestre Libere</h3>
        </div>
        <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-0.5">
          🌿 Wellbeing
        </span>
      </div>

      {breakOpportunities.length === 0 ? (
        <p className="text-xs text-slate-500">Nicio fereastră liberă de minim 15 min disponibilă azi.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {breakOpportunities.map((slot, i) => {
            const ideal = slot.durationMinutes >= 20
            return (
              <div key={i} className={`flex items-center gap-2.5 rounded-xl px-3 py-2 border transition-all ${
                ideal
                  ? 'bg-emerald-500/8 border-emerald-500/20'
                  : 'bg-surface-border/15 border-surface-border/25'
              }`}>
                <span className="text-sm">{ideal ? '🌿' : '☕'}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-semibold leading-tight ${ideal ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {fmtTime(slot.startTime)} – {fmtTime(slot.endTime)}
                    <span className="ml-1.5 font-normal text-slate-500">· {slot.durationMinutes} min</span>
                  </p>
                </div>
                {ideal && (
                  <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-md px-1.5 py-0.5 shrink-0">
                    ✓ Ideal
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── 4-Week Heatmap ───────────────────────────────────────────── */
function FourWeekHeatmap({ baseMonday, events, selectedWeekOffset, onSelectWeek }) {
  const today = new Date()

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Săptămânile tale — 4 săpt.</h3>
        <span className="text-[9px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded-lg px-2 py-0.5">
          📊 Heatmap
        </span>
      </div>

      {/* Header row */}
      <div className="grid grid-cols-6 gap-1">
        <div />
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-[9px] font-medium text-slate-600">{d}</div>
        ))}
      </div>

      {Array.from({ length: 4 }, (_, weekIdx) => {
        const weekMon = new Date(baseMonday)
        weekMon.setDate(baseMonday.getDate() + weekIdx * 7)
        const isSelected = weekIdx === selectedWeekOffset

        return (
          <button
            key={weekIdx}
            onClick={() => onSelectWeek(weekIdx)}
            className={`grid grid-cols-6 gap-1 rounded-xl p-1.5 border transition-all text-left w-full ${
              isSelected
                ? 'border-brand/50 bg-brand/8 ring-1 ring-brand/20'
                : 'border-surface-border/25 hover:border-surface-border/50'
            }`}
          >
            <div className="flex flex-col justify-center">
              <span className={`text-[9px] font-bold leading-tight ${isSelected ? 'text-brand-light' : 'text-slate-500'}`}>
                S{weekIdx + 1}
              </span>
              <span className="text-[8px] text-slate-700 leading-tight">
                {weekMon.getDate()} {MONTHS_RO[weekMon.getMonth()]}
              </span>
            </div>

            {Array.from({ length: 5 }, (_, dayIdx) => {
              const day = new Date(weekMon)
              day.setDate(weekMon.getDate() + dayIdx)
              const { count, totalMin } = getDayLoad(events, day)
              const { dot, bg } = loadColor(totalMin)
              const isToday = isSameDay(day, today)

              return (
                <div key={dayIdx} className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 border ${bg} ${
                  isToday ? 'ring-2 ring-sky-400/50 ring-offset-1 ring-offset-surface-card' : ''
                }`}>
                  <span className="text-xs leading-none">{dot}</span>
                  <span className="text-[8px] text-slate-600">{count}m</span>
                </div>
              )
            })}
          </button>
        )
      })}

      <div className="flex items-center gap-3 flex-wrap mt-1">
        <span className="flex items-center gap-1 text-[9px] text-slate-600">⚪ Liber</span>
        <span className="flex items-center gap-1 text-[9px] text-slate-600">🟢 Ușor (&lt;2h)</span>
        <span className="flex items-center gap-1 text-[9px] text-slate-600">🟡 Mediu (2-4h)</span>
        <span className="flex items-center gap-1 text-[9px] text-slate-600">🔴 Intens (&gt;4h)</span>
      </div>
    </div>
  )
}

/* ── Mood Card ────────────────────────────────────────────────── */
function MoodCard({ moodScore, moodFactors, moodLabel, moodReco }) {
  const scoreColor =
    moodScore >= 80 ? '#34d399' :
    moodScore >= 65 ? '#38bdf8' :
    moodScore >= 50 ? '#fbbf24' : '#f87171'

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Mood Score Azi</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Calculat din calendarul tău</p>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-lg px-2 py-1">
          <Zap className="w-3 h-3" /> AI
        </div>
      </div>

      {/* Gauge */}
      <div className="flex items-center justify-center">
        <div className="relative" style={{ width: 160, height: 88 }}>
          <svg width="160" height="88" viewBox="0 0 160 88">
            <path d="M 16 80 A 64 64 0 1 1 144 80"
              fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round" />
            <path d="M 16 80 A 64 64 0 1 1 144 80"
              fill="none" stroke={scoreColor} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${(moodScore / 100) * 201} 201`}
              style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 6px ${scoreColor}60)` }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <span className="text-2xl font-bold text-white tabular-nums">{moodScore}</span>
            <span className={`text-[10px] font-semibold ${moodLabel.color}`}>{moodLabel.text}</span>
          </div>
        </div>
      </div>

      {/* Factors */}
      <div className="flex flex-col gap-1.5">
        {moodFactors.map((f, i) => (
          <div key={i} className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="text-xs">{f.icon}</span>
              <span>{f.label}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">{f.value}</span>
            </div>
            <span className={`font-medium tabular-nums ${f.delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {f.delta >= 0 ? `+${f.delta}` : f.delta}
            </span>
          </div>
        ))}
      </div>

      {/* AI Reco */}
      <div className="bg-indigo-500/8 border border-indigo-500/20 rounded-xl p-3">
        <p className="text-[10px] font-semibold text-indigo-300 mb-1 flex items-center gap-1">
          <Zap className="w-2.5 h-2.5" /> Recomandare AI
        </p>
        <p className="text-[10px] text-slate-400 leading-relaxed">{moodReco}</p>
      </div>
    </div>
  )
}

/* ── Meeting Warning Banner ───────────────────────────────────── */
function MeetingWarningBanner({ todayEvents, breakOpportunities }) {
  const now = new Date()
  if (now.getDay() === 0 || now.getDay() === 6) return null

  const workStart = new Date(now); workStart.setHours(8, 0, 0, 0)
  const workEnd   = new Date(now); workEnd.setHours(19, 0, 0, 0)
  if (now < workStart || now > workEnd) return null

  const upcoming = todayEvents
    .map(ev => ({ ...ev, minsUntil: (new Date(ev.start) - now) / 60000 }))
    .filter(ev => ev.minsUntil > 0 && ev.minsUntil < 30)
    .sort((a, b) => a.minsUntil - b.minsUntil)

  if (upcoming.length === 0) return null
  const next = upcoming[0]
  const nextBreak = breakOpportunities.find(s => new Date(s.startTime) > new Date(next.end))

  return (
    <div className="max-w-7xl mx-auto px-6 pt-4 w-full">
      <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-5 py-4">
        <span className="text-xl shrink-0">⚠️</span>
        <div>
          <p className="text-sm font-semibold text-amber-300">
            Ședință în {Math.ceil(next.minsUntil)} minute — nu lua pauza acum!
          </p>
          <p className="text-xs text-amber-200/70 mt-0.5">
            <strong className="text-amber-300">{next.subject}</strong> începe la {fmtTime(next.start)}.
            {nextBreak
              ? ` Fereastra liberă după: ${fmtTime(nextBreak.startTime)} (${nextBreak.durationMinutes} min).`
              : ' Nu mai există ferestre libere după această ședință azi.'}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ────────────────────────────────────────────────── */
export default function ProgramPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [weekendAlert, setWeekendAlert] = useState(false)
  const [m365Alert, setM365Alert] = useState(false)
  const {
    events, connected, connectMicrosoft,
    moodScore, moodFactors, moodLabel, moodReco,
    selectedWeekOffset, nextWeek, prevWeek,
    weekStart, weekDays,
    todayEvents, breakOpportunities, smartBreaks
  } = useCalendar()

  const today = new Date()
  
  // Calculate the "Next Break" for today dynamically
  const nextBreakToday = useMemo(() => {
    const currentHDecimal = today.getHours() + today.getMinutes() / 60;
    return smartBreaks.find(b => {
      const breakHDecimal = b.time.getHours() + b.time.getMinutes() / 60;
      return breakHDecimal + 0.25 >= currentHDecimal;
    })
  }, [smartBreaks])

  /* baseMonday for heatmap */
  const baseMonday = useMemo(() => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() - selectedWeekOffset * 7)
    return d
  }, [weekStart, selectedWeekOffset])

  const isCurrentWeek = selectedWeekOffset === 0

  const weekLabel = useMemo(() => {
    const end = new Date(weekStart)
    end.setDate(weekStart.getDate() + 4)
    return `${weekStart.getDate()} ${MONTHS_RO[weekStart.getMonth()]} – ${end.getDate()} ${MONTHS_RO[end.getMonth()]}`
  }, [weekStart])

  return (
    <div className="min-h-screen flex flex-col bg-surface">

      {/* ── Header ── */}
      <header className="border-b border-surface-border bg-surface-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center gap-4 justify-between">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-9 h-9 rounded-xl border border-surface-border bg-surface hover:bg-surface-border flex items-center justify-center text-slate-400 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Programul Meu</h1>
                <p className="text-[10px] text-slate-500 leading-none">Outlook · Teams · Wellbeing</p>
              </div>
            </div>
          </div>

          {/* Center — week navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevWeek}
              disabled={selectedWeekOffset === 0}
              className="w-8 h-8 rounded-lg border border-surface-border bg-surface hover:bg-surface-border flex items-center justify-center text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center min-w-[160px]">
              <p className="text-xs font-semibold text-white">{weekLabel}</p>
              <p className="text-[9px] text-slate-500">
                {isCurrentWeek ? 'Săptămâna curentă' : `Săptămâna +${selectedWeekOffset}`}
              </p>
            </div>

            <button
              onClick={nextWeek}
              disabled={selectedWeekOffset === 3}
              className="w-8 h-8 rounded-lg border border-surface-border bg-surface hover:bg-surface-border flex items-center justify-center text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (!isCurrentWeek) {
                  for (let i = 0; i < selectedWeekOffset; i++) prevWeek()
                }
                setTimeout(() => window.dispatchEvent(new CustomEvent('highlight-today')), 50)
                
                if (today.getDay() === 0 || today.getDay() === 6) {
                  setWeekendAlert(true)
                  setTimeout(() => setWeekendAlert(false), 3500)
                }
              }}
              className="ml-1 px-3 py-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-400 text-[10px] font-semibold hover:bg-sky-500/20 transition-all"
            >
              Azi
            </button>
          </div>

          {/* Right — MS365 connect + date */}
          <div className="flex items-center gap-3">
            {connected ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 rounded-xl px-3 py-1.5">
                <Wifi className="w-3.5 h-3.5" /> Microsoft 365 conectat
              </div>
            ) : (
              <button
                onClick={() => {
                  setM365Alert(true)
                  setTimeout(() => setM365Alert(false), 3500)
                }}
                className="flex items-center gap-2 text-xs text-white border border-indigo-500/40 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-xl px-4 py-2 transition-all"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 21 21" fill="none">
                  <rect x="1"  y="1"  width="9" height="9" fill="#f25022"/>
                  <rect x="11" y="1"  width="9" height="9" fill="#7fba00"/>
                  <rect x="1"  y="11" width="9" height="9" fill="#00a4ef"/>
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                </svg>
                Conectează Microsoft 365
              </button>
            )}
            <p className="text-xs text-slate-500 hidden md:block">{fmtDate(today)}</p>
          </div>
        </div>
      </header>

      {/* ── Toast Notification ── */}
      <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${weekendAlert ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-emerald-500/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center gap-3 border border-emerald-400/30">
          <span className="text-lg">🌴</span>
          <span className="font-medium text-sm">Este weekend! Relaxează-te și lasă AI-ul să ia o pauză.</span>
        </div>
      </div>

      <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${m365Alert ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-indigo-500/90 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center gap-3 border border-indigo-400/30">
          <span className="text-lg flex items-center justify-center pt-0.5"><svg className="w-5 h-5 mx-1" viewBox="0 0 21 21" fill="none"><rect x="1" y="1" width="9" height="9" fill="#f25022"/><rect x="11" y="1" width="9" height="9" fill="#7fba00"/><rect x="1" y="11" width="9" height="9" fill="#00a4ef"/><rect x="11" y="11" width="9" height="9" fill="#ffb900"/></svg></span>
          <span className="font-medium text-sm">Conectarea cu Microsoft 365 va fi disponibilă în curând!</span>
        </div>
      </div>

      {/* Demo banner */}
      {!connected && (
        <div className="max-w-7xl mx-auto px-6 pt-5 w-full">
          <div className="flex items-start gap-3 bg-indigo-500/8 border border-indigo-500/20 rounded-2xl px-5 py-3.5">
            <WifiOff className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-indigo-300">Date simulate · Demo Mode</span>
              {' '}— Conectează-te cu Microsoft 365 pentru calendar real Outlook/Teams.
            </p>
          </div>
        </div>
      )}

      {/* Meeting warning */}
      <MeetingWarningBanner todayEvents={todayEvents} breakOpportunities={breakOpportunities} />

      {/* ── Main grid ── */}
      <main className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-5 gap-5 flex-1 w-full">

        {/* ── Left: Teams calendar ── */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <TeamsWeekCalendar
            weekDays={weekDays}
            events={events}
            workSchedule={user?.workSchedule}
            isCurrentWeek={isCurrentWeek}
            nextBreakToday={nextBreakToday}
          />
        </div>

        {/* ── Right: sidebar ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Mood */}
          <MoodCard
            moodScore={moodScore}
            moodFactors={moodFactors}
            moodLabel={moodLabel}
            moodReco={moodReco}
          />

          {/* AI Break schedule */}
          <AiBreakScheduleCard
            scheduledBreaks={smartBreaks}
            nextBreak={nextBreakToday}
            workSchedule={user?.workSchedule}
          />

          {/* Free break windows */}
          <BreakOpportunitiesPanel breakOpportunities={breakOpportunities} />

          {/* 4-week heatmap */}
          <FourWeekHeatmap
            baseMonday={baseMonday}
            events={events}
            selectedWeekOffset={selectedWeekOffset}
            onSelectWeek={(idx) => {
              const diff = idx - selectedWeekOffset
              if (diff > 0) for (let i = 0; i < diff; i++) nextWeek()
              else          for (let i = 0; i < -diff; i++) prevWeek()
            }}
          />

        </div>
      </main>
    </div>
  )
}
