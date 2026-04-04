import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import SmartBreak from './SmartBreak'
import MatchmakingFeed from './MatchmakingFeed'
import FloatingAiAssistant from './FloatingAiAssistant'
import { useAuth } from '../context/AuthContext'

const TICKER_ITEMS = [
  '🎾 Alex a postat un meci de Padel pentru azi la 18:00',
  '🏓 Ioana caută parteneri de Ping Pong — Cluj',
  '🌿 Elena și-a completat pauza de 3 minute · streak #7',
  '🤝 Andrei s-a conectat cu Vlad pentru Tennis',
  '🚴 Sofia caută colegi de drumuri spre birou',
  '🏸 Elena caută parteneri de Badminton diseară',
]

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

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tickerIndex, setTickerIndex] = useState(0)
  const [tickerVisible, setTickerVisible] = useState(true)

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
  const firstName = user?.name?.split(' ')[0] ?? 'Coleg'

  return (
    <div className="min-h-screen relative">
      {/* Subtle aurora glow in background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* Header */}
      <header className="border-b border-surface-border bg-surface-card/60 backdrop-blur-md sticky top-0 z-40">
        {/* Ticker */}
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
                <p className="text-[10px] text-slate-500">{user?.city} · {user?.preferredSports?.slice(0, 2).join(', ')}</p>
              </div>
            </div>

            <button onClick={handleLogout} title="Deconectare"
              className="w-9 h-9 rounded-xl border border-surface-border bg-surface hover:bg-red-500/10 hover:border-red-500/30 flex items-center justify-center text-slate-400 hover:text-red-400 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero greeting */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-4xl font-bold mb-1.5"
            style={{ background: 'linear-gradient(135deg, #fff 30%, #818cf8 70%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {getGreeting()}, {firstName} 👋
          </h2>
          <p className="text-slate-400">Iată snapshot-ul tău de wellbeing pentru astăzi.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <AnimatedStatCard icon="🏃" label="Streak" target={7} unit=" zile" sub="+2 săptămâna asta" color="emerald" delay={0} />
          <AnimatedStatCard icon="😊" label="Mood Score" target={82} unit="/100" sub="↑ față de ieri" color="violet" delay={100} />
          <AnimatedStatCard icon="🤝" label="Matches" target={14} unit="" sub="Luna aceasta" color="sky" delay={200} />
          <AnimatedStatCard icon="☕" label="Pauze" target={3} unit="" sub="Recomandat: 5" color="amber" delay={300} />
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <SmartBreak userId={user?.userId ?? 1} />
          </div>
          <div className="lg:col-span-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <MatchmakingFeed userId={user?.userId ?? 1} userName={user?.name} />
          </div>
        </div>
      </main>

      <FloatingAiAssistant />
    </div>
  )
}

function AnimatedStatCard({ icon, label, target, unit, sub, color, delay }) {
  const value = useCountUp(target)
  const colorMap = {
    emerald: { text: 'text-emerald-400', bg: 'bg-emerald-400/10', glow: 'hover:shadow-emerald-500/10' },
    violet:  { text: 'text-violet-400',  bg: 'bg-violet-400/10',  glow: 'hover:shadow-violet-500/10' },
    sky:     { text: 'text-sky-400',     bg: 'bg-sky-400/10',     glow: 'hover:shadow-sky-500/10' },
    amber:   { text: 'text-amber-400',   bg: 'bg-amber-400/10',   glow: 'hover:shadow-amber-500/10' },
  }
  const c = colorMap[color]
  return (
    <div className={`stat-card hover:scale-[1.02] hover:shadow-xl ${c.glow} transition-all duration-300 cursor-default animate-fade-in`}
      style={{ animationDelay: `${delay}ms` }}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${c.bg}`}>{icon}</div>
      <p className={`text-3xl font-bold mt-2 tabular-nums ${c.text}`}>{value}{unit}</p>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  )
}
