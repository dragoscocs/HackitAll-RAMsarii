import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatedForm, EcoOrbitDisplay, BoxReveal } from '../components/ui/SignIn'
import { useAuth } from '../context/AuthContext'

const API_BASE = ''

const SPORTS = [
  { id: 'Padel',     emoji: '🎾', label: 'Padel',     desc: 'Curți disponibile în oraș'   },
  { id: 'Tennis',    emoji: '🎾', label: 'Tennis',    desc: 'Parteneri la nivel similar'  },
  { id: 'Ping Pong', emoji: '🏓', label: 'Ping Pong', desc: 'În sala de la birou'         },
  { id: 'Badminton', emoji: '🏸', label: 'Badminton', desc: 'Antrenamente ușoare'         },
  { id: 'Football',  emoji: '⚽', label: 'Fotbal',    desc: 'Echipe de 5–11 jucători'     },
  { id: 'Cycling',   emoji: '🚴', label: 'Ciclism',   desc: 'Grupuri de pedalat'          },
  { id: 'Yoga',      emoji: '🧘', label: 'Yoga',      desc: 'Mindfulness & stretching'    },
  { id: 'Ski',       emoji: '⛷️', label: 'Ski',       desc: 'Weekenduri la munte'         },
  { id: 'Running',   emoji: '🏃', label: 'Alergare',  desc: 'Grupuri de dimineață'        },
]
const SPORTS_LIST = SPORTS.map(s => s.id)
const CITIES = ['Bucharest', 'Cluj', 'Iași', 'Timișoara', 'Brașov']

export default function AuthPage() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    city: 'Bucharest',
    preferredSports: [],
  })

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    setError('')
  }

  const toggleSport = (sport) => {
    setFormData((prev) => ({
      ...prev,
      preferredSports: prev.preferredSports.includes(sport)
        ? prev.preferredSports.filter((s) => s !== sport)
        : [...prev.preferredSports, sport],
    }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Autentificare eșuată')
      login(data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) { setError('Numele este obligatoriu'); return }
    if (formData.preferredSports.length === 0) { setError('Alege cel puțin un sport'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          city: formData.city,
          preferredSports: formData.preferredSports,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Înregistrare eșuată')
      login(data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    alert('Google OAuth: adaugă Google Client ID în application.properties pentru a activa. Demo: folosește conturile de test (ex: andrei@syncfit.ro / demo123)')
  }

  const loginFields = [
    {
      label: 'Email',
      required: true,
      type: 'email',
      placeholder: 'ex: andrei@syncfit.ro',
      onChange: handleChange('email'),
    },
    {
      label: 'Password',
      required: true,
      type: 'password',
      placeholder: '••••••••',
      onChange: handleChange('password'),
    },
  ]

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Left — orbit animation */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-card" />
        <EcoOrbitDisplay />
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 py-12">
        {mode === 'login' ? (
          <AnimatedForm
            header="Bine ai revenit"
            subHeader="Intră în contul tău SyncFit"
            fields={loginFields}
            submitButton="Sign in"
            textVariantButton="Nu ai cont? Înregistrează-te"
            errorField={error}
            onSubmit={handleLogin}
            googleLogin={handleGoogleLogin}
            goTo={() => { setMode('register'); setError('') }}
            loading={loading}
          />
        ) : (
          <RegisterForm
            formData={formData}
            handleChange={handleChange}
            toggleSport={toggleSport}
            handleRegister={handleRegister}
            error={error}
            loading={loading}
            onGoLogin={() => { setMode('login'); setError('') }}
            handleGoogleLogin={handleGoogleLogin}
          />
        )}

        {/* Demo hint */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-600">
            Conturi demo: <span className="text-slate-500">andrei@syncfit.ro</span> /{' '}
            <span className="text-slate-500">elena@syncfit.ro</span> · parolă: <span className="text-slate-500">demo123</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function RegisterForm({ formData, handleChange, toggleSport, handleRegister, error, loading, onGoLogin, handleGoogleLogin }) {
  return (
    <section className="w-full max-w-sm mx-auto flex flex-col gap-4">
      <BoxReveal boxColor="#6366f1" duration={0.3}>
        <h2 className="font-bold text-3xl text-white">Cont nou</h2>
      </BoxReveal>
      <BoxReveal boxColor="#6366f1" duration={0.3} className="pb-1">
        <p className="text-slate-400 text-sm">Alătură-te ecosistemului SyncFit</p>
      </BoxReveal>

      {/* Google */}
      <button
        className="g-button group/btn bg-transparent w-full rounded-md h-10 font-medium hover:cursor-pointer relative overflow-hidden"
        type="button"
        onClick={handleGoogleLogin}
      >
        <span className="flex items-center justify-center w-full h-full gap-3 text-white text-sm">
          <img
            src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
            width={22} height={22} alt="Google"
          />
          Continuă cu Google
        </span>
      </button>

      <div className="flex items-center gap-4">
        <hr className="flex-1 border-dashed border-surface-border" />
        <p className="text-slate-500 text-sm">sau</p>
        <hr className="flex-1 border-dashed border-surface-border" />
      </div>

      <form onSubmit={handleRegister} className="flex flex-col gap-3">
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Nume complet <span className="text-red-400">*</span></label>
          <input
            type="text"
            placeholder="ex: Ion Popescu"
            value={formData.name}
            onChange={handleChange('name')}
            className="flex h-10 w-full rounded-md bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-surface-border"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Email <span className="text-red-400">*</span></label>
          <input
            type="email"
            placeholder="ion@companie.ro"
            value={formData.email}
            onChange={handleChange('email')}
            className="flex h-10 w-full rounded-md bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-surface-border"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Parolă <span className="text-red-400">*</span></label>
          <input
            type="password"
            placeholder="minim 6 caractere"
            value={formData.password}
            onChange={handleChange('password')}
            className="flex h-10 w-full rounded-md bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-surface-border"
          />
        </div>

        {/* City */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Oraș</label>
          <select
            value={formData.city}
            onChange={handleChange('city')}
            className="flex h-10 w-full rounded-md bg-zinc-800 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-surface-border"
          >
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Sports */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">
              Sporturi preferate <span className="text-red-400">*</span>
            </label>
            {formData.preferredSports.length > 0 && (
              <span className="text-xs text-brand-light font-medium">
                {formData.preferredSports.length} selectat{formData.preferredSports.length > 1 ? 'e' : ''}
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SPORTS.map(({ id, emoji, label, desc }) => {
              const active = formData.preferredSports.includes(id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleSport(id)}
                  className={`relative flex flex-col items-center gap-1 rounded-xl p-3 border text-center transition-all duration-200 hover:scale-[1.03] active:scale-95 ${
                    active
                      ? 'bg-indigo-600/25 border-indigo-500/60 shadow-lg shadow-indigo-500/20'
                      : 'bg-zinc-900/60 border-surface-border hover:border-indigo-500/40 hover:bg-zinc-800/60'
                  }`}
                >
                  {active && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[9px] text-white font-bold">✓</span>
                  )}
                  <span className="text-2xl leading-none">{emoji}</span>
                  <span className={`text-xs font-semibold leading-tight ${active ? 'text-white' : 'text-slate-300'}`}>{label}</span>
                  <span className="text-[10px] text-slate-500 leading-tight hidden sm:block">{desc}</span>
                </button>
              )
            })}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 bg-gradient-to-br from-brand to-brand-dark w-full text-white rounded-md h-10 font-medium shadow-lg shadow-brand/30 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Se procesează...' : 'Creează cont →'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={onGoLogin}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Ai deja cont? Conectează-te
          </button>
        </div>
      </form>
    </section>
  )
}
