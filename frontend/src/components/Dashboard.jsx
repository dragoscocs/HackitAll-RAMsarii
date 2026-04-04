import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, X, CalendarDays } from 'lucide-react'
import SmartBreak from './SmartBreak'
import MatchmakingFeed, { SPORT_ICONS, SPORTS_LIST } from './MatchmakingFeed'
import FloatingAiAssistant from './FloatingAiAssistant'
import AnimatedShaderHero from './ui/AnimatedShaderHero'
import { useAuth } from '../context/AuthContext'
import { useCalendar } from '../context/CalendarContext'

const TICKER_ITEMS = [
  '🎾 Alex a postat un meci de Padel pentru azi la 18:00',
  '🏓 Ioana caută parteneri de Ping Pong — Cluj',
  '🌿 Elena și-a completat pauza de 3 minute · streak #7',
  '🤝 Andrei s-a conectat cu Vlad pentru Tennis',
  '🚴 Sofia caută colegi de drumuri spre birou',
  '🏸 Elena caută parteneri de Badminton diseară',
]

const HERO_STREAK  = 7
const HERO_MATCHES = 14

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

function toDateString(date) {
  return date.toISOString().split('T')[0]
}

function ActivityModal({ userId, userName, onClose }) {
  const today   = toDateString(new Date())
  const maxDate = toDateString(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

  const [sport,      setSport]      = useState('')
  const [date,       setDate]       = useState(today)
  const [submitting, setSubmitting] = useState(false)
  const [done,       setDone]       = useState(false)

  const handleSubmit = async () => {
    if (!sport || !date) return
    setSubmitting(true)
    try {
      await fetch(`http://localhost:8080/api/matchmaking/${userId}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity: sport, date, userName }),
      })
    } catch {}
    setSubmitting(false)
    setDone(true)
    setTimeout(onClose, 1400)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md bg-surface border border-surface-border rounded-2xl shadow-2xl animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
          <div>
            <h2 className="text-base font-semibold text-white">Adaugă o activitate</h2>
            <p className="text-xs text-slate-500 mt-0.5">Invită colegi compatibili să se alăture</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-surface-border flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          <div className="px-6 py-10 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center text-2xl">🎉</div>
            <p className="text-white font-semibold">Activitate postată!</p>
            <p className="text-sm text-slate-400">Colegii compatibili vor fi notificați automat.</p>
          </div>
        ) : (
          <div className="px-6 py-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Sport</label>
              <select
                value={sport}
                onChange={e => setSport(e.target.value)}
                className="w-full bg-zinc-900 border border-surface-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand transition-colors"
              >
                <option value="">Alege sportul…</option>
                {SPORTS_LIST.map(s => (
                  <option key={s} value={s}>{SPORT_ICONS[s] || '🏅'} {s}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Data</label>
              <input
                type="date"
                value={date}
                min={today}
                max={maxDate}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-zinc-900 border border-surface-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand transition-colors [color-scheme:dark]"
              />
              <p className="text-[11px] text-slate-600">Poți selecta o dată în intervalul următoarelor 30 de zile.</p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!sport || !date || submitting}
              className="mt-1 w-full py-3 rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-brand/25 flex items-center justify-center gap-2"
            >
              {submitting
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Se trimite…</>
                : 'Postează activitatea →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { moodScore, moodLabel } = useCalendar()
  const navigate = useNavigate()

  const [tickerIndex,   setTickerIndex]   = useState(0)
  const [tickerVisible, setTickerVisible] = useState(true)
  const [showModal,     setShowModal]     = useState(false)
  const [searchTrigger, setSearchTrigger] = useState({ sport: null, key: 0 })

  const matchmakingRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerVisible(false)
      setTimeout(() => {
        setTickerIndex(i => (i + 1) % TICKER_ITEMS.length)
        setTickerVisible(true)
      }, 400)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const firstName        = user?.name?.split(' ')[0] ?? 'Coleg'
  const preferredSports  = user?.preferredSports ?? []
  const primarySport     = preferredSports[0] ?? 'Padel'

  const handleFindPartners = () => {
    setSearchTrigger(prev => ({ sport: primarySport, key: prev.key + 1 }))
    matchmakingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const heroSubtitle = preferredSports.length > 0
    ? `Streak activ: ${HERO_STREAK} zile · Sporturi: ${preferredSports.slice(0, 3).join(', ')} · ${HERO_MATCHES} matches luna aceasta`
    : `Streak activ: ${HERO_STREAK} zile · ${HERO_MATCHES} matches luna aceasta · ${getGreeting()}, ${firstName}!`

  return (
    <div className="min-h-screen relative">
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <header className="border-b border-surface-border bg-surface-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="border-b border-surface-border/50 bg-surface/40 px-6 py-1.5 flex items-center gap-3">
          <span className="text-xs font-semibold text-brand-light uppercase tracking-widest shrink-0">Live</span>
          <div className="w-px h-3 bg-surface-border" />
          <p className={`text-xs text-slate-400 transition-opacity duration-300 truncate ${tickerVisible ? 'opacity-100' : 'opacity-0'}`}>
            {TICKER_ITEMS[tickerIndex]}
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center shadow-lg shadow-brand/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">EcoSync</h1>
              <p className="text-[10px] text-slate-500 leading-none">AI Wellbeing Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="hidden sm:inline">Live</span>
            </div>

            <div className="flex items-center gap-2.5 bg-surface border border-surface-border rounded-xl px-3 py-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs font-bold text-white">
                {getInitials(user?.name)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white leading-tight">{user?.name}</p>
                <p className="text-[10px] text-slate-500">{user?.city} · {preferredSports.slice(0, 2).join(', ')}</p>
              </div>
            </div>

            <button onClick={handleLogout} title="Deconectare"
              className="w-9 h-9 rounded-xl border border-surface-border bg-surface hover:bg-red-500/10 hover:border-red-500/30 flex items-center justify-center text-slate-400 hover:text-red-400 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <AnimatedShaderHero
          trustBadge={{ text: 'Pauza ta inteligentă durează 3 minute. Relaxează-te!' }}
          headline={{ line1: 'EcoSync', line2: 'Wellbeing & Sport' }}
          subtitle={heroSubtitle}
          buttons={{
            primary:   { text: 'Adaugă o activitate',             onClick: () => setShowModal(true) },
            secondary: { text: 'Găsește Partener (Sporturile tale)', onClick: handleFindPartners },
          }}
          className="animate-fade-in"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AnimatedStatCard icon="🏃" label="Streak"     target={HERO_STREAK} unit=" zile" sub="+2 săptămâna asta"     color="emerald" delay={0}   />
          <AnimatedStatCard icon="😊" label="Mood Score" target={moodScore}   unit="/100" sub={moodLabel.text} color="violet"  delay={100} link="/program" onLink={() => navigate('/program')} />
          <AnimatedStatCard icon="🤝" label="Matches"    target={HERO_MATCHES} unit=""    sub="Luna aceasta"           color="sky"     delay={200} />
          <AnimatedStatCard icon="☕" label="Pauze"      target={3}            unit=""    sub="Recomandat: 5"          color="amber"   delay={300} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <SmartBreak userId={user?.userId ?? 1} />
          </div>
          <div ref={matchmakingRef} className="lg:col-span-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <MatchmakingFeed
              userId={user?.userId ?? 1}
              userName={user?.name}
              autoSearch={searchTrigger}
            />
          </div>
        </div>
      </main>

      <FloatingAiAssistant />

      {showModal && (
        <ActivityModal
          userId={user?.userId ?? 1}
          userName={user?.name}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function AnimatedStatCard({ icon, label, target, unit, sub, color, delay, onLink }) {
  const value = useCountUp(target)
  const colorMap = {
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-400/10', glow: 'hover:shadow-emerald-500/10' },
    violet:  { text: 'text-violet-400',  bg: 'bg-violet-400/10',  glow: 'hover:shadow-violet-500/10' },
    sky:     { text: 'text-sky-400',     bg: 'bg-sky-400/10',     glow: 'hover:shadow-sky-500/10'    },
    amber:   { text: 'text-amber-400',   bg: 'bg-amber-400/10',   glow: 'hover:shadow-amber-500/10'  },
  }
  const c = colorMap[color]
  return (
    <div
      onClick={onLink}
      className={`stat-card hover:scale-[1.02] hover:shadow-xl ${c.glow} transition-all duration-300 animate-fade-in ${onLink ? 'cursor-pointer' : 'cursor-default'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${c.bg}`}>{icon}</div>
        {onLink && <CalendarDays className="w-3.5 h-3.5 text-slate-600" />}
      </div>
      <p className={`text-3xl font-bold mt-2 tabular-nums ${c.text}`}>{value}{unit}</p>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  )
}
