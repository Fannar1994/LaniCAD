import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Dashboard } from '@/pages/Dashboard'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { useAuth } from '@/lib/auth'

// Lazy-loaded pages (code-split heavy chunks: Three.js, PDF.js, Tesseract, calculators)
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const FenceCalculator = lazy(() => import('@/pages/calculators/FenceCalculator').then(m => ({ default: m.FenceCalculator })))
const ScaffoldCalculator = lazy(() => import('@/pages/calculators/ScaffoldCalculator').then(m => ({ default: m.ScaffoldCalculator })))
const RollingScaffoldCalculator = lazy(() => import('@/pages/calculators/RollingScaffoldCalculator').then(m => ({ default: m.RollingScaffoldCalculator })))
const CeilingPropsCalculator = lazy(() => import('@/pages/calculators/CeilingPropsCalculator').then(m => ({ default: m.CeilingPropsCalculator })))
const FormworkCalculator = lazy(() => import('@/pages/calculators/FormworkCalculator').then(m => ({ default: m.FormworkCalculator })))
const DrawingPage = lazy(() => import('@/pages/DrawingPage').then(m => ({ default: m.DrawingPage })))
const SchematicsPage = lazy(() => import('@/pages/SchematicsPage').then(m => ({ default: m.SchematicsPage })))
const TemplatesPage = lazy(() => import('@/pages/TemplatesPage').then(m => ({ default: m.TemplatesPage })))

function LazyFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-accent border-t-transparent" />
    </div>
  )
}

// Lazy-loaded admin pages
const AuditLogPage = lazy(() => import('@/pages/AuditLogPage').then(m => ({ default: m.AuditLogPage })))

export function App() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <ErrorBoundary>
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Suspense fallback={<LazyFallback />}><ProjectsPage /></Suspense>} />
        <Route path="calculator/fence" element={<Suspense fallback={<LazyFallback />}><FenceCalculator /></Suspense>} />
        <Route path="calculator/scaffolding" element={<Suspense fallback={<LazyFallback />}><ScaffoldCalculator /></Suspense>} />
        <Route path="calculator/rolling" element={<Suspense fallback={<LazyFallback />}><RollingScaffoldCalculator /></Suspense>} />
        <Route path="calculator/ceiling" element={<Suspense fallback={<LazyFallback />}><CeilingPropsCalculator /></Suspense>} />
        <Route path="calculator/formwork" element={<Suspense fallback={<LazyFallback />}><FormworkCalculator /></Suspense>} />
        <Route path="drawing" element={<Suspense fallback={<LazyFallback />}><DrawingPage /></Suspense>} />
        <Route path="schematics" element={<Suspense fallback={<LazyFallback />}><SchematicsPage /></Suspense>} />
        <Route path="templates" element={<Suspense fallback={<LazyFallback />}><TemplatesPage /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<LazyFallback />}><SettingsPage /></Suspense>} />
        <Route path="audit-log" element={<Suspense fallback={<LazyFallback />}><AuditLogPage /></Suspense>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/login" element={<Navigate to="/" replace />} />
    </Routes>
    </ErrorBoundary>
  )
}
