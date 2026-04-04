import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, CalendarDays, Home, Building2, ChevronRight } from 'lucide-react'
import SmartBreak from './SmartBreak'
import MatchmakingFeed from './MatchmakingFeed'
import FloatingAiAssistant from './FloatingAiAssistant'
import AnimatedShaderHero from './ui/AnimatedShaderHero'
import { useAuth } from '../context/AuthContext'
import { useCalendar } from '../context/CalendarContext'

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
      <div
        style={{
          position: 'relative',
          height: '164px',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── Front ── */}
        <div
          className="absolute inset-0 bg-surface-card rounded-2xl p-5 flex flex-col gap-1 shadow-xl"
          style={{ backfaceVisibility: 'hidden', border: `1px solid ${c.border}` }}
        >
          <div className="flex items-center justify-between">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${c.bg}`}>{icon}</div>
            <span className="text-[10px] text-slate-700 font-medium select-none">↻ detalii</span>
          </div>
          <p className={`text-3xl font-bold mt-1 tabular-nums ${c.text}`}>{value}{unit}</p>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
        </div>

        {/* ── Back ── */}
        <div
          className="absolute inset-0 bg-surface-card rounded-2xl p-5 flex flex-col justify-center gap-3 shadow-xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', border: `1px solid ${c.border}` }}
        >
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl ${c.bg}`}>{icon}</div>
          <p className={`text-sm font-bold ${c.text}`}>{label}</p>
          <p className="text-xs text-slate-400 leading-relaxed">{definition}</p>
          <span className="text-[10px] text-slate-600 mt-auto">↻ apasă pentru a reveni</span>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { moodScore, moodLabel } = useCalendar()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const firstName       = user?.name?.split(' ')[0] ?? 'Coleg'
  const preferredSports = user?.preferredSports ?? []
  const workLocation    = user?.workLocation ?? null

  const breaksTakenToday = user?.breaksTakenToday ?? 0
  const currentStreak    = user?.currentStreak    ?? 0
  const matchesThisMonth = user?.matchesThisMonth ?? 0

  const realMoodScore = Math.min(100, Math.round(
    40
    + Math.min(matchesThisMonth * 3, 24)
    + Math.min(breaksTakenToday * 8, 24)
    + Math.min(currentStreak * 1.5, 12)
  ))
  const displayMoodScore = realMoodScore > 40 ? realMoodScore : moodScore
  const displayMoodLabel = realMoodScore >= 80 ? 'Excelent 🌟'
    : realMoodScore >= 65 ? 'Bine 😊'
    : realMoodScore >= 50 ? 'Moderat 😐'
    : moodLabel.text

  const workLocationBadge = workLocation === 'HOME'
    ? { icon: Home,      label: 'Acasă',    cls: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' }
    : workLocation === 'OFFICE'
    ? { icon: Building2, label: 'La birou', cls: 'text-sky-400 border-sky-500/30 bg-sky-500/10' }
    : null

  // Hero subtitle — descriptive & personal
  const sportsLine = preferredSports.length > 0
    ? ` · Sporturi: ${preferredSports.slice(0, 3).join(' · ')}`
    : ''
  const streakLine  = currentStreak > 0
    ? `🔥 ${currentStreak} ${currentStreak === 1 ? 'zi' : 'zile'} de streak consecutiv`
    : 'Niciun streak activ — ia prima pauză azi!'
  const matchLine   = matchesThisMonth > 0
    ? ` · 🤝 ${matchesThisMonth} ${matchesThisMonth === 1 ? 'activitate' : 'activități'} luna aceasta`
    : ''
  const heroSubtitle = `${getGreeting()}, ${firstName}! ${streakLine}${matchLine}${sportsLine}.`

  return (
    <div className="min-h-screen relative">
      {/* Ambient background glows */}
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

            {/* Calendar shortcut — prominent */}
            <button
              onClick={() => navigate('/program')}
              title="Programul meu"
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-surface-border bg-surface hover:bg-indigo-500/10 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 transition-all text-xs font-medium"
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Program</span>
            </button>

            {/* Clickable user pill → /my-profile */}
            <button
              onClick={() => navigate('/my-profile')}
              className="flex items-center gap-2.5 bg-surface border border-surface-border hover:border-brand/50 rounded-xl px-3 py-2 transition-all duration-200 group"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs font-bold text-white shadow">
                {getInitials(user?.name)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-white leading-tight group-hover:text-brand-light transition-colors">{user?.name}</p>
                <p className="text-[10px] text-slate-500">{user?.city} · {preferredSports.slice(0, 2).join(', ')}</p>
              </div>
              <ChevronRight className="hidden sm:block w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Deconectare"
              className="w-9 h-9 rounded-xl border border-surface-border bg-surface hover:bg-red-500/10 hover:border-red-500/30 flex items-center justify-center text-slate-400 hover:text-red-400 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Hero — no buttons */}
        <AnimatedShaderHero
          trustBadge={{ text: 'Pauza ta inteligentă durează 3 minute. Relaxează-te!' }}
          headline={{ line1: 'SyncFit', line2: 'Wellbeing & Sport' }}
          subtitle={heroSubtitle}
          className="animate-fade-in"
        />

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

        {/* Smart Break + Matchmaking */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <SmartBreak
              userId={user?.userId ?? 1}
              workLocation={workLocation}
              userSports={preferredSports}
            />
          </div>
          <div className="lg:col-span-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <MatchmakingFeed
              userId={user?.userId ?? 1}
              userName={user?.name}
              autoSearch={{ sport: null, key: 0 }}
            />
          </div>
        </div>
      </main>

      <FloatingAiAssistant />
    </div>
  )
}
