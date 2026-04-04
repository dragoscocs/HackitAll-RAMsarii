import { useState, useEffect, useRef } from 'react'

const BREAK_DURATION_SECONDS = 3 * 60  // 3 minutes

export default function SmartBreak({ userId }) {
  const [suggestion, setSuggestion]     = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [phase, setPhase]               = useState('idle')   // idle | active | countdown | feedback | fallback
  const [snoozed, setSnoozed]           = useState(false)
  const [secondsLeft, setSecondsLeft]   = useState(BREAK_DURATION_SECONDS)
  const timerRef                        = useRef(null)

  useEffect(() => {
    const fetchBreak = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/breaks/${userId}`)
        if (!res.ok) throw new Error('Failed to fetch break suggestion')
        const data = await res.json()
        setSuggestion(data)
        setPhase('active')
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    fetchBreak()
  }, [userId])

  const startCountdown = () => {
    setPhase('countdown')
    setSecondsLeft(BREAK_DURATION_SECONDS)

    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setPhase('feedback')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const snooze = () => {
    setSnoozed(true)
    setPhase('idle')
    setTimeout(() => {
      setSnoozed(false)
      if (suggestion) setPhase('active')
    }, 10 * 60 * 1000) // 10 min (for demo this triggers immediately in dev)
  }

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0')
    const s = String(secs % 60).padStart(2, '0')
    return `${m}:${s}`
  }

  const circumference = 2 * Math.PI * 52
  const progress = 1 - secondsLeft / BREAK_DURATION_SECONDS

  if (loading) return <BreakSkeleton />

  if (error) return (
    <div className="card h-full flex flex-col items-center justify-center gap-3 text-center">
      <span className="text-4xl">⚠️</span>
      <p className="text-slate-400 text-sm">Could not load break suggestion.</p>
      <p className="text-xs text-slate-600">{error}</p>
    </div>
  )

  return (
    <div className="card h-full flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-400/10 flex items-center justify-center text-lg">
            🧘
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Smart Break</h3>
            <p className="text-xs text-slate-500">AI-powered wellness</p>
          </div>
        </div>
        {suggestion?.isAiGenerated && (
          <span className="badge bg-emerald-400/10 text-emerald-400">✨ AI</span>
        )}
      </div>

      {/* ---- Phase: SNOOZED ---- */}
      {snoozed && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center animate-fade-in">
          <span className="text-5xl">😴</span>
          <p className="text-slate-300 font-medium">Snoozed for 10 minutes</p>
          <p className="text-xs text-slate-500">We'll remind you again shortly.</p>
        </div>
      )}

      {/* ---- Phase: ACTIVE (notification) ---- */}
      {phase === 'active' && (
        <div className="flex-1 flex flex-col gap-5 animate-slide-up">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-sm font-semibold text-emerald-300 mb-1">
              ⏰ Time for a break!
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {suggestion?.suggestionText}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Suggested at <strong className="text-slate-300">{suggestion?.time}</strong>
          </div>

          <div className="flex gap-3 mt-auto">
            <button id="break-snooze-btn" onClick={snooze} className="btn-secondary flex-1 text-sm">
              😴 Snooze 10 min
            </button>
            <button id="break-confirm-btn" onClick={startCountdown} className="btn-primary flex-1 text-sm">
              ✅ Confirm
            </button>
          </div>
        </div>
      )}

      {/* ---- Phase: COUNTDOWN ---- */}
      {phase === 'countdown' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-fade-in">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" stroke="#334155" strokeWidth="8" fill="none" />
              <circle
                cx="60" cy="60" r="52"
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white tabular-nums">
                {formatTime(secondsLeft)}
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-slate-200 font-semibold">Break in progress 🌿</p>
            <p className="text-xs text-slate-500 mt-1">Step away, breathe, stretch.</p>
          </div>
        </div>
      )}

      {/* ---- Phase: FEEDBACK ---- */}
      {phase === 'feedback' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 animate-slide-up">
          <span className="text-5xl">🌟</span>
          <p className="text-lg font-semibold text-white text-center">Did you relax?</p>
          <div className="flex gap-3 w-full">
            <button
              id="feedback-yes-btn"
              onClick={() => setPhase('done')}
              className="btn-primary flex-1"
            >
              😊 Yes!
            </button>
            <button
              id="feedback-no-btn"
              onClick={() => setPhase('fallback')}
              className="btn-secondary flex-1"
            >
              😕 No
            </button>
          </div>
        </div>
      )}

      {/* ---- Phase: FALLBACK (no = AI advice) ---- */}
      {phase === 'fallback' && (
        <div className="flex-1 flex flex-col gap-4 animate-slide-up">
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
            <p className="text-sm font-semibold text-violet-300 mb-2">💡 EcoSync AI suggests:</p>
            <p className="text-xs text-slate-300 leading-relaxed">
              It sounds like you're feeling overwhelmed. Try the <strong>4-7-8 breathing technique</strong>:
              inhale for 4 seconds, hold for 7, exhale for 8. Repeat 3 times.
              This activates the parasympathetic nervous system and can reduce stress in under 2 minutes.
            </p>
          </div>
          <button
            id="fallback-reset-btn"
            onClick={() => setPhase('active')}
            className="btn-primary w-full text-sm"
          >
            Try another break →
          </button>
        </div>
      )}

      {/* ---- Phase: DONE ---- */}
      {phase === 'done' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-fade-in">
          <span className="text-6xl">🎉</span>
          <p className="text-xl font-bold text-white">Great job!</p>
          <p className="text-sm text-slate-400 text-center">
            Your wellbeing score went up. Keep it up!
          </p>
          <button
            id="done-reset-btn"
            onClick={() => setPhase('active')}
            className="btn-secondary text-sm mt-2"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  )
}

function BreakSkeleton() {
  return (
    <div className="card h-full flex flex-col gap-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-surface-border" />
        <div className="h-4 w-32 bg-surface-border rounded" />
      </div>
      <div className="h-24 bg-surface-border rounded-xl" />
      <div className="flex gap-3">
        <div className="h-10 flex-1 bg-surface-border rounded-xl" />
        <div className="h-10 flex-1 bg-surface-border rounded-xl" />
      </div>
    </div>
  )
}
