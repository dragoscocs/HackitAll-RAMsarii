import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Wifi, WifiOff, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCalendar, MEETING_TYPES_MAP } from '../context/CalendarContext'

const DAY_START_H = 8
const DAY_END_H   = 19
const DAY_MINUTES = (DAY_END_H - DAY_START_H) * 60

const DAYS_RO = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm']
const MONTHS_RO = ['Ian','Feb','Mar','Apr','Mai','Iun','Iul','Aug','Sep','Oct','Nov','Dec']

function fmtTime(date) {
  const d = new Date(date)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function fmtDate(date) {
  const d = new Date(date)
  return `${DAYS_RO[d.getDay()]}, ${d.getDate()} ${MONTHS_RO[d.getMonth()]}`
}

function topPct(date) {
  const d = new Date(date)
  const min = d.getHours() * 60 + d.getMinutes() - DAY_START_H * 60
  return Math.max(0, (min / DAY_MINUTES) * 100)
}

function heightPct(duration) {
  return Math.max(2, (duration / DAY_MINUTES) * 100)
}

export default function ProgramPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { events, connected, connectMicrosoft, moodScore, moodFactors, moodLabel, moodReco } = useCalendar()

  const today = new Date()
  const todayEvents = events
    .filter(ev => {
      const d = new Date(ev.start)
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth()
    })
    .sort((a, b) => a.start - b.start)

  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today)
    const dow = today.getDay()
    const monday = 1 - (dow === 0 ? 7 : dow)
    d.setDate(today.getDate() + monday + i)
    d.setHours(0, 0, 0, 0)
    return d
  })

  const scoreColor =
    moodScore >= 80 ? '#34d399' :
    moodScore >= 65 ? '#38bdf8' :
    moodScore >= 50 ? '#fbbf24' : '#f87171'

  const GAUGE_R = 70
  const GAUGE_CIRC = 2 * Math.PI * GAUGE_R
  const GAUGE_ARC = GAUGE_CIRC * 0.7
  const scoreOffset = GAUGE_ARC - (moodScore / 100) * GAUGE_ARC

  return (
    <div className="min-h-screen">
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
                <Calendar className="w-4.5 h-4.5 text-white w-5 h-5" />
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

      {!connected && (
        <div className="max-w-7xl mx-auto px-6 pt-5">
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

      <main className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Today's timeline ── */}
        <div className="lg:col-span-3 card flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Azi, {fmtDate(today)}</h2>
              <p className="text-xs text-slate-500">{todayEvents.length} ședințe programate</p>
            </div>
            <span className="badge bg-sky-500/10 text-sky-400">📅 Calendar</span>
          </div>

          {todayEvents.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center">
              <span className="text-5xl">🎉</span>
              <p className="text-white font-medium">Nicio ședință azi!</p>
              <p className="text-sm text-slate-400">Timp liber pentru focus și wellbeing.</p>
            </div>
          ) : (
            <div className="relative" style={{ height: `${DAY_MINUTES * 0.9}px`, minHeight: 500 }}>
              {/* Hour guides */}
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

              {/* Event blocks */}
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
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Mood score card */}
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
                    d={`M 18 90 A 72 72 0 1 1 162 90`}
                    fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" strokeLinecap="round" />
                  <path
                    d={`M 18 90 A 72 72 0 1 1 162 90`}
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

          {/* Weekly heatmap */}
          <div className="card flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-white">Săptămâna aceasta</h2>
            <div className="grid grid-cols-5 gap-2">
              {weekDays.map((day, i) => {
                const dayEvts = events.filter(ev => {
                  const d = new Date(ev.start)
                  return d.getDate() === day.getDate() && d.getMonth() === day.getMonth()
                })
                const totalMin = dayEvts.reduce((s, ev) => s + ev.duration, 0)
                const isToday  = day.getDate() === today.getDate()
                const intensity =
                  totalMin > 240 ? 'bg-red-500/60 border-red-500/40' :
                  totalMin > 120 ? 'bg-amber-500/40 border-amber-500/30' :
                  totalMin > 30  ? 'bg-emerald-500/30 border-emerald-500/20' :
                                   'bg-surface-border/40 border-surface-border/30'
                return (
                  <div key={i}
                    className={`flex flex-col items-center gap-1.5 rounded-xl p-2.5 border transition-all ${intensity} ${isToday ? 'ring-2 ring-brand ring-offset-1 ring-offset-surface-card' : ''}`}>
                    <span className="text-[10px] font-medium text-slate-400">{['Lun','Mar','Mie','Joi','Vin'][i]}</span>
                    <span className="text-base">{
                      totalMin > 240 ? '🔴' : totalMin > 120 ? '🟡' : totalMin > 30 ? '🟢' : '⚪'
                    }</span>
                    <span className="text-[10px] text-slate-500">{dayEvts.length} mtg</span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">⚪ Liber</span>
              <span className="flex items-center gap-1">🟢 Ușor</span>
              <span className="flex items-center gap-1">🟡 Mediu</span>
              <span className="flex items-center gap-1">🔴 Intens</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
