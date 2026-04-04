import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, Users, MapPin, Clock, Calendar, Send, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSportLobby } from '../context/SportLobbyContext'

/* ── Sport metadata ──────────────────────────────────────────────── */
export const SPORT_META = {
  Padel:       { icon: '🎾', color: '#a78bfa', bg: 'from-violet-600/20 to-purple-900/10'  },
  Tennis:      { icon: '🎾', color: '#34d399', bg: 'from-emerald-600/20 to-teal-900/10'   },
  'Ping Pong': { icon: '🏓', color: '#38bdf8', bg: 'from-sky-600/20 to-blue-900/10'        },
  Badminton:   { icon: '🏸', color: '#fbbf24', bg: 'from-amber-600/20 to-yellow-900/10'   },
  Squash:      { icon: '🏸', color: '#fb923c', bg: 'from-orange-600/20 to-red-900/10'     },
  Football:    { icon: '⚽', color: '#4ade80', bg: 'from-green-600/20 to-emerald-900/10'  },
  Basketball:  { icon: '🏀', color: '#f97316', bg: 'from-orange-600/20 to-amber-900/10'   },
  Volleyball:  { icon: '🏐', color: '#e879f9', bg: 'from-fuchsia-600/20 to-pink-900/10'   },
  Running:     { icon: '🏃', color: '#f87171', bg: 'from-red-600/20 to-rose-900/10'       },
  Cycling:     { icon: '🚴', color: '#facc15', bg: 'from-yellow-600/20 to-orange-900/10'  },
  Ski:         { icon: '⛷️', color: '#67e8f9', bg: 'from-cyan-600/20 to-sky-900/10'       },
  Swimming:    { icon: '🏊', color: '#60a5fa', bg: 'from-blue-600/20 to-indigo-900/10'    },
  Hiking:      { icon: '🥾', color: '#86efac', bg: 'from-green-600/20 to-teal-900/10'     },
  Yoga:        { icon: '🧘', color: '#f472b6', bg: 'from-pink-600/20 to-rose-900/10'      },
  Gym:         { icon: '💪', color: '#94a3b8', bg: 'from-slate-600/20 to-zinc-900/10'     },
  CrossFit:    { icon: '🏋️', color: '#ef4444', bg: 'from-red-600/20 to-orange-900/10'    },
}

function toDateStr(d) { return d.toISOString().split('T')[0] }

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date(); today.setHours(0,0,0,0)
  const tom   = new Date(today); tom.setDate(tom.getDate() + 1)
  if (d.getTime() === today.getTime()) return 'Azi'
  if (d.getTime() === tom.getTime())   return 'Mâine'
  return d.toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' })
}

/* ── Lobby card ──────────────────────────────────────────────────── */
function LobbyCard({ lobby, sport, onJoin }) {
  const meta    = SPORT_META[sport] ?? SPORT_META.Padel
  const spots   = lobby.maxPlayers - (lobby.currentPlayers?.length ?? 0)
  const isFull  = spots <= 0
  const isPending = lobby.status === 'pending_invite'

  return (
    <div
      className="group relative rounded-2xl border border-white/8 bg-zinc-900/60 hover:border-white/15 transition-all duration-200 overflow-hidden"
      style={{ boxShadow: `0 0 0 1px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)` }}
    >
      {/* Top color strip */}
      <div className="h-0.5 w-full" style={{ background: meta.color, opacity: 0.6 }} />

      <div className="p-4 flex flex-col gap-3">
        {/* Creator row */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${lobby.creatorGradient} flex items-center justify-center text-sm font-bold text-white shadow shrink-0`}>
            {lobby.creatorInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{lobby.creatorName}</p>
            <p className="text-[11px] text-slate-500">a creat acest lobby</p>
          </div>
          {isPending && (
            <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400">
              ⏳ Invitație trimisă
            </span>
          )}
          {lobby.isMine && !isPending && (
            <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
              ✨ Al tău
            </span>
          )}
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Calendar className="w-3 h-3 text-slate-500" />
            {formatDate(lobby.date)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Clock className="w-3 h-3 text-slate-500" />
            {lobby.time}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 min-w-0">
            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate">{lobby.location}</span>
          </div>
        </div>

        {/* Players */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-400">
              <span className="font-semibold text-white">{lobby.currentPlayers?.length ?? 1}</span>
              <span className="text-slate-600"> / {lobby.maxPlayers}</span>
            </span>
            {/* Player dots */}
            <div className="flex gap-0.5 ml-1">
              {Array.from({ length: lobby.maxPlayers }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: i < (lobby.currentPlayers?.length ?? 1) ? meta.color : 'rgba(255,255,255,0.1)',
                  }}
                />
              ))}
            </div>
          </div>

          {!lobby.isMine && !isPending && (
            <button
              disabled={isFull}
              onClick={() => onJoin?.(lobby)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 hover:scale-[1.03] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: isFull ? 'rgba(255,255,255,0.05)' : `${meta.color}22`,
                border: `1px solid ${meta.color}44`,
                color: isFull ? '#64748b' : meta.color,
              }}
            >
              {isFull ? 'Complet' : 'Alătură-te →'}
            </button>
          )}
        </div>

        {/* Notes */}
        {lobby.notes && (
          <p className="text-[11px] text-slate-500 italic border-t border-white/5 pt-2">
            "{lobby.notes}"
          </p>
        )}
        {/* Pending invite info */}
        {isPending && lobby.invitedUser && (
          <p className="text-[11px] text-amber-400/70 border-t border-amber-500/10 pt-2">
            Invitație trimisă lui <strong>{lobby.invitedUser}</strong> · în așteptare
          </p>
        )}
      </div>
    </div>
  )
}

/* ── AI Recommendation card ──────────────────────────────────────── */
function RecommendationCard({ match, rank, sport, onInvite }) {
  const meta  = SPORT_META[sport] ?? SPORT_META.Padel
  const score = Math.round((match.matchScore ?? 0) * 100)
  const initials = (match.matchedEmployeeName ?? '??').split(' ').map(w => w[0]).join('').slice(0, 2)
  const GRADIENTS = [
    'from-violet-500 to-purple-700', 'from-sky-500 to-blue-700',
    'from-emerald-500 to-teal-700',  'from-orange-500 to-amber-700',
    'from-pink-500 to-rose-700',     'from-indigo-500 to-blue-700',
  ]
  const grad = GRADIENTS[rank % GRADIENTS.length]

  return (
    <div className="group rounded-2xl border border-white/8 bg-zinc-900/60 hover:border-white/15 transition-all duration-200 p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        {/* Rank badge */}
        <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[9px] font-bold text-slate-400">#{rank + 1}</span>
        </div>
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-sm font-bold text-white shadow shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-semibold text-white truncate">{match.matchedEmployeeName}</p>
            <span className="text-xs font-bold tabular-nums shrink-0" style={{ color: meta.color }}>
              {score}%
            </span>
          </div>
          {match.city && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-400 bg-sky-400/10 border border-sky-400/20 rounded-md px-1.5 py-0.5 mb-2">
              📍 {match.city}
            </span>
          )}
          {/* Score bar */}
          <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${score}%`, background: meta.color }}
            />
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">💡 {match.aiCustomMessage}</p>
        </div>
      </div>

      <button
        onClick={() => onInvite(match)}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-150 hover:scale-[1.01] border"
        style={{
          background: `${meta.color}15`,
          borderColor: `${meta.color}40`,
          color: meta.color,
        }}
      >
        <Send className="w-3.5 h-3.5" />
        Invită la un meci de {sport}
      </button>
    </div>
  )
}

/* ── Create/Invite lobby modal ───────────────────────────────────── */
function LobbyModal({ sport, invitee, onClose, onSubmit }) {
  const today  = toDateStr(new Date())
  const [form, setForm] = useState({
    date:       today,
    time:       '18:00',
    location:   '',
    maxPlayers: '4',
    notes:      '',
    message:    invitee ? `Bună! Te invit la un meci de ${sport}. Ce zici?` : '',
  })
  const [submitting, setSubmitting] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.date || !form.time || !form.location) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 400))
    onSubmit(form)
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-md animate-slide-up">
        <div className="bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${SPORT_META[sport]?.color ?? '#6366f1'}, #6366f1)` }} />

          <div className="px-6 py-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {SPORT_META[sport]?.icon} {invitee ? `Invită pe ${invitee.matchedEmployeeName}` : 'Creează lobby nou'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {invitee ? `Meci de ${sport} · invitație directă` : `Lobby public de ${sport}`}
                </p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Data</label>
                <input
                  type="date" value={form.date} min={today}
                  onChange={e => set('date', e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25 [color-scheme:dark]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Ora</label>
                <input
                  type="time" value={form.time}
                  onChange={e => set('time', e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25 [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Locație</label>
              <input
                type="text" value={form.location} placeholder="ex: Terenul Floreasca, Sala IOR..."
                onChange={e => set('location', e.target.value)}
                className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/25"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Jucători maxim</label>
              <div className="flex gap-2">
                {['2', '3', '4', '6', '8', '10'].map(n => (
                  <button
                    key={n}
                    onClick={() => set('maxPlayers', n)}
                    className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all ${
                      form.maxPlayers === n
                        ? 'text-white border-white/20 bg-white/10'
                        : 'text-slate-500 border-white/5 bg-zinc-900 hover:border-white/15 hover:text-slate-300'
                    }`}
                  >{n}</button>
                ))}
              </div>
            </div>

            {invitee && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Mesaj</label>
                <textarea
                  value={form.message} rows={2}
                  onChange={e => set('message', e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/25 resize-none"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Note (opțional)</label>
              <input
                type="text" value={form.notes} placeholder="Nivel, echipament necesar..."
                onChange={e => set('notes', e.target.value)}
                className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/25"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!form.date || !form.time || !form.location || submitting}
              className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${SPORT_META[sport]?.color ?? '#6366f1'}, #6366f1)` }}
            >
              {submitting
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Se creează…</>
                : invitee
                  ? <><Send className="w-4 h-4" /> Trimite invitația</>
                  : <><Zap className="w-4 h-4" /> Creează lobby</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main SportPage ──────────────────────────────────────────────── */
export default function SportPage() {
  const { sport }    = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuth()
  const { lobbies, createLobby, inviteToLobby } = useSportLobby()

  const meta = SPORT_META[sport] ?? { icon: '🏅', color: '#6366f1', bg: 'from-indigo-600/20 to-blue-900/10' }

  // AI recommendations
  const [matches,    setMatches]    = useState([])
  const [loadingAI,  setLoadingAI]  = useState(false)
  const [aiError,    setAiError]    = useState(null)

  // Modals
  const [showCreate, setShowCreate]   = useState(false)
  const [invitee,    setInvitee]      = useState(null) // match object
  const [successMsg, setSuccessMsg]   = useState(null)

  // Lobby list for this sport
  const sportLobbies = lobbies.filter(l => l.sport === sport)

  const fetchAI = useCallback(async () => {
    if (!user?.userId) return
    setLoadingAI(true); setAiError(null)
    try {
      const res = await fetch(`/api/matchmaking/${user.userId}?activity=${encodeURIComponent(sport)}`)
      if (!res.ok) throw new Error('unavailable')
      setMatches(await res.json())
    } catch {
      setAiError('Nu s-au putut încărca recomandările AI.')
    } finally {
      setLoadingAI(false)
    }
  }, [user?.userId, sport])

  useEffect(() => { fetchAI() }, [fetchAI])

  const handleCreateSubmit = (form) => {
    createLobby({ sport, ...form })
    setShowCreate(false)
    setSuccessMsg('Lobby creat! Alți colegi îl vor vedea acum.')
    setTimeout(() => setSuccessMsg(null), 4000)
  }

  const handleInviteSubmit = (form) => {
    inviteToLobby({ sport, ...form, message: form.message }, invitee)
    setInvitee(null)
    setSuccessMsg(`Invitație trimisă lui ${invitee.matchedEmployeeName}! Vor vedea notificarea pe dashboard.`)
    setTimeout(() => setSuccessMsg(null), 5000)
  }

  return (
    <div className="min-h-screen relative">
      {/* Ambient glow based on sport color */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-32 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${meta.color} 0%, transparent 70%)`, filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 -right-32 w-80 h-80 rounded-full opacity-8"
          style={{ background: `radial-gradient(circle, ${meta.color} 0%, transparent 70%)`, filter: 'blur(70px)' }} />
      </div>

      {/* ── Header ── */}
      <header className="border-b border-white/8 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>

          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg"
              style={{ background: `${meta.color}22`, border: `1px solid ${meta.color}44` }}
            >
              {meta.icon}
            </div>
            <div>
              <h1 className="text-base font-bold text-white">{sport}</h1>
              <p className="text-[10px] text-slate-500 leading-none">Lobby-uri · Recomandări AI</p>
            </div>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] border"
            style={{ background: `${meta.color}18`, borderColor: `${meta.color}40`, color: meta.color }}
          >
            <Plus className="w-4 h-4" />
            Creează lobby
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Success message */}
        {successMsg && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-5 py-3.5 text-sm text-emerald-300 flex items-center gap-3 animate-slide-up">
            <span className="text-xl">🎉</span>
            {successMsg}
          </div>
        )}

        {/* Two-panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── LEFT: Active lobbies ── */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4" style={{ color: meta.color }} />
                  Lobby-uri active
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {sportLobbies.length} {sportLobbies.length === 1 ? 'lobby activ' : 'lobby-uri active'} pentru {sport}
                </p>
              </div>
              <div
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30` }}
              >
                LIVE
              </div>
            </div>

            {sportLobbies.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-zinc-900/40 p-10 text-center">
                <span className="text-4xl block mb-3">{meta.icon}</span>
                <p className="text-sm font-medium text-slate-300 mb-1">Niciun lobby activ</p>
                <p className="text-xs text-slate-600">Fii primul care creează un lobby de {sport}!</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] border"
                  style={{ background: `${meta.color}18`, borderColor: `${meta.color}40`, color: meta.color }}
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1.5" />
                  Creează primul lobby
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sportLobbies.map(lobby => (
                  <LobbyCard
                    key={lobby.id}
                    lobby={lobby}
                    sport={sport}
                    onJoin={(l) => {
                      // Simple join — just show a toast for now
                      setSuccessMsg(`Te-ai alăturat lobby-ului lui ${l.creatorName}!`)
                      setTimeout(() => setSuccessMsg(null), 4000)
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: AI Recommendations ── */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4" style={{ color: meta.color }} />
                  Recomandări AI
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Parteneri compatibili pentru {sport} · personalizat pentru tine
                </p>
              </div>
              <button
                onClick={fetchAI}
                disabled={loadingAI}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-40"
              >
                {loadingAI ? '↻ Se încarcă…' : '↻ Reîncarcă'}
              </button>
            </div>

            {loadingAI && (
              <div className="flex flex-col gap-3">
                {[1,2,3].map(i => (
                  <div key={i} className="rounded-2xl border border-white/8 bg-zinc-900/40 p-4 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-white/5 rounded w-2/3" />
                        <div className="h-2 bg-white/5 rounded w-1/2" />
                        <div className="h-1 bg-white/5 rounded w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingAI && aiError && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
                <p className="text-sm text-red-400 mb-3">⚠️ {aiError}</p>
                <button onClick={fetchAI} className="text-xs text-slate-400 hover:text-white transition-colors">
                  Încearcă din nou →
                </button>
              </div>
            )}

            {!loadingAI && !aiError && matches.length === 0 && (
              <div className="rounded-2xl border border-white/8 bg-zinc-900/40 p-10 text-center">
                <span className="text-4xl block mb-3">🤖</span>
                <p className="text-sm font-medium text-slate-300 mb-1">AI-ul caută parteneri</p>
                <p className="text-xs text-slate-600">Nu s-au găsit colegi compatibili pentru {sport} momentan.</p>
              </div>
            )}

            {!loadingAI && matches.length > 0 && (
              <div className="flex flex-col gap-3">
                {matches.map((m, i) => (
                  <RecommendationCard
                    key={i}
                    match={m}
                    rank={i}
                    sport={sport}
                    onInvite={(match) => setInvitee(match)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showCreate && (
        <LobbyModal
          sport={sport}
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreateSubmit}
        />
      )}
      {invitee && (
        <LobbyModal
          sport={sport}
          invitee={invitee}
          onClose={() => setInvitee(null)}
          onSubmit={handleInviteSubmit}
        />
      )}
    </div>
  )
}
