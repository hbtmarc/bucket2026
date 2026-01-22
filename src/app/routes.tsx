import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { LoginPage } from '../features/auth/LoginPage'
import { DashboardPage } from '../features/dashboard/DashboardPage.tsx'
import { KanbanPage } from '../features/kanban/KanbanPage.tsx'
import { ThemesPage } from '../features/themes/ThemesPage.tsx'
import { ThemeDetailPage } from '../features/themes/ThemeDetailPage.tsx'
import { SettingsPage } from '../features/themes/SettingsPage.tsx'
import { useAuth } from '../features/auth/AuthContext'
import { AppShell } from './layout/AppShell'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        Carregando...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return <>{children}</>
}

export const AppRoutes = () => (
  <Routes>
    <Route
      path="/login"
      element={
        <PublicOnlyRoute>
          <LoginPage />
        </PublicOnlyRoute>
      }
    />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <AppShell>
            <DashboardPage />
          </AppShell>
        </ProtectedRoute>
      }
    />
    <Route
      path="/kanban"
      element={
        <ProtectedRoute>
          <AppShell>
            <KanbanPage />
          </AppShell>
        </ProtectedRoute>
      }
    />
    <Route
      path="/themes"
      element={
        <ProtectedRoute>
          <AppShell>
            <ThemesPage />
          </AppShell>
        </ProtectedRoute>
      }
    />
    <Route
      path="/theme/:themeId"
      element={
        <ProtectedRoute>
          <AppShell>
            <ThemeDetailPage />
          </AppShell>
        </ProtectedRoute>
      }
    />
    <Route
      path="/settings"
      element={
        <ProtectedRoute>
          <AppShell>
            <SettingsPage />
          </AppShell>
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)
