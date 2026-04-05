import { useState } from 'react'
import { useCalendar } from '../context/CalendarContext'

const DAYS_RO = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm']
const MONTHS_RO = ['Ian','Feb','Mar','Apr','Mai','Iun','Iul','Aug','Sep','Oct','Nov','Dec']

function fmtDemo(d) {
  return `${DAYS_RO[d.getDay()]} ${d.getDate()} ${MONTHS_RO[d.getMonth()]} · ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

export default function DemoControls() {
  const { demoNow, setDemoNow } = useCalendar()
  const [open, setOpen]     = useState(false)
  const [dateVal, setDateVal] = useState(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  })
  const [timeVal, setTimeVal] = useState('10:00')

  const isActive = demoNow !== null

  const apply = () => {
    if (!dateVal || !timeVal) return
    const d = new Date(`${dateVal}T${timeVal}:00`)
    if (isNaN(d.getTime())) return
    setDemoNow(d)
    setOpen(false)
  }

  const reset = () => {
    setDemoNow(null)
    setOpen(false)
  }

  // Quick presets — pick a weekday at a given time so meetings exist
  const presets = [
    { label: '🌅 09:00 azi', offset: 0, time: '09:00' },
    { label: '☕ 11:30 azi', offset: 0, time: '11:30' },
    { label: '🍱 13:00 azi', offset: 0, time: '13:00' },
    { label: '⚡ 16:00 azi', offset: 0, time: '16:00' },
    { label: '📅 09:00 mâine', offset: 1, time: '09:00' },
  ]

  const applyPreset = ({ offset, time }) => {
    const base = new Date()
    base.setDate(base.getDate() + offset)
    const [h, m] = time.split(':').map(Number)
    base.setHours(h, m, 0, 0)
    setDemoNow(base)
    setOpen(false)
  }

  return (
    <div className="fixed bottom-6 left-6 z-[9999] flex flex-col items-start gap-2">

      {/* Expanded panel */}
      {open && (
        <div className="bg-zinc-950/98 border border-zinc-700/80 rounded-2xl shadow-2xl p-5 w-80 backdrop-blur-md"
          style={{ animation: 'demo-slide 0.18s ease-out' }}>
          <style>{`
            @keyframes demo-slide {
              from { opacity: 0; transform: translateY(8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🎯</span>
              <span className="text-sm font-bold text-white">Demo Mode</span>
              {isActive && (
                <span className="text-[9px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-full px-2 py-0.5">
                  ACTIV
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-zinc-800 transition-all text-lg leading-none"
            >
              ×
            </button>
          </div>

          <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
            Simulează o dată și oră pentru a prezenta pauzele AI și scorul de mood în fața juriului.
          </p>

          {/* Quick presets */}
          <div className="mb-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Preseturi rapide</p>
            <div className="flex flex-wrap gap-1.5">
              {presets.map(p => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 text-slate-300 transition-all"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom picker */}
          <div className="mb-4 flex flex-col gap-2.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Personalizat</p>
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[9px] text-slate-600">Dată</label>
                <input
                  type="date"
                  value={dateVal}
                  onChange={e => setDateVal(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[9px] text-slate-600">Oră</label>
                <input
                  type="time"
                  value={timeVal}
                  onChange={e => setTimeVal(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={apply}
              disabled={!dateVal || !timeVal}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all hover:scale-[1.02]"
            >
              ✓ Aplică ora personalizată
            </button>
          </div>

          {/* Reset */}
          {isActive && (
            <button
              onClick={reset}
              className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-slate-400 hover:text-white text-xs font-medium transition-all border border-zinc-700"
            >
              ↺ Resetează la ora reală
            </button>
          )}

          {/* Active demo time indicator */}
          {isActive && demoNow && (
            <div className="mt-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2">
              <span className="text-sm">⏰</span>
              <div>
                <p className="text-[9px] text-amber-400 font-semibold uppercase tracking-wider">Timp activ demo</p>
                <p className="text-xs text-white font-medium">{fmtDemo(demoNow)}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Demo Controls — setează ora pentru prezentare"
        className={`flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-semibold border transition-all shadow-lg hover:scale-105 select-none ${
          isActive
            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-amber-500/20'
            : open
            ? 'bg-zinc-800 border-zinc-600 text-slate-300'
            : 'bg-zinc-900/90 border-zinc-700/70 text-slate-500 hover:text-slate-300 hover:border-zinc-600'
        }`}
      >
        <span>🎯</span>
        {isActive && demoNow ? (
          <span className="max-w-[160px] truncate">{fmtDemo(demoNow)}</span>
        ) : (
          <span>Demo Controls</span>
        )}
        {isActive && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        )}
      </button>
    </div>
  )
}
