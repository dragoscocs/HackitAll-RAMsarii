import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useCalendar } from '../context/CalendarContext'
import { useAuth } from '../context/AuthContext'

export default function BreakNotificationPopup() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    overdueBreak, addTakenBreak, snoozeBreak, demoNow,
    effectiveMoodScore, effectiveMoodReco,
  } = useCalendar()

  // Track which break we've already popped up for (by timestamp)
  const shownRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [displayBreak, setDisplayBreak] = useState(null)

  // Personalized AI suggestion from backend
  const [aiSuggestion, setAiSuggestion] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const fetchTimerRef = useRef(null)

  // Debounced AI fetch — waits 2s before calling API to avoid rapid-fire 429s
  const triggerAiFetch = useCallback(() => {
    if (!user?.userId) return
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current)
    setAiLoading(true)
    setAiSuggestion(null)
    fetchTimerRef.current = setTimeout(() => {
      fetch(`/api/breaks/${user.userId}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setAiSuggestion(data) })
        .catch(() => {})
        .finally(() => setAiLoading(false))
    }, 2000)
  }, [user?.userId])

  // Show popup when a new overdue break appears OR demoNow changes
  useEffect(() => {
    if (!overdueBreak) {
      setVisible(false)
      return
    }
    const key = overdueBreak.time.getTime()
    const isNew = key !== shownRef.current
    if (isNew) shownRef.current = key
    setDisplayBreak(overdueBreak)
    setVisible(true)
    triggerAiFetch()
  }, [overdueBreak, demoNow, triggerAiFetch])

  const handleTake = () => {
    addTakenBreak()
    setVisible(false)
    navigate('/pause')
  }

  const handleSnooze = () => {
    snoozeBreak(10)
    setVisible(false)
  }

  const handleDismiss = () => {
    snoozeBreak(60)
    setVisible(false)
  }

  if (!visible || !displayBreak) return null

  const fmt = (d) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  const breakTimeStr = fmt(displayBreak.time)
  const now = demoNow ?? new Date()
  const overdueMin = Math.round((now - displayBreak.time) / 60000)

  // Dynamic colors based on mood score
  const mood = effectiveMoodScore ?? 70
  const borderColor = mood >= 80 ? 'border-emerald-500/30' : mood >= 65 ? 'border-sky-500/30' : mood >= 50 ? 'border-amber-500/30' : 'border-red-500/30'
  const iconBg = mood >= 80 ? 'bg-emerald-500/15 border-emerald-500/30' : mood >= 65 ? 'bg-sky-500/15 border-sky-500/30' : mood >= 50 ? 'bg-amber-500/15 border-amber-500/30' : 'bg-red-500/15 border-red-500/30'
  const labelColor = mood >= 80 ? 'text-emerald-400' : mood >= 65 ? 'text-sky-400' : mood >= 50 ? 'text-amber-400' : 'text-red-400'
  const aiBadgeBg = mood >= 80 ? 'bg-emerald-500/20 text-emerald-400' : mood >= 65 ? 'bg-sky-500/20 text-sky-400' : mood >= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
  const glowColor = mood >= 80 ? 'bg-emerald-500' : mood >= 65 ? 'bg-sky-500' : mood >= 50 ? 'bg-amber-500' : 'bg-red-500'
  const icon = mood >= 80 ? '🌿' : '🔔'

  // Best AI text: prefer backend personalized AI, fall back to frontend mood reco
  const aiText = aiSuggestion?.suggestionText || effectiveMoodReco || displayBreak.reason
  const isRealAi = !!aiSuggestion?.isAiGenerated

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
        style={{ animation: 'nb-fade 0.25s ease-out' }}
      />

      {/* Popup card */}
      <div
        className={`fixed z-[9995] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   w-full max-w-sm bg-zinc-950 border rounded-3xl shadow-2xl
                   p-7 flex flex-col items-center gap-5 text-center transition-colors duration-500 ${borderColor}`}
        style={{ animation: 'nb-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        <style>{`
          @keyframes nb-fade { from { opacity: 0 } to { opacity: 1 } }
          @keyframes nb-pop  { from { opacity: 0; transform: translate(-50%, -46%) scale(0.9) } to { opacity: 1; transform: translate(-50%, -50%) scale(1) } }
          @keyframes nb-ring { 0%,100% { transform: rotate(-8deg) } 50% { transform: rotate(8deg) } }
          @keyframes nb-pulse { 0%,100% { opacity: 0.4 } 50% { opacity: 1 } }
        `}</style>

        {/* Icon with ring animation */}
        <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-colors duration-500 ${iconBg}`}
          style={{ animation: 'nb-ring 0.5s ease-in-out 3' }}>
          <span className="text-3xl">{icon}</span>
        </div>

        <div>
          <p className={`text-[10px] font-black tracking-widest uppercase mb-1 transition-colors duration-500 ${labelColor}`}>
            ⏰ Pauza ta a trecut cu {overdueMin} {overdueMin === 1 ? 'minut' : 'minute'}
          </p>
          <h2 className="text-xl font-black text-white">E momentul pentru o pauză!</h2>
          <p className="text-[12px] text-slate-400 mt-2 leading-relaxed px-2">
            Pauza programată la <span className="text-white font-bold">{breakTimeStr}</span> te așteaptă.
            <br /><span className="text-slate-500">"{displayBreak.reason}"</span>
          </p>
        </div>

        {/* ── Personalized AI Recommendation ── */}
        <div className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-left relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${aiBadgeBg}`}>
              <Zap className="w-3 h-3 fill-current" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-tight">
              Sfat SyncFit AI {isRealAi && <span className="text-[8px] font-medium text-slate-500 normal-case tracking-normal ml-1">· Personalizat</span>}
            </span>
          </div>

          {aiLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/20" style={{ animation: 'nb-pulse 1s ease-in-out infinite' }} />
              <span className="text-[11px] text-slate-500 italic">Se generează recomandarea AI…</span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              "{aiText}"
            </p>
          )}

          {/* Subtle background glow */}
          <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full blur-2xl opacity-15 transition-colors ${glowColor}`} />
        </div>

        {/* Primary action */}
        <button
          onClick={handleTake}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-bold text-sm transition-all hover:scale-[1.03] shadow-lg shadow-emerald-500/25"
        >
          🌿 Ia pauza acum
        </button>

        {/* Snooze */}
        <button
          onClick={handleSnooze}
          className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium transition-all"
        >
          😴 Reamintește în 10 minute
        </button>

        {/* Skip */}
        <button
          onClick={handleDismiss}
          className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
        >
          Sari peste această pauză
        </button>
      </div>
    </>
  )
}
