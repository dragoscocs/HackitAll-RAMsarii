import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SmartBreak({ userId }) {
  const navigate = useNavigate()
  const [suggestion, setSuggestion] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [snoozed,    setSnoozed]    = useState(false)
  const [phase,      setPhase]      = useState('idle')

  useEffect(() => {
    fetch(`http://localhost:8080/api/breaks/${userId}`)
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json() })
      .then(d => { setSuggestion(d); setPhase('active') })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [userId])

  const confirmBreak = () => {
    navigate('/pause', { state: { suggestionText: suggestion?.suggestionText } })
  }

  const snooze = () => {
    setSnoozed(true)
    setPhase('idle')
    setTimeout(() => { setSnoozed(false); if (suggestion) setPhase('active') }, 10 * 60 * 1000)
  }

  if (loading) return <BreakSkeleton />

  if (error) return (
    <div className="card h-full flex flex-col items-center justify-center gap-3 text-center">
      <span className="text-4xl">⚠️</span>
      <p className="text-slate-400 text-sm">Nu s-a putut încărca sugestia de pauză.</p>
    </div>
  )

  return (
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

      {phase === 'active' && !snoozed && (
        <div className="flex-1 flex flex-col gap-5 animate-slide-up">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-sm font-semibold text-emerald-300 mb-1">⏰ E timpul de o pauză!</p>
            <p className="text-xs text-slate-400 leading-relaxed">{suggestion?.suggestionText}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Sugerat la <strong className="text-slate-300">{suggestion?.time}</strong>
          </div>

          {/* Break preview strip */}
          <div className="rounded-xl overflow-hidden border border-surface-border" style={{ height: 80, background: '#030712' }}>
            <BreakPreviewStrip />
          </div>

          <div className="flex gap-3 mt-auto">
            <button onClick={snooze}       className="btn-secondary flex-1 text-sm">😴 Amână 10 min</button>
            <button onClick={confirmBreak} className="btn-primary  flex-1 text-sm">✅ Confirmă</button>
          </div>
        </div>
      )}

      {phase === 'idle' && !snoozed && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
          <span className="text-4xl">🌿</span>
          <p className="text-slate-400 text-sm">Se încarcă sugestia personalizată…</p>
        </div>
      )}
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
