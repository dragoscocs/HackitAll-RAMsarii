import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'

const SportLobbyContext = createContext(null)

const LOBBIES_KEY = 'syncfit_lobbies_v3'
const INVITES_KEY = 'syncfit_invites_v3'

function nanoid() {
  return Math.random().toString(36).slice(2, 10)
}

function daysFromNow(n) {
  const d = new Date(Date.now() + n * 86400000)
  return d.toISOString().split('T')[0]
}

const SEED_LOBBIES = [
  {
    id: 'seed-1', sport: 'Padel', creatorId: 101, creatorName: 'Andrei Popescu',
    creatorInitials: 'AP', creatorGradient: 'from-violet-500 to-purple-700',
    date: daysFromNow(1), time: '18:30', location: 'Terenul Floreasca, Bd. Barbu Văcărescu 56',
    maxPlayers: 4, currentPlayers: ['Andrei Popescu', 'Mihai Mureșan'], status: 'open',
    notes: 'Nivel intermediar. Veniți cu rachete proprii!',
  },
  {
    id: 'seed-2', sport: 'Tennis', creatorId: 107, creatorName: 'Victor Nica',
    creatorInitials: 'VN', creatorGradient: 'from-amber-500 to-yellow-700',
    date: daysFromNow(0), time: '07:30', location: 'Parcul IOR, Terenul 3',
    maxPlayers: 2, currentPlayers: ['Victor Nica'], status: 'open',
    notes: 'Meci scurt de dimineață, înainte de stand-up.',
  },
  {
    id: 'seed-3', sport: 'Football', creatorId: 103, creatorName: 'Bogdan Dumitrescu',
    creatorInitials: 'BD', creatorGradient: 'from-green-500 to-emerald-700',
    date: daysFromNow(2), time: '19:00', location: 'Stadionul Iolanda Balaș Soter',
    maxPlayers: 10, currentPlayers: ['Bogdan Dumitrescu', 'Alexandru Dima', 'Gabriel Vlad', 'Radu Mihalcea'], status: 'open',
    notes: 'Meci de 5vs5. Veniți în echipament sportiv.',
  },
  {
    id: 'seed-4', sport: 'Ping Pong', creatorId: 104, creatorName: 'Elena Stancu',
    creatorInitials: 'ES', creatorGradient: 'from-emerald-500 to-teal-700',
    date: daysFromNow(0), time: '13:00', location: 'Sala de sport corporativă, Etaj 2',
    maxPlayers: 2, currentPlayers: ['Elena Stancu'], status: 'open',
    notes: 'Pauza de prânz. Rapid, ușor, amuzant.',
  },
  {
    id: 'seed-5', sport: 'Running', creatorId: 106, creatorName: 'Cristina Popa',
    creatorInitials: 'CP', creatorGradient: 'from-red-500 to-pink-700',
    date: daysFromNow(3), time: '06:30', location: 'Parcul Herăstrău, Intrarea Nordului',
    maxPlayers: 6, currentPlayers: ['Cristina Popa', 'Maria Ionescu'], status: 'open',
    notes: 'Alergare 5km. Ritm moderat, conversație binevenită.',
  },
  {
    id: 'seed-6', sport: 'Badminton', creatorId: 105, creatorName: 'Radu Mihalcea',
    creatorInitials: 'RM', creatorGradient: 'from-orange-500 to-amber-700',
    date: daysFromNow(1), time: '20:00', location: 'Complexul Sportiv Titan',
    maxPlayers: 4, currentPlayers: ['Radu Mihalcea', 'Ana Constantin'], status: 'open',
    notes: 'Dublu mixt. Orice nivel e bun venit.',
  },
  {
    id: 'seed-7', sport: 'Yoga', creatorId: 110, creatorName: 'Diana Pop',
    creatorInitials: 'DP', creatorGradient: 'from-fuchsia-500 to-purple-700',
    date: daysFromNow(1), time: '12:00', location: 'Terasa biroului, Etaj 10',
    maxPlayers: 8, currentPlayers: ['Diana Pop', 'Maria Ionescu', 'Teodora Iancu'], status: 'open',
    notes: 'Yoga pentru toți. Aduceți saltea dacă aveți.',
  },
  {
    id: 'seed-8', sport: 'Cycling', creatorId: 109, creatorName: 'Sorin Munteanu',
    creatorInitials: 'SM', creatorGradient: 'from-yellow-500 to-orange-600',
    date: daysFromNow(4), time: '08:00', location: 'Parcul Tineretului, Intrarea Toporaș',
    maxPlayers: 8, currentPlayers: ['Sorin Munteanu', 'Ioana Luca'], status: 'open',
    notes: 'Traseu 20km pe malul lacului. Cască obligatorie.',
  },
  {
    id: 'seed-9', sport: 'Squash', creatorId: 105, creatorName: 'Radu Mihalcea',
    creatorInitials: 'RM', creatorGradient: 'from-orange-500 to-amber-700',
    date: daysFromNow(2), time: '17:00', location: 'World Class Floreasca',
    maxPlayers: 2, currentPlayers: ['Radu Mihalcea'], status: 'open',
    notes: 'Nivel avansat. Rezervare teren deja făcută.',
  },
]

export function SportLobbyProvider({ children }) {
  const { user } = useAuth()

  const [lobbies, setLobbies] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem(LOBBIES_KEY))
      return s?.length ? s : SEED_LOBBIES
    } catch { return SEED_LOBBIES }
  })

  const [invitations, setInvitations] = useState(() => {
    try { return JSON.parse(localStorage.getItem(INVITES_KEY)) || [] }
    catch { return [] }
  })

  useEffect(() => {
    if (!user?.name) return
    const hasIncoming = invitations.some(i => i.toName === user.name && i.status === 'pending')
    if (!hasIncoming && invitations.length === 0) {
      const seedInvite = {
        id: `invite-seed-${nanoid()}`,
        lobbyId: 'seed-1',
        fromUserId: 101,
        fromName: 'Andrei Popescu',
        toName: user.name,
        sport: 'Padel',
        date: daysFromNow(1),
        time: '18:30',
        location: 'Terenul Floreasca, Bd. Barbu Văcărescu 56',
        status: 'pending',
        message: 'Salut! Jucăm un meci de padel mâine seară. Avem loc pentru încă 2 persoane — vii?',
      }
      const updated = [seedInvite]
      setInvitations(updated)
      localStorage.setItem(INVITES_KEY, JSON.stringify(updated))
    }
  }, [user?.name])

  const _saveLobbies = (l) => {
    setLobbies(l)
    localStorage.setItem(LOBBIES_KEY, JSON.stringify(l))
  }
  const _saveInvitations = (inv) => {
    setInvitations(inv)
    localStorage.setItem(INVITES_KEY, JSON.stringify(inv))
  }

  const createLobby = useCallback((data) => {
    const lobby = {
      id: `lobby-${nanoid()}`,
      sport: data.sport,
      creatorId: user?.userId,
      creatorName: user?.name ?? 'Tu',
      creatorInitials: (user?.name ?? 'TU').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      creatorGradient: 'from-indigo-500 to-violet-700',
      date: data.date,
      time: data.time,
      location: data.location,
      maxPlayers: Number(data.maxPlayers) || 4,
      currentPlayers: [user?.name ?? 'Tu'],
      status: 'open',
      notes: data.notes ?? '',
      isMine: true,
    }
    _saveLobbies([lobby, ...lobbies])
    return lobby
  }, [user, lobbies])

  const joinLobby = useCallback((lobbyId) => {
    const userName = user?.name
    if (!userName) return
    const updated = lobbies.map(l => {
      if (l.id !== lobbyId) return l
      if ((l.currentPlayers ?? []).includes(userName)) return l
      const players = [...(l.currentPlayers ?? []), userName]
      const isFull  = players.length >= l.maxPlayers
      return { ...l, currentPlayers: players, status: isFull ? 'full' : 'open' }
    })
    _saveLobbies(updated)
  }, [lobbies, user])

  const inviteToLobby = useCallback((lobbyData, toMatch) => {
    const lobby = {
      id: `lobby-${nanoid()}`,
      sport: lobbyData.sport,
      creatorId: user?.userId,
      creatorName: user?.name ?? 'Tu',
      creatorInitials: (user?.name ?? 'TU').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      creatorGradient: 'from-indigo-500 to-violet-700',
      date: lobbyData.date,
      time: lobbyData.time,
      location: lobbyData.location,
      maxPlayers: Number(lobbyData.maxPlayers) || 4,
      currentPlayers: [user?.name ?? 'Tu'],
      status: 'pending_invite',
      invitedUser: toMatch.name,
      notes: lobbyData.notes ?? '',
      isMine: true,
    }
    const invitation = {
      id: `invite-${nanoid()}`,
      lobbyId: lobby.id,
      fromUserId: user?.userId,
      fromName: user?.name ?? 'Tu',
      toName: toMatch.name,
      sport: lobbyData.sport,
      date: lobbyData.date,
      time: lobbyData.time,
      location: lobbyData.location,
      status: 'pending',
      message: lobbyData.message ?? '',
    }
    _saveLobbies([lobby, ...lobbies])
    _saveInvitations([invitation, ...invitations])
    return { lobby, invitation }
  }, [user, lobbies, invitations])

  const acceptInvitation = useCallback((invId) => {
    const inv = invitations.find(i => i.id === invId)
    if (!inv) return
    _saveInvitations(invitations.map(i => i.id === invId ? { ...i, status: 'accepted' } : i))
    _saveLobbies(lobbies.map(l =>
      l.id === inv.lobbyId
        ? { ...l, status: 'open', currentPlayers: [...(l.currentPlayers || []), user?.name] }
        : l
    ))
  }, [invitations, lobbies, user])

  const declineInvitation = useCallback((invId) => {
    const inv = invitations.find(i => i.id === invId)
    if (!inv) return
    _saveInvitations(invitations.map(i => i.id === invId ? { ...i, status: 'declined' } : i))
    _saveLobbies(lobbies.map(l =>
      l.id === inv.lobbyId ? { ...l, status: 'open', invitedUser: null } : l
    ))
  }, [invitations, lobbies])

  const myPendingInvitations = invitations.filter(
    i => i.status === 'pending' && i.toName === user?.name
  )
  const mySentInvitations = invitations.filter(
    i => i.fromName === user?.name && i.status === 'pending'
  )

  return (
    <SportLobbyContext.Provider value={{
      lobbies, invitations,
      myPendingInvitations, mySentInvitations,
      createLobby, joinLobby, inviteToLobby, acceptInvitation, declineInvitation,
    }}>
      {children}
    </SportLobbyContext.Provider>
  )
}

export const useSportLobby = () => useContext(SportLobbyContext)
