import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cookie, Shield, BarChart2, Settings, X, ChevronDown, ChevronUp } from 'lucide-react'
import { usePrivacy } from '../context/PrivacyContext'

export default function CookieConsent() {
  const { cookieConsentGiven, acceptAllCookies, acceptEssentialOnly, saveCustomCookies } = usePrivacy()
  const navigate = useNavigate()

  const [showCustomize, setShowCustomize] = useState(false)
  const [customPrefs, setCustomPrefs] = useState({
    essential: true,
    functional: true,
    analytics: true,
  })

  if (cookieConsentGiven) return null

  const toggle = (key) => {
    if (key === 'essential') return
    setCustomPrefs(p => ({ ...p, [key]: !p[key] }))
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        {/* Main banner */}
        <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-amber-400" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white mb-1">Preferințe Cookie-uri 🍪</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Folosim cookie-uri esențiale pentru funcționarea platformei și, opțional, cookie-uri funcționale și analitice
              pentru a-ți oferi o experiență personalizată. Poți accepta toate sau să îți configurezi preferințele.{' '}
              <button
                onClick={() => navigate('/legal/cookies')}
                className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
              >
                Politica de Cookies
              </button>
            </p>

            {/* Customize panel */}
            {showCustomize && (
              <div className="mt-4 flex flex-col gap-2">
                {[
                  { key: 'essential', icon: Shield, label: 'Esențiale', desc: 'Necesare pentru autentificare și funcționarea de bază.', color: 'text-emerald-400', locked: true },
                  { key: 'functional', icon: Settings, label: 'Funcționale', desc: 'Memorizarea preferințelor și setărilor personale.', color: 'text-sky-400', locked: false },
                  { key: 'analytics', icon: BarChart2, label: 'Analitice', desc: 'Statistici anonime pentru îmbunătățirea platformei.', color: 'text-violet-400', locked: false },
                ].map(({ key, icon: Icon, label, desc, color, locked }) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3"
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white">{label}</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{desc}</p>
                    </div>
                    <button
                      onClick={() => toggle(key)}
                      disabled={locked}
                      className={`relative w-10 h-5 rounded-full transition-all shrink-0 ${
                        customPrefs[key] ? 'bg-indigo-600' : 'bg-zinc-600'
                      } ${locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow ${
                          customPrefs[key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    {locked && (
                      <span className="text-[9px] text-slate-500 font-medium uppercase tracking-wide shrink-0">Necesar</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 shrink-0 min-w-[160px]">
            <button
              onClick={acceptAllCookies}
              className="w-full px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              Acceptă toate
            </button>
            <button
              onClick={acceptEssentialOnly}
              className="w-full px-4 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-slate-300 text-xs font-medium transition-colors"
            >
              Doar esențiale
            </button>
            {showCustomize ? (
              <button
                onClick={() => saveCustomCookies(customPrefs)}
                className="w-full px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
              >
                Salvează preferințele
              </button>
            ) : (
              <button
                onClick={() => setShowCustomize(true)}
                className="w-full px-4 py-2 rounded-xl border border-zinc-600 hover:border-zinc-500 text-slate-400 hover:text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-1"
              >
                Personalizează <ChevronDown className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
