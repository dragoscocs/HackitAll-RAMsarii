import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useShaderBackground } from '../components/ui/AnimatedShaderHero'
import { useCalendar } from '../context/CalendarContext'
import { useAuth } from '../context/AuthContext'

const BREAK_DURATION = 3 * 60
const SVG_SIZE = 260
const RADIUS = 110
const CIRC = 2 * Math.PI * RADIUS

/* ── Mood Slider ─────────────────────────────────────────────────── */
function MoodSlider({ onSubmit }) {
  const [value, setValue] = useState(0)

  const getEmoji = () => {
    if (value <= -4) return '😩'
    if (value <= -2) return '😕'
    if (value === 0) return '😐'
    if (value >= 4)  return '😄'
    return '🙂'
  }
  const getColor = () => {
    if (value <= -3) return '#ef4444'
    if (value <= -1) return '#f97316'
    if (value === 0) return '#94a3b8'
    if (value >= 3)  return '#34d399'
    return '#4ade80'
  }
  const getLabel = () => {
    if (value === 0) return 'Neutru'
    if (value > 0)   return `+${value} — mai bine`
    return `${value} — mai rău`
  }

  const pct = ((value + 5) / 10) * 100

  return (
    <div className="flex flex-col items-center gap-7 animate-fade-in text-center w-full max-w-sm px-4">
      <span className="text-7xl" style={{ transition: 'all 0.2s' }}>{getEmoji()}</span>

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Cum te-ai simțit?</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          Feedback-ul tău personalizează sugestiile viitoare.
        </p>
      </div>

      {/* Big score display */}
      <div style={{ color: getColor(), transition: 'color 0.2s' }}
        className="text-6xl font-bold tabular-nums">
        {value > 0 ? `+${value}` : value}
      </div>
      <p className="text-sm font-medium -mt-4" style={{ color: getColor(), transition: 'color 0.2s' }}>
        {getLabel()}
      </p>

      {/* Slider track */}
      <div className="w-full flex items-center gap-4">
        <span className="text-2xl shrink-0">😩</span>
        <div className="flex-1 relative">
          <input
            type="range"
            min={-5}
            max={5}
            step={1}
            value={value}
            onChange={e => setValue(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none mood-slider"
            style={{
              background: `linear-gradient(to right, ${getColor()} 0%, ${getColor()} ${pct}%, rgba(255,255,255,0.12) ${pct}%, rgba(255,255,255,0.12) 100%)`,
            }}
          />
        </div>
        <span className="text-2xl shrink-0">😊</span>
      </div>

      {/* Tick labels */}
      <div className="flex justify-between w-full px-9 -mt-5 text-[11px] text-slate-600 select-none">
        {[-5,-4,-3,-2,-1,0,1,2,3,4,5].map(n => (
          <span key={n} className={n === value ? 'text-slate-300 font-bold' : ''}>
            {n === 0 ? '0' : n > 0 ? `+${n}` : n}
          </span>
        ))}
      </div>

      <button
        onClick={() => onSubmit(value)}
        className="mt-2 px-10 py-3.5 rounded-2xl font-semibold text-white transition-all hover:scale-105 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #34d399, #6366f1)', boxShadow: '0 8px 32px rgba(99,102,241,0.3)' }}
      >
        Trimite feedback →
      </button>

      <style>{`
        .mood-slider::-webkit-slider-thumb {
          appearance: none; width: 22px; height: 22px;
          border-radius: 50%; background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          cursor: pointer; transition: transform 0.1s;
        }
        .mood-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
        .mood-slider::-moz-range-thumb {
          width: 22px; height: 22px; border-radius: 50%;
          background: white; border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4); cursor: pointer;
        }
      `}</style>
    </div>
  )
}

/* ── Main Page ────────────────────────────────────────────────────── */
export default function PausePage() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const canvasRef  = useShaderBackground()
  const { recordBreak, addTakenBreak, setMoodFromSlider } = useCalendar()
  const { recordBreakInContext, user } = useAuth()
  const timerRef   = useRef(null)
  const recordedRef = useRef(false)

  const suggestionText = location.state?.suggestionText ?? 'Depărtează-te de ecran. Respiră adânc și relaxează-te.'

  const [secondsLeft, setSecondsLeft] = useState(BREAK_DURATION)
  const [phase, setPhase]             = useState('countdown')
  const [submittedMood, setSubmittedMood] = useState(0)

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

  const finishWithMood = (sliderValue) => {
    if (!recordedRef.current) {
      recordedRef.current = true
      addTakenBreak()      // records time + increments count + clears snooze
      recordBreakInContext()
    }
    const firstName = user?.name?.split(' ')[0] ?? 'Coleg'
    setMoodFromSlider(sliderValue, firstName)
    setSubmittedMood(sliderValue)
    setPhase('done')
  }

  const formatTime = s =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const progress = 1 - secondsLeft / BREAK_DURATION

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover touch-none" />
      <div className="absolute inset-0 bg-black/50" />

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
          <MoodSlider onSubmit={finishWithMood} />
        )}

        {phase === 'done' && (
          <div className="flex flex-col items-center gap-7 animate-fade-in text-center max-w-sm px-4">
            {submittedMood > 0 ? (
              <>
                <span className="text-8xl">🎉</span>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Excelent!</h1>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Pauza a funcționat — te-ai simțit mai bine! Streak-ul tău a crescut și scorul de wellbeing a fost actualizat.
                  </p>
                </div>
              </>
            ) : submittedMood === 0 ? (
              <>
                <span className="text-8xl">😊</span>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Mulțumim!</h1>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Ne bucurăm că ai luat pauza. Chiar și momentele neutre contează — continuă să fii consecvent!
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="text-8xl">💙</span>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Îți mulțumim pentru sinceritate</h1>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    AI-ul a notat starea ta și va ajusta pauzele și recomandările viitoare pentru a te sprijini mai bine în restul zilei.
                  </p>
                </div>
                <div className="w-full rounded-2xl bg-indigo-500/10 border border-indigo-500/20 px-5 py-4 text-left">
                  <p className="text-xs font-semibold text-indigo-400 mb-1">💡 Recomandare AI</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    O plimbare scurtă de 5 minute sau câteva exerciții de respirație pot îmbunătăți semnificativ concentrarea și starea de spirit.
                  </p>
                </div>
              </>
            )}
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
