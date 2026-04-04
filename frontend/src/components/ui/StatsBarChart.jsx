import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useAuth } from '../../context/AuthContext'

/* ─────────────────────────────────────────────
   STREAK BAR — horizontal bar (same as before)
───────────────────────────────────────────── */
function StreakBar({ value, softMax = 30 }) {
  const pct = softMax > 0 ? Math.min((value / softMax) * 100, 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-amber-500/8 border border-amber-500/15 rounded-2xl px-4 py-3.5 flex flex-col gap-2.5"
    >
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">🔥</span>
          <span className="text-xs font-medium text-slate-400">Zile streak</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold leading-none text-amber-400">{value}</span>
          <span className="text-[10px] text-slate-600 font-medium">zile</span>
          <span className="text-[10px] text-slate-700 ml-1">({Math.round(pct)}%)</span>
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className="absolute inset-0 rounded-full opacity-30"
          style={{ background: 'radial-gradient(ellipse at left, rgba(245,158,11,0.35), transparent 70%)' }}
        />
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
          style={{ boxShadow: '0 0 12px rgba(245,158,11,0.35)' }}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   MATCHES XOY CHART — animated line + bar chart
───────────────────────────────────────────── */
const CHART_H = 100  // drawable area height in px
const CHART_W = 100  // viewBox width units

function MatchesChart({ userId }) {
  const [data, setData] = useState(null)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    if (!userId) return
    fetch(`/api/users/${userId}/match-history`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d) })
      .catch(() => {})
  }, [userId])

  // Fallback while loading
  const points = data ?? [
    { month: '...', matches: 0 },
    { month: '...', matches: 0 },
    { month: '...', matches: 0 },
    { month: '...', matches: 0 },
    { month: '...', matches: 0 },
    { month: '...', matches: 0 },
  ]

  const maxVal = Math.max(...points.map(p => p.matches), 1)
  const n = points.length

  // Map data → SVG coordinates
  // x: evenly spaced 0..CHART_W, y: inverted (high value = low y)
  const coords = points.map((p, i) => ({
    x: (i / (n - 1)) * CHART_W,
    y: CHART_H - (p.matches / maxVal) * CHART_H,
    ...p,
  }))

  // Build smooth polyline path (catmull-rom-like via cubic bezier)
  const toPath = (pts) => {
    if (pts.length < 2) return ''
    let d = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 1; i < pts.length; i++) {
      const cp1x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) * 0.4
      const cp1y = pts[i - 1].y
      const cp2x = pts[i].x - (pts[i].x - pts[i - 1].x) * 0.4
      const cp2y = pts[i].y
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pts[i].x} ${pts[i].y}`
    }
    return d
  }

  const linePath = toPath(coords)
  // Area fill — close underneath
  const areaPath = linePath
    + ` L ${coords[coords.length - 1].x} ${CHART_H} L ${coords[0].x} ${CHART_H} Z`

  const currentMonth = points[points.length - 1]

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
      className="bg-violet-500/8 border border-violet-500/15 rounded-2xl px-4 py-3.5 flex flex-col gap-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">🤝</span>
          <span className="text-xs font-medium text-slate-400">Meciuri pe lună</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          {hovered !== null ? (
            <>
              <span className="text-xl font-bold leading-none text-violet-400">{points[hovered]?.matches}</span>
              <span className="text-[10px] text-slate-500">{points[hovered]?.month}</span>
            </>
          ) : (
            <>
              <span className="text-xl font-bold leading-none text-violet-400">{currentMonth.matches}</span>
              <span className="text-[10px] text-slate-600 font-medium">luna asta</span>
            </>
          )}
        </div>
      </div>

      {/* SVG Chart — no labels inside */}
      <div className="relative w-full" style={{ height: CHART_H }}>
        <svg
          viewBox={`-2 -4 ${CHART_W + 4} ${CHART_H + 4}`}
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="matchGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => (
            <line
              key={i}
              x1={0} y1={frac * CHART_H}
              x2={CHART_W} y2={frac * CHART_H}
              stroke="rgba(139,92,246,0.1)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />
          ))}

          {/* Animated area fill */}
          {data && (
            <motion.path
              d={areaPath}
              fill="url(#matchGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          )}

          {/* Animated line — flat, no glow */}
          {data && (
            <motion.path
              d={linePath}
              fill="none"
              stroke="#a78bfa"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.1, delay: 0.2, ease: 'easeOut' }}
            />
          )}

          {/* Hover zones + dots */}
          {coords.map((pt, i) => (
            <g key={i}>
              {/* Invisible wide hover target */}
              <rect
                x={pt.x - CHART_W / (2 * n)}
                y={0}
                width={CHART_W / n}
                height={CHART_H}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />

              {/* Vertical guide line at hover — appears exactly at data point x */}
              {hovered === i && (
                <line
                  x1={pt.x} y1={0}
                  x2={pt.x} y2={CHART_H}
                  stroke="rgba(167,139,250,0.3)"
                  strokeWidth="0.6"
                  strokeDasharray="2 2"
                />
              )}

              {/* Dot — always shows on last point, shows on hover for others */}
              {(hovered === i || i === n - 1) && (
                <motion.circle
                  cx={pt.x}
                  cy={pt.y}
                  r="1.8"
                  fill={i === n - 1 ? '#a78bfa' : '#c4b5fd'}
                  strokeWidth="0"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                />
              )}
            </g>
          ))}

          {/* X axis baseline */}
          <line
            x1={0} y1={CHART_H}
            x2={CHART_W} y2={CHART_H}
            stroke="rgba(139,92,246,0.25)"
            strokeWidth="0.6"
          />
        </svg>
      </div>

      {/* X-axis labels — absolutely positioned to align exactly under each data point */}
      <div className="relative h-4">
        {points.map((pt, i) => {
          const leftPct = n > 1 ? (i / (n - 1)) * 100 : 50
          return (
            <button
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ left: `${leftPct}%` }}
              className={`absolute top-0 -translate-x-1/2 text-[11px] leading-none whitespace-nowrap transition-all duration-150 cursor-default select-none ${
                hovered === i
                  ? 'text-violet-300 font-semibold'
                  : i === n - 1
                  ? 'text-violet-400 font-medium'
                  : 'text-slate-500 font-medium'
              }`}
            >
              {pt.month}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   BREAKS BAR — same horizontal bar style
───────────────────────────────────────────── */
function BreaksBar({ value, softMax = 8 }) {
  const pct = softMax > 0 ? Math.min((value / softMax) * 100, 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.16 }}
      className="bg-sky-500/8 border border-sky-500/15 rounded-2xl px-4 py-3.5 flex flex-col gap-2.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">☕</span>
          <span className="text-xs font-medium text-slate-400">Pauze azi</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold leading-none text-sky-400">{value}</span>
          <span className="text-[10px] text-slate-600 font-medium">pauze</span>
          <span className="text-[10px] text-slate-700 ml-1">({Math.round(pct)}%)</span>
        </div>
      </div>

      <div className="relative h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className="absolute inset-0 rounded-full opacity-30"
          style={{ background: 'radial-gradient(ellipse at left, rgba(14,165,233,0.35), transparent 70%)' }}
        />
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500"
          style={{ boxShadow: '0 0 12px rgba(14,165,233,0.35)' }}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
export default function StatsBarChart({ stats }) {
  const { user } = useAuth()

  const currentStreak    = stats?.currentStreak    ?? 0
  const matchesThisMonth = stats?.matchesThisMonth ?? 0
  const breaksTakenToday = stats?.breaksTakenToday ?? 0
  const userId           = stats?.userId ?? user?.userId

  return (
    <div className="flex flex-col gap-3">
      <StreakBar value={currentStreak} />
      <MatchesChart userId={userId} currentMatches={matchesThisMonth} />
      <BreaksBar value={breaksTakenToday} />
    </div>
  )
}
