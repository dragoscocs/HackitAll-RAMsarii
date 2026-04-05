import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Search, Plus, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const SPORT_ICONS = {
  Padel: '🎾', 'Ping Pong': '🏓', Tennis: '🎾', Badminton: '🏸',
  Football: '⚽', Yoga: '🧘', Cycling: '🚴', Ski: '⛷️', Running: '🏃',
}

const ALL_SPORTS = ['Padel', 'Tennis', 'Ping Pong', 'Badminton', 'Football', 'Yoga', 'Cycling', 'Ski', 'Running']

const MOCK_REQUESTS = [
  { id: 1, name: 'Andrei Popescu', activity: 'Padel', avatar: 'AP', time: '18:00', color: 'from-violet-500 to-purple-700' },
  { id: 2, name: 'Ioana Ionescu', activity: 'Ping Pong', avatar: 'II', time: '13:00', color: 'from-sky-500 to-blue-700' },
  { id: 3, name: 'Elena Stancu', activity: 'Badminton', avatar: 'ES', time: '19:00', color: 'from-emerald-500 to-teal-700' },
  { id: 4, name: 'Radu Mihalcea', activity: 'Tennis', avatar: 'RM', time: '17:30', color: 'from-orange-500 to-amber-700' },
  { id: 5, name: 'Maria Constantin', activity: 'Yoga', avatar: 'MC', time: '12:00', color: 'from-pink-500 to-rose-700' },
  { id: 6, name: 'Bogdan Dumitrescu', activity: 'Football', avatar: 'BD', time: '16:00', color: 'from-green-500 to-emerald-700' },
  { id: 7, name: 'Sorin Munteanu', activity: 'Cycling', avatar: 'SM', time: '07:30', color: 'from-yellow-500 to-orange-600' },
  { id: 8, name: 'Cristina Popa', activity: 'Running', avatar: 'CP', time: '06:30', color: 'from-red-500 to-pink-700' },
]

function toDateStr(d) {
  return d.toISOString().split('T')[0]
}

export default function MatchesPage() {
  const { user, recordMatchInContext } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialSport = searchParams.get('sport') || null

  const [selectedSport, setSelectedSport] = useState(initialSport)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)
  const [fetchError, setFetchError] = useState(null)

  // Post form
  const [showPost, setShowPost] = useState(false)
  const [postSport, setPostSport] = useState(initialSport ?? '')
  const [postDate, setPostDate] = useState(toDateStr(new Date()))
  const [posting, setPosting] = useState(false)
  const [postDone, setPostDone] = useState(false)

  const today = toDateStr(new Date())
  const maxDate = toDateStr(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

  const fetchMatches = async (sport) => {
    if (!sport) return
    setLoading(true); setFetchError(null); setHasFetched(false)
    try {
      const res = await fetch(`/api/matchmaking/${user?.userId ?? 1}?activity=${encodeURIComponent(sport)}`)
      if (!res.ok) throw new Error('Eroare la căutare')
      setMatches(await res.json())
      setHasFetched(true)
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const [visibleCount, setVisibleCount] = useState(5)

  // Auto-search if sport comes from URL
  useEffect(() => {
    if (initialSport) fetchMatches(initialSport)
  }, [])

  const handleSearch = () => {
    setVisibleCount(5)
    fetchMatches(selectedSport)
  }

  const handlePost = async () => {
    if (!postSport || !postDate) return
    setPosting(true)
    try {
      await fetch(`/api/matchmaking/${user?.userId ?? 1}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity: postSport, date: postDate, userName: user?.name }),
      })
      recordMatchInContext?.()
      setPostDone(true)
      setShowPost(false)
      setTimeout(() => setPostDone(false), 4000)
    } catch { }
    setPosting(false)
  }

  const filteredRequests = selectedSport
    ? MOCK_REQUESTS.filter(r => r.activity === selectedSport)
    : MOCK_REQUESTS

  const sortedMatches = [...(matches || [])].sort((a, b) => b.matchScore - a.matchScore)
  const paginatedMatches = sortedMatches.slice(0, visibleCount)
  const hasMore = sortedMatches.length > visibleCount

  return (
    <div className="min-h-screen relative">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 -left-32 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)', filter: 'blur(70px)' }} />
      </div>

      {/* ── Header ── */}
      <header className="border-b border-surface-border bg-surface-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand/20 flex items-center justify-center text-sm">🤝</div>
            <span className="text-sm font-semibold text-white">Matchmaking Sportiv</span>
            <span className="badge bg-brand/10 text-brand-light text-[10px]">✨ AI</span>
          </div>

          <button
            onClick={() => setShowPost(v => !v)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-surface-border bg-surface hover:bg-brand/10 hover:border-brand/30 text-slate-400 hover:text-brand-light transition-all text-sm font-medium"
          >
            {showPost ? <><X className="w-3.5 h-3.5" /> Anulează</> : <><Plus className="w-3.5 h-3.5" /> Postează</>}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-fade-in">

        {/* ── Post activity panel ── */}
        {showPost && (
          <div className="card border-brand/20 animate-slide-up">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-brand/15 flex items-center justify-center text-xs">📣</span>
              Postează o activitate sportivă
            </h2>
            {postDone ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-300">
                🎉 Activitate postată! Colegii compatibili vor fi notificați automat.
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={postSport}
                  onChange={e => setPostSport(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand"
                >
                  <option value="">Alege sportul…</option>
                  {ALL_SPORTS.map(s => <option key={s} value={s}>{SPORT_ICONS[s]} {s}</option>)}
                </select>
                <input
                  type="date"
                  value={postDate}
                  min={today}
                  max={maxDate}
                  onChange={e => setPostDate(e.target.value)}
                  className="sm:w-44 bg-zinc-900 border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand [color-scheme:dark]"
                />
                <button
                  onClick={handlePost}
                  disabled={!postSport || posting}
                  className="btn-primary text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {posting ? 'Se trimite…' : 'Postează →'}
                </button>
              </div>
            )}
          </div>
        )}

        {postDone && !showPost && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-3 text-sm text-emerald-300 animate-slide-up flex items-center gap-2">
            🎉 Activitate postată! Colegii compatibili vor fi notificați automat.
          </div>
        )}

        {/* ── Sport filter ── */}
        <div className="card flex flex-col gap-4 max-w-5xl mx-auto">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-sky-500/15 flex items-center justify-center text-xs">🔍</span>
            Caută parteneri de sport
          </h2>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSport(null)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all duration-200 ${!selectedSport
                ? 'bg-brand/20 border-brand/50 text-white shadow-sm shadow-brand/20'
                : 'bg-surface border-surface-border text-slate-400 hover:border-brand/30 hover:text-slate-300'
                }`}
            >
              🏅 Toate
            </button>
            {ALL_SPORTS.map(sport => (
              <button
                key={sport}
                onClick={() => setSelectedSport(s => s === sport ? null : sport)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all duration-200 ${selectedSport === sport
                  ? 'bg-brand/20 border-brand/50 text-white shadow-sm shadow-brand/20'
                  : 'bg-surface border-surface-border text-slate-400 hover:border-brand/30 hover:text-slate-300'
                  }`}
              >
                {SPORT_ICONS[sport] ?? '🏅'} {sport}
              </button>
            ))}
          </div>

          <button
            onClick={handleSearch}
            disabled={!selectedSport || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
          >
            {loading ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Se caută…</>
            ) : (
              <><Search className="w-4 h-4" /> {selectedSport ? `Găsește parteneri pentru ${SPORT_ICONS[selectedSport] ?? ''} ${selectedSport}` : 'Selectează un sport mai sus'}</>
            )}
          </button>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* Left panel: Active requests */}
          <div className="lg:col-span-2 card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center text-xs">📋</span>
                Cereri active
              </h2>
              <span className="text-xs text-slate-500">
                {filteredRequests.length} {filteredRequests.length === 1 ? 'cerere' : 'cereri'}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {filteredRequests.length > 0 ? filteredRequests.map(req => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-surface-border hover:border-brand/30 hover:bg-brand/5 transition-all duration-200 cursor-pointer"
                  onClick={() => {
                    setSelectedSport(req.activity)
                    fetchMatches(req.activity)
                  }}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${req.color} flex items-center justify-center text-sm font-bold text-white shadow shrink-0`}>
                    {req.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{req.name}</p>
                    <p className="text-xs text-slate-400">
                      {SPORT_ICONS[req.activity] ?? '🏅'} vrea să joace <strong className="text-slate-300">{req.activity}</strong>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-500">{req.time}</span>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                  <span className="text-3xl">🔍</span>
                  <p className="text-sm text-slate-500">Nicio cerere pentru {selectedSport}.</p>
                  <p className="text-xs text-slate-600">Fii primul care postează!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: AI results (Independently scrolling) */}
          <div className="lg:col-span-3 flex flex-col gap-4 lg:sticky lg:top-24 max-h-[calc(100vh-140px)] overflow-y-auto pr-2 custom-scrollbar">
            {fetchError && (
              <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-2xl p-4">
                ⚠️ {fetchError}
              </div>
            )}

            {!hasFetched && !loading && !fetchError && (
              <div className="card flex flex-col items-center justify-center gap-4 py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center text-3xl">🤝</div>
                <div>
                  <p className="text-base font-semibold text-white">Caută parteneri de sport</p>
                  <p className="text-sm text-slate-500 mt-1">Selectează un sport și apasă "Găsește parteneri"</p>
                </div>
                {selectedSport && (
                  <button onClick={handleSearch} className="btn-primary text-sm">
                    {SPORT_ICONS[selectedSport]} Caută pentru {selectedSport}
                  </button>
                )}
              </div>
            )}

            {loading && (
              <div className="card flex flex-col gap-4 animate-pulse">
                <div className="h-5 w-48 bg-surface-border rounded" />
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-surface-border rounded-xl" />
                ))}
              </div>
            )}

            {hasFetched && !loading && (
              <div className="flex flex-col gap-4 animate-slide-up pb-8">
                <div className="flex items-center justify-between sticky top-0 py-2 bg-surface/80 backdrop-blur z-10 px-2 rounded-xl border border-surface-border/50">
                  <div className="flex items-center gap-2">
                    <span className="badge bg-brand/10 text-brand-light">✨ AI</span>
                    <p className="text-sm font-semibold text-white">
                      Top compatibili · {SPORT_ICONS[selectedSport] ?? '🏅'} {selectedSport}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Sortat după scor descendent</span>
                </div>

                {matches.length === 0 ? (
                  <div className="card flex flex-col items-center justify-center py-12 gap-3 text-center">
                    <span className="text-3xl">😔</span>
                    <p className="text-sm text-slate-400">Niciun match găsit pentru {selectedSport}.</p>
                    <p className="text-xs text-slate-600">Încearcă un alt sport sau postează o activitate.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {paginatedMatches.map((m, i) => <MatchCard key={i} match={m} rank={i + 1} />)}

                    {hasMore && (
                      <button
                        onClick={() => setVisibleCount(prev => prev + 5)}
                        className="mt-2 w-full py-3 rounded-xl border border-surface-border bg-surface hover:bg-surface-card text-brand-light text-xs font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                      >
                        Vezi mai mulți colegi <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  )
}

const SPORT_ICONS_FULL = {
  Padel: '🎾', 'Ping Pong': '🏓', Tennis: '🎾', Badminton: '🏸',
  Football: '⚽', Yoga: '🧘', Cycling: '🚴', Ski: '⛷️', Running: '🏃',
  Basketball: '🏀', Volleyball: '🏐', Swimming: '🏊', Hiking: '🥾',
  Squash: '🎾', Gym: '🏋️', CrossFit: '💪',
}

function MatchCard({ match, rank }) {
  const scorePercent = Math.round(match.matchScore * 100)
  const scoreColor = scorePercent >= 90 ? 'text-emerald-400' : scorePercent >= 75 ? 'text-amber-400' : 'text-slate-400'
  const scoreBg = scorePercent >= 90 ? 'bg-emerald-500' : scorePercent >= 75 ? 'bg-amber-500' : 'bg-slate-500'
  const initials = match.matchedEmployeeName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const sports = match.sports ?? []
  const age = match.age ?? null
  const gender = match.gender === 'F' ? 'F' : match.gender === 'M' ? 'M' : null
  const metaParts = [
    age ? `${age} ani` : null,
    gender,
    `📍 ${match.city || 'București'}`,
  ].filter(Boolean)

  return (
    <div className="group bg-surface-card/40 border border-surface-border/60 rounded-2xl p-4 hover:border-brand/40 hover:bg-brand/5 transition-all duration-300">
      <div className="flex items-start gap-4">
        {/* Avatar & Rank */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm font-bold text-white shadow-inner group-hover:scale-105 transition-transform">
            {initials}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface border-2 border-surface-border flex items-center justify-center shadow-sm">
            <span className="text-[9px] font-black text-brand-light">#{rank}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate group-hover:text-brand-light transition-colors">{match.matchedEmployeeName}</h3>
              <p className="text-[10px] text-slate-500 flex items-center gap-1.5 truncate">
                {metaParts.join(' · ')}
              </p>
            </div>
            <span className={`text-base font-black tabular-nums tracking-tighter ${scoreColor}`}>{scorePercent}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-white/5 rounded-full mb-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${scoreBg} opacity-80 group-hover:opacity-100 transition-all duration-700 ease-out`}
              style={{ width: `${scorePercent}%` }}
            />
          </div>

          {/* Real sport tags */}
          {sports.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {sports.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-medium text-slate-400 group-hover:border-brand/20 group-hover:text-slate-300 transition-all">
                  {SPORT_ICONS_FULL[tag] ?? '🏅'} {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 italic mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
            "{match.aiCustomMessage}"
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="flex-1 h-8 rounded-lg border border-surface-border bg-surface hover:bg-surface-border text-white text-[10px] font-bold transition-all active:scale-95">
              Vezi Profil
            </button>
            <button className="flex-[1.5] h-8 rounded-lg bg-brand/10 hover:bg-brand/20 border border-brand/20 text-brand-light text-[10px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5">
              <Plus className="w-3 h-3" /> Invită
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
