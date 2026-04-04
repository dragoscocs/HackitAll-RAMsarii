import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
const API = 'http://localhost:8080'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('syncfit_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [showWorkModal, setShowWorkModal] = useState(() => {
    try {
      const stored = localStorage.getItem('syncfit_user')
      if (!stored) return false
      const u = JSON.parse(stored)
      return u?.requiresWorkLocationSetup === true
    } catch { return false }
  })

  const _persist = (userData) => {
    setUser(userData)
    localStorage.setItem('syncfit_user', JSON.stringify(userData))
  }

  const login = (userData) => {
    _persist(userData)
    if (userData?.requiresWorkLocationSetup) setShowWorkModal(true)
  }

  const updateUser = (fields) => {
    if (!user) return
    const updated = { ...user, ...fields }
    _persist(updated)
  }

  const logout = () => {
    setUser(null)
    setShowWorkModal(false)
    localStorage.removeItem('syncfit_user')
  }

  const setWorkLocation = async (location) => {
    if (!user?.userId) return
    try {
      await fetch(`${API}/api/users/${user.userId}/work-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workLocation: location }),
      })
    } catch {}
    const updated = { ...user, workLocation: location, requiresWorkLocationSetup: false }
    _persist(updated)
    setShowWorkModal(false)
  }

  const recordBreakInContext = async () => {
    if (!user?.userId) return
    try {
      await fetch(`${API}/api/breaks/${user.userId}/record`, { method: 'POST' })
    } catch {}
    // Refresh stats from server
    try {
      const res = await fetch(`${API}/api/users/${user.userId}/stats`)
      if (res.ok) {
        const stats = await res.json()
        _persist({ ...user, ...stats })
      }
    } catch {}
  }

  const recordMatchInContext = async () => {
    if (!user?.userId) return
    try {
      await fetch(`${API}/api/users/${user.userId}/record-match`, { method: 'POST' })
      const res = await fetch(`${API}/api/users/${user.userId}/stats`)
      if (res.ok) {
        const stats = await res.json()
        _persist({ ...user, ...stats })
      }
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, setWorkLocation, recordBreakInContext, recordMatchInContext }}>
      {children}
      {showWorkModal && user && <WorkLocationModal onSelect={setWorkLocation} userName={user.name?.split(' ')[0] ?? 'Coleg'} />}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

/* ─── Work Location Modal ──────────────────────────────────────────────── */

const MORNING_MOODS = [
  { value: 1, emoji: '😩', label: 'Epuizat' },
  { value: 2, emoji: '😕', label: 'Obosit'  },
  { value: 3, emoji: '😐', label: 'Ok'      },
  { value: 4, emoji: '🙂', label: 'Bine'    },
  { value: 5, emoji: '😄', label: 'Excelent!'},
]

function WorkLocationModal({ onSelect, userName }) {
  const [step, setStep]         = useState(1)   // 1 = location, 2 = morning mood
  const [selected, setSelected] = useState(null)
  const [moodValue, setMoodValue] = useState(3)
  const [confirming, setConfirming] = useState(false)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bună dimineața' : hour < 18 ? 'Bună ziua' : 'Bună seara'

  const handleConfirm = async () => {
    if (step === 1) {
      if (!selected) return
      setStep(2)
      return
    }
    // Step 2: save morning mood + finalize
    setConfirming(true)
    const moodData = { value: moodValue, date: new Date().toDateString() }
    localStorage.setItem('syncfit_morning_mood', JSON.stringify(moodData))
    window.dispatchEvent(new CustomEvent('syncfit:morning-mood', { detail: { value: moodValue } }))
    await onSelect(selected)
  }

  const options = [
    {
      id: 'OFFICE',
      emoji: '🏢',
      label: 'La birou',
      desc: 'Terasă, sala de conferințe, colegi lângă tine',
      gradient: 'from-indigo-600/30 to-blue-600/20',
      border: 'border-indigo-500/40',
      glow: 'shadow-indigo-500/20',
      ring: 'ring-indigo-500',
    },
    {
      id: 'HOME',
      emoji: '🏠',
      label: 'De acasă',
      desc: 'Balcon, camera ta, mai multă flexibilitate',
      gradient: 'from-emerald-600/30 to-teal-600/20',
      border: 'border-emerald-500/40',
      glow: 'shadow-emerald-500/20',
      ring: 'ring-emerald-500',
    },
  ]

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #34d399, transparent)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Card */}
        <div className="bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {/* Top stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500" />

          <div className="px-8 py-8 flex flex-col gap-7">

            {/* Step 1: Work location */}
            {step === 1 && (<>
              {/* Header */}
              <div className="text-center flex flex-col gap-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-xl shadow-indigo-500/30 text-2xl mb-1">
                  ⚡
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {greeting}, {userName}!
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Unde lucrezi <strong className="text-slate-300">azi</strong>? AI-ul îți va personaliza
                  pauzele și recomandările în funcție de locație.
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                {options.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelected(opt.id)}
                    className={`
                      relative flex flex-col items-center gap-3 rounded-2xl p-5 border-2 transition-all duration-200
                      bg-gradient-to-br ${opt.gradient}
                      ${selected === opt.id
                        ? `${opt.border} ring-2 ${opt.ring} ring-offset-2 ring-offset-zinc-950 shadow-xl ${opt.glow} scale-[1.03]`
                        : 'border-white/10 hover:border-white/20 hover:scale-[1.01]'
                      }
                    `}
                  >
                    {selected === opt.id && (
                      <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-zinc-900">✓</span>
                    )}
                    <span className="text-4xl">{opt.emoji}</span>
                    <div className="text-center">
                      <p className={`text-sm font-bold ${selected === opt.id ? 'text-white' : 'text-slate-300'}`}>
                        {opt.label}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* AI hint */}
              <div className="flex items-start gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-3">
                <span className="text-lg mt-0.5">✨</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {selected === 'OFFICE'
                    ? 'La birou îți sugerăm: plimbări până la terasă, stretching la birou, socializare cu colegii.'
                    : selected === 'HOME'
                    ? 'Acasă îți sugerăm: exerciții ușoare, ieșit pe balcon, respirații ghidate 4-7-8.'
                    : 'AI-ul va adapta fiecare sugestie de pauză la contextul tău de lucru.'}
                </p>
              </div>
            </>)}

            {/* Step 2: Morning mood */}
            {step === 2 && (<>
              <div className="text-center flex flex-col gap-2">
                <div className="text-5xl mb-1">{MORNING_MOODS[moodValue - 1].emoji}</div>
                <h2 className="text-2xl font-bold text-white">Cum te simți azi?</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Scorul tău de <strong className="text-slate-300">wellness</strong> începe de aici.
                  AI-ul îl va ajusta pe parcursul zilei.
                </p>
              </div>

              <div className="flex flex-col items-center gap-5">
                <div className="text-4xl font-bold text-white">
                  {MORNING_MOODS[moodValue - 1].label}
                </div>

                {/* Mood chip row */}
                <div className="flex gap-2 w-full justify-between">
                  {MORNING_MOODS.map(m => (
                    <button
                      key={m.value}
                      onClick={() => setMoodValue(m.value)}
                      className={`flex-1 flex flex-col items-center gap-1.5 rounded-2xl py-3 px-1 border-2 transition-all duration-200 ${
                        moodValue === m.value
                          ? 'border-indigo-500/60 bg-indigo-600/20 scale-[1.05]'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <span className={`text-[10px] font-semibold leading-tight text-center ${moodValue === m.value ? 'text-white' : 'text-slate-500'}`}>
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-start gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-3 w-full">
                  <span className="text-lg mt-0.5">🤖</span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {moodValue <= 2
                      ? 'Ne pare rău că nu te simți bine. AI-ul îți va sugera pauze mai blânde și activități relaxante.'
                      : moodValue >= 4
                      ? 'Super! Energie mare azi. Îți vom sugera activități sociale și sport cu colegii.'
                      : 'Zi obișnuită. Vom adapta pauzele pentru a-ți menține nivelul de energie.'}
                  </p>
                </div>
              </div>
            </>)}

            {/* Confirm button */}
            <button
              onClick={handleConfirm}
              disabled={(step === 1 && !selected) || confirming}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-base transition-all duration-200 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
            >
              {confirming
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Se salvează…</>
                : step === 1
                ? (selected ? `Continuă cu "${options.find(o => o.id === selected)?.label}" →` : 'Alege locația ta →')
                : 'Începe ziua →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
