import { createContext, useContext, useState, useEffect } from 'react'

const PrivacyContext = createContext(null)

const DEFAULT_PREFS = {
  // Cookie categories
  cookies: {
    essential: true,   // always true, cannot be disabled
    functional: true,
    analytics: true,
  },
  // Data display preferences
  display: {
    workSchedule: true,
    sportsPreferences: true,
    workLocation: true,
    breakStats: true,
    moodData: true,
    calendarData: true,
    matchmakingProfile: true,
  },
}

const STORAGE_KEY = 'syncfit_privacy'
const COOKIE_CONSENT_KEY = 'syncfit_cookie_consent'

export function PrivacyProvider({ children }) {
  const [prefs, setPrefs] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge with defaults to handle new keys
        return {
          cookies: { ...DEFAULT_PREFS.cookies, ...parsed.cookies, essential: true },
          display: { ...DEFAULT_PREFS.display, ...parsed.display },
        }
      }
    } catch {}
    return DEFAULT_PREFS
  })

  const [cookieConsentState, setCookieConsentState] = useState(() => {
    return localStorage.getItem(COOKIE_CONSENT_KEY) // null | 'all' | 'essential'
  })

  const updateCookies = (cookiePrefs) => {
    const updated = { ...prefs, cookies: { ...cookiePrefs, essential: true } }
    setPrefs(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const updateDisplay = (displayPrefs) => {
    const updated = { ...prefs, display: { ...prefs.display, ...displayPrefs } }
    setPrefs(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const acceptAllCookies = () => {
    const updated = { ...prefs, cookies: { essential: true, functional: true, analytics: true } }
    setPrefs(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    localStorage.setItem(COOKIE_CONSENT_KEY, 'all')
    setCookieConsentState('all')
  }

  const acceptEssentialOnly = () => {
    const updated = { ...prefs, cookies: { essential: true, functional: false, analytics: false } }
    setPrefs(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    localStorage.setItem(COOKIE_CONSENT_KEY, 'essential')
    setCookieConsentState('essential')
  }

  const saveCustomCookies = (cookiePrefs) => {
    updateCookies(cookiePrefs)
    localStorage.setItem(COOKIE_CONSENT_KEY, 'custom')
    setCookieConsentState('custom')
  }

  const resetConsent = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY)
    setCookieConsentState(null)
  }

  return (
    <PrivacyContext.Provider value={{
      prefs,
      cookieConsentGiven: cookieConsentState !== null,
      cookieConsentState,
      updateDisplay,
      updateCookies,
      acceptAllCookies,
      acceptEssentialOnly,
      saveCustomCookies,
      resetConsent,
    }}>
      {children}
    </PrivacyContext.Provider>
  )
}

export function usePrivacy() {
  const ctx = useContext(PrivacyContext)
  if (!ctx) throw new Error('usePrivacy must be used within PrivacyProvider')
  return ctx
}
