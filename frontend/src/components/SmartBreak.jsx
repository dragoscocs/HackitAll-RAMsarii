import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCalendar } from '../context/CalendarContext'

const SPORT_ICONS = {
  Padel: '🎾', 'Ping Pong': '🏓', Tennis: '🎾', Badminton: '🏸',
  Football: '⚽', Yoga: '🧘', Cycling: '🚴', Ski: '⛷️', Running: '🏃',
}

export default function SmartBreak({ userId, workLocation, userSports = [] }) {
  const navigate = useNavigate()
  const { smartBreaks, moodScore } = useCalendar()

  const [suggestion, setSuggestion] = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)
  const [snoozed,    setSnoozed]    = useState(false)
  const [phase,      setPhase]      = useState('idle') // 'idle' | 'fetching' | 'active'
  const [selectedSport, setSelectedSport] = useState(null)
  
  const [nextBreak, setNextBreak] = useState(null)
  const lastFiredBreakRef = useRef(null)

  // Monitor clock and trigger AI break when time comes
  useEffect(() => {
    if (!smartBreaks || smartBreaks.length === 0) return

    const tick = () => {
      if (snoozed || phase !== 'idle') return

      const now = new Date()
      
      // Find the upcoming break for display
      const upcoming = smartBreaks.find(b => new Date(b.time) > now)
      setNextBreak(upcoming)

      // Find if we are currently INSIDE a break window (within 5 mins after scheduled time)
      const currentBreak = smartBreaks.find(b => {
        const bTime = new Date(b.time)
        const diffMin = (now - bTime) / 60000
        return diffMin >= 0 && diffMin < 5
      })

      // If it's break time and we haven't already fired for this specific break slot
      if (currentBreak && lastFiredBreakRef.current?.getTime() !== currentBreak.time.getTime()) {
        lastFiredBreakRef.current = currentBreak.time
        triggerAiBreak(currentBreak)
      }
    }

    tick()
    const intervalId = setInterval(tick, 10000) // check every 10s
    return () => clearInterval(intervalId)
  }, [smartBreaks, snoozed, phase])

  const triggerAiBreak = async (breakSlot) => {
    setPhase('fetching')
    setLoading(true)
    setError(null)
    
    const payload = {
      scheduleContext: breakSlot.reason,
      currentMood: moodScore || 80,
      timeOfDay: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
    }

    try {
      const res = await fetch(`/api/ai/smart-break/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Ai Break Failed')
      
      const data = await res.json()
      setSuggestion({ ...data, time: payload.timeOfDay })
      setPhase('active')
    } catch (e) {
      console.error(e)
      setError(e.message)
      setPhase('idle')
    } finally {
      setLoading(false)
    }
  }

  const handleTestTrigger = () => {
    if (smartBreaks?.length > 0) {
      triggerAiBreak(smartBreaks[0])
    } else {
      triggerAiBreak({ reason: 'Sesiune de test manuală', time: new Date() })
    }
  }

  const confirmBreak = () => {
    navigate('/pause', { state: { suggestionText: suggestion?.suggestionText } })
  }

  const snooze = () => {
    setSnoozed(true)
    setPhase('idle')
    setTimeout(() => { setSnoozed(false); if (suggestion) setPhase('active') }, 10 * 60 * 1000)
  }

  const handleFindPartner = () => {
    const url = selectedSport
      ? `/matches?sport=${encodeURIComponent(selectedSport)}`
      : '/matches'
    navigate(url)
  }

  if (loading) return <BreakSkeleton />

  if (error) return (
    <div className="card h-full flex flex-col items-center justify-center gap-3 text-center">
      <span className="text-4xl">⚠️</span>
      <p className="text-slate-400 text-sm">Nu s-a putut încărca sugestia de pauză.</p>
    </div>
  )

  return (
    <div className="card flex flex-col gap-4">
      {/* ── Header ── */}
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

      {/* ── Snoozed state ── */}
      {snoozed && (
        <div className="flex flex-col items-center justify-center gap-3 text-center py-6 animate-fade-in">
          <span className="text-5xl">😴</span>
          <p className="text-slate-300 font-medium">Amânat 10 minute</p>
          <p className="text-xs text-slate-500">Te vom reaminti în curând.</p>
        </div>
      )}

      {/* ── Active break suggestion ── */}
      {phase === 'active' && !snoozed && (
        <div className="flex flex-col gap-4 animate-slide-up">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-sm font-semibold text-emerald-300 mb-1">⏰ E timpul de o pauză!</p>
            <p className="text-xs text-slate-400 leading-relaxed">{suggestion?.suggestionText}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shrink-0" />
            Sugerat la <strong className="text-slate-300 ml-1">{suggestion?.time}</strong>
          </div>

          {/* Break preview strip */}
          <div className="rounded-xl overflow-hidden border border-surface-border" style={{ height: 68, background: '#030712' }}>
            <BreakPreviewStrip />
          </div>

          <div className="flex gap-3">
            <button onClick={snooze}       className="btn-secondary flex-1 text-sm">😴 Amână 10 min</button>
            <button onClick={confirmBreak} className="btn-primary  flex-1 text-sm">✅ Confirmă</button>
          </div>
        </div>
      )}

      {phase === 'idle' && !snoozed && (
        <div className="flex flex-col items-center justify-center gap-3 text-center py-6">
          <div className="relative">
            <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full animate-pulse" />
            <span className="text-4xl relative z-10">⏳</span>
          </div>
          <div>
            <p className="text-slate-300 font-medium text-sm">
              Următoarea pauză la {nextBreak ? new Date(nextBreak.time).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }) : 'nedefinit'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Concentrează-te. Îți trimit o alertă când e timpul!</p>
          </div>
          <button onClick={handleTestTrigger} className="text-[10px] uppercase tracking-wider text-slate-600 hover:text-brand transition-colors mt-2">
            Simulează Acum (Demo)
          </button>
        </div>
      )}

      {phase === 'fetching' && (
        <div className="flex flex-col items-center justify-center gap-3 text-center py-6">
          <span className="text-4xl animate-bounce">🤖</span>
          <p className="text-slate-400 text-sm animate-pulse">Gemini creează o pauză personalizată...</p>
        </div>
      )}

      {/* ── Divider ── */}
      <div className="border-t border-surface-border" />

      {/* ── Sport Matchmaking Section ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center text-base shrink-0">🏅</div>
          <div>
            <p className="text-sm font-semibold text-white">Vrei să joci un sport?</p>
            <p className="text-xs text-slate-500">Găsește un coleg disponibil acum</p>
          </div>
        </div>

        {userSports.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {userSports.map(sport => (
              <button
                key={sport}
                onClick={() => setSelectedSport(s => s === sport ? null : sport)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                  selectedSport === sport
                    ? 'bg-brand/20 border-brand/50 text-white shadow-sm shadow-brand/20'
                    : 'bg-surface border-surface-border text-slate-400 hover:border-brand/30 hover:text-slate-300'
                }`}
              >
                <span>{SPORT_ICONS[sport] ?? '🏅'}</span>
                {sport}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-600 italic">
            Adaugă sporturi preferate din{' '}
            <button
              onClick={() => navigate('/my-profile')}
              className="text-brand-light hover:underline"
            >
              profilul tău
            </button>.
          </p>
        )}

        <button
          onClick={handleFindPartner}
          className="w-full py-2.5 rounded-xl bg-brand/10 hover:bg-brand/20 border border-brand/20 hover:border-brand/40 text-brand-light text-sm font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
        >
          🤝 {selectedSport
            ? `Găsește parteneri de ${selectedSport}`
            : 'Explorează toate activitățile →'}
        </button>
      </div>
    </div>
  )
}

function BreakPreviewStrip() {
  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #030712 0%, #0c1a3a 50%, #030712 100%)',
      }}>
        <div className="absolute w-32 h-32 rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, #34d399, transparent)', filter: 'blur(20px)', top: '-20%', left: '10%',
            animation: 'blobPreview 4s ease-in-out infinite alternate' }} />
        <div className="absolute w-24 h-24 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(20px)', bottom: '-20%', right: '15%',
            animation: 'blobPreview 5s ease-in-out infinite alternate-reverse' }} />
      </div>
      <p className="relative z-10 text-xs font-medium text-slate-300 tracking-wider">
        🌿 Apasă <strong className="text-emerald-300">Confirmă</strong> pentru pauza full-screen
      </p>
      <style>{`
        @keyframes blobPreview {
          0%   { transform: scale(1) translate(0,0); }
          100% { transform: scale(1.2) translate(10px,-10px); }
        }
      `}</style>
    </div>
  )
}

function BreakSkeleton() {
  return (
    <div className="card flex flex-col gap-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-surface-border" />
        <div className="h-4 w-32 bg-surface-border rounded" />
      </div>
      <div className="h-24 bg-surface-border rounded-xl" />
      <div className="flex gap-3">
        <div className="h-10 flex-1 bg-surface-border rounded-xl" />
        <div className="h-10 flex-1 bg-surface-border rounded-xl" />
      </div>
      <div className="border-t border-surface-border" />
      <div className="h-20 bg-surface-border rounded-xl" />
    </div>
  )
}
