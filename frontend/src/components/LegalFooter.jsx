import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Lock, Landmark, SlidersHorizontal } from 'lucide-react'
import PrivacyPreferencesModal from './PrivacyPreferencesModal'

const QUICK_LINKS = [
  { label: 'Politica de Confidențialitate', docId: 'privacy' },
  { label: 'Termeni și Condiții',           docId: 'terms'   },
  { label: 'Politica de Cookies',           docId: 'cookies' },
  { label: 'Contact',                        docId: 'contact' },
]

const COMPLIANCE_BADGES = [
  {
    docId: 'gdpr',
    icon: CheckCircle2,
    label: 'GDPR Compliant',
    sub: 'Regulamentul UE 2016/679',
    iconColor: 'text-emerald-400',
    ringColor: 'ring-emerald-500/20',
    bgColor: 'bg-emerald-500/5',
    hoverBg: 'hover:bg-emerald-500/10',
    dotColor: 'bg-emerald-400',
    borderColor: 'border-emerald-500/15',
  },
  {
    docId: 'criptare',
    icon: Lock,
    label: 'Date Criptate',
    sub: 'TLS 1.3 · AES-256',
    iconColor: 'text-sky-400',
    ringColor: 'ring-sky-500/20',
    bgColor: 'bg-sky-500/5',
    hoverBg: 'hover:bg-sky-500/10',
    dotColor: 'bg-sky-400',
    borderColor: 'border-sky-500/15',
  },
  {
    docId: 'anspdcp',
    icon: Landmark,
    label: 'ANSPDCP',
    sub: 'Înregistrat ca operator',
    iconColor: 'text-violet-400',
    ringColor: 'ring-violet-500/20',
    bgColor: 'bg-violet-500/5',
    hoverBg: 'hover:bg-violet-500/10',
    dotColor: 'bg-violet-400',
    borderColor: 'border-violet-500/15',
  },
]

export default function LegalFooter() {
  const navigate = useNavigate()
  const [showPrivacy, setShowPrivacy] = useState(false)

  return (
    <>
      <PrivacyPreferencesModal open={showPrivacy} onClose={() => setShowPrivacy(false)} />

      <footer className="border-t border-surface-border bg-zinc-950/90 mt-auto">
        {/* Main grid */}
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Left — brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center shadow-lg shadow-brand/20">
                <span className="text-white text-sm font-bold">S</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">SyncFit</p>
                <p className="text-[10px] text-slate-500 leading-none">by EcoSync</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
              Platforma de wellbeing corporativ care te ajută să rămâi în echilibru.
            </p>
            <p className="text-[10px] text-slate-600">© 2026 SyncFit by EcoSync. Toate drepturile rezervate.</p>

            {/* Privacy preferences shortcut */}
            <button
              onClick={() => setShowPrivacy(true)}
              className="flex items-center gap-2 w-fit text-[10px] text-slate-500 hover:text-slate-300 transition-colors group mt-1"
            >
              <SlidersHorizontal className="w-3 h-3 group-hover:text-indigo-400 transition-colors" />
              Preferințe de afișare date
            </button>
          </div>

          {/* Center — quick links */}
          <div className="flex flex-col gap-2.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Legal & Politici</p>
            <div className="flex flex-col gap-1.5">
              {QUICK_LINKS.map(({ label, docId }) => (
                <button
                  key={docId}
                  onClick={() => navigate(`/legal/${docId}`)}
                  className="text-left text-xs text-slate-500 hover:text-white transition-colors py-0.5 relative group"
                >
                  <span className="absolute left-0 bottom-0 w-0 h-px bg-indigo-500 transition-all group-hover:w-full" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Right — compliance badges */}
          <div className="flex flex-col gap-2.5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Conformitate</p>
            <div className="flex flex-col gap-2">
              {COMPLIANCE_BADGES.map(({ docId, icon: Icon, label, sub, iconColor, bgColor, hoverBg, dotColor, borderColor }) => (
                <button
                  key={docId}
                  onClick={() => navigate(`/legal/${docId}`)}
                  className={`group flex items-center gap-3 ${bgColor} ${hoverBg} border ${borderColor} rounded-xl px-3 py-2.5 transition-all duration-200 hover:scale-[1.01] text-left`}
                >
                  {/* Status dot */}
                  <div className="relative shrink-0">
                    <div className={`w-8 h-8 rounded-lg ${bgColor} border ${borderColor} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${iconColor}`} />
                    </div>
                    <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${dotColor} ring-2 ring-zinc-950`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-semibold ${iconColor} leading-none mb-0.5`}>{label}</p>
                    <p className="text-[9px] text-slate-500 leading-none">{sub}</p>
                  </div>

                  {/* Arrow indicator */}
                  <svg className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="border-t border-surface-border/40 px-6 py-2.5">
          <p className="max-w-7xl mx-auto text-center text-[9px] text-slate-600 leading-relaxed">
            SyncFit prelucrează datele personale în conformitate cu GDPR (Regulamentul UE 2016/679) exclusiv în scopul furnizării serviciilor de wellbeing corporativ.
            Datele nu sunt transmise terților fără consimțământ explicit. DPO:{' '}
            <a href="mailto:privacy@syncfit.ro" className="hover:text-slate-400 transition-colors">privacy@syncfit.ro</a>
            {' '}· ANSPDCP:{' '}
            <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">www.dataprotection.ro</a>
            {' '}·{' '}
            <button onClick={() => navigate('/legal/cookies')} className="hover:text-slate-400 transition-colors underline underline-offset-2">
              Gestionează cookies
            </button>
          </p>
        </div>
      </footer>
    </>
  )
}
