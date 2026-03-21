import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Dashboard } from '@/pages/Dashboard'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { FenceCalculator } from '@/pages/calculators/FenceCalculator'
import { ScaffoldCalculator } from '@/pages/calculators/ScaffoldCalculator'
import { LayherSpeedyCalculator } from '@/pages/calculators/LayherSpeedyCalculator'
import { ID15Calculator } from '@/pages/calculators/ID15Calculator'
import { ST60Calculator } from '@/pages/calculators/ST60Calculator'
import { TopecCalculator } from '@/pages/calculators/TopecCalculator'
import { RollingScaffoldCalculator } from '@/pages/calculators/RollingScaffoldCalculator'
import { CeilingPropsCalculator } from '@/pages/calculators/CeilingPropsCalculator'
import { FormworkCalculator } from '@/pages/calculators/FormworkCalculator'
import { DrawingPage } from '@/pages/DrawingPage'
import { SchematicsPage } from '@/pages/SchematicsPage'
import { TemplatesPage } from '@/pages/TemplatesPage'

export function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<AppShell />}
      >
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="calculator/fence" element={<FenceCalculator />} />
        <Route path="calculator/scaffolding/villalta" element={<ScaffoldCalculator />} />
        <Route path="calculator/scaffolding/layher-speedy" element={<LayherSpeedyCalculator />} />
        <Route path="calculator/scaffolding/id15" element={<ID15Calculator />} />
        <Route path="calculator/scaffolding/st60" element={<ST60Calculator />} />
        <Route path="calculator/scaffolding/topec" element={<TopecCalculator />} />
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
