import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { SPORT_ICONS } from './MatchmakingFeed'

const BREAK_DURATION_SECONDS = 3 * 60

const BREAK_REQUESTS = [
  { id: 1, name: 'Andrei Popescu',  activity: 'Padel',     avatar: 'AP', time: '12:30', color: 'from-violet-500 to-purple-700' },
  { id: 2, name: 'Ioana Ionescu',   activity: 'Ping Pong', avatar: 'II', time: '13:00', color: 'from-sky-500 to-blue-700' },
  { id: 3, name: 'Elena Stancu',    activity: 'Badminton', avatar: 'ES', time: '14:00', color: 'from-emerald-500 to-teal-700' },
]

const SPORTS_LIST = ['Padel', 'Tennis', 'Ping Pong', 'Badminton', 'Football', 'Yoga', 'Cycling']

export default function SmartBreak({ userId }) {
  const [suggestion, setSuggestion]   = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [phase, setPhase]             = useState('idle')
  const [snoozed, setSnoozed]         = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(BREAK_DURATION_SECONDS)
  const timerRef                      = useRef(null)

  useEffect(() => {
    fetch(`http://localhost:8080/api/breaks/${userId}`)
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json() })
      .then(d => { setSuggestion(d); setPhase('active') })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [userId])

  const startCountdown = () => {
    setPhase('countdown')
    setSecondsLeft(BREAK_DURATION_SECONDS)
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setPhase('feedback'); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const skipBreak = () => {
    clearInterval(timerRef.current)
    setPhase('feedback')
  }

  const snooze = () => {
    setSnoozed(true); setPhase('idle')
    setTimeout(() => { setSnoozed(false); if (suggestion) setPhase('active') }, 10 * 60 * 1000)
  }

  const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const circumference = 2 * Math.PI * 52
  const progress = 1 - secondsLeft / BREAK_DURATION_SECONDS

  if (loading) return <BreakSkeleton />

  if (error) return (
    <div className="card h-full flex flex-col items-center justify-center gap-3 text-center">
      <span className="text-4xl">⚠️</span>
      <p className="text-slate-400 text-sm">Nu s-a putut încărca sugestia de pauză.</p>
    </div>
  )

  return (
    <>
      <div className="card h-full flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-400/10 flex items-center justify-center text-lg">🧘</div>
            <div>
              <h3 className="text-sm font-semibold text-white">Smart Break</h3>
              <p className="text-xs text-slate-500">AI-powered wellness</p>
            </div>
          </div>
          {suggestion?.isAiGenerated && <span className="badge bg-emerald-400/10 text-emerald-400">✨ AI</span>}
        </div>

        {snoozed && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center animate-fade-in">
            <span className="text-5xl">😴</span>
            <p className="text-slate-300 font-medium">Amânat 10 minute</p>
            <p className="text-xs text-slate-500">Te vom reaminti în curând.</p>
          </div>
        )}

        {phase === 'active' && (
          <div className="flex-1 flex flex-col gap-5 animate-slide-up">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-sm font-semibold text-emerald-300 mb-1">⏰ E timpul de o pauză!</p>
              <p className="text-xs text-slate-400 leading-relaxed">{suggestion?.suggestionText}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              Sugerat la <strong className="text-slate-300">{suggestion?.time}</strong>
            </div>
            <div className="flex gap-3 mt-auto">
              <button onClick={snooze} className="btn-secondary flex-1 text-sm">😴 Amână 10 min</button>
              <button onClick={startCountdown} className="btn-primary flex-1 text-sm">✅ Confirmă</button>
            </div>
          </div>
        )}

        {/* Compact placeholder shown while overlay is active */}
        {phase === 'countdown' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-fade-in">
            <div className="text-5xl animate-pulse-slow">🌿</div>
            <p className="text-slate-300 font-semibold text-center">Pauza activă</p>
            <p className="text-xs text-slate-500 text-center">Ecranul principal e în modul relaxare.</p>
            <p className="text-3xl font-bold text-white tabular-nums">{formatTime(secondsLeft)}</p>
          </div>
        )}

        {phase === 'feedback' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 animate-slide-up">
            <span className="text-5xl">🌟</span>
            <p className="text-lg font-semibold text-white text-center">Te-ai relaxat?</p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setPhase('done')} className="btn-primary flex-1">😊 Da!</button>
              <button onClick={() => setPhase('fallback')} className="btn-secondary flex-1">😕 Nu</button>
            </div>
          </div>
        )}

        {phase === 'fallback' && (
          <div className="flex-1 flex flex-col gap-4 animate-slide-up">
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
              <p className="text-sm font-semibold text-violet-300 mb-2">💡 EcoSync AI sugerează:</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Încearcă tehnica <strong>4-7-8</strong>: inspiră 4 secunde, ține 7, expiră 8.
                Repetă de 3 ori. Activează sistemul nervos parasimpatic și reduce stresul în sub 2 minute.
              </p>
            </div>
            <button onClick={() => setPhase('active')} className="btn-primary w-full text-sm">Încearcă o altă pauză →</button>
          </div>
        )}

        {phase === 'done' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-fade-in">
            <span className="text-6xl">🎉</span>
            <p className="text-xl font-bold text-white">Bravo!</p>
            <p className="text-sm text-slate-400 text-center">Scorul tău de wellbeing a crescut. Continuă!</p>
            <button onClick={() => setPhase('active')} className="btn-secondary text-sm mt-2">Reset</button>
          </div>
        )}
      </div>

      {/* Full-screen overlay rendered in body via portal */}
      {phase === 'countdown' && createPortal(
        <BreakOverlay
          secondsLeft={secondsLeft}
          progress={progress}
          circumference={circumference}
          formatTime={formatTime}
          userId={userId}
          onSkip={skipBreak}
        />,
        document.body
      )}
    </>
  )
}

function BreakOverlay({ secondsLeft, progress, circumference, formatTime, userId, onSkip }) {
  const [requests, setRequests]         = useState(BREAK_REQUESTS)
  const [showPost, setShowPost]         = useState(false)
  const [newActivity, setNewActivity]   = useState('')
  const [newTime, setNewTime]           = useState('18:00')
  const [posted, setPosted]             = useState(false)

  const handlePost = () => {
    if (!newActivity) return
    setRequests(prev => [{ id: Date.now(), name: 'Tu', activity: newActivity, avatar: '✦', time: newTime, color: 'from-brand to-brand-dark' }, ...prev])
    setShowPost(false)
    setNewActivity('')
    setPosted(true)
    setTimeout(() => setPosted(false), 3000)
  }

  const svgSize = 280
  const r = 120
  const circ = 2 * Math.PI * r

  return (
    <div className="fixed inset-0 z-[200] flex flex-col overflow-hidden"
      style={{ background: '#030712' }}>

      {/* Aurora blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)', filter: 'blur(100px)', top: '-10%', left: '-10%',
            animation: 'blobMove1 12s ease-in-out infinite alternate' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(100px)', bottom: '0%', right: '-5%',
            animation: 'blobMove2 15s ease-in-out infinite alternate' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)', filter: 'blur(80px)', top: '40%', left: '40%',
            animation: 'blobMove3 10s ease-in-out infinite alternate' }} />
      </div>

      {/* Skip button */}
      <div className="absolute top-6 right-6 z-10">
        <button onClick={onSkip}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 border border-white/10 hover:border-white/20 rounded-lg px-3 py-2 transition-all backdrop-blur-sm bg-white/5">
          <X className="w-3.5 h-3.5" /> Sari peste pauză
        </button>
      </div>

      {/* Center: timer + message */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
        <div className="text-center mb-2">
          <p className="text-sm font-medium text-emerald-400 tracking-widest uppercase">🌿 Pauza ta de 3 minute</p>
        </div>

        {/* Giant circular timer */}
        <div className="relative" style={{ width: svgSize, height: svgSize }}>
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.4) 0%, transparent 70%)', filter: 'blur(30px)' }} />

          <svg width={svgSize} height={svgSize} style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle cx={svgSize/2} cy={svgSize/2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="10" fill="none" />
            {/* Progress */}
            <circle cx={svgSize/2} cy={svgSize/2} r={r}
              stroke="url(#breakGrad)" strokeWidth="10" fill="none"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * progress}
              style={{ transition: 'stroke-dashoffset 1s linear' }} />
            <defs>
              <linearGradient id="breakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time display inside circle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <span className="text-6xl font-bold text-white tabular-nums tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(secondsLeft)}
            </span>
            <span className="text-sm text-slate-400">rămase</span>
          </div>
        </div>

        <div className="text-center max-w-xs">
          <p className="text-xl font-semibold text-white mb-1">Depărtează-te de ecran</p>
          <p className="text-sm text-slate-400">Respiră adânc. Privește pe geam. Întinde-te.</p>
        </div>
      </div>

      {/* Bottom panel: matchmaking */}
      <div className="relative z-10 mx-6 mb-6 rounded-2xl overflow-hidden"
        style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Cât te relaxezi…</p>
            <button onClick={() => setShowPost(v => !v)}
              className="text-xs text-brand-light hover:text-white border border-brand/30 rounded-lg px-3 py-1.5 transition-colors hover:bg-brand/10">
              {showPost ? '✕ Anulează' : '+ Postează activitate'}
            </button>
          </div>

          {posted && (
            <div className="mb-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 text-xs text-emerald-300">
              🎉 Postat! Colegii tăi vor fi notificați.
            </div>
          )}

          {showPost && (
            <div className="mb-3 flex gap-2 animate-slide-up">
              <select value={newActivity} onChange={e => setNewActivity(e.target.value)}
                className="flex-1 bg-zinc-900 border border-surface-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand">
                <option value="">Sport…</option>
                {SPORTS_LIST.map(s => <option key={s} value={s}>{SPORT_ICONS[s] || '🏅'} {s}</option>)}
              </select>
              <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                className="w-24 bg-zinc-900 border border-surface-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand" />
              <button onClick={handlePost} disabled={!newActivity}
                className="px-4 py-2 bg-brand hover:bg-brand-dark text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50">
                ✓
              </button>
            </div>
          )}

          <div className="flex gap-3 overflow-x-auto pb-1">
            {requests.map(req => (
              <div key={req.id} className="flex-shrink-0 flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 transition-colors cursor-pointer">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${req.color} flex items-center justify-center text-xs font-bold text-white`}>
                  {req.avatar}
                </div>
                <div>
                  <p className="text-xs font-medium text-white whitespace-nowrap">{req.name}</p>
                  <p className="text-[10px] text-slate-400">{SPORT_ICONS[req.activity] || '🏅'} {req.activity} · {req.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blobMove1 {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(60px,-40px) scale(1.15); }
        }
        @keyframes blobMove2 {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(-50px,30px) scale(0.9); }
        }
        @keyframes blobMove3 {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(30px,50px) scale(1.1); }
        }
      `}</style>
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
