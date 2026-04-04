import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CalendarProvider } from './context/CalendarContext'
import AuthPage from './pages/AuthPage'
import Dashboard from './components/Dashboard'
import PausePage from './pages/PausePage'
import ProgramPage from './pages/ProgramPage'
import MyProfilePage from './pages/MyProfilePage'
import MatchesPage from './pages/MatchesPage'

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
      <Route path="/"           element={<Navigate to="/dashboard" replace />} />
      <Route path="*"           element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CalendarProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CalendarProvider>
    </AuthProvider>
  )
}
