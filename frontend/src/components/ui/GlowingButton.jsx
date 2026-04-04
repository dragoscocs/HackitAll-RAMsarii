function hexToRgba(hex, alpha = 1) {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(0,0,0,${alpha})`
  return `rgba(${r},${g},${b},${alpha})`
}

export function GlowingButton({
  children,
  className = '',
  glowColor = '#a3e635',
  onClick,
  disabled,
  ...props
}) {
  const gc    = hexToRgba(glowColor, 1)
  const gcVia = hexToRgba(glowColor, 0.08)
  const gcTo  = hexToRgba(glowColor, 0.22)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex items-center justify-center overflow-hidden transition-all duration-200 border rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap bg-zinc-900/80 text-white hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
      style={{ borderColor: hexToRgba(glowColor, 0.28) }}
      {...props}
    >
      {/* Gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: `linear-gradient(to right, transparent 40%, ${gcVia} 70%, ${gcTo})` }}
      />
      {/* Right glow bar */}
      <div
        className="pointer-events-none absolute right-0 w-[5px] h-[60%] rounded-l transition-transform duration-200 group-hover:translate-x-full"
        style={{ background: gc, boxShadow: `-2px 0 10px ${gc}` }}
      />
      <span className="relative z-10 flex items-center gap-1.5">{children}</span>
    </button>
  )
}
