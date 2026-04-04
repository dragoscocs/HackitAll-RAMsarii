import { useState } from 'react'

const MOCK_REQUESTS = [
  { id: 1, name: 'Gigel Popescu', activity: 'Padel', avatar: 'GP', time: '12:30', color: 'from-violet-500 to-purple-700' },
  { id: 2, name: 'Ana Ionescu',   activity: 'Ping Pong', avatar: 'AI', time: '13:00', color: 'from-sky-500 to-blue-700' },
  { id: 3, name: 'Elena Stancu',  activity: 'Badminton', avatar: 'ES', time: '14:00', color: 'from-emerald-500 to-teal-700' },
]

const SPORT_ICONS = {
  Padel:     '🎾',
  'Ping Pong': '🏓',
  Tennis:    '🎾',
  Badminton: '🏸',
  Football:  '⚽',
  Yoga:      '🧘',
  Cycling:   '🚴',
}

export default function MatchmakingFeed({ userId }) {
  const [selected, setSelected]       = useState(MOCK_REQUESTS[0])
  const [matches, setMatches]         = useState([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const [hasFetched, setHasFetched]   = useState(false)

  const findMatches = async () => {
    setLoading(true)
    setError(null)
    setHasFetched(false)
    try {
      const res = await fetch(
        `http://localhost:8080/api/matchmaking/${userId}?activity=${encodeURIComponent(selected.activity)}`
      )
      if (!res.ok) throw new Error('Failed to fetch matches')
      const data = await res.json()
      setMatches(data)
      setHasFetched(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center text-lg">
            🤝
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Activity Matchmaking</h3>
            <p className="text-xs text-slate-500">AI-powered sport pairing</p>
          </div>
        </div>
        <span className="badge bg-brand/10 text-brand-light">✨ AI</span>
      </div>

      {/* Active requests */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
          Active Requests
        </p>
        <div className="flex flex-col gap-2">
          {MOCK_REQUESTS.map(req => (
            <div
              key={req.id}
              id={`request-${req.id}`}
              onClick={() => { setSelected(req); setHasFetched(false); setMatches([]) }}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200
                ${selected.id === req.id
                  ? 'border-brand/50 bg-brand/10'
                  : 'border-surface-border hover:border-brand/30 hover:bg-surface-border/40'}`}
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${req.color} flex items-center justify-center text-xs font-bold text-white shadow`}>
                {req.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{req.name}</p>
                <p className="text-xs text-slate-400">
                  {SPORT_ICONS[req.activity] || '🏅'} wants to play <strong className="text-slate-300">{req.activity}</strong>
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-500">{req.time}</span>
                {selected.id === req.id && (
                  <div className="w-2 h-2 rounded-full bg-brand mt-1 ml-auto" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Find Matches button */}
      <button
        id="find-matches-btn"
        onClick={findMatches}
        disabled={loading}
        className="btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Finding matches…
          </>
        ) : (
          <>🔍 Find Matches for {selected.name}</>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-3">
          ⚠️ {error}
        </div>
      )}

      {/* Results */}
      {hasFetched && (
        <div className="animate-slide-up">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
            Top Matches for {selected.activity} {SPORT_ICONS[selected.activity]}
          </p>

          {matches.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No matches found.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {matches.map((m, i) => (
                <MatchCard key={i} match={m} rank={i + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MatchCard({ match, rank }) {
  const scorePercent = Math.round(match.matchScore * 100)
  const scoreColor =
    scorePercent >= 90 ? 'text-emerald-400' :
    scorePercent >= 75 ? 'text-amber-400' : 'text-slate-400'

  const initials = match.matchedEmployeeName
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)

  return (
    <div
      id={`match-card-${rank}`}
      className="bg-surface border border-surface-border rounded-xl p-4 hover:border-brand/30 transition-colors duration-200"
    >
      <div className="flex items-start gap-3">
        {/* Rank badge */}
        <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs font-bold text-brand-light">#{rank}</span>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-white truncate">{match.matchedEmployeeName}</p>
            <span className={`text-sm font-bold tabular-nums shrink-0 ${scoreColor}`}>
              {scorePercent}%
            </span>
          </div>

          {/* Score bar */}
          <div className="h-1.5 bg-surface-border rounded-full mb-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-brand-light transition-all duration-700"
              style={{ width: `${scorePercent}%` }}
            />
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            💡 {match.aiCustomMessage}
          </p>
        </div>
      </div>
    </div>
  )
}
