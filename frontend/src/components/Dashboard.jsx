import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, CalendarDays, Home, Building2, ChevronRight, Search } from 'lucide-react'
import FloatingAiAssistant from './FloatingAiAssistant'
import AnimatedShaderHero from './ui/AnimatedShaderHero'
import { useAuth } from '../context/AuthContext'
import { useCalendar } from '../context/CalendarContext'

/* ── Shared sport constants ───────────────────────────────────────── */
const SPORT_ICONS = {
  Padel: '🎾', 'Ping Pong': '🏓', Tennis: '🎾', Badminton: '🏸',
  Football: '⚽', Yoga: '🧘', Cycling: '🚴', Ski: '⛷️', Running: '🏃',
}
const ALL_SPORTS = ['Padel', 'Tennis', 'Ping Pong', 'Badminton', 'Football', 'Yoga', 'Cycling', 'Ski', 'Running']

/* ── Helpers ─────────────────────────────────────────────────────── */
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setValue(target); clearInterval(timer) }
      else setValue(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return value
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bună dimineața'
  if (h < 18) return 'Bună ziua'
  return 'Bună seara'
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

/* ── Flip stat card ──────────────────────────────────────────────── */
const DEFINITIONS = {
  streak:  'Numărul de zile consecutive în care ai luat cel puțin o pauză activă. Cu cât streak-ul e mai lung, cu atât ești mai consecvent în obiceiurile tale de wellbeing.',
  mood:    'Scor calculat automat pe baza ședințelor din calendar, pauzelor luate și activităților sportive. Reflectă echilibrul tău energetic la locul de muncă.',
  matches: 'Activitățile sportive cu colegii tăi luna aceasta. Sportul în echipă construiește conexiuni autentice și îmbunătățește moralul la birou.',
  breaks:  'Pauzele active luate azi. Obiectivul recomandat: 5 pauze de 3 minute pe zi — cresc concentrarea cu până la 40% și reduc oboseala mentală.',
}

const COLOR_MAP = {
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'rgba(52,211,153,0.2)' },
  violet:  { text: 'text-violet-400',  bg: 'bg-violet-400/10',  border: 'rgba(167,139,250,0.2)' },
  sky:     { text: 'text-sky-400',     bg: 'bg-sky-400/10',     border: 'rgba(56,189,248,0.2)'  },
  amber:   { text: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'rgba(251,191,36,0.2)'  },
}

function FlipCard({ icon, label, target, unit, sub, color, delay, definition }) {
  const [flipped, setFlipped] = useState(false)
  const value = useCountUp(target)
  const c = COLOR_MAP[color]

  return (
    <div
      className="animate-fade-in cursor-pointer select-none"
      style={{ perspective: '1000px', animationDelay: `${delay}ms`, minHeight: '164px' }}
      onClick={() => setFlipped(f => !f)}
      title="Apasă pentru definiție"
    >
      <div style={{
        position: 'relative', height: '164px', transformStyle: 'preserve-3d',
        transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        {/* Front */}
        <div className="absolute inset-0 bg-surface-card rounded-2xl p-5 flex flex-col gap-1 shadow-xl"
          style={{ backfaceVisibility: 'hidden', border: `1px solid ${c.border}` }}>
          <div className="flex items-center justify-between">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${c.bg}`}>{icon}</div>
            <span className="text-[10px] text-slate-700 font-medium select-none">↻ detalii</span>
          </div>
          <p className={`text-3xl font-bold mt-1 tabular-nums ${c.text}`}>{value}{unit}</p>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
        </div>
        {/* Back */}
        <div className="absolute inset-0 bg-surface-card rounded-2xl p-5 flex flex-col justify-center gap-3 shadow-xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', border: `1px solid ${c.border}` }}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl ${c.bg}`}>{icon}</div>
          <p className={`text-sm font-bold ${c.text}`}>{label}</p>
          <p className="text-xs text-slate-400 leading-relaxed">{definition}</p>
          <span className="text-[10px] text-slate-600 mt-auto">↻ apasă pentru a reveni</span>
        </div>
      </div>
    </div>
  )
}

/* ── Smart Break Banner ──────────────────────────────────────────── */
function SmartBreakBanner({ userId, workLocation }) {
  const navigate = useNavigate()
  const [schedule, setSchedule]       = useState(null)
  const [suggestion, setSuggestion]   = useState(null)
  const [snoozedIdx, setSnoozedIdx]   = useState(0)   // skip breaks before this index

  const todayDow  = new Date().getDay()
  const isWeekend = todayDow === 0 || todayDow === 6

  useEffect(() => {
    if (!userId || isWeekend) return
    Promise.all([
      fetch(`/api/breaks/${userId}/schedule`).then(r => r.ok ? r.json() : null),
      fetch(`/api/breaks/${userId}`).then(r => r.ok ? r.json() : null),
    ]).then(([sched, sugg]) => {
      if (sched) setSchedule(sched)
      if (sugg) setSuggestion(sugg)
    }).catch(() => {})
  }, [userId, isWeekend])

  // Weekend — show a rest card instead of nothing
  if (isWeekend) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 flex items-center gap-4 animate-fade-in">
        <span className="text-2xl shrink-0">🌴</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-emerald-300">Weekend — odihnă bine meritată!</p>
          <p className="text-xs text-slate-500 mt-0.5">Pauzele tale AI revin luni. Bucură-te de timp liber!</p>
        </div>
        <button
          onClick={() => navigate('/program')}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium transition-all shrink-0"
        >
          📅 Program
        </button>
      </div>
    )
  }

  if (!schedule) return null

  const now         = new Date()
  const currentHour = now.getHours()
  const currentMin  = now.getMinutes()
  const nowMin      = currentHour * 60 + currentMin

  const breaks   = schedule.scheduledBreakHours ?? []
  const meetings = schedule.meetings ?? []

  // Find which break to show (respects snooze index)
  let displayIdx = -1
  for (let i = snoozedIdx; i < breaks.length; i++) {
    const breakMin = breaks[i] * 60
    if (breakMin >= nowMin - 45) { displayIdx = i; break }
  }
  if (displayIdx === -1) return null

  const breakHour   = breaks[displayIdx]
  const breakMin    = breakHour * 60
  const minDiff     = breakMin - nowMin          // negative = overdue
  const isOverdue   = minDiff < 0
  const isImminent  = minDiff >= 0 && minDiff <= 20

  // Only show when break is within 20 min coming up OR up to 45 min overdue
  if (minDiff > 20 || minDiff < -45) return null

  const absMin       = Math.abs(Math.round(minDiff))
  const breakTimeStr = `${String(breakHour).padStart(2, '0')}:00`

  // Next meeting AFTER this break for context
  const nextMeeting = meetings
    .filter(m => m.startHour > breakHour)
    .sort((a, b) => a.startHour - b.startHour)[0]

  const snooze = () => setSnoozedIdx(displayIdx + 1)

  const confirmBreak = () =>
    navigate('/pause', { state: { suggestionText: suggestion?.suggestionText } })

  // Color scheme
  const scheme = isOverdue
    ? { outer: 'bg-emerald-500/10 border-emerald-400/30', dot: 'bg-emerald-400', pulse: true,
        badge: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/25',
        btn:   'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/40' }
    : { outer: 'bg-amber-500/10 border-amber-400/30', dot: 'bg-amber-400', pulse: false,
        badge: 'bg-amber-400/10 text-amber-300 border-amber-400/25',
        btn:   'bg-amber-500 hover:bg-amber-400 shadow-amber-500/40' }

  return (
    <div className={`rounded-2xl border px-5 py-4 flex items-center gap-4 animate-slide-up ${scheme.outer}`}>
      {/* Live dot */}
      <div className="relative shrink-0">
        <div className={`w-3 h-3 rounded-full ${scheme.dot}`} />
        {scheme.pulse && (
          <div className={`absolute inset-0 w-3 h-3 rounded-full ${scheme.dot} animate-ping opacity-60`} />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-white leading-tight">
            {isOverdue
              ? `⏰ E timpul de o pauză! · ${absMin} min față de ${breakTimeStr}`
              : `🌿 Pauza ta e în ${absMin} ${absMin === 1 ? 'minut' : 'minute'} · ${breakTimeStr}`}
          </p>
          {nextMeeting && (
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-lg border ${scheme.badge}`}>
              Urmează: {nextMeeting.title} la {String(nextMeeting.startHour).padStart(2, '0')}:00
            </span>
          )}
        </div>
        {suggestion?.suggestionText && (
          <p className="text-xs text-slate-500 mt-1 truncate">{suggestion.suggestionText}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0">
        <button onClick={snooze}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium transition-all">
          😴 Amân
        </button>
        <button onClick={confirmBreak}
          className={`px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 shadow-lg ${scheme.btn}`}>
          🌿 Intru în pauză
        </button>
      </div>
    </div>
  )
}

/* ── Match card ──────────────────────────────────────────────────── */
function MatchCard({ match, rank }) {
  const scorePercent = Math.round((match.matchScore ?? 0) * 100)
  const scoreColor   = scorePercent >= 90 ? 'text-emerald-400' : scorePercent >= 75 ? 'text-amber-400' : 'text-slate-400'
  const initials     = (match.matchedEmployeeName ?? '??').split(' ').map(w => w[0]).join('').slice(0, 2)

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl p-4 hover:border-brand/30 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs font-bold text-brand-light">#{rank}</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-white truncate">{match.matchedEmployeeName}</p>
            <span className={`text-sm font-bold tabular-nums shrink-0 ${scoreColor}`}>{scorePercent}%</span>
          </div>
          {match.city && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-400 bg-sky-400/10 border border-sky-400/20 rounded-md px-2 py-0.5 mb-2">
              📍 {match.city}
            </span>
          )}
          <div className="h-1.5 bg-surface-border rounded-full mb-2 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-light transition-all duration-700"
              style={{ width: `${scorePercent}%` }} />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">💡 {match.aiCustomMessage}</p>
        </div>
      </div>
    </div>
  )
}

/* ── Matchmaking Section ─────────────────────────────────────────── */
function MatchmakingSection({ userId, userName, userSports, userCity }) {
  const [selectedSport, setSelectedSport] = useState(null)
  const [matches,       setMatches]       = useState([])
  const [loading,       setLoading]       = useState(false)
  const [hasFetched,    setHasFetched]    = useState(false)
  const [error,         setError]         = useState(null)

  const sportsToShow = userSports.length > 0 ? userSports : ALL_SPORTS

  const findMatches = useCallback(async (sport) => {
    if (!sport) return
    setLoading(true); setError(null); setHasFetched(false)
    try {
      const res = await fetch(`/api/matchmaking/${userId}?activity=${encodeURIComponent(sport)}`)
      if (!res.ok) throw new Error('Failed')
      setMatches(await res.json())
      setHasFetched(true)
    } catch {
      setError('Nu s-a putut căuta. Verifică conexiunea și încearcă din nou.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const activeSport = selectedSport ?? sportsToShow[0]

  return (
    <section className="space-y-5 animate-fade-in">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">🤝 Găsește colegi pentru sport</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {userCity
              ? <>Colegi din <strong className="text-slate-400">{userCity}</strong> · filtrare automată după oraș</>
              : 'Colegi din același oraș · AI-powered pairing'}
          </p>
        </div>
      </div>

      {/* Sport picker + find button row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap gap-2 flex-1">
          {sportsToShow.map(sport => (
            <button
              key={sport}
              onClick={() => { setSelectedSport(sport); setHasFetched(false) }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                (selectedSport === sport || (!selectedSport && sport === sportsToShow[0]))
                  ? 'bg-brand/20 border-brand/50 text-white scale-[1.03] shadow-sm shadow-brand/20'
                  : 'bg-surface border-surface-border text-slate-400 hover:border-brand/30 hover:text-slate-300'
              }`}
            >
              <span>{SPORT_ICONS[sport] ?? '🏅'}</span>
              {sport}
            </button>
          ))}
        </div>

        <button
          onClick={() => findMatches(activeSport)}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand/15 hover:bg-brand/25 border border-brand/25 hover:border-brand/50 text-brand-light text-sm font-semibold transition-all duration-200 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
        >
          {loading
            ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>Se caută…</>
            : <><Search className="w-4 h-4" />Găsește colegi{activeSport ? ` de ${activeSport}` : ''}</>
          }
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-3">
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {hasFetched && (
        <div className="animate-slide-up">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
            Top compatibili · {userCity || 'Același oraș'} · {activeSport}
          </p>
          {matches.length === 0
            ? (
              <div className="text-center py-10 text-slate-400">
                <span className="text-4xl block mb-3">😔</span>
                <p className="text-sm">Niciun coleg din {userCity} activ pentru {activeSport}.</p>
                <p className="text-xs text-slate-600 mt-1">Încearcă alt sport sau revino mai târziu.</p>
              </div>
            )
            : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map((m, i) => <MatchCard key={i} match={m} rank={i + 1} />)}
              </div>
            )
          }
        </div>
      )}
    </section>
  )
}

/* ── Dashboard ───────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user, logout }                          = useAuth()
  const { moodScore, moodLabel, moodOverride, morningMood } = useCalendar()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const firstName         = user?.name?.split(' ')[0] ?? 'Coleg'
  const preferredSports   = user?.preferredSports ?? []
  const workLocation      = user?.workLocation ?? null
  const userCity          = user?.city ?? null

  const breaksTakenToday  = user?.breaksTakenToday  ?? 0
  const currentStreak     = user?.currentStreak     ?? 0
  const matchesThisMonth  = user?.matchesThisMonth  ?? 0

  const realMoodScore = Math.min(100, Math.round(
    40
    + Math.min(matchesThisMonth * 3, 24)
    + Math.min(breaksTakenToday * 8, 24)
    + Math.min(currentStreak * 1.5, 12)
  ))
  // Morning mood (1-5 emojis): divide 100 by 4 intervals → option 2 = 25, option 3 = 50, etc.
  const morningMoodScore = morningMood !== null ? Math.round((morningMood - 1) / 4 * 100) : null
  const baseMoodScore    = realMoodScore > 40 ? realMoodScore : moodScore
  const displayMoodScore = moodOverride !== null
    ? moodOverride
    : morningMoodScore !== null
    ? morningMoodScore
    : Math.min(100, baseMoodScore)
  const displayMoodLabel = displayMoodScore >= 80 ? 'Excelent 🌟'
    : displayMoodScore >= 65 ? 'Bine 😊'
    : displayMoodScore >= 50 ? 'Moderat 😐'
    : 'Obositor 😔'

  const workLocationBadge = workLocation === 'HOME'
    ? { icon: Home,      label: 'Acasă',    cls: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' }
    : workLocation === 'OFFICE'
    ? { icon: Building2, label: 'La birou', cls: 'text-sky-400 border-sky-500/30 bg-sky-500/10' }
    : null

  const sportsLine   = preferredSports.length > 0 ? ` · Sporturi: ${preferredSports.slice(0, 3).join(' · ')}` : ''
  const streakLine   = currentStreak > 0
    ? `🔥 ${currentStreak} ${currentStreak === 1 ? 'zi' : 'zile'} de streak consecutiv`
    : 'Niciun streak activ — ia prima pauză azi!'
  const matchLine    = matchesThisMonth > 0
    ? ` · 🤝 ${matchesThisMonth} ${matchesThisMonth === 1 ? 'activitate' : 'activități'} luna aceasta`
    : ''
  const heroSubtitle = `${getGreeting()}, ${firstName}! ${streakLine}${matchLine}${sportsLine}.`

  return (
    <div className="min-h-screen relative">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* ── Header ── */}
      <header className="border-b border-surface-border bg-surface-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logo.png?v=2" alt="SyncFit Logo" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">SyncFit</h1>
              <p className="text-[10px] text-slate-500 leading-none">AI Wellbeing Platform</p>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {workLocationBadge && (
              <div className={`hidden sm:flex items-center gap-1.5 text-xs border rounded-xl px-3 py-1.5 ${workLocationBadge.cls}`}>
                <workLocationBadge.icon className="w-3 h-3" />
                {workLocationBadge.label}
              </div>
            )}

            <button onClick={() => navigate('/program')} title="Programul meu"
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-surface-border bg-surface hover:bg-indigo-500/10 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all text-xs font-medium">
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Program</span>
            </button>

            <button onClick={() => navigate('/my-profile')}
              className="flex items-center gap-2.5 bg-surface border border-surface-border hover:border-brand/50 rounded-xl px-3 py-2 transition-all duration-200 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs font-bold text-white shadow">
                {getInitials(user?.name)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-white leading-tight group-hover:text-brand-light transition-colors">{user?.name}</p>
                <p className="text-[10px] text-slate-500">{userCity} · {preferredSports.slice(0, 2).join(', ')}</p>
              </div>
              <ChevronRight className="hidden sm:block w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </button>

            <button onClick={handleLogout} title="Deconectare"
              className="w-9 h-9 rounded-xl border border-surface-border bg-surface hover:bg-red-500/10 hover:border-red-500/30 flex items-center justify-center text-slate-400 hover:text-red-400 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Hero */}
        <AnimatedShaderHero
          trustBadge={{ text: 'Pauza ta inteligentă durează 3 minute. Relaxează-te!' }}
          headline={{ line1: 'SyncFit', line2: 'Wellbeing & Sport' }}
          subtitle={heroSubtitle}
          className="animate-fade-in"
        />

        {/* Smart Break Banner — appears ONLY when a break is due or imminent */}
        <SmartBreakBanner userId={user?.userId} workLocation={workLocation} />

        {/* Flip stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FlipCard
            icon="🔥" label="Streak" target={currentStreak} unit=" zile"
            sub={currentStreak > 0 ? `${currentStreak} zile consecutive ✨` : 'Ia prima pauză azi!'}
            color="emerald" delay={0} definition={DEFINITIONS.streak}
          />
          <FlipCard
            icon="😊" label="Mood Score" target={displayMoodScore} unit="/100"
            sub={displayMoodLabel}
            color="violet" delay={100} definition={DEFINITIONS.mood}
          />
          <FlipCard
            icon="🤝" label="Matches" target={matchesThisMonth} unit=""
            sub="Activități luna aceasta"
            color="sky" delay={200} definition={DEFINITIONS.matches}
          />
          <FlipCard
            icon="☕" label="Pauze azi" target={breaksTakenToday} unit=""
            sub={breaksTakenToday >= 5 ? '🎉 Obiectiv atins!' : `Obiectiv: 5 · mai ${Math.max(0, 5 - breaksTakenToday)} rămase`}
            color="amber" delay={300} definition={DEFINITIONS.breaks}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-surface-border" />

        {/* Matchmaking Section — full width below flip cards */}
        <MatchmakingSection
          userId={user?.userId ?? 1}
          userName={user?.name}
          userSports={preferredSports}
          userCity={userCity}
        />

      </main>

      <FloatingAiAssistant />
    </div>
  )
}
