import { useState } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { usePrivacy } from '../context/PrivacyContext'

const DISPLAY_OPTIONS = [
  { key: 'workSchedule',       label: 'Program de lucru',        desc: 'Afișează orele de lucru și programul pe dashboard.' },
  { key: 'sportsPreferences',  label: 'Sporturi preferate',      desc: 'Afișează sporturile tale în profil și matchmaking.' },
  { key: 'workLocation',       label: 'Locație de lucru',        desc: 'Afișează dacă ești la birou sau la distanță.' },
  { key: 'breakStats',         label: 'Statistici pauze',        desc: 'Afișează numărul de pauze luate și streak-ul.' },
  { key: 'moodData',           label: 'Date wellbeing / mood',   desc: 'Afișează informații despre starea ta de bine.' },
  { key: 'calendarData',       label: 'Date calendar',           desc: 'Afișează ședințele și evenimentele din calendar.' },
  { key: 'matchmakingProfile', label: 'Profil matchmaking',      desc: 'Fii vizibil(ă) pentru colegii care caută parteneri sportivi.' },
]

export default function PrivacyPreferencesModal({ open, onClose }) {
  const { prefs, updateDisplay } = usePrivacy()
  const [local, setLocal] = useState(() => ({ ...prefs.display }))

  if (!open) return null

  const toggle = (key) => setLocal(p => ({ ...p, [key]: !p[key] }))

  const save = () => {
    updateDisplay(local)
    onClose()
  }

  const enabledCount = Object.values(local).filter(Boolean).length

  return (
    <div className="fixed inset-0 z-[8000] flex items-end md:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Eye className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Preferințe de afișare date</h2>
              <p className="text-[10px] text-slate-500">{enabledCount} din {DISPLAY_OPTIONS.length} categorii active</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="px-6 pt-4 pb-2">
          <p className="text-xs text-slate-400 leading-relaxed bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3">
            Controlează ce categorii de date sunt afișate pe profilul și dashboard-ul tău.
            Debifarea unei categorii <strong className="text-slate-300">nu șterge datele</strong> — doar le ascunde din interfață.
            Poți modifica oricând aceste setări.
          </p>
        </div>

        {/* Options */}
        <div className="px-6 py-4 flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
          {DISPLAY_OPTIONS.map(({ key, label, desc }) => (
            <div
              key={key}
              onClick={() => toggle(key)}
              className={`flex items-center gap-4 rounded-xl px-4 py-3 border cursor-pointer transition-all ${
                local[key]
                  ? 'bg-indigo-600/10 border-indigo-500/30'
                  : 'bg-zinc-800/40 border-zinc-700/40 opacity-70'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                local[key] ? 'bg-indigo-500/20' : 'bg-zinc-700/40'
              }`}>
                {local[key]
                  ? <Eye className="w-4 h-4 text-indigo-400" />
                  : <EyeOff className="w-4 h-4 text-slate-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-none mb-1 ${local[key] ? 'text-white' : 'text-slate-500'}`}>{label}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">{desc}</p>
              </div>
              {/* Toggle */}
              <div className={`relative w-10 h-5 rounded-full transition-all shrink-0 ${local[key] ? 'bg-indigo-600' : 'bg-zinc-600'}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${local[key] ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-zinc-800">
          <button
            onClick={() => setLocal(Object.fromEntries(DISPLAY_OPTIONS.map(o => [o.key, true])))}
            className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
          >
            Activează toate
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-700 text-slate-400 text-xs font-medium hover:border-zinc-600 transition-colors"
            >
              Anulează
            </button>
            <button
              onClick={save}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              Salvează
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
