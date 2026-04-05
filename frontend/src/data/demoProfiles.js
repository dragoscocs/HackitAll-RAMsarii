export const DEMO_PROFILES = [
  {
    id: 101, name: 'Andrei Popescu', age: 28, gender: 'M',
    city: 'București', initials: 'AP', gradient: 'from-violet-500 to-purple-700',
    role: 'Software Engineer', department: 'Engineering',
    sports: ['Padel', 'Tennis', 'Squash'],
    sportLevels: { Padel: 'Intermediar', Tennis: 'Avansat', Squash: 'Intermediar' },
    bio: 'Joc tenis de 5 ani și am descoperit padelul recent. Prefer meciuri competitive dar cu energie bună.',
    availability: ['Luni seara', 'Joi seara', 'Weekend dimineață'],
    matchesPlayed: 23, rating: 4.8,
  },
  {
    id: 102, name: 'Maria Ionescu', age: 32, gender: 'F',
    city: 'București', initials: 'MI', gradient: 'from-pink-500 to-rose-700',
    role: 'Product Manager', department: 'Product',
    sports: ['Yoga', 'Running', 'Cycling'],
    sportLevels: { Yoga: 'Avansat', Running: 'Intermediar', Cycling: 'Beginner' },
    bio: 'Alerg semimaratoane și fac yoga zilnic. Caut colegi pentru antrenamente de dimineață sau în pauza de prânz.',
    availability: ['Luni dimineață', 'Miercuri dimineață', 'Sâmbătă'],
    matchesPlayed: 31, rating: 4.9,
  },
  {
    id: 103, name: 'Bogdan Dumitrescu', age: 25, gender: 'M',
    city: 'București', initials: 'BD', gradient: 'from-green-500 to-emerald-700',
    role: 'Data Analyst', department: 'Analytics',
    sports: ['Football', 'Basketball', 'Running'],
    sportLevels: { Football: 'Avansat', Basketball: 'Intermediar', Running: 'Beginner' },
    bio: 'Pasionat de fotbal de când eram mic. Organizez meciuri de 5vs5 în fiecare vineri seara pe Stadionul Iolanda.',
    availability: ['Vineri seara', 'Sâmbătă', 'Duminică'],
    matchesPlayed: 42, rating: 4.7,
  },
  {
    id: 104, name: 'Elena Stancu', age: 29, gender: 'F',
    city: 'București', initials: 'ES', gradient: 'from-emerald-500 to-teal-700',
    role: 'UX Designer', department: 'Design',
    sports: ['Ping Pong', 'Badminton', 'Yoga'],
    sportLevels: { 'Ping Pong': 'Avansat', Badminton: 'Intermediar', Yoga: 'Intermediar' },
    bio: 'Campioană la ping pong pe departament 3 ani la rând. Provocarea e oricând binevenită — serios.',
    availability: ['Prânz', 'Marți seara', 'Joi seara'],
    matchesPlayed: 58, rating: 4.9,
  },
  {
    id: 105, name: 'Radu Mihalcea', age: 35, gender: 'M',
    city: 'București', initials: 'RM', gradient: 'from-orange-500 to-amber-700',
    role: 'Engineering Lead', department: 'Engineering',
    sports: ['Squash', 'Padel', 'Swimming'],
    sportLevels: { Squash: 'Avansat', Padel: 'Intermediar', Swimming: 'Intermediar' },
    bio: 'Squash înainte de muncă, în fiecare dimineață. Nu există zi proastă după 45 de minute pe teren.',
    availability: ['Dimineți (7:00-8:30)', 'Weekend'],
    matchesPlayed: 67, rating: 4.6,
  },
  {
    id: 106, name: 'Cristina Popa', age: 27, gender: 'F',
    city: 'București', initials: 'CP', gradient: 'from-red-500 to-pink-700',
    role: 'Marketing Specialist', department: 'Marketing',
    sports: ['Running', 'Hiking', 'Cycling'],
    sportLevels: { Running: 'Avansat', Hiking: 'Intermediar', Cycling: 'Intermediar' },
    bio: 'Îmi place să explorez trasee noi. Luna trecută am terminat maratonul din Sibiu — 3h 47min.',
    availability: ['Dimineți', 'Weekend'],
    matchesPlayed: 19, rating: 4.8,
  },
  {
    id: 107, name: 'Victor Nica', age: 31, gender: 'M',
    city: 'București', initials: 'VN', gradient: 'from-amber-500 to-yellow-700',
    role: 'Backend Developer', department: 'Engineering',
    sports: ['Tennis', 'Squash', 'Badminton'],
    sportLevels: { Tennis: 'Intermediar', Squash: 'Avansat', Badminton: 'Beginner' },
    bio: 'Intermediar la tenis, avansat la squash. Meciuri scurte și intense în pauza de prânz — locul ideal.',
    availability: ['Prânz', 'Miercuri seara', 'Sâmbătă dimineață'],
    matchesPlayed: 44, rating: 4.5,
  },
  {
    id: 108, name: 'Ana Constantin', age: 24, gender: 'F',
    city: 'București', initials: 'AC', gradient: 'from-sky-500 to-blue-700',
    role: 'HR Specialist', department: 'HR',
    sports: ['Volleyball', 'Badminton', 'Running'],
    sportLevels: { Volleyball: 'Intermediar', Badminton: 'Beginner', Running: 'Intermediar' },
    bio: 'Am jucat volei în liceu și vreau să revin la formă. Multă energie și mereu bună dispoziție!',
    availability: ['Luni seara', 'Miercuri seara', 'Sâmbătă'],
    matchesPlayed: 12, rating: 4.9,
  },
  {
    id: 109, name: 'Sorin Munteanu', age: 38, gender: 'M',
    city: 'București', initials: 'SM', gradient: 'from-yellow-500 to-orange-600',
    role: 'Senior Architect', department: 'Engineering',
    sports: ['Cycling', 'Running', 'Swimming'],
    sportLevels: { Cycling: 'Avansat', Running: 'Avansat', Swimming: 'Intermediar' },
    bio: 'Triatlet amator. 50km pe bicicletă în fiecare weekend. Caut colegi pentru group rides și alergări.',
    availability: ['Sâmbătă dimineață', 'Duminică dimineață'],
    matchesPlayed: 87, rating: 4.7,
  },
  {
    id: 110, name: 'Diana Pop', age: 26, gender: 'F',
    city: 'București', initials: 'DP', gradient: 'from-fuchsia-500 to-purple-700',
    role: 'Content Creator', department: 'Marketing',
    sports: ['Yoga', 'Swimming', 'Running'],
    sportLevels: { Yoga: 'Avansat', Swimming: 'Intermediar', Running: 'Beginner' },
    bio: 'Instructor de yoga certificat. Organizez sesiuni pe terasa biroului în pauzele de prânz — toți sunt bineveniți.',
    availability: ['Prânz', 'Luni seara', 'Vineri seara'],
    matchesPlayed: 26, rating: 5.0,
  },
  {
    id: 111, name: 'Alexandru Dima', age: 22, gender: 'M',
    city: 'București', initials: 'AD', gradient: 'from-indigo-500 to-blue-700',
    role: 'Junior Developer', department: 'Engineering',
    sports: ['Basketball', 'Football', 'CrossFit'],
    sportLevels: { Basketball: 'Intermediar', Football: 'Intermediar', CrossFit: 'Beginner' },
    bio: 'Proaspăt angajat, full of energy. Baschet marți și joi după program — mai vin și alții?',
    availability: ['Marți seara', 'Joi seara', 'Weekend'],
    matchesPlayed: 8, rating: 4.6,
  },
  {
    id: 112, name: 'Teodora Iancu', age: 34, gender: 'F',
    city: 'București', initials: 'TI', gradient: 'from-teal-500 to-cyan-700',
    role: 'Finance Manager', department: 'Finance',
    sports: ['Swimming', 'Running', 'Yoga'],
    sportLevels: { Swimming: 'Avansat', Running: 'Intermediar', Yoga: 'Intermediar' },
    bio: 'Înot de performanță în trecut, acum pentru relaxare. Alergări în Parcul Herăstrău sâmbăta dimineața.',
    availability: ['Marți dimineață', 'Joi dimineață', 'Duminică'],
    matchesPlayed: 35, rating: 4.8,
  },
  {
    id: 113, name: 'Gabriel Vlad', age: 29, gender: 'M',
    city: 'București', initials: 'GV', gradient: 'from-red-600 to-orange-700',
    role: 'DevOps Engineer', department: 'Engineering',
    sports: ['CrossFit', 'Gym', 'Football'],
    sportLevels: { CrossFit: 'Avansat', Gym: 'Avansat', Football: 'Intermediar' },
    bio: 'CrossFit de 3 ori pe săptămână, fără compromisuri. Caut oameni motivați pentru antrenamente solide.',
    availability: ['Dimineți', 'Miercuri seara', 'Sâmbătă'],
    matchesPlayed: 51, rating: 4.4,
  },
  {
    id: 114, name: 'Ioana Luca', age: 30, gender: 'F',
    city: 'București', initials: 'IL', gradient: 'from-cyan-500 to-sky-700',
    role: 'Project Manager', department: 'Operations',
    sports: ['Ski', 'Hiking', 'Cycling'],
    sportLevels: { Ski: 'Avansat', Hiking: 'Avansat', Cycling: 'Intermediar' },
    bio: 'Pasionată de munte și natură. Organizez weekenduri la Sinaia și trasee pe Bucegi. Mereu mai mult de 10km.',
    availability: ['Weekenduri', 'Concedii'],
    matchesPlayed: 29, rating: 4.9,
  },
  {
    id: 115, name: 'Mihai Mureșan', age: 33, gender: 'M',
    city: 'București', initials: 'MM', gradient: 'from-lime-500 to-green-700',
    role: 'Product Designer', department: 'Design',
    sports: ['Tennis', 'Padel', 'Basketball'],
    sportLevels: { Tennis: 'Avansat', Padel: 'Intermediar', Basketball: 'Intermediar' },
    bio: 'Am jucat tenis în liga universitară, acum mai relaxat. Padelul e noua mea obsesie de weekend.',
    availability: ['Miercuri seara', 'Vineri seara', 'Sâmbătă dimineață'],
    matchesPlayed: 48, rating: 4.7,
  },
]

export const SPORT_GROUPS = {
  racket:  ['Padel', 'Tennis', 'Ping Pong', 'Badminton', 'Squash'],
  team:    ['Football', 'Basketball', 'Volleyball'],
  outdoor: ['Running', 'Cycling', 'Ski', 'Swimming', 'Hiking'],
  wellness:['Yoga', 'Gym', 'CrossFit'],
}

export function getSportGroup(sport) {
  return Object.entries(SPORT_GROUPS).find(([, s]) => s.includes(sport))?.[0] ?? 'other'
}

export function computeCompatibility(currentUser, profile, targetSport) {
  let score = 0
  const userSports = currentUser?.preferredSports ?? []
  const userCity   = currentUser?.city ?? ''
  const userAge    = currentUser?.age ?? null

  const exact = profile.sports.filter(s => userSports.includes(s)).length
  score += Math.min(exact * 18, 45)

  if (profile.sports.includes(targetSport)) score += 10

  const userGroups = new Set(userSports.map(getSportGroup))
  const groupHits  = profile.sports.filter(s => userGroups.has(getSportGroup(s)) && !userSports.includes(s)).length
  score += Math.min(groupHits * 6, 15)

  if (userCity && profile.city.toLowerCase() === userCity.toLowerCase()) score += 10

  if (userAge && profile.age) {
    const diff = Math.abs(profile.age - userAge)
    if (diff <= 3) score += 10
    else if (diff <= 6) score += 7
    else if (diff <= 10) score += 4
  }

  return Math.min(Math.max(score, 15), 98)
}

export function compatibilityMessage(currentUser, profile, targetSport, score) {
  const first  = profile.name.split(' ')[0]
  const level  = profile.sportLevels?.[targetSport]
  const shared = profile.sports.filter(s => (currentUser?.preferredSports ?? []).includes(s))
  const group  = getSportGroup(targetSport)

  if (score >= 80) {
    if (shared.length >= 2)
      return `${first} și cu tine aveți ${shared.length} sporturi comune — meci garantat de calitate.`
    if (level)
      return `${first} joacă ${targetSport} la nivel ${level.toLowerCase()} — probabil cel mai bun partener disponibil acum.`
    return `Profilul sportiv al lui ${first} se potrivește excelent cu al tău.`
  }
  if (score >= 60) {
    if (profile.sports.includes(targetSport))
      return `${first} joacă ${targetSport} activ și caută meci — nivel și disponibilitate compatibile.`
    return `${first} practică sporturi similare (${profile.sports[0]}) — reflexele și coordonarea se transferă bine.`
  }
  if (score >= 40)
    return `${first} e activ și cu energie bună — un partener solid chiar dacă sporturile diferă puțin.`
  return `${first} e deschis la sporturi noi și ar putea fi un partener de antrenament interesant.`
}

export function resolveProfile(playerName) {
  return DEMO_PROFILES.find(p => p.name === playerName) ?? {
    name: playerName,
    initials: playerName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    gradient: 'from-slate-500 to-zinc-700',
    age: null, gender: null, city: null, role: null, bio: null,
    sports: [], sportLevels: {}, availability: [], matchesPlayed: 0, rating: null,
  }
}
