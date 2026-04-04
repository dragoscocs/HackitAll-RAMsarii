import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'

const MOCK_REQUESTS = [
  { id: 1, name: 'Andrei Popescu', activity: 'Padel',     avatar: 'AP', time: '12:30', color: 'from-violet-500 to-purple-700' },
  { id: 2, name: 'Ioana Ionescu',  activity: 'Ping Pong', avatar: 'II', time: '13:00', color: 'from-sky-500 to-blue-700'     },
  { id: 3, name: 'Elena Stancu',   activity: 'Badminton', avatar: 'ES', time: '14:00', color: 'from-emerald-500 to-teal-700' },
]

export const SPORT_ICONS = {
  Padel: '🎾', 'Ping Pong': '🏓', Tennis: '🎾', Badminton: '🏸',
  Football: '⚽', Yoga: '🧘', Cycling: '🚴', Ski: '⛷️', Running: '🏃',
}

export const SPORTS_LIST = ['Padel', 'Tennis', 'Ping Pong', 'Badminton', 'Football', 'Yoga', 'Cycling', 'Ski', 'Running']

export default function MatchmakingFeed({ userId, userName, compact = false, autoSearch = null }) {
  const [selected,     setSelected]     = useState(MOCK_REQUESTS[0])
  const [requests,     setRequests]     = useState(MOCK_REQUESTS)
  const [matches,      setMatches]      = useState([])
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)
  const [hasFetched,   setHasFetched]   = useState(false)
  const [showPostForm, setShowPostForm] = useState(false)
  const [newActivity,  setNewActivity]  = useState('')
  const [newTime,      setNewTime]      = useState('18:00')
  const [postSuccess,  setPostSuccess]  = useState(false)

  const fetchMatches = async (activity) => {
    setLoading(true); setError(null); setHasFetched(false)
    try {
      const res = await fetch(`http://localhost:8080/api/matchmaking/${userId}?activity=${encodeURIComponent(activity)}`)
      if (!res.ok) throw new Error('Failed to fetch matches')
      setMatches(await res.json())
      setHasFetched(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Triggered externally from the Hero "Find Partners" button
  useEffect(() => {
    if (!autoSearch?.sport || autoSearch.key === 0) return
    fetchMatches(autoSearch.sport)
  }, [autoSearch?.key])

  const findMatches = () => fetchMatches(selected.activity)

  const handlePost = () => {
    if (!newActivity) return
    const initials = (userName ?? 'Eu').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    const newReq = {
      id: Date.now(), name: userName ?? 'Tu', activity: newActivity,
      avatar: initials, time: newTime, color: 'from-brand to-brand-dark',
    }
    setRequests(prev => [newReq, ...prev])
    setSelected(newReq)
    setShowPostForm(false)
    setNewActivity('')
    setPostSuccess(true)
    setTimeout(() => setPostSuccess(false), 3000)
  }

  const activeLabel = autoSearch?.sport && autoSearch.key > 0
    ? `${SPORT_ICONS[autoSearch.sport] ?? '🏅'} Sporturile tale · ${autoSearch.sport}`
    : `${SPORT_ICONS[selected.activity] ?? '🏅'} ${selected.activity}`

  return (
    <div className="card flex flex-col gap-5 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center text-lg">🤝</div>
          <div>
            <h3 className="text-sm font-semibold text-white">Activity Matchmaking</h3>
            <p className="text-xs text-slate-500">AI-powered sport pairing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge bg-brand/10 text-brand-light">✨ AI</span>
          <button
            onClick={() => { setShowPostForm(v => !v); setPostSuccess(false) }}
            className="w-8 h-8 rounded-lg bg-brand/10 hover:bg-brand/20 border border-brand/20 flex items-center justify-center text-brand-light transition-colors"
          >
            {showPostForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {showPostForm && (
        <div className="bg-brand/5 border border-brand/20 rounded-xl p-4 flex flex-col gap-3 animate-slide-up">
          <p className="text-xs font-semibold text-brand-light">📣 Postează o activitate</p>
          <div className="flex gap-2">
            <select value={newActivity} onChange={e => setNewActivity(e.target.value)}
              className="flex-1 bg-zinc-800 border border-surface-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand">
              <option value="">Alege sportul…</option>
              {SPORTS_LIST.map(s => <option key={s} value={s}>{SPORT_ICONS[s] || '🏅'} {s}</option>)}
            </select>
            <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
              className="w-24 bg-zinc-800 border border-surface-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand [color-scheme:dark]" />
          </div>
          <button onClick={handlePost} disabled={!newActivity}
            className="btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed">
            Postează →
          </button>
        </div>
      )}

      {postSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-sm text-emerald-300 animate-slide-up">
          🎉 Activitate postată! Colegii compatibili vor fi notificați.
        </div>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Active Requests</p>
        <div className="flex flex-col gap-2">
          {requests.map(req => (
            <div key={req.id}
              onClick={() => { setSelected(req); setHasFetched(false); setMatches([]) }}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200
                ${selected.id === req.id ? 'border-brand/50 bg-brand/10' : 'border-surface-border hover:border-brand/30 hover:bg-surface-border/40'}`}>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${req.color} flex items-center justify-center text-xs font-bold text-white shadow`}>
                {req.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{req.name}</p>
                <p className="text-xs text-slate-400">
                  {SPORT_ICONS[req.activity] || '🏅'} vrea să joace <strong className="text-slate-300">{req.activity}</strong>
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-500">{req.time}</span>
                {selected.id === req.id && <div className="w-2 h-2 rounded-full bg-brand mt-1 ml-auto" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={findMatches} disabled={loading}
        className="btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100">
        {loading
          ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Se caută…</>
          : <>🔍 Găsește colegi pentru {selected.activity}</>}
      </button>

      {error && (
        <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-3">⚠️ {error}</div>
      )}

      {hasFetched && (
        <div className="animate-slide-up">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
            Top compatibili · {activeLabel}
          </p>
          {matches.length === 0
            ? <p className="text-sm text-slate-400 text-center py-6">Niciun match găsit.</p>
            : <div className="flex flex-col gap-3">{matches.map((m, i) => <MatchCard key={i} match={m} rank={i + 1} />)}</div>}
        </div>
      )}
    </div>
  )
}

function MatchCard({ match, rank }) {
  const scorePercent = Math.round(match.matchScore * 100)
  const scoreColor   = scorePercent >= 90 ? 'text-emerald-400' : scorePercent >= 75 ? 'text-amber-400' : 'text-slate-400'
  const initials     = match.matchedEmployeeName.split(' ').map(w => w[0]).join('').slice(0, 2)
  return (
    <div className="bg-surface border border-surface-border rounded-xl p-4 hover:border-brand/30 transition-colors duration-200">
      <div className="flex items-start gap-3">
        <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs font-bold text-brand-light">#{rank}</span>
        </div>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-white truncate">{match.matchedEmployeeName}</p>
            <span className={`text-sm font-bold tabular-nums shrink-0 ${scoreColor}`}>{scorePercent}%</span>
          </div>
          <div className="h-1.5 bg-surface-border rounded-full mb-2 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-light transition-all duration-700" style={{ width: `${scorePercent}%` }} />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">💡 {match.aiCustomMessage}</p>
        </div>
      </div>
    </div>
  )
}
