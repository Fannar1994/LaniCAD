import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { Dashboard } from '@/pages/Dashboard'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { FenceCalculator } from '@/pages/calculators/FenceCalculator'
import { ScaffoldCalculator } from '@/pages/calculators/ScaffoldCalculator'
import { RollingScaffoldCalculator } from '@/pages/calculators/RollingScaffoldCalculator'
import { CeilingPropsCalculator } from '@/pages/calculators/CeilingPropsCalculator'
import { FormworkCalculator } from '@/pages/calculators/FormworkCalculator'
import { DrawingPage } from '@/pages/DrawingPage'
import { SchematicsPage } from '@/pages/SchematicsPage'
import { TemplatesPage } from '@/pages/TemplatesPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="calculator/fence" element={<FenceCalculator />} />
        <Route path="calculator/scaffolding" element={<ScaffoldCalculator />} />
        <Route path="calculator/rolling" element={<RollingScaffoldCalculator />} />
        <Route path="calculator/ceiling" element={<CeilingPropsCalculator />} />
        <Route path="calculator/formwork" element={<FormworkCalculator />} />
        <Route path="drawing" element={<DrawingPage />} />
        <Route path="schematics" element={<SchematicsPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
