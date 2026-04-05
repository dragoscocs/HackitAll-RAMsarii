import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, CalendarDays, Home, Building2, ChevronRight, Check, X, Bell, MapPin, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import FloatingAiAssistant from './FloatingAiAssistant'
import AnimatedShaderHero from './ui/AnimatedShaderHero'
import { GlowingButton } from './ui/GlowingButton'
import { useAuth } from '../context/AuthContext'
import { useCalendar } from '../context/CalendarContext'
import { useSportLobby } from '../context/SportLobbyContext'
import { SPORT_META } from '../pages/SportPage'

/* ── All sports with metadata ─────────────────────────────────────── */
const ALL_SPORTS_META = [
  { name: 'Padel',       icon: '🎾', group: 'racket'   },
  { name: 'Tennis',      icon: '🎾', group: 'racket'   },
  { name: 'Ping Pong',   icon: '🏓', group: 'racket'   },
  { name: 'Badminton',   icon: '🏸', group: 'racket'   },
  { name: 'Squash',      icon: '🏸', group: 'racket'   },
  { name: 'Football',    icon: '⚽', group: 'team'     },
  { name: 'Basketball',  icon: '🏀', group: 'team'     },
  { name: 'Volleyball',  icon: '🏐', group: 'team'     },
  { name: 'Running',     icon: '🏃', group: 'outdoor'  },
  { name: 'Cycling',     icon: '🚴', group: 'outdoor'  },
  { name: 'Ski',         icon: '⛷️', group: 'outdoor' },
  { name: 'Swimming',    icon: '🏊', group: 'outdoor'  },
  { name: 'Hiking',      icon: '🥾', group: 'outdoor'  },
  { name: 'Yoga',        icon: '🧘', group: 'wellness' },
  { name: 'Gym',         icon: '💪', group: 'wellness' },
  { name: 'CrossFit',    icon: '🏋️', group: 'wellness'},
]

const CITIES = ['București', 'Cluj-Napoca', 'Iași', 'Timișoara', 'Brașov', 'Constanța']

function sortedSports(userPreferred) {
  const prefSet    = new Set(userPreferred)
  const prefGroups = new Set(
    ALL_SPORTS_META.filter(s => prefSet.has(s.name)).map(s => s.group)
  )
  return [...ALL_SPORTS_META].sort((a, b) => {
    const sa = prefSet.has(a.name) ? 3 : prefGroups.has(a.group) ? 2 : 1
    const sb = prefSet.has(b.name) ? 3 : prefGroups.has(b.group) ? 2 : 1
    if (sa !== sb) return sb - sa
    if (sa === 3) return userPreferred.indexOf(a.name) - userPreferred.indexOf(b.name)
    return a.name.localeCompare(b.name)
  })
}

function sportGlowOpacity(sport, userPreferred) {
  const prefSet    = new Set(userPreferred)
  const prefGroups = new Set(
    ALL_SPORTS_META.filter(s => prefSet.has(s.name)).map(s => s.group)
  )
  if (prefSet.has(sport.name)) return 1
  if (prefGroups.has(sport.group)) return 0.5
  return 0.2
}

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
  mood:    'Scor calculat pe baza ședințelor din calendar, pauzelor luate și activităților sportive. Reflectă echilibrul tău energetic la locul de muncă.',
  matches: 'Activitățile sportive cu colegii tăi luna aceasta. Sportul în echipă construiește conexiuni și îmbunătățește moralul la birou.',
  breaks:  'Pauzele active luate azi. Obiectiv: 5 pauze × 3 minute — cresc concentrarea cu 40% și reduc oboseala mentală.',
}

const CARD_STYLES = {
  emerald: { grad: 'from-emerald-500 to-teal-500',   num: '#34d399', glow: '#10b981', border: 'rgba(52,211,153,0.2)',  iconBg: 'bg-emerald-500/12' },
  violet:  { grad: 'from-violet-500 to-purple-500',  num: '#a78bfa', glow: '#8b5cf6', border: 'rgba(167,139,250,0.2)', iconBg: 'bg-violet-500/12'  },
  sky:     { grad: 'from-sky-500 to-blue-500',       num: '#38bdf8', glow: '#0ea5e9', border: 'rgba(56,189,248,0.2)',  iconBg: 'bg-sky-500/12'     },
  amber:   { grad: 'from-amber-500 to-orange-500',   num: '#fbbf24', glow: '#f59e0b', border: 'rgba(251,191,36,0.2)',  iconBg: 'bg-amber-500/12'   },
}

function FlipCard({ icon, label, target, unit, sub, color, delay, definition }) {
  const [flipped, setFlipped] = useState(false)
  const value = useCountUp(target)
  const s = CARD_STYLES[color]

  return (
    <div
      className="animate-fade-in cursor-pointer select-none"
      style={{ perspective: '1000px', animationDelay: `${delay}ms`, height: '172px' }}
      onClick={() => setFlipped(f => !f)}
    >
      <div style={{
        position: 'relative', height: '172px', transformStyle: 'preserve-3d',
        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>

        {/* ── Front ── */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl"
          style={{ backfaceVisibility: 'hidden', border: `1px solid ${s.border}`, background: '#0c0d12' }}>
          {/* Ambient glow */}
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-25 blur-2xl pointer-events-none"
            style={{ background: s.glow }} />
          {/* Gradient top bar */}
          <div className={`h-[3px] w-full bg-gradient-to-r ${s.grad}`} />

          <div className="p-5 flex flex-col h-[calc(100%-3px)]">
            {/* Icon + label */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base ${s.iconBg} border`}
                  style={{ borderColor: s.border }}>
                  {icon}
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{label}</span>
              </div>
              <span className="text-[9px] text-slate-700 font-medium">↻ flip</span>
            </div>

            {/* Big value */}
            <p className="text-[2.6rem] font-black tabular-nums leading-none mt-auto"
              style={{ color: s.num, textShadow: `0 0 24px ${s.glow}55` }}>
              {value}<span className="text-xl font-bold opacity-60 ml-0.5">{unit}</span>
            </p>

            {/* Sub */}
            <p className="text-[11px] text-slate-500 mt-1.5 leading-tight truncate">{sub}</p>
          </div>
        </div>

        {/* ── Back ── */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', border: `1px solid ${s.border}`, background: '#0c0d12' }}>
          <div className={`h-[3px] w-full bg-gradient-to-r ${s.grad}`} />
          <div className="p-4 flex flex-col gap-2.5 h-[calc(100%-3px)]">
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${s.iconBg} border`}
                style={{ borderColor: s.border }}>
                {icon}
              </div>
              <p className="text-xs font-bold" style={{ color: s.num }}>{label}</p>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed flex-1 overflow-hidden"
              style={{ display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {definition}
            </p>
            <span className="text-[9px] text-slate-700 shrink-0">↻ apasă pentru a reveni</span>
          </div>
        </div>

      </div>
    </div>
  )
}

/* ── Smart Break Banner ──────────────────────────────────────────── */
function SmartBreakBanner() {
  const navigate = useNavigate()
  const { nextBreak, overdueBreak, addTakenBreak, snoozeBreak, demoNow, adjustedSmartBreaks } = useCalendar()

  const now       = demoNow ?? new Date()
  const todayDow  = now.getDay()
  const isWeekend = todayDow === 0 || todayDow === 6

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

  const displayBreak = overdueBreak ?? nextBreak
  if (!displayBreak) {
    // All breaks done for today
    const allTaken = adjustedSmartBreaks.length > 0 && adjustedSmartBreaks.every(b => b.taken)
    if (!allTaken) return null
    return (
      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 px-5 py-4 flex items-center gap-4 animate-fade-in">
        <span className="text-2xl shrink-0">🎉</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-violet-300">Ai luat toate pauzele de azi!</p>
          <p className="text-xs text-slate-500 mt-0.5">Wellbeing 100%. Continuă tot așa mâine.</p>
        </div>
      </div>
    )
  }

  const isOverdue  = overdueBreak !== null
  const minDiff    = Math.round((displayBreak.time - now) / 60000)
  const absMin     = Math.abs(minDiff)
  const isImminent = !isOverdue && minDiff <= 20
  const isFar      = !isOverdue && minDiff > 20

  const fmt = (d) => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  const breakTimeStr = fmt(displayBreak.time)

  const goBreak = () => {
    addTakenBreak()
    navigate('/pause')
  }

  if (isFar) {
    // Calm "upcoming" indicator — always visible
    return (
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-5 py-4 flex items-center gap-4 animate-fade-in">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center text-lg shrink-0">🌿</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">
            Următoarea pauză AI la <span className="text-indigo-400">{breakTimeStr}</span>
            {displayBreak.adjusted && <span className="ml-2 text-[10px] text-indigo-300 bg-indigo-500/15 border border-indigo-500/25 rounded-full px-2 py-0.5">✨ Reconfigurat</span>}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {displayBreak.reason} · în {Math.floor(absMin / 60) > 0 ? `${Math.floor(absMin/60)}h ` : ''}{absMin % 60}min
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={goBreak}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all hover:scale-105 shadow-lg">
            🌿 Ia o acum
          </button>
          <button onClick={() => navigate('/program')}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-xs font-medium transition-all">
            📅 Program
          </button>
        </div>
      </div>
    )
  }

  // Imminent or overdue
  const scheme = isOverdue
    ? { outer: 'bg-red-500/10 border-red-400/35', dot: 'bg-red-400', pulse: true,
        btn: 'bg-red-500 hover:bg-red-400 shadow-red-500/40' }
    : { outer: 'bg-amber-500/10 border-amber-400/30', dot: 'bg-amber-400', pulse: false,
        btn: 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/40' }

  return (
    <div className={`rounded-2xl border px-5 py-4 flex items-center gap-4 animate-slide-up ${scheme.outer}`}>
      <div className="relative shrink-0">
        <div className={`w-3 h-3 rounded-full ${scheme.dot}`} />
        {scheme.pulse && (
          <div className={`absolute inset-0 w-3 h-3 rounded-full ${scheme.dot} animate-ping opacity-60`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-tight">
          {isOverdue
            ? `⏰ E timpul de o pauză! · ${absMin} min față de ${breakTimeStr}`
            : `🌿 Pauza ta e în ${absMin} ${absMin === 1 ? 'minut' : 'minute'} · ${breakTimeStr}`}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{displayBreak.reason}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button onClick={() => snoozeBreak(10)}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium transition-all">
          😴 +10 min
        </button>
        <button onClick={goBreak}
          className={`px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 shadow-lg ${scheme.btn}`}>
          🌿 Ia pauza
        </button>
      </div>
    </div>
  )
}


/* ── Invitation banner ────────────────────────────────────────────── */
function InvitationBanner() {
  const navigate = useNavigate()
  const { myPendingInvitations, acceptInvitation, declineInvitation } = useSportLobby()

  if (!myPendingInvitations?.length) return null

  return (
    <div className="flex flex-col gap-2 animate-slide-up">
      {myPendingInvitations.map(inv => {
        const meta = SPORT_META[inv.sport] ?? { icon: '🏅', color: '#6366f1' }
        return (
          <div
            key={inv.id}
            className="rounded-2xl border px-5 py-4 flex items-center gap-4"
            style={{ background: `${meta.color}08`, borderColor: `${meta.color}30` }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: `${meta.color}20`, border: `1px solid ${meta.color}40` }}
            >
              {meta.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">
                🎾 Invitație de la <span style={{ color: meta.color }}>{inv.fromName}</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {inv.sport} · {inv.date} la {inv.time} · {inv.location}
              </p>
              {inv.message && (
                <p className="text-xs text-slate-500 italic mt-0.5">"{inv.message}"</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => declineInvitation(inv.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 text-xs font-medium transition-all"
              >
                <X className="w-3.5 h-3.5" /> Refuz
              </button>
              <button
                onClick={() => { acceptInvitation(inv.id); navigate(`/sport/${inv.sport}`) }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-semibold transition-all hover:scale-[1.03]"
                style={{ background: meta.color }}
              >
                <Check className="w-3.5 h-3.5" /> Accept
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CityDropdown({ currentCity, onSelect }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/3 border border-white/8 rounded-xl px-3 py-1.5 hover:bg-white/5 hover:border-white/20 transition-all group"
      >
        <MapPin className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-light transition-colors" />
        <span className="text-[11px] font-semibold text-slate-300">{currentCity ?? 'București'}</span>
        <ChevronDown className={`w-3 h-3 text-slate-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-44 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100]"
          >
            <div className="py-1.5">
              {CITIES.map((city) => {
                const isActive = city === currentCity
                return (
                  <button
                    key={city}
                    onClick={() => { onSelect(city); setIsOpen(false) }}
                    className={`w-full text-left px-4 py-2 text-[11px] font-medium transition-all flex items-center justify-between group ${
                      isActive ? 'bg-brand/10 text-brand-light' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {city}
                    {isActive && <Check className="w-3 h-3" />}
                    {!isActive && <div className="w-1 h-1 rounded-full bg-brand opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const SPORT_GROUPS = [
  { key: 'racket',   label: 'Rachetă',  icon: '🎾', accent: '#6366f1' },
  { key: 'team',     label: 'Echipă',   icon: '⚽', accent: '#10b981' },
  { key: 'outdoor',  label: 'Outdoor',  icon: '🏃', accent: '#f59e0b' },
  { key: 'wellness', label: 'Wellness', icon: '🧘', accent: '#ec4899' },
]

/* ── Sport grid section ───────────────────────────────────────────── */
function SportGridSection({ userSports, userCity }) {
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const prefSet = new Set(userSports)

  const preferred = ALL_SPORTS_META.filter(s => prefSet.has(s.name))
  const byGroup   = (key) => ALL_SPORTS_META.filter(s => s.group === key && !prefSet.has(s.name))

  return (
    <section className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            🤝 Sport cu colegii
            <span className="text-[10px] font-normal text-slate-500 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full">
              ✦ AI-powered pairing
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {userCity
              ? <>Lobby-uri și parteneri din <strong className="text-slate-400">{userCity}</strong> · recomandat de AI</>
              : 'Alege sportul și găsește parteneri sau creează un lobby'}
          </p>
        </div>
        <CityDropdown currentCity={userCity} onSelect={(city) => updateUser({ city })} />
      </div>

      {/* Favourite sports — prominent row */}
      {preferred.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">⭐ Sporturile tale</p>
          <div className="flex flex-wrap gap-2.5">
            {preferred.map(sport => {
              const meta = SPORT_META[sport.name] ?? { color: '#6366f1' }
              return (
                <button
                  key={sport.name}
                  onClick={() => navigate(`/sport/${encodeURIComponent(sport.name)}`)}
                  className="relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.04] active:scale-[0.97]"
                  style={{
                    background: `linear-gradient(135deg, ${meta.color}22, ${meta.color}10)`,
                    border: `1.5px solid ${meta.color}55`,
                    boxShadow: `0 4px 20px ${meta.color}20`,
                  }}
                >
                  <span className="text-base leading-none">{sport.icon}</span>
                  <span>{sport.name}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md ml-0.5"
                    style={{ background: `${meta.color}30`, color: meta.color }}>★</span>
                  {/* Glow bar */}
                  <div className="absolute inset-x-0 bottom-0 h-[1px] rounded-full"
                    style={{ background: `linear-gradient(to right, transparent, ${meta.color}80, transparent)` }} />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Grouped rows */}
      <div className="space-y-4">
        {SPORT_GROUPS.map(group => {
          const sports = byGroup(group.key)
          if (sports.length === 0) return null
          return (
            <div key={group.key} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">{group.icon}</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{group.label}</p>
                <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${group.accent}30, transparent)` }} />
              </div>
              <div className="flex flex-wrap gap-2">
                {sports.map(sport => {
                  const meta = SPORT_META[sport.name] ?? { color: group.accent }
                  return (
                    <GlowingButton
                      key={sport.name}
                      glowColor={meta.color}
                      onClick={() => navigate(`/sport/${encodeURIComponent(sport.name)}`)}
                      className="transition-all duration-200"
                    >
                      <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>{sport.icon}</span>
                      <span className="font-semibold">{sport.name}</span>
                    </GlowingButton>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
        <span>💡</span>
        Sporturile tale preferate sunt cele mai luminate. Apasă pe orice sport pentru a vedea lobby-uri active și recomandări AI.
      </p>
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
  const moodIcon = displayMoodScore >= 80 ? '🌟'
    : displayMoodScore >= 65 ? '😊'
    : displayMoodScore >= 50 ? '😐'
    : '😔'

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
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs font-bold text-white shadow overflow-hidden">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  getInitials(user?.name)
                )}
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

        {/* Smart Break Banner — always visible (upcoming, imminent, or overdue) */}
        <SmartBreakBanner />

        {/* Flip stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <FlipCard
            icon="🔥" label="Streak" target={currentStreak} unit=" zile"
            sub={currentStreak > 0 ? `${currentStreak} zile consecutive ✨` : 'Ia prima pauză azi!'}
            color="emerald" delay={0} definition={DEFINITIONS.streak}
          />
          <FlipCard
            icon={moodIcon} label="Mood Score" target={displayMoodScore} unit="/100"
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

        {/* Pending sport invitations */}
        <InvitationBanner />

        {/* Divider */}
        <div className="border-t border-surface-border" />

        {/* Sport grid — glowing buttons sorted by preference */}
        <SportGridSection
          userSports={preferredSports}
          userCity={userCity}
        />

      </main>

      <FloatingAiAssistant />
    </div>
  )
}
