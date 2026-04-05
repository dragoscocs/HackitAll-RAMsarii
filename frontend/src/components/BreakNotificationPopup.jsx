import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCalendar } from '../context/CalendarContext'

export default function BreakNotificationPopup() {
  const navigate = useNavigate()
  const { overdueBreak, nextBreak, addTakenBreak, snoozeBreak, demoNow } = useCalendar()

  // Track which break we've already popped up for (by timestamp)
  const shownRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [displayBreak, setDisplayBreak] = useState(null)

  useEffect(() => {
    if (!overdueBreak) {
      // Hide if break was taken (no more overdue)
      setVisible(false)
      return
    }
    const key = overdueBreak.time.getTime()
    if (key !== shownRef.current) {
      shownRef.current = key
      setDisplayBreak(overdueBreak)
      setVisible(true)
    }
  }, [overdueBreak])

  // When snooze expires, allow the same break to re-trigger
  useEffect(() => {
    if (!overdueBreak) return
    setDisplayBreak(overdueBreak)
    setVisible(true)
  }, [overdueBreak?.time?.getTime(), demoNow]) // re-fire when demoNow changes

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
    snoozeBreak(60) // dismiss for 1h (effectively "skip this break")
    setVisible(false)
  }

  if (!visible || !displayBreak) return null

  const fmt = (d) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  const breakTimeStr = fmt(displayBreak.time)
  const now = demoNow ?? new Date()
  const overdueMin = Math.round((now - displayBreak.time) / 60000)

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
        className="fixed z-[9995] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   w-full max-w-sm bg-zinc-950 border border-red-500/30 rounded-3xl shadow-2xl
                   p-7 flex flex-col items-center gap-5 text-center"
        style={{ animation: 'nb-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        <style>{`
          @keyframes nb-fade { from { opacity: 0 } to { opacity: 1 } }
          @keyframes nb-pop  { from { opacity: 0; transform: translate(-50%, -46%) scale(0.9) } to { opacity: 1; transform: translate(-50%, -50%) scale(1) } }
          @keyframes nb-ring { 0%,100% { transform: rotate(-8deg) } 50% { transform: rotate(8deg) } }
        `}</style>

        {/* Bell icon with ring animation */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center"
          style={{ animation: 'nb-ring 0.5s ease-in-out 3' }}>
          <span className="text-3xl">🔔</span>
        </div>

        <div>
          <p className="text-xs font-semibold text-red-400 tracking-wider uppercase mb-1">
            ⏰ Pauza ta a trecut cu {overdueMin} {overdueMin === 1 ? 'minut' : 'minute'}
          </p>
          <h2 className="text-xl font-bold text-white">E momentul pentru o pauză!</h2>
          <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
            Pauza programată la <span className="text-white font-medium">{breakTimeStr}</span> te așteaptă.
            <br />{displayBreak.reason}.
          </p>
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
