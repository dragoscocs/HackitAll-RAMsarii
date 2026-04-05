import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, Users, MapPin, Clock, Calendar, Send, Zap, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSportLobby } from '../context/SportLobbyContext'
import { DEMO_PROFILES, computeCompatibility, compatibilityMessage, resolveProfile } from '../data/demoProfiles'

/* ── Sport metadata ──────────────────────────────────────────────── */
export const SPORT_META = {
  Padel:       { icon: '🎾', color: '#a78bfa', bg: 'from-violet-600/20 to-purple-900/10'  },
  Tennis:      { icon: '🎾', color: '#34d399', bg: 'from-emerald-600/20 to-teal-900/10'   },
  'Ping Pong': { icon: '🏓', color: '#38bdf8', bg: 'from-sky-600/20 to-blue-900/10'       },
  Badminton:   { icon: '🏸', color: '#fbbf24', bg: 'from-amber-600/20 to-yellow-900/10'   },
  Squash:      { icon: '🏸', color: '#fb923c', bg: 'from-orange-600/20 to-red-900/10'     },
  Football:    { icon: '⚽', color: '#4ade80', bg: 'from-green-600/20 to-emerald-900/10'  },
  Basketball:  { icon: '🏀', color: '#f97316', bg: 'from-orange-600/20 to-amber-900/10'   },
  Volleyball:  { icon: '🏐', color: '#e879f9', bg: 'from-fuchsia-600/20 to-pink-900/10'   },
  Running:     { icon: '🏃', color: '#f87171', bg: 'from-red-600/20 to-rose-900/10'       },
  Cycling:     { icon: '🚴', color: '#facc15', bg: 'from-yellow-600/20 to-orange-900/10'  },
  Ski:         { icon: '⛷️', color: '#67e8f9', bg: 'from-cyan-600/20 to-sky-900/10'      },
  Swimming:    { icon: '🏊', color: '#60a5fa', bg: 'from-blue-600/20 to-indigo-900/10'    },
  Hiking:      { icon: '🥾', color: '#86efac', bg: 'from-green-600/20 to-teal-900/10'     },
  Yoga:        { icon: '🧘', color: '#f472b6', bg: 'from-pink-600/20 to-rose-900/10'      },
  Gym:         { icon: '💪', color: '#94a3b8', bg: 'from-slate-600/20 to-zinc-900/10'     },
  CrossFit:    { icon: '🏋️', color: '#ef4444', bg: 'from-red-600/20 to-orange-900/10'   },
}

function toDateStr(d) { return d.toISOString().split('T')[0] }

function formatDate(dateStr) {
  const d     = new Date(dateStr + 'T00:00:00')
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tom   = new Date(today); tom.setDate(tom.getDate() + 1)
  if (d.getTime() === today.getTime()) return 'Azi'
  if (d.getTime() === tom.getTime())   return 'Mâine'
  return d.toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' })
}

function scoreColor(score) {
  if (score >= 80) return '#4ade80'
  if (score >= 60) return '#facc15'
  if (score >= 40) return '#fb923c'
  return '#94a3b8'
}

/* ── Avatar ──────────────────────────────────────────────────────── */
function Avatar({ profile, size = 'md', onClick, ring }) {
  const sz = size === 'sm' ? 'w-7 h-7 text-[10px]' : size === 'lg' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm'
  return (
    <div
      onClick={onClick}
      className={`${sz} rounded-xl bg-gradient-to-br ${profile.gradient ?? 'from-slate-500 to-zinc-700'} flex items-center justify-center font-bold text-white shadow shrink-0 ${onClick ? 'cursor-pointer hover:scale-110 active:scale-95 transition-transform' : ''} ${ring ? 'ring-2 ring-white/20' : ''}`}
    >
      {profile.initials ?? (profile.name ?? '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
    </div>
  )
}

/* ── Profile Modal ───────────────────────────────────────────────── */
function ProfileModal({ profile, sport, onClose, onInvite }) {
  const meta = SPORT_META[sport] ?? SPORT_META.Padel
  if (!profile) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative w-full max-w-sm bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${profile.gradient?.includes('violet') ? '#a78bfa' : meta.color}, ${meta.color})` }} />

        <div className="p-6 flex flex-col gap-5">
          {/* Header row */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar profile={profile} size="lg" />
              <div>
                <p className="text-base font-bold text-white">{profile.name}</p>
                {profile.role && <p className="text-xs text-slate-400">{profile.role}</p>}
                {profile.department && <p className="text-[11px] text-slate-600">{profile.department}</p>}
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center text-slate-500 hover:text-white transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick stats */}
          <div className="flex gap-2">
            {profile.city && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-400 bg-sky-400/10 border border-sky-400/20 rounded-lg px-2 py-1">
                📍 {profile.city}
              </span>
            )}
            {profile.age && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                {profile.age} ani · {profile.gender === 'M' ? '♂' : '♀'}
              </span>
            )}
            {profile.rating && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-2 py-1">
                ⭐ {profile.rating}
              </span>
            )}
          </div>

          {/* Sports */}
          {profile.sports?.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Sporturi practicate</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.sports.map(s => {
                  const sm = SPORT_META[s]
                  const level = profile.sportLevels?.[s]
                  return (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 text-[11px] font-medium rounded-lg px-2 py-1 border"
                      style={{ background: sm ? `${sm.color}15` : 'rgba(255,255,255,0.05)', borderColor: sm ? `${sm.color}35` : 'rgba(255,255,255,0.1)', color: sm ? sm.color : '#94a3b8' }}
                    >
                      {sm?.icon ?? '🏅'} {s}{level ? ` · ${level}` : ''}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-slate-400 leading-relaxed border-l-2 pl-3" style={{ borderColor: meta.color + '60' }}>
              "{profile.bio}"
            </p>
          )}

          {/* Availability */}
          {profile.availability?.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Disponibilitate</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.availability.map(a => (
                  <span key={a} className="text-[11px] text-slate-400 bg-white/5 border border-white/8 rounded-lg px-2 py-1">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          {profile.matchesPlayed > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Users className="w-3.5 h-3.5" />
              {profile.matchesPlayed} meciuri jucate în companie
            </div>
          )}

          {/* CTA */}
          <button
            onClick={() => { onClose(); onInvite(profile) }}
            className="w-full py-3 rounded-2xl font-bold text-sm text-white transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${meta.color}, #6366f1)` }}
          >
            <Send className="w-4 h-4" />
            Invită la un meci de {sport}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Lobby Card ──────────────────────────────────────────────────── */
function LobbyCard({ lobby, sport, currentUserName, onJoin, onMemberClick }) {
  const meta    = SPORT_META[sport] ?? SPORT_META.Padel
  const players = lobby.currentPlayers ?? []
  const isFull  = players.length >= lobby.maxPlayers
  const isJoined   = players.includes(currentUserName)
  const isPending  = lobby.status === 'pending_invite'
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`group relative rounded-2xl border bg-zinc-900/60 transition-all duration-200 overflow-hidden ${isFull ? 'opacity-50' : 'hover:border-white/15'}`}
      style={{
        borderColor: isFull ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
        boxShadow: `0 0 0 1px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      <div className="h-0.5 w-full" style={{ background: isFull ? '#334155' : meta.color, opacity: isFull ? 1 : 0.7 }} />

      <div className="p-4 flex flex-col gap-3">
        {/* Creator row */}
        <div className="flex items-center gap-3">
          <Avatar profile={resolveProfile(lobby.creatorName)} onClick={() => onMemberClick?.(resolveProfile(lobby.creatorName))} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{lobby.creatorName}</p>
            <p className="text-[11px] text-slate-500">organizează acest meci</p>
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
          {isFull && (
            <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-500">
              Complet
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Calendar className="w-3 h-3 text-slate-600" />{formatDate(lobby.date)}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3 text-slate-600" />{lobby.time}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400 min-w-0">
            <MapPin className="w-3 h-3 text-slate-600 shrink-0" />
            <span className="truncate">{lobby.location}</span>
          </span>
        </div>

        {/* Players row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Avatars */}
            <div className="flex -space-x-1.5">
              {players.slice(0, 5).map((name, i) => {
                const p = resolveProfile(name)
                return (
                  <div
                    key={i}
                    onClick={() => onMemberClick?.(p)}
                    title={name}
                    className="w-6 h-6 rounded-lg bg-gradient-to-br flex items-center justify-center text-[9px] font-bold text-white border border-zinc-900 cursor-pointer hover:scale-110 hover:z-10 relative transition-transform"
                    style={{ background: `var(--tw-gradient-from, #6366f1)` }}
                  >
                    <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${p.gradient ?? 'from-slate-500 to-zinc-700'}`} />
                    <span className="relative z-10">{p.initials?.slice(0, 1)}</span>
                  </div>
                )
              })}
              {players.length > 5 && (
                <div className="w-6 h-6 rounded-lg bg-white/10 border border-zinc-900 flex items-center justify-center text-[9px] font-bold text-slate-400">
                  +{players.length - 5}
                </div>
              )}
            </div>

            <span className="text-xs text-slate-400">
              <span className="font-semibold text-white">{players.length}</span>
              <span className="text-slate-600"> / {lobby.maxPlayers}</span>
            </span>

            {/* Slot dots */}
            <div className="flex gap-0.5">
              {Array.from({ length: lobby.maxPlayers }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i < players.length ? meta.color : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Expand toggle */}
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-slate-600 hover:text-slate-400 transition-colors"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Join / Joined button */}
            {!lobby.isMine && !isPending && (
              isJoined ? (
                <span className="text-[11px] font-semibold px-3 py-1.5 rounded-xl" style={{ background: `${meta.color}20`, color: meta.color }}>
                  ✓ Ești în meci
                </span>
              ) : (
                <button
                  disabled={isFull}
                  onClick={() => onJoin?.(lobby.id)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all hover:scale-[1.03] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: `${meta.color}22`, border: `1px solid ${meta.color}44`, color: meta.color }}
                >
                  {isFull ? 'Complet' : 'Vreau să joc'}
                </button>
              )
            )}
          </div>
        </div>

        {/* Expanded member list */}
        {expanded && players.length > 0 && (
          <div className="border-t border-white/5 pt-3 flex flex-col gap-2">
            <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Jucători înscriși</p>
            {players.map((name, i) => {
              const p = resolveProfile(name)
              return (
                <div
                  key={i}
                  onClick={() => onMemberClick?.(p)}
                  className="flex items-center gap-2.5 cursor-pointer hover:bg-white/3 rounded-xl px-2 py-1.5 -mx-2 transition-colors"
                >
                  <Avatar profile={p} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{name}</p>
                    {p.role && <p className="text-[10px] text-slate-500">{p.role}</p>}
                  </div>
                  {p.sports?.length > 0 && (
                    <span className="text-[10px] text-slate-600">{p.sports.slice(0, 2).join(' · ')}</span>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Notes & pending info */}
        {lobby.notes && !expanded && (
          <p className="text-[11px] text-slate-500 italic border-t border-white/5 pt-2">"{lobby.notes}"</p>
        )}
        {isPending && lobby.invitedUser && (
          <p className="text-[11px] text-amber-400/70 border-t border-amber-500/10 pt-2">
            Invitație trimisă lui <strong>{lobby.invitedUser}</strong> · în așteptare
          </p>
        )}
      </div>
    </div>
  )
}

/* ── Recommendation Card ─────────────────────────────────────────── */
function RecommendationCard({ profile, score, message, sport, rank, onInvite, onViewProfile }) {
  const meta = SPORT_META[sport] ?? SPORT_META.Padel
  const sc   = scoreColor(score)
  const sportLevel = profile.sportLevels?.[sport]

  return (
    <div
      className="group rounded-2xl border border-white/8 bg-zinc-900/60 hover:border-white/15 transition-all duration-200 overflow-hidden cursor-pointer"
      onClick={() => onViewProfile(profile)}
    >
      <div className="h-0.5 w-full" style={{ background: sc, opacity: 0.5 }} />

      <div className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="relative">
            <Avatar profile={profile} />
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-900 flex items-center justify-center"
              style={{ background: sc }}
            >
              <span className="text-[7px] font-black text-zinc-900">#{rank + 1}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="text-sm font-bold text-white truncate">{profile.name}</p>
              <span className="text-sm font-black tabular-nums shrink-0" style={{ color: sc }}>{score}%</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {profile.role && <span className="text-[10px] text-slate-500">{profile.role}</span>}
              {profile.age && (
                <span className="text-[10px] text-slate-600">· {profile.age} ani</span>
              )}
              {profile.city && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-sky-400">· 📍 {profile.city}</span>
              )}
            </div>
          </div>
        </div>

        {/* Compatibility bar */}
        <div className="flex flex-col gap-1">
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${score}%`, background: `linear-gradient(to right, ${sc}88, ${sc})` }}
            />
          </div>
        </div>

        {/* Sports chips */}
        <div className="flex flex-wrap gap-1">
          {profile.sports.map(s => {
            const sm = SPORT_META[s]
            const isTarget = s === sport
            return (
              <span
                key={s}
                className="text-[10px] font-medium rounded-md px-1.5 py-0.5 border"
                style={{
                  background: isTarget ? `${sm?.color ?? meta.color}25` : 'rgba(255,255,255,0.04)',
                  borderColor: isTarget ? `${sm?.color ?? meta.color}45` : 'rgba(255,255,255,0.08)',
                  color: isTarget ? (sm?.color ?? meta.color) : '#64748b',
                }}
              >
                {sm?.icon ?? '🏅'} {s}{isTarget && sportLevel ? ` · ${sportLevel}` : ''}
              </span>
            )
          })}
        </div>

        {/* AI message */}
        <p className="text-[11px] text-slate-500 leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="flex gap-2 pt-0.5" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onViewProfile(profile)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold border border-white/8 bg-white/5 hover:bg-white/8 text-slate-400 hover:text-white transition-all"
          >
            Ver profil
          </button>
          <button
            onClick={() => onInvite(profile)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] border"
            style={{ background: `${meta.color}15`, borderColor: `${meta.color}40`, color: meta.color }}
          >
            <Send className="w-3 h-3" />
            Invită
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Lobby / Invite Modal ────────────────────────────────────────── */
function LobbyModal({ sport, invitee, onClose, onSubmit }) {
  const today = toDateStr(new Date())
  const [form, setForm] = useState({
    date: today, time: '18:00', location: '', maxPlayers: '4', notes: '',
    message: invitee ? `Salut ${invitee.name?.split(' ')[0]}! Te invit la un meci de ${sport}. Ce zici?` : '',
  })
  const [submitting, setSubmitting] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const meta = SPORT_META[sport] ?? { color: '#6366f1', icon: '🏅' }

  const handleSubmit = async () => {
    if (!form.date || !form.time || !form.location) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 350))
    onSubmit(form)
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-md">
        <div className="bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${meta.color}, #6366f1)` }} />

          <div className="px-6 py-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  {meta.icon} {invitee ? `Invitație pentru ${invitee.name?.split(' ')[0]}` : 'Lobby nou'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {invitee ? `Meci de ${sport} · invitație directă` : `Lobby public de ${sport} — oricine poate intra`}
                </p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Data</label>
                <input type="date" value={form.date} min={today} onChange={e => set('date', e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25 [color-scheme:dark]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Ora</label>
                <input type="time" value={form.time} onChange={e => set('time', e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/25 [color-scheme:dark]" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Locație</label>
              <input type="text" value={form.location} placeholder="ex: Terenul Floreasca, Sala IOR..."
                onChange={e => set('location', e.target.value)}
                className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/25" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Câte persoane maxim</label>
              <div className="flex gap-2">
                {['2', '3', '4', '6', '8', '10'].map(n => (
                  <button key={n} onClick={() => set('maxPlayers', n)}
                    className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all ${form.maxPlayers === n ? 'text-white border-white/20 bg-white/10' : 'text-slate-500 border-white/5 bg-zinc-900 hover:border-white/15 hover:text-slate-300'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {invitee && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Mesaj</label>
                <textarea value={form.message} rows={2} onChange={e => set('message', e.target.value)}
                  className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/25 resize-none" />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Note (opțional)</label>
              <input type="text" value={form.notes} placeholder="Nivel, echipament, alte detalii..."
                onChange={e => set('notes', e.target.value)}
                className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/25" />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!form.date || !form.time || !form.location || submitting}
              className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${meta.color}, #6366f1)` }}
            >
              {submitting
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Se trimite…</>
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
  const { sport }   = useParams()
  const navigate    = useNavigate()
  const { user }    = useAuth()
  const { lobbies, createLobby, joinLobby, inviteToLobby } = useSportLobby()

  const meta = SPORT_META[sport] ?? { icon: '🏅', color: '#6366f1', bg: 'from-indigo-600/20 to-blue-900/10' }

  const [backendMatches, setBackendMatches] = useState([])
  const [loadingAI, setLoadingAI]           = useState(false)
  const [aiError,   setAiError]             = useState(null)
  const [showCreate, setShowCreate]         = useState(false)
  const [invitee,    setInvitee]            = useState(null)
  const [profileView, setProfileView]       = useState(null)
  const [successMsg, setSuccessMsg]         = useState(null)
  const [joinedMsg,  setJoinedMsg]          = useState(null)

  /* Lobby list for this sport — sorted: open first, full last */
  const rawLobbies   = lobbies.filter(l => l.sport === sport)
  const sportLobbies = [...rawLobbies].sort((a, b) => {
    const aFull = (a.currentPlayers?.length ?? 0) >= a.maxPlayers
    const bFull = (b.currentPlayers?.length ?? 0) >= b.maxPlayers
    if (aFull !== bFull) return aFull ? 1 : -1
    const aTime = new Date(a.date + 'T' + (a.time ?? '00:00'))
    const bTime = new Date(b.date + 'T' + (b.time ?? '00:00'))
    return aTime - bTime
  })

  /* Compute frontend recommendations from demo profiles */
  const frontendRecs = DEMO_PROFILES
    .filter(p => p.name !== user?.name)
    .map(p => ({
      ...p,
      score: computeCompatibility(user, p, sport),
      message: compatibilityMessage(user, p, sport, computeCompatibility(user, p, sport)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)

  /* Try backend; fall back to frontend recs */
  const fetchAI = useCallback(async () => {
    if (!user?.userId) return
    setLoadingAI(true); setAiError(null)
    try {
      const res = await fetch(`/api/matchmaking/${user.userId}?activity=${encodeURIComponent(sport)}`)
      if (!res.ok) throw new Error('unavailable')
      const data = await res.json()
      // Enrich backend results with demo profile data
      const enriched = data.map(m => {
        const profile = DEMO_PROFILES.find(p => p.name === m.matchedEmployeeName)
        return {
          ...(profile ?? {}),
          name: m.matchedEmployeeName,
          score: Math.round(m.matchScore * 100),
          message: m.aiCustomMessage,
          city: m.city ?? profile?.city,
          initials: profile?.initials ?? m.matchedEmployeeName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
          gradient: profile?.gradient ?? 'from-slate-500 to-zinc-700',
          sports: profile?.sports ?? [],
          sportLevels: profile?.sportLevels ?? {},
          bio: profile?.bio ?? null,
          availability: profile?.availability ?? [],
          age: profile?.age ?? null,
          gender: profile?.gender ?? null,
          role: profile?.role ?? null,
          department: profile?.department ?? null,
          rating: profile?.rating ?? null,
          matchesPlayed: profile?.matchesPlayed ?? 0,
        }
      })
      setBackendMatches(enriched)
    } catch {
      setAiError(true)
    } finally {
      setLoadingAI(false)
    }
  }, [user?.userId, sport])

  useEffect(() => { fetchAI() }, [fetchAI])

  /* Use backend if available, else frontend recs */
  const recommendations = (backendMatches.length > 0 && !aiError) ? backendMatches : frontendRecs

  const flash = (setter, msg, ms = 4000) => {
    setter(msg)
    setTimeout(() => setter(null), ms)
  }

  const handleJoin = (lobbyId) => {
    joinLobby(lobbyId)
    const lobby = lobbies.find(l => l.id === lobbyId)
    flash(setJoinedMsg, `Ești acum în meci${lobby ? ` cu ${lobby.creatorName}` : ''}! 🎉`)
  }

  const handleCreateSubmit = (form) => {
    createLobby({ sport, ...form })
    setShowCreate(false)
    flash(setSuccessMsg, 'Lobby creat! Apare acum în lista din stânga — colegii tăi îl pot vedea.')
  }

  const handleInviteSubmit = (form) => {
    const to = invitee
    inviteToLobby({ sport, ...form }, to)
    setInvitee(null)
    flash(setSuccessMsg, `Invitație trimisă lui ${to.name?.split(' ')[0]}! Va vedea notificarea pe dashboard.`, 5000)
  }

  return (
    <div className="min-h-screen relative">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-32 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${meta.color} 0%, transparent 70%)`, filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 -right-32 w-80 h-80 rounded-full opacity-8"
          style={{ background: `radial-gradient(circle, ${meta.color} 0%, transparent 70%)`, filter: 'blur(70px)' }} />
      </div>

      {/* Header */}
      <header className="border-b border-white/8 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg"
              style={{ background: `${meta.color}22`, border: `1px solid ${meta.color}44` }}>
              {meta.icon}
            </div>
            <div>
              <h1 className="text-base font-bold text-white">{sport}</h1>
              <p className="text-[10px] text-slate-500 leading-none">Meciuri active · Colegi compatibili</p>
            </div>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] border"
            style={{ background: `${meta.color}18`, borderColor: `${meta.color}40`, color: meta.color }}
          >
            <Plus className="w-4 h-4" /> Creează lobby
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Toast messages */}
        {successMsg && (
          <div className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 px-5 py-3.5 text-sm text-emerald-300 flex items-center gap-3">
            <span className="text-xl">🎉</span> {successMsg}
          </div>
        )}
        {joinedMsg && (
          <div className="mb-5 rounded-2xl border border-sky-500/20 bg-sky-500/8 px-5 py-3.5 text-sm text-sky-300 flex items-center gap-3">
            <span className="text-xl">👋</span> {joinedMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── LEFT: Active Lobbies ── */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4" style={{ color: meta.color }} />
                  Meciuri care caută jucători
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {sportLobbies.length === 0
                    ? `Niciun meci de ${sport} momentan — tu poți fi primul`
                    : `${sportLobbies.filter(l => (l.currentPlayers?.length ?? 0) < l.maxPlayers).length} ${sportLobbies.length === 1 ? 'meci activ' : 'meciuri cu locuri libere'}`
                  }
                </p>
              </div>
              <div className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30` }}>
                LIVE
              </div>
            </div>

            {sportLobbies.length === 0 ? (
              <div className="rounded-2xl border border-white/8 bg-zinc-900/40 p-10 text-center">
                <span className="text-4xl block mb-3">{meta.icon}</span>
                <p className="text-sm font-semibold text-slate-200 mb-1">Nimeni nu a deschis un meci de {sport} încă</p>
                <p className="text-xs text-slate-600 mb-4">Fii primul — colegii tăi vor putea să se alăture.</p>
                <button onClick={() => setShowCreate(true)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] border"
                  style={{ background: `${meta.color}18`, borderColor: `${meta.color}40`, color: meta.color }}>
                  <Plus className="w-3.5 h-3.5 inline mr-1.5" /> Deschide primul meci
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sportLobbies.map(lobby => (
                  <LobbyCard
                    key={lobby.id}
                    lobby={lobby}
                    sport={sport}
                    currentUserName={user?.name}
                    onJoin={handleJoin}
                    onMemberClick={setProfileView}
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
                  Colegi compatibili
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {aiError
                    ? `Scor calculat local · ${recommendations.length} colegi din companie`
                    : loadingAI
                      ? 'Gemini analizează profilurile...'
                      : backendMatches.length > 0
                        ? `Recomandări personalizate de la Gemini · ${recommendations.length} colegi`
                        : `Compatibilitate calculată pe baza profilului tău`
                  }
                </p>
              </div>
              <button
                onClick={fetchAI}
                disabled={loadingAI}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-40"
              >
                {loadingAI ? '⟳ Analizez…' : '⟳ Reîncarcă'}
              </button>
            </div>

            {loadingAI && (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="rounded-2xl border border-white/8 bg-zinc-900/40 p-4 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-white/5 rounded w-2/3" />
                        <div className="h-2 bg-white/5 rounded w-1/2" />
                        <div className="h-1.5 bg-white/5 rounded w-full mt-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingAI && (
              <div className="flex flex-col gap-3">
                {recommendations.map((rec, i) => (
                  <RecommendationCard
                    key={rec.id ?? rec.name ?? i}
                    profile={rec}
                    score={rec.score}
                    message={rec.message}
                    sport={sport}
                    rank={i}
                    onInvite={(p) => setInvitee(p)}
                    onViewProfile={(p) => setProfileView(p)}
                  />
                ))}
              </div>
            )}

            {!loadingAI && recommendations.length === 0 && (
              <div className="rounded-2xl border border-white/8 bg-zinc-900/40 p-10 text-center">
                <span className="text-4xl block mb-3">🤷</span>
                <p className="text-sm font-semibold text-slate-300 mb-1">Nu am găsit colegi compatibili</p>
                <p className="text-xs text-slate-600">Încearcă să adaugi mai multe sporturi în profilul tău.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {profileView && (
        <ProfileModal
          profile={profileView}
          sport={sport}
          onClose={() => setProfileView(null)}
          onInvite={(p) => setInvitee(p)}
        />
      )}

      {/* Create Lobby Modal */}
      {showCreate && (
        <LobbyModal sport={sport} onClose={() => setShowCreate(false)} onSubmit={handleCreateSubmit} />
      )}

      {/* Invite Modal */}
      {invitee && (
        <LobbyModal sport={sport} invitee={invitee} onClose={() => setInvitee(null)} onSubmit={handleInviteSubmit} />
      )}
    </div>
  )
}
