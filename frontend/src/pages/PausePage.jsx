import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { SkipForward } from 'lucide-react'
import { useShaderBackground } from '../components/ui/AnimatedShaderHero'
import { useCalendar } from '../context/CalendarContext'

const BREAK_DURATION = 3 * 60
const SVG_SIZE = 260
const RADIUS = 110
const CIRC = 2 * Math.PI * RADIUS

export default function PausePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const canvasRef = useShaderBackground()
  const { recordBreak } = useCalendar()
  const timerRef = useRef(null)

  const suggestionText = location.state?.suggestionText ?? 'Depărtează-te de ecran. Respiră adânc și relaxează-te.'

  const [secondsLeft, setSecondsLeft] = useState(BREAK_DURATION)
  const [phase, setPhase] = useState('countdown')

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setPhase('feedback'); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const skip = () => { clearInterval(timerRef.current); setPhase('feedback') }

  const finishHappy = () => { recordBreak(); setPhase('done') }

  const formatTime = s =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const progress = 1 - secondsLeft / BREAK_DURATION

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover touch-none" />
      <div className="absolute inset-0 bg-black/50" />

      {phase === 'countdown' && (
        <button onClick={skip}
          className="absolute top-6 right-6 z-20 flex items-center gap-2 text-xs text-slate-400 hover:text-white border border-white/10 hover:border-white/25 rounded-xl px-4 py-2.5 transition-all backdrop-blur-md bg-white/5 hover:bg-white/10">
          <SkipForward className="w-3.5 h-3.5" /> Sari peste
        </button>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-8 px-8">

        {phase === 'countdown' && (
          <>
            <p className="text-xs font-semibold text-emerald-400 tracking-[0.2em] uppercase">
              🌿 Pauza ta inteligentă · 3 minute
            </p>

            <div className="relative" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
              <div className="absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.3) 0%, transparent 65%)', filter: 'blur(40px)' }} />
              <svg width={SVG_SIZE} height={SVG_SIZE} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={SVG_SIZE / 2} cy={SVG_SIZE / 2} r={RADIUS}
                  stroke="rgba(255,255,255,0.07)" strokeWidth="10" fill="none" />
                <circle cx={SVG_SIZE / 2} cy={SVG_SIZE / 2} r={RADIUS}
                  stroke="url(#pauseGrad)" strokeWidth="10" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC * progress}
                  style={{ transition: 'stroke-dashoffset 1s linear' }} />
                <defs>
                  <linearGradient id="pauseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <span className="text-6xl font-bold text-white tabular-nums tracking-tight">
                  {formatTime(secondsLeft)}
                </span>
                <span className="text-sm text-slate-400">rămase</span>
              </div>
            </div>

            <div className="text-center max-w-sm">
              <h1 className="text-2xl font-bold text-white mb-2">Depărtează-te de ecran</h1>
              <p className="text-slate-400 text-sm leading-relaxed">{suggestionText}</p>
            </div>

            <button onClick={skip}
              className="px-8 py-3.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-full font-medium text-sm transition-all backdrop-blur-md hover:scale-105">
              Sunt gata mai devreme
            </button>
          </>
        )}

        {phase === 'feedback' && (
          <div className="flex flex-col items-center gap-7 animate-fade-in text-center">
            <span className="text-7xl">🌟</span>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Te-ai relaxat?</h1>
              <p className="text-slate-400 text-sm">Feedback-ul tău îmbunătățește sugestiile AI.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={finishHappy}
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-emerald-500/30">
                😊 Da, mulțumesc!
              </button>
              <button onClick={() => navigate('/dashboard')}
                className="px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-2xl font-semibold text-lg transition-all hover:scale-105 backdrop-blur-md">
                😕 Nu prea
              </button>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="flex flex-col items-center gap-7 animate-fade-in text-center">
            <span className="text-8xl">🎉</span>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Excelent!</h1>
              <p className="text-slate-400 text-sm">Scorul tău de wellbeing a crescut. Continuă tot așa!</p>
            </div>
            <button onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-indigo-500 text-white rounded-2xl font-semibold transition-all hover:scale-105 shadow-lg shadow-indigo-500/30">
              Înapoi la dashboard →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
