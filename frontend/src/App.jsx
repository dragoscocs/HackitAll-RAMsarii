import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CalendarProvider } from './context/CalendarContext'
import { PrivacyProvider } from './context/PrivacyContext'
import LegalFooter from './components/LegalFooter'
import ScrollToTop from './components/ScrollToTop'
import CookieConsent from './components/CookieConsent'
import AuthPage from './pages/AuthPage'
import Dashboard from './components/Dashboard'
import PausePage from './pages/PausePage'
import ProgramPage from './pages/ProgramPage'
import MyProfilePage from './pages/MyProfilePage'
import MatchesPage from './pages/MatchesPage'
import LegalDocumentPage from './pages/LegalDocumentPage'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"      element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/pause"      element={<ProtectedRoute><PausePage /></ProtectedRoute>} />
      <Route path="/program"    element={<ProtectedRoute><ProgramPage /></ProtectedRoute>} />
      <Route path="/my-profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />
      <Route path="/matches"    element={<ProtectedRoute><MatchesPage /></ProtectedRoute>} />
      <Route path="/legal/:docId" element={<LegalDocumentPage />} />
      <Route path="/"           element={<Navigate to="/dashboard" replace />} />
      <Route path="*"           element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <PrivacyProvider>
      <AuthProvider>
        <CalendarProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen bg-surface">
              <div className="flex-1 flex flex-col">
                <AppRoutes />
              </div>
              <LegalFooter />
            </div>
            <CookieConsent />
          </BrowserRouter>
        </CalendarProvider>
      </AuthProvider>
    </PrivacyProvider>
  )
}
