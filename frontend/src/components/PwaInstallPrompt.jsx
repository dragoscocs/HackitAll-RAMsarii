import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!deferredPrompt) return null

  const handleInstall = async () => {
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/90 backdrop-blur-md border border-zinc-700 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
      <Download size={18} className="text-lime-400 shrink-0" />
      <span className="text-sm text-zinc-200 whitespace-nowrap">
        Instalează aplicația EcoSync pe ecranul principal
      </span>
      <button
        onClick={handleInstall}
        className="ml-2 px-4 py-1.5 rounded-xl bg-lime-400 text-zinc-900 text-sm font-semibold hover:bg-lime-300 active:scale-95 transition-all shrink-0"
      >
        Instalează
      </button>
      <button
        onClick={() => setDeferredPrompt(null)}
        className="text-zinc-500 hover:text-zinc-300 transition-colors text-lg leading-none shrink-0"
        aria-label="Închide"
      >
        ×
      </button>
    </div>
  )
}
