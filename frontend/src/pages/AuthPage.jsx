import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatedForm, EcoOrbitDisplay, BoxReveal } from '../components/ui/SignIn'
import { useAuth } from '../context/AuthContext'

const API_BASE = 'http://localhost:8080'

const SPORTS_LIST = ['Padel', 'Tennis', 'Ping Pong', 'Badminton', 'Football', 'Cycling', 'Yoga', 'Ski', 'Running']
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
    alert('Google OAuth: adaugă Google Client ID în application.properties pentru a activa. Demo: folosește conturile de test (ex: gigel@ecosync.ro / demo123)')
  }

  const loginFields = [
    {
      label: 'Email',
      required: true,
      type: 'email',
      placeholder: 'ex: gigel@ecosync.ro',
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
            subHeader="Intră în contul tău EcoSync"
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
            Conturi demo: <span className="text-slate-500">gigel@ecosync.ro</span> /{' '}
            <span className="text-slate-500">ana@ecosync.ro</span> · parolă: <span className="text-slate-500">demo123</span>
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
        <p className="text-slate-400 text-sm">Alătură-te ecosistemului EcoSync</p>
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
          <label className="text-sm font-medium text-slate-300">Sporturi preferate <span className="text-red-400">*</span></label>
          <div className="flex flex-wrap gap-2">
            {SPORTS_LIST.map((sport) => {
              const selected = formData.preferredSports.includes(sport)
              return (
                <button
                  key={sport}
                  type="button"
                  onClick={() => toggleSport(sport)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    selected
                      ? 'bg-brand border-brand text-white shadow-md shadow-brand/30'
                      : 'bg-transparent border-surface-border text-slate-400 hover:border-brand/50 hover:text-slate-200'
                  }`}
                >
                  {sport}
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
