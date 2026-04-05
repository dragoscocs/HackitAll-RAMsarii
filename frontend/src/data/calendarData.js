// 4-week mock calendar data for specific users
// Week offsets: 0 = current week (starting Monday), 1, 2, 3

function ev(monday, weekOffset, dayOfWeek, sh, sm, eh, em, subject, type, organizer, isOnline = false) {
  const start = new Date(monday)
  start.setDate(start.getDate() + weekOffset * 7 + dayOfWeek)
  start.setHours(sh, sm, 0, 0)
  const end = new Date(monday)
  end.setDate(end.getDate() + weekOffset * 7 + dayOfWeek)
  end.setHours(eh, em, 0, 0)
  return { subject, type, organizer, start, end, duration: (eh * 60 + em) - (sh * 60 + sm), isOnline }
}

export function generateCalendarForUser(email, monday) {
  const e = (week, day, sh, sm, eh, em, subj, type, org, online = false) =>
    ev(monday, week, day, sh, sm, eh, em, subj, type, org, online)

  if (email === 'ana@ecosync.ro') return generateAna(e)
  if (email === 'andrei@ecosync.ro') return generateAndrei(e)
  if (email === 'gigel@ecosync.ro') return generateGigel(e)
  return generateDefault(e)
}

// ─────────────────────────────────────────────────────────────────────────────
// ANA — 9:00-17:00, Product/UX/Banking team
// ─────────────────────────────────────────────────────────────────────────────
function generateAna(e) {
  return [
    // ── WEEK 0 ──────────────────────────────────────────────────────────────
    // Monday - Testing: Occupied at 12:30. 
    // Gaps: 9:15-9:30, 11:00-12:00, 13:00-14:00. 
    // Lunch targets 12:30, so it should pick the 11:00-12:00 gap (ending at 12:00).
    e(0,0, 9, 0, 9,15, 'Daily Check-in — Echipa Produs',        'standup',    'Ana Ionescu'),
    e(0,0, 9,30,11, 0, 'Sprint Planning Q2 — Iterație 3',      'planning',   'Victor Dumitrescu'),
    e(0,0,12, 0,13, 0, 'Prânz de Afaceri — Parteneri ING',     'team',       'Cristina Marin'),
    e(0,0,14, 0,15, 0, 'Team Sync — Roadmap Produs',           'team',       'Bogdan Popa'),
    e(0,0,15,15,16, 0, 'Revizie Documentație GDPR',            'review',     'Legal Team'),
    // Tuesday - Testing: Marathon meeting 10:30-16:00. 
    // This blocks the entire 10:30-15:30 window. Lunch must move to 16:00.
    e(0,1, 9, 0, 9,15, 'Daily Check-in — Echipa Produs',        'standup',    'Ana Ionescu'),
    e(0,1, 9,30,10,30, 'Recenzie Design Sisteme',              'review',     'Design Team'),
    e(0,1,10,30,16, 0, 'MARATON: Planificare Strategică Q3',   'workshop',   'Management Team'),
    e(0,1,16,30,17, 0, 'Wrap-up Maraton',                      'team',       'Victor Dumitrescu'),
    // Wednesday
    e(0,2, 9, 0, 9,15, 'Daily Check-in — Echipa Produs',        'standup',    'Ana Ionescu'),
    e(0,2,10,30,11,30, 'Grooming Sprint Backlog',              'planning',   'Victor Dumitrescu'),
    e(0,2,11, 0,12, 0, 'Customer Journey Review — ING Pay',    'team',       'UX Team'),
    e(0,2,13,30,14, 0, 'Catch-up cu echipa Amsterdam',         'one-on-one', 'Global Team', true),
    e(0,2,15, 0,16, 0, 'Design Review — Componente UI',        'review',     'Design System Team'),
    // Thursday
    e(0,3, 9, 0, 9,15, 'Daily Check-in — Echipa Produs',        'standup',    'Ana Ionescu'),
    e(0,3, 9,30,10,30, 'Regulatory Compliance Update',         'review',     'Compliance Team'),
    e(0,3,11, 0,12, 0, 'Product Demo — HomeBank v3',           'demo',       'Product Team'),
    e(0,3,13, 0,13,30, '1:1 cu Managerul',                     'one-on-one', 'Cristina Marin'),
    e(0,3,14, 0,15,30, 'Sprint Retrospective — iterație 2',    'planning',   'Victor Dumitrescu'),
    e(0,3,16, 0,17, 0, 'Risk Assessment Q2',                   'review',     'Risk Team'),
    // Friday
    e(0,4, 9, 0, 9,15, 'Daily Check-in — Echipa Produs',        'standup',    'Ana Ionescu'),
    e(0,4, 9,30,10, 0, 'Weekly Wrap-up',                       'team',       'Victor Dumitrescu'),
    e(0,4,11, 0,11,30, 'Planificare Săptămâna Viitoare',       'planning',   'Cristina Marin'),

    // ── WEEK 1 ──────────────────────────────────────────────────────────────
    // Monday
    e(1,0, 9, 0, 9,15, 'Daily Check-in — Echipa Produs',        'standup',    'Ana Ionescu'),
    e(1,0, 9, 30, 10, 30, 'Refinement Sprint Backlog',            'planning',   'Victor Dumitrescu'),
    e(1,0, 12, 15, 13, 0, 'Sync Echipa Amsterdam',                'one-on-one', 'Global Team', true),
    e(1,0, 14, 0, 15, 0, 'Team Sync — Prioritizare Features',    'team',       'Bogdan Popa'),
    e(1,0,15,30,16,30, 'Accessibility Review — WCAG 2.2',      'review',     'Design Team'),
    // Tuesday
    e(1,1, 9, 0, 9,15, 'Daily Check-in — Echipa Produs',        'standup',    'Ana Ionescu'),
    e(1,1, 9,30,11, 0, 'Workshop: Jobs-to-be-Done Framework',  'workshop',   'Product Strategy'),
    e(1,1,13, 0,13,30, '1:1 cu Managerul',                     'one-on-one', 'Cristina Marin'),
    e(1,1,14,30,15,30, 'Sync Parteneriate API',                'team',       'Partnerships Team', true),
    // Wednesday — overlapping meetings
    e(1,2, 9, 0, 9,15, 'Daily Check-in — Echipa Produs',        'standup',    'Ana Ionescu'),
    e(1,2,10,30,11,30, 'Grooming Sprint Backlog',              'planning',   'Victor Dumitrescu'),
    e(1,2, 11, 0, 12, 0, 'Customer Journey Review — Cards',      'team',       'UX Team'),
    e(1,2, 12, 15, 13, 15, 'Feedback Sesion — Architecture',      'review',     'Engineering Lead'),
    e(1,2, 13, 30, 14, 0, 'Sync cu echipa Amsterdam',             'one-on-one', 'Global Team', true),
    e(1,2,15, 0,16, 0, 'Product Metrics Review',               'review',     'Analytics Team'),
    // Thursday
    e(1,3, 9, 0, 9,15, 'Daily Check-in — Echipa Produs',        'standup',    'Ana Ionescu'),
    e(1,3,10, 0,11, 0, 'User Testing Session — ING Pay',       'demo',       'UX Research'),
    e(1,3,13, 0,13,30, '1:1 cu Managerul',                     'one-on-one', 'Cristina Marin'),
    e(1,3,15, 0,16,30, 'Sprint Retrospective — iterație 3',    'planning',   'Victor Dumitrescu'),
    // Friday
    e(1,4, 9, 0, 9,15, 'Daily Check-in — Echipa Produs',        'standup',    'Ana Ionescu'),
    e(1,4, 9,30,10, 0, 'Weekly Wrap-up',                       'team',       'Victor Dumitrescu'),
    e(1,4,11, 0,11,30, 'Planificare Săptămâna Viitoare',       'planning',   'Cristina Marin'),
    e(1,4,14, 0,15, 0, 'Retrospective Notes & Actions',        'review',     'Echipa Produs'),

    // ── WEEK 2 ──────────────────────────────────────────────────────────────
    // Monday
    e(2,0, 9, 0, 9,15, 'Daily Check-in — Echipa Produs',        'standup',    'Ana Ionescu'),
    e(2,0, 9, 30, 11, 0, 'Sprint Planning Q2 — Iterație 4',      'planning',   'Victor Dumitrescu'),
    e(2,0, 12, 0, 13, 0, 'Alignment: Marketing Roadmap',          'team',       'Marketing Team'),
    e(2,0, 13, 15, 13, 45, '1:1 cu Managerul',                     'one-on-one', 'Cristina Marin'),
    e(2,0,14, 0,15, 0, 'Team Sync — Obiective Trimestrul III', 'team',       'Bogdan Popa'),
    // Tuesday
    e(2,1, 9, 0, 9,15, 'Daily Check-in — Echipa Produs',        'standup',    'Ana Ionescu'),
    e(2,1, 9,30,11, 0, 'Workshop: Prototipare Rapidă',         'workshop',   'Innovation Lab'),
    e(2,1,13, 0,13,30, '1:1 cu Managerul',                     'one-on-one', 'Cristina Marin'),
    e(2,1,14, 0,15, 0, 'Review: Flux de Onboarding',           'review',     'UX Team'),
    e(2,1,16, 0,17, 0, 'All Hands ING România — Q2',           'all-hands',  'Exec Team'),
    // Wednesday
    e(2,2, 9, 0, 9,15, 'Daily Check-in — Echipa Produs',        'standup',    'Ana Ionescu'),
    e(2,2,10, 0,11, 0, 'Architecture Review — Microservicii',  'review',     'Engineering Lead'),
    e(2,2, 11, 30, 12, 0, 'Grooming Sprint Backlog',              'planning',   'Victor Dumitrescu'),
    e(2,2, 12, 15, 13, 15, 'Architecture Deep-Dive',              'review',     'Tech Council'),
    e(2,2, 13, 30, 14, 30, 'Catch-up cu echipa Amsterdam',         'one-on-one', 'Global Team', true),
    e(2,2,15,30,16,30, 'Feedback Session — Design Tokens',     'review',     'Design System'),
    // Thursday
    e(2,3, 9, 0, 9,15, 'Daily Check-in — Echipa Produs',        'standup',    'Ana Ionescu'),
    e(2,3, 9,30,10,30, 'Compliance Check — PSD2',              'review',     'Compliance Team'),
    e(2,3,11, 0,12, 0, 'Product Demo — Funcții Noi Conturi',   'demo',       'Product Team'),
    e(2,3,13, 0,13,30, '1:1 cu Managerul',                     'one-on-one', 'Cristina Marin'),
    e(2,3,14, 0,15,30, 'Sprint Retrospective — iterație 4',    'planning',   'Victor Dumitrescu'),
    e(2,3,16, 0,17, 0, 'Security Review — Autentificare',      'review',     'Security Team'),
    // Friday
    e(2,4, 9, 0, 9,15, 'Daily Check-in — Echipa Produs',        'standup',    'Ana Ionescu'),
    e(2,4, 9,30,10, 0, 'Weekly Wrap-up',                       'team',       'Victor Dumitrescu'),
    e(2,4,11, 0,11,30, 'Planificare Săptămâna Viitoare',       'planning',   'Cristina Marin'),

    // ── WEEK 3 ──────────────────────────────────────────────────────────────
    // Monday
    e(3,0, 9, 0, 9,15, 'Daily Check-in — Echipa Produs',        'standup',    'Ana Ionescu'),
    e(3,0, 9, 30, 10, 30, 'Refinement Sprint Backlog',            'planning',   'Victor Dumitrescu'),
    e(3,0, 12, 0, 13, 0, 'Risk Assessment: Release Candidate',    'review',     'Security Team'),
    e(3,0, 13, 15, 13, 45, '1:1 cu Managerul',                     'one-on-one', 'Cristina Marin'),
    e(3,0,14, 0,15, 0, 'Team Sync — Pregătire Release',        'team',       'Bogdan Popa'),
    e(3,0,15,30,16,30, 'Review Documentație Tehnică',          'review',     'Engineering Lead'),
    // Tuesday
    e(3,1, 9, 0, 9,15, 'Daily Check-in — Echipa Produs',        'standup',    'Ana Ionescu'),
    e(3,1,10, 0,11,30, 'Workshop: A/B Testing Strategii',      'workshop',   'Growth Team'),
    e(3,1,13, 0,13,30, '1:1 cu Managerul',                     'one-on-one', 'Cristina Marin'),
    e(3,1,14,30,15,30, 'Sync cu echipa de Marketing',          'team',       'Marketing Team'),
    // Wednesday
    e(3,2, 9, 0, 9,15, 'Daily Check-in — Echipa Produs',        'standup',    'Ana Ionescu'),
    e(3,2,10,30,11,30, 'Grooming Sprint Backlog',              'planning',   'Victor Dumitrescu'),
    e(3,2, 11, 0, 12, 0, 'Customer Journey Review — Credite',    'team',       'UX Team'),
    e(3,2, 12, 30, 13, 30, 'Quarterly Results Preview',            'review',     'Exec Team'),
    e(3,2, 13, 45, 14, 45, 'Catch-up cu echipa Amsterdam',         'one-on-one', 'Global Team', true),
    e(3,2,15, 0,16, 0, 'Release Readiness Review',             'review',     'Release Team'),
    // Thursday — back-to-back meetings 14:00-17:00
    e(3,3, 9, 0, 9,15, 'Daily Check-in — Echipa Produs',        'standup',    'Ana Ionescu'),
    e(3,3, 9,30,10,30, 'Compliance Final Check',               'review',     'Compliance Team'),
    e(3,3,11, 0,12, 0, 'Product Demo — Release Candidate',     'demo',       'Product Team'),
    e(3,3,13, 0,13,30, '1:1 cu Managerul',                     'one-on-one', 'Cristina Marin'),
    e(3,3,14, 0,16, 0, 'Sprint Retrospective — iterație 5',    'planning',   'Victor Dumitrescu'),
    e(3,3,16, 0,17, 0, 'Post-Mortem & Lessons Learned',        'review',     'Echipa Produs'),
    // Friday
    e(3,4, 9, 0, 9,15, 'Daily Check-in — Echipa Produs',        'standup',    'Ana Ionescu'),
    e(3,4, 9,30,10, 0, 'Weekly Wrap-up',                       'team',       'Victor Dumitrescu'),
    e(3,4,11, 0,11,30, 'Planificare Săptămâna Viitoare',       'planning',   'Cristina Marin'),
    e(3,4,13, 0,14, 0, 'Quarterly Business Review Prep',       'review',     'Management Team'),
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// ANDREI — 8:00-16:00, Backend Developer
// ─────────────────────────────────────────────────────────────────────────────
function generateAndrei(e) {
  return [
    // ── WEEK 0 ──────────────────────────────────────────────────────────────
    // Monday
    e(0,0, 8, 0, 8,15, 'Daily Check-in — Backend Team',         'standup',    'Andrei Dumitrescu'),
    e(0,0, 8,30,10, 0, 'Sprint Planning — Backend Iterație 3', 'planning',   'Tech Lead Dan'),
    e(0,0,10,30,11,30, 'Architecture Review — Auth Service',   'review',     'Tech Lead Dan'),
    e(0,0,13, 0,14, 0, 'Code Review Session — PR #342',        'review',     'Echipa Backend'),
    e(0,0,14,30,15,30, '1:1 cu Tech Lead',                     'one-on-one', 'Dan Petrescu'),
    // Tuesday
    e(0,1, 8, 0, 8,15, 'Daily Check-in — Backend Team',         'standup',    'Andrei Dumitrescu'),
    e(0,1, 9, 0,10,30, 'Workshop: Clean Architecture Patterns','workshop',   'Engineering Guild'),
    e(0,1,11, 0,12, 0, 'API Design Review — Payments Service', 'review',     'Tech Lead Dan'),
    e(0,1,13, 0,13,30, '1:1 cu Tech Lead',                     'one-on-one', 'Dan Petrescu'),
    e(0,1,14, 0,15, 0, 'Tech Sync — Mobile Backend',           'team',       'Radu Georgescu'),
    // Wednesday
    e(0,2, 8, 0, 8,15, 'Daily Check-in — Backend Team',         'standup',    'Andrei Dumitrescu'),
    e(0,2, 9, 0,10,30, 'DB Schema Review — Conturi Service',   'review',     'DB Team'),
    e(0,2,11, 0,12, 0, 'Security Audit Walkthrough',           'review',     'Security Team'),
    e(0,2,13,30,14,30, 'Sync cu echipa Frontend',              'team',       'Frontend Team', true),
    e(0,2,15, 0,16, 0, 'DevOps Sync — CI/CD Pipeline',         'team',       'DevOps Team'),
    // Thursday
    e(0,3, 8, 0, 8,15, 'Daily Check-in — Backend Team',         'standup',    'Andrei Dumitrescu'),
    e(0,3, 9, 0,10, 0, 'Microservices Planning Q2',            'planning',   'Tech Lead Dan'),
    e(0,3,10,30,11,30, 'Performance Testing Review',           'review',     'QA Team'),
    e(0,3,13, 0,13,30, '1:1 cu Tech Lead',                     'one-on-one', 'Dan Petrescu'),
    e(0,3,14, 0,15,30, 'Sprint Retrospective — iterație 2',    'planning',   'Tech Lead Dan'),
    // Friday
    e(0,4, 8, 0, 8,15, 'Daily Check-in — Backend Team',         'standup',    'Andrei Dumitrescu'),
    e(0,4, 8,30, 9,30, 'Weekly Tech Sync',                     'team',       'Engineering Team'),
    e(0,4,10, 0,10,30, 'Code Freeze Checklist',                'review',     'Tech Lead Dan'),

    // ── WEEK 1 ──────────────────────────────────────────────────────────────
    // Monday
    e(1,0, 8, 0, 8,15, 'Daily Check-in — Backend Team',         'standup',    'Andrei Dumitrescu'),
    e(1,0, 8,30, 9,30, 'Refinement Backlog — Sprint 4',        'planning',   'Tech Lead Dan'),
    e(1,0,10, 0,11, 0, 'Kafka Integration Workshop',           'workshop',   'Platform Team'),
    e(1,0,13, 0,14, 0, 'Code Review Session — PR #378',        'review',     'Echipa Backend'),
    e(1,0,14,30,15,30, '1:1 cu Tech Lead',                     'one-on-one', 'Dan Petrescu'),
    // Tuesday
    e(1,1, 8, 0, 8,15, 'Daily Check-in — Backend Team',         'standup',    'Andrei Dumitrescu'),
    e(1,1, 9, 0,10, 0, 'Workshop: Event-Driven Architecture',  'workshop',   'Engineering Guild'),
    e(1,1,10,30,11,30, 'API Contract Review — Parteners',      'review',     'Partnerships Team', true),
    e(1,1,13, 0,13,30, '1:1 cu Tech Lead',                     'one-on-one', 'Dan Petrescu'),
    e(1,1,14, 0,15, 0, 'Tech Sync — Notification Service',     'team',       'Echipa Backend'),
    // Wednesday — overlapping: DB Architecture 9:00-10:30 overlaps Microservices 9:30-11:00
    e(1,2, 8, 0, 8,15, 'Daily Check-in — Backend Team',         'standup',    'Andrei Dumitrescu'),
    e(1,2, 9, 0,10,30, 'DB Architecture Review — Sharding',    'review',     'DB Architecture Team'),
    e(1,2, 9,30,11, 0, 'Microservices Planning — Phase 2',     'planning',   'Tech Lead Dan'),
    e(1,2,13,30,14,30, 'Sync cu echipa Frontend',              'team',       'Frontend Team', true),
    e(1,2,15, 0,16, 0, 'Monitoring Setup Review',              'review',     'DevOps Team'),
    // Thursday
    e(1,3, 8, 0, 8,15, 'Daily Check-in — Backend Team',         'standup',    'Andrei Dumitrescu'),
    e(1,3, 9, 0,10, 0, 'Load Testing Analysis',                'review',     'QA Team'),
    e(1,3,11, 0,12, 0, 'Technical Demo — Payments v2',         'demo',       'Product Team'),
    e(1,3,13, 0,13,30, '1:1 cu Tech Lead',                     'one-on-one', 'Dan Petrescu'),
    e(1,3,14, 0,15,30, 'Sprint Retrospective — iterație 3',    'planning',   'Tech Lead Dan'),
    // Friday
    e(1,4, 8, 0, 8,15, 'Daily Check-in — Backend Team',         'standup',    'Andrei Dumitrescu'),
    e(1,4, 8,30, 9,30, 'Weekly Tech Sync',                     'team',       'Engineering Team'),
    e(1,4,10,30,11, 0, 'Deployment Checklist Review',          'review',     'Tech Lead Dan'),

    // ── WEEK 2 ──────────────────────────────────────────────────────────────
    // Monday
    e(2,0, 8, 0, 8,15, 'Daily Check-in — Backend Team',         'standup',    'Andrei Dumitrescu'),
    e(2,0, 8,30,10, 0, 'Sprint Planning — Backend Iterație 4', 'planning',   'Tech Lead Dan'),
    e(2,0,10,30,11,30, 'Architecture Review — Caching Layer',  'review',     'Tech Lead Dan'),
    e(2,0,13, 0,14, 0, 'Code Review Session — PR #412',        'review',     'Echipa Backend'),
    e(2,0,14,30,15,30, '1:1 cu Tech Lead',                     'one-on-one', 'Dan Petrescu'),
    // Tuesday
    e(2,1, 8, 0, 8,15, 'Daily Check-in — Backend Team',         'standup',    'Andrei Dumitrescu'),
    e(2,1, 9, 0,10,30, 'Workshop: Reactive Programming',       'workshop',   'Engineering Guild'),
    e(2,1,11, 0,12, 0, 'Observability Review — Distributed Tracing', 'review', 'Platform Team'),
    e(2,1,13, 0,13,30, '1:1 cu Tech Lead',                     'one-on-one', 'Dan Petrescu'),
    e(2,1,15, 0,16, 0, 'All Hands ING România — Q2',           'all-hands',  'Exec Team'),
    // Wednesday
    e(2,2, 8, 0, 8,15, 'Daily Check-in — Backend Team',         'standup',    'Andrei Dumitrescu'),
    e(2,2, 9, 0,10, 0, 'DB Performance Tuning Workshop',       'workshop',   'DB Team'),
    e(2,2,10,30,11,30, 'Security Hardening Review',            'review',     'Security Team'),
    e(2,2,13,30,14,30, 'Sync cu echipa Frontend',              'team',       'Frontend Team', true),
    e(2,2,15, 0,16, 0, 'CI/CD Optimization Session',           'team',       'DevOps Team'),
    // Thursday
    e(2,3, 8, 0, 8,15, 'Daily Check-in — Backend Team',         'standup',    'Andrei Dumitrescu'),
    e(2,3, 9, 0,10, 0, 'Microservices Planning — Phase 3',     'planning',   'Tech Lead Dan'),
    e(2,3,10,30,11,30, 'Integration Testing Review',           'review',     'QA Team'),
    e(2,3,13, 0,13,30, '1:1 cu Tech Lead',                     'one-on-one', 'Dan Petrescu'),
    e(2,3,14, 0,15,30, 'Sprint Retrospective — iterație 4',    'planning',   'Tech Lead Dan'),
    // Friday
    e(2,4, 8, 0, 8,15, 'Daily Check-in — Backend Team',         'standup',    'Andrei Dumitrescu'),
    e(2,4, 8,30, 9,30, 'Weekly Tech Sync',                     'team',       'Engineering Team'),
    e(2,4,10, 0,10,30, 'Release Notes Review',                 'review',     'Tech Lead Dan'),

    // ── WEEK 3 ──────────────────────────────────────────────────────────────
    // Monday
    e(3,0, 8, 0, 8,15, 'Daily Check-in — Backend Team',         'standup',    'Andrei Dumitrescu'),
    e(3,0, 8,30, 9,30, 'Refinement Backlog — Sprint 5',        'planning',   'Tech Lead Dan'),
    e(3,0,10, 0,11, 0, 'Service Mesh Workshop',                'workshop',   'Platform Team'),
    e(3,0,13, 0,14, 0, 'Code Review Session — PR #451',        'review',     'Echipa Backend'),
    e(3,0,14,30,15,30, '1:1 cu Tech Lead',                     'one-on-one', 'Dan Petrescu'),
    // Tuesday
    e(3,1, 8, 0, 8,15, 'Daily Check-in — Backend Team',         'standup',    'Andrei Dumitrescu'),
    e(3,1, 9, 0,10,30, 'Workshop: gRPC & Protocol Buffers',    'workshop',   'Engineering Guild'),
    e(3,1,11, 0,12, 0, 'API Versioning Strategy Review',       'review',     'Tech Lead Dan'),
    e(3,1,13, 0,13,30, '1:1 cu Tech Lead',                     'one-on-one', 'Dan Petrescu'),
    e(3,1,14, 0,15, 0, 'Tech Sync — Release Pregătire',        'team',       'Echipa Backend'),
    // Wednesday
    e(3,2, 8, 0, 8,15, 'Daily Check-in — Backend Team',         'standup',    'Andrei Dumitrescu'),
    e(3,2, 9, 0,10, 0, 'Final DB Migration Review',            'review',     'DB Team'),
    e(3,2,10,30,11,30, 'Security Final Audit',                 'review',     'Security Team'),
    e(3,2,13,30,14,30, 'Sync cu echipa Frontend',              'team',       'Frontend Team', true),
    e(3,2,15, 0,16, 0, 'Pre-Release Checklist',                'review',     'Tech Lead Dan'),
    // Thursday — back-to-back
    e(3,3, 8, 0, 8,15, 'Daily Check-in — Backend Team',         'standup',    'Andrei Dumitrescu'),
    e(3,3, 9, 0,10, 0, 'Load & Stress Test Results',           'review',     'QA Team'),
    e(3,3,11, 0,12, 0, 'Technical Demo — Release Candidate',   'demo',       'Product Team'),
    e(3,3,13, 0,13,30, '1:1 cu Tech Lead',                     'one-on-one', 'Dan Petrescu'),
    e(3,3,14, 0,15,30, 'Sprint Retrospective — iterație 5',    'planning',   'Tech Lead Dan'),
    e(3,3,15,30,16, 0, 'Post-Mortem Backend Incidents',        'review',     'Echipa Backend'),
    // Friday
    e(3,4, 8, 0, 8,15, 'Daily Check-in — Backend Team',         'standup',    'Andrei Dumitrescu'),
    e(3,4, 8,30, 9,30, 'Weekly Tech Sync',                     'team',       'Engineering Team'),
    e(3,4,10, 0,10,30, 'Deployment Final Review',              'review',     'Tech Lead Dan'),
    e(3,4,11, 0,12, 0, 'Knowledge Transfer Session',           'workshop',   'Echipa Backend'),
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// GIGEL — 10:00-18:00, Data Analytics
// ─────────────────────────────────────────────────────────────────────────────
function generateGigel(e) {
  return [
    // ── WEEK 0 ──────────────────────────────────────────────────────────────
    // Monday
    e(0,0,10, 0,10,15, 'Daily Check-in — Data Team',            'standup',    'Gigel Popescu'),
    e(0,0,10,30,12, 0, 'Data Governance Sprint Planning',      'planning',   'Chief Data Officer'),
    e(0,0,13, 0,14, 0, 'ML Model Review — Churn Prediction',   'review',     'ML Team'),
    e(0,0,14,30,16, 0, 'Analytics Platform Sync',              'team',       'Platform Team'),
    e(0,0,16,30,17,30, 'Data Quality Report Review',           'review',     'Data Ops'),
    // Tuesday
    e(0,1,10, 0,10,15, 'Daily Check-in — Data Team',            'standup',    'Gigel Popescu'),
    e(0,1,10,30,12, 0, 'Workshop: Feature Engineering',        'workshop',   'ML Team'),
    e(0,1,13, 0,13,30, '1:1 cu Head of Data',                  'one-on-one', 'Mihai Rusu'),
    e(0,1,14, 0,15, 0, 'BI Dashboard Review — Retail',         'review',     'BI Team'),
    e(0,1,16, 0,17, 0, 'Stakeholder Data Demo',                'demo',       'Business Team'),
    // Wednesday
    e(0,2,10, 0,10,15, 'Daily Check-in — Data Team',            'standup',    'Gigel Popescu'),
    e(0,2,11, 0,12, 0, 'Data Pipeline Review',                 'review',     'Data Engineering'),
    e(0,2,13,30,15, 0, 'Analytics Review — Customer Segments', 'review',     'Analytics Team'),
    e(0,2,15,30,17, 0, 'Data Governance Working Group',        'team',       'Cross-Functional Team'),
    // Thursday
    e(0,3,10, 0,10,15, 'Daily Check-in — Data Team',            'standup',    'Gigel Popescu'),
    e(0,3,11, 0,12, 0, 'ML Model Deployment Review',           'review',     'MLOps Team'),
    e(0,3,13, 0,14, 0, '1:1 cu Head of Data',                  'one-on-one', 'Mihai Rusu'),
    e(0,3,14, 0,15,30, 'BI Sync — Quarterly Dashboards',       'team',       'BI Team'),
    e(0,3,16, 0,17,30, 'Data Strategy Planning',               'planning',   'Data Leadership'),
    // Friday
    e(0,4,10, 0,10,15, 'Daily Check-in — Data Team',            'standup',    'Gigel Popescu'),
    e(0,4,10,30,11,30, 'Weekly Data Review',                   'review',     'Data Team'),
    e(0,4,13, 0,14, 0, 'End-of-Week Data Report',              'review',     'Analytics Team'),
    e(0,4,16,30,17,30, 'End-of-Week Report Finalizare',        'review',     'Data Ops'),

    // ── WEEK 1 ──────────────────────────────────────────────────────────────
    // Monday
    e(1,0,10, 0,10,15, 'Daily Check-in — Data Team',            'standup',    'Gigel Popescu'),
    e(1,0,10,30,11,30, 'Data Backlog Refinement',              'planning',   'Chief Data Officer'),
    e(1,0,13, 0,14, 0, 'ML Experiment Review',                 'review',     'ML Team'),
    e(1,0,14,30,16, 0, 'Analytics Platform Upgrade Sync',      'team',       'Platform Team'),
    // Tuesday
    e(1,1,10, 0,10,15, 'Daily Check-in — Data Team',            'standup',    'Gigel Popescu'),
    e(1,1,10,30,12, 0, 'Workshop: Real-Time Analytics',        'workshop',   'Engineering Guild'),
    e(1,1,13, 0,13,30, '1:1 cu Head of Data',                  'one-on-one', 'Mihai Rusu'),
    e(1,1,14,30,16, 0, 'Data Quality Deep Dive',               'review',     'Data Ops'),
    e(1,1,16,30,17,30, 'Customer Insights Presentation',       'demo',       'Business Team'),
    // Wednesday — overlapping: Data Warehouse 10:30-12:00 overlaps ETL Review 11:00-12:30
    e(1,2,10, 0,10,15, 'Daily Check-in — Data Team',            'standup',    'Gigel Popescu'),
    e(1,2,10,30,12, 0, 'Data Warehouse Architecture Review',   'review',     'Data Engineering'),
    e(1,2,11, 0,12,30, 'ETL Pipeline Optimization',            'review',     'Data Engineering'),
    e(1,2,13,30,15, 0, 'Analytics Review — Fraud Detection',   'review',     'Analytics Team'),
    e(1,2,15,30,17, 0, 'Data Governance Working Group',        'team',       'Cross-Functional Team'),
    // Thursday — back-to-back evening
    e(1,3,10, 0,10,15, 'Daily Check-in — Data Team',            'standup',    'Gigel Popescu'),
    e(1,3,11, 0,12, 0, 'Model Validation Session',             'review',     'MLOps Team'),
    e(1,3,13, 0,14, 0, '1:1 cu Head of Data',                  'one-on-one', 'Mihai Rusu'),
    e(1,3,14, 0,15,30, 'Sprint Retrospective — Data Team',     'planning',   'Chief Data Officer'),
    e(1,3,16, 0,17,30, 'BI Quarterly Planning',                'planning',   'BI Team'),
    // Friday
    e(1,4,10, 0,10,15, 'Daily Check-in — Data Team',            'standup',    'Gigel Popescu'),
    e(1,4,10,30,11,30, 'Weekly Data Review',                   'review',     'Data Team'),
    e(1,4,16,30,17,30, 'End-of-Week Report Finalizare',        'review',     'Data Ops'),

    // ── WEEK 2 ──────────────────────────────────────────────────────────────
    // Monday
    e(2,0,10, 0,10,15, 'Daily Check-in — Data Team',            'standup',    'Gigel Popescu'),
    e(2,0,10,30,12, 0, 'Data Governance Sprint Planning',      'planning',   'Chief Data Officer'),
    e(2,0,13, 0,14, 0, 'ML Model Review — Scoring Credite',    'review',     'ML Team'),
    e(2,0,14,30,16, 0, 'Analytics Platform Sync',              'team',       'Platform Team'),
    e(2,0,16,30,17,30, 'Data Quality Report Review',           'review',     'Data Ops'),
    // Tuesday — All Hands at end of day
    e(2,1,10, 0,10,15, 'Daily Check-in — Data Team',            'standup',    'Gigel Popescu'),
    e(2,1,10,30,12, 0, 'Workshop: MLflow & Experiment Tracking','workshop',  'ML Team'),
    e(2,1,13, 0,13,30, '1:1 cu Head of Data',                  'one-on-one', 'Mihai Rusu'),
    e(2,1,14, 0,15, 0, 'BI Dashboard Review — Mobile',         'review',     'BI Team'),
    e(2,1,17, 0,18, 0, 'All Hands ING România — Q2',           'all-hands',  'Exec Team'),
    // Wednesday
    e(2,2,10, 0,10,15, 'Daily Check-in — Data Team',            'standup',    'Gigel Popescu'),
    e(2,2,11, 0,12, 0, 'Data Pipeline Optimization',           'review',     'Data Engineering'),
    e(2,2,13,30,15, 0, 'Analytics Review — Digital Channels',  'review',     'Analytics Team'),
    e(2,2,15,30,17, 0, 'Data Governance Working Group',        'team',       'Cross-Functional Team'),
    e(2,2,17,30,18, 0, 'Quick Sync Data Catalog',              'team',       'Data Engineering'),
    // Thursday — back-to-back 14:00-18:00
    e(2,3,10, 0,10,15, 'Daily Check-in — Data Team',            'standup',    'Gigel Popescu'),
    e(2,3,11, 0,12, 0, 'ML Model Deployment — Production',     'review',     'MLOps Team'),
    e(2,3,13, 0,14, 0, '1:1 cu Head of Data',                  'one-on-one', 'Mihai Rusu'),
    e(2,3,14, 0,15,30, 'BI Sync — Q3 Roadmap',                 'team',       'BI Team'),
    e(2,3,15,30,17, 0, 'Data Strategy Deep Dive',              'planning',   'Data Leadership'),
    e(2,3,17, 0,18, 0, 'Stakeholder Report Prezentare',        'demo',       'Business Team'),
    // Friday
    e(2,4,10, 0,10,15, 'Daily Check-in — Data Team',            'standup',    'Gigel Popescu'),
    e(2,4,10,30,11,30, 'Weekly Data Review',                   'review',     'Data Team'),
    e(2,4,13, 0,14, 0, 'End-of-Week Data Report',              'review',     'Analytics Team'),
    e(2,4,16,30,17,30, 'End-of-Week Report Finalizare',        'review',     'Data Ops'),

    // ── WEEK 3 ──────────────────────────────────────────────────────────────
    // Monday
    e(3,0,10, 0,10,15, 'Daily Check-in — Data Team',            'standup',    'Gigel Popescu'),
    e(3,0,10,30,11,30, 'Data Backlog Refinement',              'planning',   'Chief Data Officer'),
    e(3,0,13, 0,14, 0, 'ML Experiment Results Review',         'review',     'ML Team'),
    e(3,0,14,30,16, 0, 'Analytics Platform — Q3 Planning',     'team',       'Platform Team'),
    e(3,0,16,30,17,30, 'Data Catalog Review',                  'review',     'Data Ops'),
    // Tuesday
    e(3,1,10, 0,10,15, 'Daily Check-in — Data Team',            'standup',    'Gigel Popescu'),
    e(3,1,10,30,12, 0, 'Workshop: Vector Databases & Embeddings','workshop', 'ML Team'),
    e(3,1,13, 0,13,30, '1:1 cu Head of Data',                  'one-on-one', 'Mihai Rusu'),
    e(3,1,14,30,16, 0, 'Customer Data Platform Review',        'review',     'Data Ops'),
    e(3,1,16,30,17,30, 'Insights Presentation Q2',             'demo',       'Business Team'),
    // Wednesday — overlapping
    e(3,2,10, 0,10,15, 'Daily Check-in — Data Team',            'standup',    'Gigel Popescu'),
    e(3,2,10,30,12, 0, 'Final Data Governance Review',         'review',     'Data Engineering'),
    e(3,2,11,30,13, 0, 'Compliance Data Audit',                'review',     'Compliance Team'),
    e(3,2,13,30,15, 0, 'Analytics Review — End of Quarter',    'review',     'Analytics Team'),
    e(3,2,15,30,17, 0, 'Data Governance Working Group',        'team',       'Cross-Functional Team'),
    // Thursday — heavy back-to-back
    e(3,3,10, 0,10,15, 'Daily Check-in — Data Team',            'standup',    'Gigel Popescu'),
    e(3,3,11, 0,12, 0, 'ML Model Final Validation',            'review',     'MLOps Team'),
    e(3,3,13, 0,14, 0, '1:1 cu Head of Data',                  'one-on-one', 'Mihai Rusu'),
    e(3,3,14, 0,15,30, 'Sprint Retrospective — Data Team',     'planning',   'Chief Data Officer'),
    e(3,3,15,30,17, 0, 'Quarterly Data Review',                'review',     'Data Leadership'),
    e(3,3,17, 0,18, 0, 'Executive Data Report',                'demo',       'Business Team'),
    // Friday
    e(3,4,10, 0,10,15, 'Daily Check-in — Data Team',            'standup',    'Gigel Popescu'),
    e(3,4,10,30,11,30, 'Weekly Data Review',                   'review',     'Data Team'),
    e(3,4,13, 0,14, 0, 'End-of-Quarter Data Report',           'review',     'Analytics Team'),
    e(3,4,16,30,17,30, 'Final End-of-Quarter Report',          'review',     'Data Ops'),
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT — 9:00-17:00, Generic corporate schedule
// ─────────────────────────────────────────────────────────────────────────────
function generateDefault(e) {
  return [
    // ── WEEK 0 (sprint planning week) ───────────────────────────────────────
    // Monday
    e(0,0, 9, 0, 9,15, 'Daily Check-in — Echipa Retail Banking',  'standup',    'Ana Ionescu'),
    e(0,0, 9,30,11, 0, 'Sprint Planning Q2',                     'planning',   'Victor Dumitrescu'),
    e(0,0,13, 0,13,30, '1:1 cu Managerul',                       'one-on-one', 'Cristina Marin'),
    e(0,0,14, 0,15, 0, 'Sync API Integration — ING Core',        'team',       'Bogdan Popa'),
    e(0,0,15,15,16, 0, 'Revizie Documentație GDPR',              'review',     'Legal Team'),
    // Tuesday
    e(0,1, 9, 0, 9,15, 'Daily Check-in — Echipa Retail Banking',  'standup',    'Ana Ionescu'),
    e(0,1,10, 0,11,30, 'Workshop: Digitalizare Procese Interne', 'workshop',   'Innovation Lab'),
    e(0,1,14, 0,14,45, 'Review Quarterly OKRs',                  'review',     'Cristina Marin'),
    e(0,1,15, 0,16, 0, 'Tech Sync — Mobile App',                 'team',       'Radu Georgescu'),
    e(0,1,16,30,17,30, 'All Hands ING România',                  'all-hands',  'Exec Team'),
    // Wednesday
    e(0,2, 9, 0, 9,15, 'Daily Check-in — Echipa Retail Banking',  'standup',    'Ana Ionescu'),
    e(0,2,10,30,11, 0, 'Grooming Sprint Backlog',                'planning',   'Victor Dumitrescu'),
    e(0,2,11, 0,12, 0, 'Customer Journey Review',                'team',       'UX Team'),
    e(0,2,13,30,14, 0, 'Catch-up cu Colegii din Amsterdam',      'one-on-one', 'Global Team'),
    // Thursday
    e(0,3, 9, 0, 9,15, 'Daily Check-in — Echipa Retail Banking',  'standup',    'Ana Ionescu'),
    e(0,3, 9,30,10,30, 'Regulatory Compliance Update',           'review',     'Compliance Team'),
    e(0,3,11, 0,12, 0, 'Product Demo — HomeBank',                'demo',       'Product Team'),
    e(0,3,13, 0,13,30, '1:1 cu Managerul',                       'one-on-one', 'Cristina Marin'),
    e(0,3,14, 0,15,30, 'Sprint Retrospective',                   'planning',   'Victor Dumitrescu'),
    e(0,3,16, 0,17, 0, 'Risk Assessment Q2',                     'review',     'Risk Team'),
    // Friday
    e(0,4, 9, 0, 9,15, 'Daily Check-in — Echipa Retail Banking',  'standup',    'Ana Ionescu'),
    e(0,4,10, 0,10,30, 'Weekly Wrap-up',                         'team',       'Victor Dumitrescu'),
    e(0,4,11, 0,11,30, 'Planificare Săptămâna Viitoare',         'planning',   'Cristina Marin'),

    // ── WEEK 1 (refinement week) ─────────────────────────────────────────────
    // Monday
    e(1,0, 9, 0, 9,15, 'Daily Check-in — Echipa Retail Banking',  'standup',    'Ana Ionescu'),
    e(1,0, 9,30,10,30, 'Refinement Sprint Backlog',              'planning',   'Victor Dumitrescu'),
    e(1,0,13, 0,13,30, '1:1 cu Managerul',                       'one-on-one', 'Cristina Marin'),
    e(1,0,14, 0,15, 0, 'Sync Proiecte Active',                   'team',       'Bogdan Popa'),
    e(1,0,15,30,16,30, 'Review Arhitectură Sistem',              'review',     'Engineering Lead'),
    // Tuesday
    e(1,1, 9, 0, 9,15, 'Daily Check-in — Echipa Retail Banking',  'standup',    'Ana Ionescu'),
    e(1,1, 9,30,11, 0, 'Workshop: API Security Best Practices',  'workshop',   'Security Team'),
    e(1,1,13, 0,14, 0, 'Product Metrics Review',                 'review',     'Cristina Marin'),
    e(1,1,15, 0,16, 0, 'Tech Sync — Backend Services',           'team',       'Radu Georgescu'),
    e(1,1,16,30,17,30, 'All Hands ING România',                  'all-hands',  'Exec Team'),
    // Wednesday
    e(1,2, 9, 0, 9,15, 'Daily Check-in — Echipa Retail Banking',  'standup',    'Ana Ionescu'),
    e(1,2,10,30,11,30, 'Grooming Sprint Backlog',                'planning',   'Victor Dumitrescu'),
    e(1,2,11, 0,12, 0, 'Customer Journey Review — Credite',      'team',       'UX Team'),
    e(1,2,13,30,14, 0, 'Catch-up cu Colegii din Amsterdam',      'one-on-one', 'Global Team'),
    e(1,2,15, 0,16, 0, 'Performance Review Q2',                  'review',     'Analytics Team'),
    // Thursday
    e(1,3, 9, 0, 9,15, 'Daily Check-in — Echipa Retail Banking',  'standup',    'Ana Ionescu'),
    e(1,3, 9,30,10,30, 'Regulatory Compliance Checkpoint',       'review',     'Compliance Team'),
    e(1,3,11, 0,12, 0, 'User Testing Session',                   'demo',       'UX Research'),
    e(1,3,13, 0,13,30, '1:1 cu Managerul',                       'one-on-one', 'Cristina Marin'),
    e(1,3,14, 0,15,30, 'Sprint Retrospective',                   'planning',   'Victor Dumitrescu'),
    // Friday
    e(1,4, 9, 0, 9,15, 'Daily Check-in — Echipa Retail Banking',  'standup',    'Ana Ionescu'),
    e(1,4,10, 0,10,30, 'Weekly Wrap-up',                         'team',       'Victor Dumitrescu'),
    e(1,4,11, 0,11,30, 'Planificare Săptămâna Viitoare',         'planning',   'Cristina Marin'),

    // ── WEEK 2 (sprint planning week) ───────────────────────────────────────
    // Monday
    e(2,0, 9, 0, 9,15, 'Daily Check-in — Echipa Retail Banking',  'standup',    'Ana Ionescu'),
    e(2,0, 9,30,11, 0, 'Sprint Planning Q2 — Iterație 2',        'planning',   'Victor Dumitrescu'),
    e(2,0,13, 0,13,30, '1:1 cu Managerul',                       'one-on-one', 'Cristina Marin'),
    e(2,0,14, 0,15, 0, 'Sync API Integration — ING Core',        'team',       'Bogdan Popa'),
    e(2,0,15,15,16, 0, 'Revizie Documentație GDPR',              'review',     'Legal Team'),
    // Tuesday
    e(2,1, 9, 0, 9,15, 'Daily Check-in — Echipa Retail Banking',  'standup',    'Ana Ionescu'),
    e(2,1,10, 0,11,30, 'Workshop: Open Banking Standards',       'workshop',   'Innovation Lab'),
    e(2,1,13, 0,13,30, '1:1 cu Managerul',                       'one-on-one', 'Cristina Marin'),
    e(2,1,14, 0,14,45, 'Review Quarterly OKRs',                  'review',     'Cristina Marin'),
    e(2,1,15, 0,16, 0, 'Tech Sync — Mobile App',                 'team',       'Radu Georgescu'),
    e(2,1,16,30,17,30, 'All Hands ING România — Q2',             'all-hands',  'Exec Team'),
    // Wednesday
    e(2,2, 9, 0, 9,15, 'Daily Check-in — Echipa Retail Banking',  'standup',    'Ana Ionescu'),
    e(2,2,10,30,11, 0, 'Grooming Sprint Backlog',                'planning',   'Victor Dumitrescu'),
    e(2,2,11, 0,12, 0, 'Customer Journey Review — Investiții',   'team',       'UX Team'),
    e(2,2,13,30,14, 0, 'Catch-up cu Colegii din Amsterdam',      'one-on-one', 'Global Team'),
    e(2,2,15, 0,16, 0, 'Design System Alignment',                'review',     'Design Team'),
    // Thursday
    e(2,3, 9, 0, 9,15, 'Daily Check-in — Echipa Retail Banking',  'standup',    'Ana Ionescu'),
    e(2,3, 9,30,10,30, 'Regulatory Compliance Update',           'review',     'Compliance Team'),
    e(2,3,11, 0,12, 0, 'Product Demo — Funcții Noi',             'demo',       'Product Team'),
    e(2,3,13, 0,13,30, '1:1 cu Managerul',                       'one-on-one', 'Cristina Marin'),
    e(2,3,14, 0,15,30, 'Sprint Retrospective',                   'planning',   'Victor Dumitrescu'),
    e(2,3,16, 0,17, 0, 'Risk Assessment Q2',                     'review',     'Risk Team'),
    // Friday
    e(2,4, 9, 0, 9,15, 'Daily Check-in — Echipa Retail Banking',  'standup',    'Ana Ionescu'),
    e(2,4,10, 0,10,30, 'Weekly Wrap-up',                         'team',       'Victor Dumitrescu'),
    e(2,4,11, 0,11,30, 'Planificare Săptămâna Viitoare',         'planning',   'Cristina Marin'),

    // ── WEEK 3 (refinement week) ─────────────────────────────────────────────
    // Monday
    e(3,0, 9, 0, 9,15, 'Daily Check-in — Echipa Retail Banking',  'standup',    'Ana Ionescu'),
    e(3,0, 9,30,10,30, 'Refinement Sprint Backlog',              'planning',   'Victor Dumitrescu'),
    e(3,0,13, 0,13,30, '1:1 cu Managerul',                       'one-on-one', 'Cristina Marin'),
    e(3,0,14, 0,15, 0, 'Sync Proiecte Active',                   'team',       'Bogdan Popa'),
    // Tuesday
    e(3,1, 9, 0, 9,15, 'Daily Check-in — Echipa Retail Banking',  'standup',    'Ana Ionescu'),
    e(3,1,10, 0,11,30, 'Workshop: Cloud Migration Strategy',     'workshop',   'Cloud Team'),
    e(3,1,13, 0,14, 0, 'Product Roadmap Review',                 'review',     'Cristina Marin'),
    e(3,1,15, 0,16, 0, 'Tech Sync — Backend Services',           'team',       'Radu Georgescu'),
    // Wednesday
    e(3,2, 9, 0, 9,15, 'Daily Check-in — Echipa Retail Banking',  'standup',    'Ana Ionescu'),
    e(3,2,10,30,11,30, 'Grooming Sprint Backlog',                'planning',   'Victor Dumitrescu'),
    e(3,2,11, 0,12, 0, 'Customer Journey Review — Economii',     'team',       'UX Team'),
    e(3,2,13,30,14, 0, 'Catch-up cu Colegii din Amsterdam',      'one-on-one', 'Global Team'),
    e(3,2,15, 0,16, 0, 'Release Readiness Review',               'review',     'Release Team'),
    // Thursday
    e(3,3, 9, 0, 9,15, 'Daily Check-in — Echipa Retail Banking',  'standup',    'Ana Ionescu'),
    e(3,3, 9,30,10,30, 'Regulatory Compliance Final Check',      'review',     'Compliance Team'),
    e(3,3,11, 0,12, 0, 'Product Demo — Release Candidate',       'demo',       'Product Team'),
    e(3,3,13, 0,13,30, '1:1 cu Managerul',                       'one-on-one', 'Cristina Marin'),
    e(3,3,14, 0,15,30, 'Sprint Retrospective',                   'planning',   'Victor Dumitrescu'),
    e(3,3,16, 0,17, 0, 'Risk Assessment Q3',                     'review',     'Risk Team'),
    // Friday
    e(3,4, 9, 0, 9,15, 'Daily Check-in — Echipa Retail Banking',  'standup',    'Ana Ionescu'),
    e(3,4,10, 0,10,30, 'Weekly Wrap-up',                         'team',       'Victor Dumitrescu'),
    e(3,4,11, 0,11,30, 'Planificare Săptămâna Viitoare',         'planning',   'Cristina Marin'),
    e(3,4,13, 0,14, 0, 'Quarterly Business Review Prep',         'review',     'Management Team'),
  ]
}
