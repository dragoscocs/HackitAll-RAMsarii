import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Calendar, ChevronLeft, ChevronRight, Wifi, WifiOff, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCalendar, MEETING_TYPES_MAP } from '../context/CalendarContext'

const DAY_START_H = 8
const DAY_END_H   = 19
const DAY_MINUTES = (DAY_END_H - DAY_START_H) * 60

const DAYS_RO  = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm']
const MONTHS_RO = ['Ian','Feb','Mar','Apr','Mai','Iun','Iul','Aug','Sep','Oct','Nov','Dec']
const DAY_LABELS = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin']

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

function topPct(date) {
  const d = new Date(date)
  const min = d.getHours() * 60 + d.getMinutes() - DAY_START_H * 60
  return Math.max(0, (min / DAY_MINUTES) * 100)
}

function heightPct(duration) {
  return Math.max(2, (duration / DAY_MINUTES) * 100)
}

function isSameDay(a, b) {
  const da = new Date(a); const db = new Date(b)
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
}

function getDayLoad(evts, day) {
  const dayEvts = evts.filter(ev => isSameDay(ev.start, day))
  const totalMin = dayEvts.reduce((s, ev) => s + ev.duration, 0)
  return { count: dayEvts.length, totalMin }
}

function loadColor(totalMin) {
  if (totalMin > 240) return { dot: '🔴', bg: 'bg-red-500/50 border-red-500/40', label: 'Intens' }
  if (totalMin > 120) return { dot: '🟡', bg: 'bg-amber-500/35 border-amber-500/30', label: 'Mediu' }
  if (totalMin > 30)  return { dot: '🟢', bg: 'bg-emerald-500/25 border-emerald-500/20', label: 'Ușor' }
  return                     { dot: '⚪', bg: 'bg-surface-border/30 border-surface-border/20', label: 'Liber' }
}

// ── Meeting warning banner ────────────────────────────────────────────────────
function MeetingWarningBanner({ todayEvents, breakOpportunities }) {
  const now = new Date()
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
    <div className="max-w-7xl mx-auto px-6 pt-4">
      <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-5 py-4">
        <span className="text-xl shrink-0">⚠️</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-300">
            Ședință în {Math.ceil(next.minsUntil)} minute — Nu lua pauza acum!
          </p>
          <p className="text-xs text-amber-200/70 mt-0.5">
            <strong className="text-amber-300">{next.subject}</strong> începe la {fmtTime(next.start)}.
            {nextBreak
              ? ` Următoarea fereastră liberă: ${fmtTime(nextBreak.startTime)} (${nextBreak.durationMinutes} min).`
              : ' Nu mai există ferestre libere după această ședință azi.'}
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Break opportunities section ───────────────────────────────────────────────
function BreakOpportunitiesPanel({ breakOpportunities }) {
  if (breakOpportunities.length === 0) {
    return (
      <div className="card flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-white">Ferestre de Pauze</h2>
        <p className="text-xs text-slate-400">Nicio fereastră liberă de minim 15 min disponibilă azi.</p>
      </div>
    )
  }

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Ferestre de Pauze</h2>
        <span className="badge bg-emerald-500/10 text-emerald-400">🌿 Wellbeing</span>
      </div>
      <p className="text-xs text-slate-400">Sloturi libere de minim 15 min între ședințe</p>
      <div className="flex flex-col gap-2">
        {breakOpportunities.map((slot, i) => {
          const ideal = slot.durationMinutes >= 20
          return (
            <div key={i}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 border ${
                ideal
                  ? 'bg-emerald-500/10 border-emerald-500/25'
                  : 'bg-surface-border/20 border-surface-border/30'
              }`}>
              <div className="flex items-center gap-2.5">
                <span className="text-base">{ideal ? '🌿' : '☕'}</span>
                <div>
                  <p className={`text-xs font-semibold ${ideal ? 'text-emerald-300' : 'text-slate-300'}`}>
                    {fmtTime(slot.startTime)} – {fmtTime(slot.endTime)}
                    <span className="ml-1.5 text-slate-400 font-normal">· {slot.durationMinutes} min libere</span>
                  </p>
                  {ideal && (
                    <p className="text-[10px] text-emerald-400/80 mt-0.5">Ideal pentru pauză</p>
                  )}
                </div>
              </div>
              {ideal && (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 rounded-lg px-2 py-0.5">
                  ✓ Recomandat
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Compact week view (non-current weeks) ────────────────────────────────────
function CompactWeekView({ weekDays, events, weekOffset }) {
  return (
    <div className="flex flex-col gap-3">
      {weekDays.map((day, dayIdx) => {
        const dayEvts = events
          .filter(ev => {
            const d = new Date(ev.start)
            return d.getFullYear() === day.getFullYear() &&
              d.getMonth() === day.getMonth() &&
              d.getDate() === day.getDate()
          })
          .sort((a, b) => new Date(a.start) - new Date(b.start))

        const { totalMin } = getDayLoad(events, day)
        const { dot, bg } = loadColor(totalMin)

        return (
          <div key={dayIdx} className={`rounded-xl border p-3 ${bg}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">{dot}</span>
                <span className="text-xs font-semibold text-white">{DAY_LABELS[dayIdx]}, {fmtShortDate(day)}</span>
              </div>
              <span className="text-[10px] text-slate-400">{dayEvts.length} ședințe · {(totalMin/60).toFixed(1)}h</span>
            </div>
            {dayEvts.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Zi liberă</p>
            ) : (
              <div className="flex flex-col gap-1">
                {dayEvts.map((ev, i) => {
                  const type = MEETING_TYPES_MAP[ev.type] ?? MEETING_TYPES_MAP.team
                  return (
                    <div key={i} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 border ${type.bg} ${type.border}`}>
                      <span className="text-[10px] text-slate-400 shrink-0 tabular-nums w-10">
                        {fmtTime(ev.start)}
                      </span>
                      <span className="text-xs text-white truncate flex-1">{ev.subject}</span>
                      <span className={`text-[9px] font-medium shrink-0 ${type.text}`}>{type.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Full timeline (current week / today) ─────────────────────────────────────
function TodayTimeline({ todayEvents }) {
  const today = new Date()
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Azi, {fmtDate(today)}</h2>
          <p className="text-xs text-slate-500">{todayEvents.length} ședințe programate</p>
        </div>
        <span className="badge bg-sky-500/10 text-sky-400">📅 Azi</span>
      </div>

      {todayEvents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="text-5xl">🎉</span>
          <p className="text-white font-medium">Nicio ședință azi!</p>
          <p className="text-sm text-slate-400">Timp liber pentru focus și wellbeing.</p>
        </div>
      ) : (
        <div className="relative" style={{ height: `${DAY_MINUTES * 0.9}px`, minHeight: 500 }}>
          {Array.from({ length: DAY_END_H - DAY_START_H + 1 }, (_, i) => {
            const h = DAY_START_H + i
            const top = (i / (DAY_END_H - DAY_START_H)) * 100
            return (
              <div key={h} className="absolute left-0 right-0 flex items-center gap-3"
                style={{ top: `${top}%` }}>
                <span className="text-[10px] text-slate-600 w-10 shrink-0 text-right">{String(h).padStart(2,'0')}:00</span>
                <div className="flex-1 h-px bg-surface-border/50" />
              </div>
            )
          })}

          {todayEvents.map((ev, idx) => {
            const type   = MEETING_TYPES_MAP[ev.type] ?? MEETING_TYPES_MAP.team
            const top    = topPct(ev.start)
            const height = heightPct(ev.duration)
            return (
              <div key={idx}
                className={`absolute left-14 right-0 rounded-xl border px-3 py-2 flex flex-col justify-center overflow-hidden cursor-default hover:brightness-110 transition-all ${type.bg} ${type.border}`}
                style={{ top: `${top}%`, height: `${height}%`, minHeight: 36 }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-white truncate leading-tight">{ev.subject}</p>
                  <span className={`text-[10px] font-medium shrink-0 ${type.text}`}>{type.label}</span>
                </div>
                {height > 4 && (
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {fmtTime(ev.start)} – {fmtTime(ev.end)} · {ev.organizer}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

// ── 4-week heatmap ────────────────────────────────────────────────────────────
function FourWeekHeatmap({ baseMonday, events, selectedWeekOffset, onSelectWeek }) {
  const today = new Date()

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Săptămânile tale — 4 săptămâni</h2>
        <span className="badge bg-sky-500/10 text-sky-400">📊 Heatmap</span>
      </div>

      <div className="flex flex-col gap-2">
        {/* Day-of-week header */}
        <div className="grid grid-cols-6 gap-1.5 mb-1">
          <div /> {/* spacer for week label */}
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-slate-500">{d}</div>
          ))}
        </div>

        {Array.from({ length: 4 }, (_, weekIdx) => {
          const weekMonday = new Date(baseMonday)
          weekMonday.setDate(baseMonday.getDate() + weekIdx * 7)
          const isSelected = weekIdx === selectedWeekOffset

          return (
            <button
              key={weekIdx}
              onClick={() => onSelectWeek(weekIdx)}
              className={`grid grid-cols-6 gap-1.5 rounded-xl p-2 border transition-all text-left w-full ${
                isSelected
                  ? 'border-brand/60 bg-brand/10 ring-1 ring-brand/30'
                  : 'border-surface-border/30 hover:border-surface-border/60 bg-transparent'
              }`}
            >
              {/* Week label */}
              <div className="flex flex-col justify-center">
                <span className={`text-[10px] font-semibold leading-tight ${isSelected ? 'text-brand-light' : 'text-slate-500'}`}>
                  S{weekIdx + 1}
                </span>
                <span className="text-[9px] text-slate-600 leading-tight">
                  {weekMonday.getDate()} {MONTHS_RO[weekMonday.getMonth()]}
                </span>
              </div>

              {Array.from({ length: 5 }, (_, dayIdx) => {
                const day = new Date(weekMonday)
                day.setDate(weekMonday.getDate() + dayIdx)
                const { count, totalMin } = getDayLoad(events, day)
                const { dot, bg } = loadColor(totalMin)
                const isToday = isSameDay(day, today)

                return (
                  <div key={dayIdx}
                    className={`flex flex-col items-center gap-1 rounded-lg py-2 border ${bg} ${
                      isToday ? 'ring-2 ring-sky-400/60 ring-offset-1 ring-offset-surface-card' : ''
                    }`}>
                    <span className="text-sm leading-none">{dot}</span>
                    <span className="text-[9px] text-slate-500">{count}m</span>
                  </div>
                )
              })}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-4 text-[10px] text-slate-500 flex-wrap">
        <span className="flex items-center gap-1">⚪ Liber</span>
        <span className="flex items-center gap-1">🟢 Ușor (&lt;2h)</span>
        <span className="flex items-center gap-1">🟡 Mediu (2-4h)</span>
        <span className="flex items-center gap-1">🔴 Intens (&gt;4h)</span>
      </div>
    </div>
  )
}

// ── Mood gauge card ───────────────────────────────────────────────────────────
function MoodCard({ moodScore, moodFactors, moodLabel, moodReco }) {
  const scoreColor =
    moodScore >= 80 ? '#34d399' :
    moodScore >= 65 ? '#38bdf8' :
    moodScore >= 50 ? '#fbbf24' : '#f87171'

  return (
    <div className="card flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Mood Score Azi</h2>
          <p className="text-xs text-slate-500">Calculat din calendarul tău</p>
        </div>
        <span className="badge bg-violet-500/10 text-violet-300">✨ AI</span>
      </div>

      {/* Gauge */}
      <div className="flex items-center justify-center py-2">
        <div className="relative" style={{ width: 180, height: 100 }}>
          <svg width="180" height="100" viewBox="0 0 180 100">
            <path
              d="M 18 90 A 72 72 0 1 1 162 90"
              fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" strokeLinecap="round" />
            <path
              d="M 18 90 A 72 72 0 1 1 162 90"
              fill="none" stroke={scoreColor} strokeWidth="12" strokeLinecap="round"
              strokeDasharray={`${(moodScore / 100) * 226} 226`}
              style={{ transition: 'stroke-dasharray 1s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
            <span className="text-3xl font-bold text-white tabular-nums">{moodScore}</span>
            <span className={`text-xs font-semibold ${moodLabel.color}`}>{moodLabel.text}</span>
          </div>
        </div>
      </div>

      {/* Factors */}
      <div className="flex flex-col gap-2">
        {moodFactors.map((f, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <span>{f.icon}</span>
              <span>{f.label}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500">{f.value}</span>
            </div>
            <span className={f.delta >= 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
              {f.delta >= 0 ? `+${f.delta}` : f.delta}
            </span>
          </div>
        ))}
      </div>

      {/* AI Recommendation */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
        <p className="text-xs font-semibold text-indigo-300 mb-1.5 flex items-center gap-1.5">
          <Zap className="w-3 h-3" /> Recomandare AI
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">{moodReco}</p>
      </div>
    </div>
  )
}

// ── Smart Break Timeline ────────────────────────────────────────────────────────────────────────────────
function SmartBreakTimeline({ userId }) {
  const [schedule, setSchedule] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    fetch(`/api/breaks/${userId}/schedule`)
      .then(r => { if (!r.ok) throw new Error('Schedule unavailable'); return r.json() })
      .then(d => setSchedule(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return (
    <div className="card flex flex-col gap-4 animate-pulse border border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      <div className="h-4 w-40 bg-surface-border/50 rounded" />
      <div className="h-16 bg-surface-border/30 rounded-2xl" />
      <div className="flex gap-2"><div className="h-3 w-16 bg-surface-border/50 rounded" /><div className="h-3 w-20 bg-surface-border/50 rounded" /></div>
    </div>
  )

  if (error || !schedule) return (
    <div className="card flex flex-col gap-2 border border-red-500/20 bg-red-500/5">
      <h2 className="text-sm font-semibold text-red-400">Timeline indisponibil</h2>
      <p className="text-xs text-red-300/70">
          {error ? 'Sistemul AI întâmpină dificultăți.' : 'Conectează-te la backend pentru a vizualiza orarul inteligent.'}
      </p>
    </div>
  )

  const { workStartHour, workEndHour, scheduledBreakHours, meetings, nextBreakHour } = schedule
  const totalHours = workEndHour - workStartHour

  const pct = (h) => ((h - workStartHour) / totalHours) * 100

  const now = new Date()
  const currentH = now.getHours() + now.getMinutes() / 60
  const currentPct = Math.min(100, Math.max(0, pct(currentH)))
  const isWorkingNow = currentH >= workStartHour && currentH <= currentH <= workEndHour

  return (
    <div className="card border border-white/5 bg-gradient-to-br from-surface-card to-surface-card/50 flex flex-col gap-6 relative shadow-2xl">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between relative z-10">
        <div>
          <h2 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 flex items-center gap-2">
            Timeline Inteligent
            <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              AI Powered
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Program generat pentru fereastra: <strong className="text-slate-300">{String(workStartHour).padStart(2,'0')}:00 – {String(workEndHour).padStart(2,'0')}:00</strong>
          </p>
        </div>
      </div>

      {/* Main Timeline Visual */}
      <div className="relative mt-2">
        {/* Core Bar */}
        <div className="relative h-14 rounded-2xl bg-[#09090b] shadow-inner border border-white/5 overflow-hidden flex items-end">
          
          {/* subtle background grid */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '10% 100%' }} />

          {/* Meeting Blocks */}
          {meetings.map((m, i) => (
            <div
              key={i}
              title={`Ședință: ${m.title} (${m.startHour}:00 - ${m.endHour}:00)`}
              className="absolute top-0 h-full backdrop-blur-sm group overflow-hidden border-x border-rose-500/40 opacity-90 transition-all hover:opacity-100 cursor-default"
              style={{
                background: 'linear-gradient(135deg, rgba(244,63,94,0.1) 0%, rgba(225,29,72,0.2) 100%)',
                left:  `${pct(m.startHour)}%`,
                width: `${pct(m.endHour) - pct(m.startHour)}%`,
              }}
            >
              {/* Dynamic stripes overlay for meetings */}
              <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, white 4px, white 8px)' }} />
              
              <div className="absolute inset-0 flex items-center justify-center p-1">
                <span className="text-[9px] font-semibold text-rose-300 drop-shadow-md truncate text-center leading-tight group-hover:scale-105 transition-transform">
                  {m.title}
                </span>
              </div>
            </div>
          ))}

          {/* Scheduled Break Indicators */}
          {scheduledBreakHours.map(h => {
             const isNext = h === nextBreakHour
             const isPast = h < now.getHours()
             const colorClass = isNext ? 'from-amber-400 to-amber-600' : 'from-emerald-400 to-emerald-600'
             const textColor = isNext ? 'text-amber-300' : 'text-emerald-300'
             
             return (
               <div key={h} className="absolute inset-y-0 w-px z-10" style={{ left: `${pct(h)}%` }}>
                 {/* Energy beam dropping down */}
                 <div className={`absolute -top-1 bottom-0 w-[2px] -ml-[1px] bg-gradient-to-b ${colorClass} opacity-80`} />
                 <div className={`absolute bottom-0 w-8 h-8 -ml-4 bg-gradient-to-t ${colorClass} blur-xl opacity-30`} />

                 {/* Glowing Node */}
                 <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-surface bg-gradient-to-br ${colorClass} shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20`}>
                    {isNext && (
                      <div className="absolute inset-0 rounded-full animate-ping bg-amber-400 opacity-75" />
                    )}
                 </div>

                 {/* Hover label */}
                 <div className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-surface hover-target rounded border border-white/10 px-2 py-0.5 text-[9px] font-bold shadow-lg ${textColor} whitespace-nowrap opacity-0 transition-opacity`}>
                   Pauză {String(h).padStart(2,'0')}:00
                 </div>
               </div>
             )
          })}

          {/* Current Time Needle */}
          {isWorkingNow && (
            <div className="absolute top-0 bottom-0 z-30 transition-all duration-1000 ease-out" style={{ left: `${currentPct}%` }}>
               <div className="absolute inset-0 w-[1px] bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
               <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-sky-400 border-[3px] border-surface shadow-md" />
            </div>
          )}
        </div>

        {/* Ruler Layout (Hours) */}
        <div className="relative h-6 mt-1 border-t border-white/5 pt-1">
          {Array.from({ length: totalHours + 1 }, (_, i) => {
            const h = workStartHour + i
            return (
              <div key={h} className="absolute flex flex-col items-center -translate-x-1/2" style={{ left: `${pct(h)}%` }}>
                <div className="w-[1px] h-1.5 bg-slate-600 mb-0.5" />
                <span className="text-[9px] font-medium text-slate-500 tracking-tighter">
                  {String(h).padStart(2,'0')}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Informative Legend & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-500/80 shadow-[0_0_5px_rgba(244,63,94,0.5)]" />
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">ȘEDINȚĂ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]" />
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">PAUZĂ AI</span>
          </div>
          {isWorkingNow && (
             <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_5px_rgba(56,189,248,0.5)]" />
               <span className="text-[10px] text-slate-400 font-medium tracking-wide">ACUM</span>
             </div>
          )}
        </div>

        {scheduledBreakHours.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {scheduledBreakHours.map(h => {
              const isNext = h === nextBreakHour
              const isPast = h < now.getHours()
              return (
                <div
                  key={h}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold border transition-all ${
                    isNext
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30'
                      : isPast
                      ? 'bg-surface/50 border-white/5 text-slate-600 line-through grayscale opacity-60'
                      : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                  }`}
                >
                  {isNext && <span className="animate-pulse">⚡</span>}
                  {String(h).padStart(2,'0')}:00
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      {/* CSS definition for hover targets on timeline */}
      <style>{`
        .hover-target { pointer-events: none; }
        .group:hover .hover-target, *[style*="left"]:hover .hover-target { opacity: 1; pointer-events: auto; }
      `}</style>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProgramPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    events, connected, connectMicrosoft,
    moodScore, moodFactors, moodLabel, moodReco,
    breaksToday, recordBreak,
    selectedWeekOffset, nextWeek, prevWeek,
    weekStart, weekDays,
    todayEvents, breakOpportunities,
  } = useCalendar()

  const today = new Date()

  // baseMonday = Monday of the actual current week (for heatmap)
  const baseMonday = useMemo(() => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() - selectedWeekOffset * 7)
    return d
  }, [weekStart, selectedWeekOffset])

  const isCurrentWeek = selectedWeekOffset === 0

  // Events for the selected week's days
  const selectedWeekEvents = useMemo(() =>
    events.filter(ev => {
      const d = new Date(ev.start)
      return weekDays.some(day => isSameDay(d, day))
    }), [events, weekDays])

  const weekLabel = useMemo(() => {
    const end = new Date(weekStart)
    end.setDate(weekStart.getDate() + 4)
    return `${weekStart.getDate()} ${MONTHS_RO[weekStart.getMonth()]} – ${end.getDate()} ${MONTHS_RO[end.getMonth()]}`
  }, [weekStart])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-surface-border bg-surface-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')}
              className="w-9 h-9 rounded-xl border border-surface-border bg-surface hover:bg-surface-border flex items-center justify-center text-slate-400 hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Programul Meu</h1>
                <p className="text-[10px] text-slate-500 leading-none">Outlook · Teams · Wellbeing</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {connected ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 rounded-xl px-3 py-1.5">
                <Wifi className="w-3.5 h-3.5" /> Microsoft 365 conectat
              </div>
            ) : (
              <button onClick={connectMicrosoft}
                className="flex items-center gap-2 text-xs text-white border border-indigo-500/40 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-xl px-4 py-2 transition-all">
                <svg className="w-3.5 h-3.5" viewBox="0 0 21 21" fill="none">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                </svg>
                Conectează Microsoft 365
              </button>
            )}
            <p className="text-xs text-slate-500 hidden sm:block">{fmtDate(today)}</p>
          </div>
        </div>
      </header>

      {/* Demo mode banner */}
      {!connected && (
        <div className="max-w-7xl mx-auto px-6 pt-5 w-full">
          <div className="flex items-start gap-3 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl px-5 py-4">
            <WifiOff className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-indigo-300">Date simulate · Demo Mode</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Conectează-te cu Microsoft 365 pentru a vedea calendarul tău real Outlook/Teams și calcule de mood bazate pe ședințe reale.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Meeting warning */}
      <MeetingWarningBanner todayEvents={todayEvents} breakOpportunities={breakOpportunities} />

      <main className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 w-full">

        {/* ── Left: timeline / week view ── */}
        <div className="lg:col-span-3 card flex flex-col gap-5">

          {/* Week navigation header */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevWeek}
              disabled={selectedWeekOffset === 0}
              className="w-8 h-8 rounded-lg border border-surface-border bg-surface hover:bg-surface-border flex items-center justify-center text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center">
              <p className="text-xs font-semibold text-white">{weekLabel}</p>
              <p className="text-[10px] text-slate-500">
                {isCurrentWeek ? 'Săptămâna curentă' : `Săptămâna ${selectedWeekOffset + 1} din 4`}
              </p>
            </div>

            <button
              onClick={nextWeek}
              disabled={selectedWeekOffset === 3}
              className="w-8 h-8 rounded-lg border border-surface-border bg-surface hover:bg-surface-border flex items-center justify-center text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Timeline or compact week view */}
          {isCurrentWeek ? (
            <TodayTimeline todayEvents={todayEvents} />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Săptămâna {selectedWeekOffset + 1} — {weekLabel}
                  </h2>
                  <p className="text-xs text-slate-500">{selectedWeekEvents.length} ședințe programate</p>
                </div>
                <span className="badge bg-sky-500/10 text-sky-400">📅 Calendar</span>
              </div>
              <CompactWeekView weekDays={weekDays} events={events} weekOffset={selectedWeekOffset} />
            </>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Mood card */}
          <MoodCard
            moodScore={moodScore}
            moodFactors={moodFactors}
            moodLabel={moodLabel}
            moodReco={moodReco}
          />

          {/* Break opportunities */}
          <BreakOpportunitiesPanel breakOpportunities={breakOpportunities} />

          {/* Smart Break Timeline — AI-scheduled breaks */}
          <SmartBreakTimeline userId={user?.userId} />

          {/* 4-week heatmap */}
          <FourWeekHeatmap
            baseMonday={baseMonday}
            events={events}
            selectedWeekOffset={selectedWeekOffset}
            onSelectWeek={(idx) => {
              // Navigate to selected week via the context functions
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
