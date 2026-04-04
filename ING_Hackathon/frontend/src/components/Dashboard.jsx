import SmartBreak from './SmartBreak'
import MatchmakingFeed from './MatchmakingFeed'

const CURRENT_USER_ID = 1

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      {/* Top navigation bar */}
      <header className="border-b border-surface-border bg-surface-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center shadow-lg shadow-brand/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">EcoSync</h1>
              <p className="text-xs text-slate-400">AI Wellbeing Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
              <span>Live</span>
            </div>
            <div className="flex items-center gap-2.5 bg-surface border border-surface-border rounded-xl px-3 py-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs font-bold text-white">
                GP
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white leading-tight">Gigel Popescu</p>
                <p className="text-xs text-slate-500">Employee #1</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page title */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-white mb-1">
            Good morning, Gigel 👋
          </h2>
          <p className="text-slate-400">
            Here's your wellbeing snapshot for today.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in">
          <StatCard icon="🏃" label="Streak" value="7 days" sub="+2 this week" color="emerald" />
          <StatCard icon="😊" label="Mood Score" value="8.2/10" sub="↑ from yesterday" color="violet" />
          <StatCard icon="🤝" label="Matches Made" value="14" sub="This month" color="sky" />
          <StatCard icon="☕" label="Breaks Taken" value="3" sub="Recommended: 5" color="amber" />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Break widget — narrower */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <SmartBreak userId={CURRENT_USER_ID} />
          </div>

          {/* Matchmaking feed — wider */}
          <div className="lg:col-span-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <MatchmakingFeed userId={CURRENT_USER_ID} />
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, sub, color }) {
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-400/10',
    violet:  'text-violet-400 bg-violet-400/10',
    sky:     'text-sky-400 bg-sky-400/10',
    amber:   'text-amber-400 bg-amber-400/10',
  }
  return (
    <div className="stat-card">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-white mt-2">{value}</p>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  )
}
