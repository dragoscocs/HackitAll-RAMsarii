import { createContext, useContext, useState } from 'react'

const MEETING_TYPES = {
  standup:   { label: 'Standup',     color: '#34d399', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-300' },
  planning:  { label: 'Planning',    color: '#818cf8', bg: 'bg-indigo-500/15',  border: 'border-indigo-500/30',  text: 'text-indigo-300'  },
  'one-on-one': { label: '1:1',      color: '#a78bfa', bg: 'bg-violet-500/15',  border: 'border-violet-500/30',  text: 'text-violet-300'  },
  team:      { label: 'Team Sync',   color: '#38bdf8', bg: 'bg-sky-500/15',     border: 'border-sky-500/30',     text: 'text-sky-300'     },
  review:    { label: 'Review',      color: '#fb923c', bg: 'bg-orange-500/15',  border: 'border-orange-500/30',  text: 'text-orange-300'  },
  'all-hands':{ label: 'All Hands',  color: '#f472b6', bg: 'bg-pink-500/15',    border: 'border-pink-500/30',    text: 'text-pink-300'    },
  workshop:  { label: 'Workshop',    color: '#facc15', bg: 'bg-yellow-500/15',  border: 'border-yellow-500/30',  text: 'text-yellow-300'  },
  demo:      { label: 'Demo',        color: '#4ade80', bg: 'bg-green-500/15',   border: 'border-green-500/30',   text: 'text-green-300'   },
}

function buildEvent(base, dayOffset, sh, sm, eh, em, subject, type, organizer) {
  const start = new Date(base)
  start.setDate(start.getDate() + dayOffset)
  start.setHours(sh, sm, 0, 0)
  const end = new Date(base)
  end.setDate(end.getDate() + dayOffset)
  end.setHours(eh, em, 0, 0)
  return { subject, type, organizer, start, end, duration: (eh * 60 + em) - (sh * 60 + sm) }
}

function generateWeekEvents() {
  const today = new Date()
  const monday = new Date(today)
  const dow = today.getDay()
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
  monday.setHours(0, 0, 0, 0)

  const e = (d, sh, sm, eh, em, subj, type, org) =>
    buildEvent(monday, d, sh, sm, eh, em, subj, type, org)

  return [
    // Monday
    e(0, 9,  0, 9, 15, 'Daily Standup — Echipa Retail Banking',  'standup',   'Ana Ionescu'),
    e(0, 9, 30,11,  0, 'Sprint Planning Q2',                     'planning',  'Victor Dumitrescu'),
    e(0,13,  0,13, 30, '1:1 cu Managerul',                       'one-on-one','Cristina Marin'),
    e(0,14,  0,15,  0, 'Sync API Integration — ING Core',        'team',      'Bogdan Popa'),
    e(0,15, 15,16,  0, 'Revizie Documentație GDPR',              'review',    'Legal Team'),

    // Tuesday
    e(1, 9,  0, 9, 15, 'Daily Standup — Echipa Retail Banking',  'standup',   'Ana Ionescu'),
    e(1,10,  0,11, 30, 'Workshop: Digitalizare Procese Interne', 'workshop',  'Innovation Lab'),
    e(1,14,  0,14, 45, 'Review Quarterly OKRs',                  'review',    'Cristina Marin'),
    e(1,15,  0,16,  0, 'Tech Sync — Mobile App',                 'team',      'Radu Georgescu'),
    e(1,16, 30,17, 30, 'All Hands ING România',                  'all-hands', 'Exec Team'),

    // Wednesday
    e(2, 9,  0, 9, 15, 'Daily Standup — Echipa Retail Banking',  'standup',   'Ana Ionescu'),
    e(2,10, 30,11,  0, 'Grooming Sprint Backlog',                'planning',  'Victor Dumitrescu'),
    e(2,11,  0,12,  0, 'Customer Journey Review',                'team',      'UX Team'),
    e(2,13, 30,14,  0, 'Catch-up cu Colegii din Amsterdam',      'one-on-one','Global Team'),

    // Thursday
    e(3, 9,  0, 9, 15, 'Daily Standup — Echipa Retail Banking',  'standup',   'Ana Ionescu'),
    e(3, 9, 30,10, 30, 'Regulatory Compliance Update',           'review',    'Compliance Team'),
    e(3,11,  0,12,  0, 'Product Demo — HomeBank',                'demo',      'Product Team'),
    e(3,13,  0,13, 30, '1:1 cu Managerul',                       'one-on-one','Cristina Marin'),
    e(3,14,  0,15, 30, 'Sprint Retrospective',                   'planning',  'Victor Dumitrescu'),
    e(3,16,  0,17,  0, 'Risk Assessment Q2',                     'review',    'Risk Team'),

    // Friday
    e(4, 9,  0, 9, 15, 'Daily Standup — Echipa Retail Banking',  'standup',   'Ana Ionescu'),
    e(4,10,  0,10, 30, 'Weekly Wrap-up',                         'team',      'Victor Dumitrescu'),
    e(4,11,  0,11, 30, 'Planificare Săptămâna Viitoare',         'planning',  'Cristina Marin'),
  ]
}

function calcMoodScore(events, breaksToday) {
  const today = new Date()
  const todayEvents = events.filter(ev => {
    const d = new Date(ev.start)
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth()
  })

  let score = 80

  const totalMin = todayEvents.reduce((s, ev) => s + ev.duration, 0)
  score -= Math.min(20, Math.floor(totalMin / 30) * 2)

  const sorted = [...todayEvents].sort((a, b) => a.start - b.start)
  for (let i = 1; i < sorted.length; i++) {
    const gap = (sorted[i].start - sorted[i - 1].end) / 60000
    if (gap < 10) score -= 6
    else if (gap < 20) score -= 2
  }

  todayEvents.filter(ev => ['all-hands', 'workshop'].includes(ev.type)).forEach(() => { score -= 4 })
  todayEvents.filter(ev => new Date(ev.end).getHours() >= 17).forEach(() => { score -= 4 })
  todayEvents.filter(ev => ev.type === 'standup').forEach(() => { score += 2 })

  score += breaksToday * 6

  return Math.max(20, Math.min(100, Math.round(score)))
}

function getMoodFactors(events, breaksToday) {
  const today = new Date()
  const todayEvents = events.filter(ev => {
    const d = new Date(ev.start)
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth()
  })

  const totalMin = todayEvents.reduce((s, ev) => s + ev.duration, 0)
  const sorted = [...todayEvents].sort((a, b) => a.start - b.start)
  let consecutive = 0
  for (let i = 1; i < sorted.length; i++) {
    if ((sorted[i].start - sorted[i - 1].end) / 60000 < 10) consecutive++
  }
  const heavy = todayEvents.filter(ev => ['all-hands', 'workshop'].includes(ev.type)).length
  const late  = todayEvents.filter(ev => new Date(ev.end).getHours() >= 17).length

  return [
    { label: 'Ședințe azi',          value: `${(totalMin / 60).toFixed(1)}h`,     delta: -Math.min(20, Math.floor(totalMin / 30) * 2), icon: '📅' },
    { label: 'Înapoi-în-înapoi',     value: `${consecutive} pauze`,               delta: -(consecutive * 4),  icon: '⚡' },
    { label: 'Ședințe grele',        value: `${heavy} sesiuni`,                   delta: -(heavy * 4),        icon: '🏋️' },
    { label: 'Ședințe târzii',       value: `${late} după 17:00`,                 delta: -(late * 4),         icon: '🌙' },
    { label: 'Pauze luate',          value: `${breaksToday} pauze`,               delta: breaksToday * 6,     icon: '🌿' },
  ]
}

function getMoodLabel(score) {
  if (score >= 80) return { text: 'Excelent',    color: 'text-emerald-400' }
  if (score >= 65) return { text: 'Bine',         color: 'text-sky-400'     }
  if (score >= 50) return { text: 'Moderat',      color: 'text-amber-400'   }
  return                   { text: 'Obositor',    color: 'text-red-400'     }
}

function getMoodRecommendation(score, factors) {
  const totalMeetingH = factors[0].delta
  if (score < 50) return 'Ziua ta e destul de intensă. Ia o pauză de 3 minute acum — chiar și o scurtă plimbare îmbunătățește concentrarea cu 20%. Consideră să blochezi timp de focus în calendar.'
  if (score < 65) return 'Ai câteva ședințe înghesuiate. Încearcă să lași 10 minute între ele pentru recuperare mentală. O pauză scurtă de mișcare ar face minuni.'
  if (score >= 80) return 'Zi bine structurată! Continui cu energie bună. Menține ritmul și nu uita să te hidratezi.'
  return 'Zi echilibrată. Ai grijă de pauze regulate și limitează ședințele consecutive.'
}

export const MEETING_TYPES_MAP = MEETING_TYPES

const CalendarContext = createContext(null)

export function CalendarProvider({ children }) {
  const [events]       = useState(generateWeekEvents)
  const [connected,    setConnected]    = useState(false)
  const [breaksToday,  setBreaksToday]  = useState(1)

  const moodScore      = calcMoodScore(events, breaksToday)
  const moodFactors    = getMoodFactors(events, breaksToday)
  const moodLabel      = getMoodLabel(moodScore)
  const moodReco       = getMoodRecommendation(moodScore, moodFactors)

  const connectMicrosoft = () => setConnected(true)
  const recordBreak      = () => setBreaksToday(p => p + 1)

  return (
    <CalendarContext.Provider value={{
      events, connected, connectMicrosoft,
      moodScore, moodFactors, moodLabel, moodReco,
      breaksToday, recordBreak,
    }}>
      {children}
    </CalendarContext.Provider>
  )
}

export const useCalendar = () => useContext(CalendarContext)
