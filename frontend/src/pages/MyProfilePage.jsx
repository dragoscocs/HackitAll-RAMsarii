import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Edit3, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const SPORTS = [
  { id: 'Padel',     emoji: '🎾', label: 'Padel'     },
  { id: 'Tennis',    emoji: '🎾', label: 'Tennis'    },
  { id: 'Ping Pong', emoji: '🏓', label: 'Ping Pong' },
  { id: 'Badminton', emoji: '🏸', label: 'Badminton' },
  { id: 'Football',  emoji: '⚽', label: 'Fotbal'    },
  { id: 'Cycling',   emoji: '🚴', label: 'Ciclism'   },
  { id: 'Yoga',      emoji: '🧘', label: 'Yoga'      },
  { id: 'Ski',       emoji: '⛷️', label: 'Ski'       },
  { id: 'Running',   emoji: '🏃', label: 'Alergare'  },
]

const CITIES = ['Bucharest', 'Cluj', 'Iași', 'Timișoara', 'Brașov']

const SCHEDULES = [
  { id: '8-16',     label: '8:00 – 16:00', emoji: '🌅' },
  { id: '9-17',     label: '9:00 – 17:00', emoji: '☀️' },
  { id: '10-18',    label: '10:00 – 18:00', emoji: '🌤️' },
  { id: 'flexible', label: 'Flexibil',      emoji: '🔄' },
]

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function MyProfilePage() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved]   = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm]     = useState({
    name:              user?.name              ?? '',
    city:              user?.city              ?? 'Bucharest',
    preferredSports:   user?.preferredSports   ?? [],
    workSchedule:      user?.workSchedule      ?? '9-17',
    userPersonaPrompt: user?.userPersonaPrompt ?? '',
    userHealthLimits:  user?.userHealthLimits  ?? '',
  })

  const toggleSport = (sport) => setForm(prev => ({
    ...prev,
    preferredSports: prev.preferredSports.includes(sport)
      ? prev.preferredSports.filter(s => s !== sport)
      : [...prev.preferredSports, sport],
  }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${user.id || user.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        const updatedUser = await res.json()
        login({ ...user, ...updatedUser })
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const workLocationLabel = user?.workLocation === 'HOME'
    ? '🏠 Acasă'
    : user?.workLocation === 'OFFICE'
    ? '🏢 La birou'
    : '📍 Locație nesetată'

  return (
    <div className="min-h-screen relative">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)', filter: 'blur(70px)' }} />
      </div>

      {/* ── Header ── */}
      <header className="border-b border-surface-border bg-surface-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-[10px] font-bold text-white">
              {getInitials(form.name)}
            </div>
            <span className="text-sm font-semibold text-white">Profilul meu</span>
          </div>

          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              saved
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-brand hover:bg-brand-dark text-white shadow-lg shadow-brand/25 hover:scale-[1.02]'
            }`}
          >
            {saved ? <><Check className="w-3.5 h-3.5" /> Salvat!</> : 'Salvează'}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-5 animate-fade-in">
        {/* ── Avatar & identity ── */}
        <div className="card flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-violet-500/20">
              {getInitials(form.name)}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl bg-surface-card border border-surface-border flex items-center justify-center">
              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-white truncate">{form.name || 'Fără nume'}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="badge bg-brand/10 text-brand-light text-[10px]">{workLocationLabel}</span>
              {user?.currentStreak > 0 && (
                <span className="badge bg-emerald-400/10 text-emerald-400 text-[10px]">
                  🔥 {user.currentStreak} zile streak
                </span>
              )}
              <span className="badge bg-violet-400/10 text-violet-400 text-[10px]">
                {form.preferredSports.length} sporturi
              </span>
            </div>
          </div>
        </div>

        {/* ── Personal info ── */}
        <div className="card flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center text-xs">👤</span>
            Informații personale
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nume complet</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-zinc-900 border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors placeholder:text-slate-600"
                placeholder="Ion Popescu"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className="w-full bg-zinc-900/40 border border-surface-border/50 rounded-xl px-4 py-2.5 text-sm text-slate-600 cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-700">Emailul nu poate fi modificat.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Oraș</label>
              <select
                value={form.city}
                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                className="w-full bg-zinc-900 border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand transition-colors"
              >
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Work schedule ── */}
        <div className="card flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center text-xs">🕐</span>
              Program de lucru
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 ml-8">Folosit pentru personalizarea calendarului și a pauzelor</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SCHEDULES.map(s => (
              <button
                key={s.id}
                onClick={() => setForm(p => ({ ...p, workSchedule: s.id }))}
                className={`flex flex-col items-center gap-1.5 rounded-xl p-3.5 border text-center transition-all duration-200 ${
                  form.workSchedule === s.id
                    ? 'bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10 scale-[1.02]'
                    : 'bg-zinc-900/60 border-surface-border hover:border-indigo-500/30 hover:scale-[1.01]'
                }`}
              >
                <span className="text-2xl">{s.emoji}</span>
                <span className={`text-xs font-semibold leading-tight ${form.workSchedule === s.id ? 'text-white' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-start gap-2 bg-amber-500/8 border border-amber-500/15 rounded-xl px-3 py-2.5">
            <span className="text-amber-400 text-sm shrink-0">ℹ️</span>
            <p className="text-xs text-amber-300/70 leading-relaxed">
              Integrarea completă cu <strong className="text-amber-300/90">Microsoft 365 / Outlook</strong> va fi disponibilă în curând.
            </p>
          </div>
        </div>

        {/* ── Personalizare AI ── */}
        <div className="card flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center text-xs">🤖</span>
              Personalizare AI (SyncFit Coach)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 ml-8">Setează personalitatea și limitele de sănătate pentru asistentul tău virtual.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tonul Asistentului (Persona)</label>
              <textarea
                value={form.userPersonaPrompt}
                onChange={e => setForm(p => ({ ...p, userPersonaPrompt: e.target.value }))}
                className="w-full bg-zinc-900 border border-surface-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand transition-colors placeholder:text-slate-600/70 resize-none h-28"
                placeholder="Ex: Vorbește cu mine ca un antrenor militar dur, folosește expresii din tabăra de instrucție și încurajează-mă ferm. Sau: Fii foarte blând, Zen și axează-te pe respirație."
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Alergii sau Limite Fizice</label>
              <textarea
                value={form.userHealthLimits}
                onChange={e => setForm(p => ({ ...p, userHealthLimits: e.target.value }))}
                className="w-full bg-zinc-900 border border-surface-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-slate-600/70 resize-none h-28"
                placeholder="Ex: Am dureri frecvente în zona lombară, evită exercițiile care implică aplecări bruște. Sau: Sunt alergic la nuci, nu îmi recomanda gustări care le conțin."
              />
            </div>
          </div>
        </div>

        {/* ── Sports ── */}
        <div className="card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center text-xs">🏅</span>
              Sporturi preferate
            </h2>
            {form.preferredSports.length > 0 && (
              <span className="text-xs text-brand-light font-medium">
                {form.preferredSports.length} selectat{form.preferredSports.length > 1 ? 'e' : ''}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {SPORTS.map(({ id, emoji, label }) => {
              const active = form.preferredSports.includes(id)
              return (
                <button
                  key={id}
                  onClick={() => toggleSport(id)}
                  className={`relative flex flex-col items-center gap-1.5 rounded-xl p-3 border text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 ${
                    active
                      ? 'bg-indigo-600/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                      : 'bg-zinc-900/60 border-surface-border hover:border-indigo-500/30'
                  }`}
                >
                  {active && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[9px] text-white font-bold">✓</span>
                  )}
                  <span className="text-2xl">{emoji}</span>
                  <span className={`text-xs font-semibold leading-tight ${active ? 'text-white' : 'text-slate-400'}`}>{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Stats (read-only) ── */}
        <div className="card flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-sky-500/15 flex items-center justify-center text-xs">📊</span>
            Statistici
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-400/5 border border-emerald-400/15 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{user?.currentStreak ?? 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Zile streak</p>
            </div>
            <div className="bg-violet-400/5 border border-violet-400/15 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-violet-400">{user?.matchesThisMonth ?? 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Matches luna asta</p>
            </div>
            <div className="bg-amber-400/5 border border-amber-400/15 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{user?.breaksTakenToday ?? 0}</p>
              <p className="text-xs text-slate-500 mt-0.5">Pauze azi</p>
            </div>
          </div>
        </div>

        {/* ── Bottom save ── */}
        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            className="px-5 py-4 rounded-2xl bg-surface hover:bg-red-500/10 border border-surface-border hover:border-red-500/30 text-slate-400 hover:text-red-400 font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            title="Deconectare"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Deconectare</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-4 rounded-2xl bg-brand hover:bg-brand-dark text-white font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-99 shadow-lg shadow-brand/25 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving 
              ? 'Se salvează...' 
              : saved
                ? <><Check className="w-4 h-4" /> Profil salvat cu succes!</>
                : 'Salvează profilul'}
          </button>
        </div>
      </main>
    </div>
  )
}
