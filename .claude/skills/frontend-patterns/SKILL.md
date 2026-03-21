---
name: frontend-patterns
description: React component patterns, Tailwind styling, shadcn/ui usage, routing, and layout conventions for LániCAD.
argument-hint: What frontend pattern? (component | styling | routing | layout | form)
allowed-tools:
  - read_file
  - replace_string_in_file
  - create_file
  - grep_search
---

# Frontend Patterns Skill

## Stack

- **React 19** with function components + hooks
- **TypeScript 5.7** — strict mode
- **Vite 6** — dev server, HMR, build
- **Tailwind CSS 3.4** — utility-first styling
- **shadcn/ui** — component primitives (not installed via CLI — manual copies)
- **React Router 7** — client-side routing
- **Lucide React** — icon library

## Path Alias

```ts
// tsconfig.app.json
"paths": { "@/*": ["./src/*"] }

// Usage
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
```

## Design Tokens

```css
/* Brand Colors */
--color-dark: #404042;    /* Primary text, sidebar bg */
--color-accent: #f5c800;  /* Yellow accent, highlights, active states */
--color-bg: #f5f5f5;      /* Page background */

/* Fonts */
font-family: 'Barlow', sans-serif;          /* Body text */
font-family: 'Barlow Condensed', sans-serif; /* Headings, sidebar */
```

## Component Patterns

### Page Component
```tsx
export function MyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#404042]">Page Title</h1>
        <button className="bg-[#f5c800] text-[#404042] px-4 py-2 rounded font-semibold hover:bg-yellow-400">
          Action
        </button>
      </div>
      {/* Content */}
    </div>
  )
}
```

### Form Input
```tsx
<label className="block text-sm font-medium text-gray-700">
  Label
  <input
    type="text"
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#f5c800] focus:ring-[#f5c800]"
    value={value}
    onChange={(e) => setValue(e.target.value)}
  />
</label>
```

### Card Container
```tsx
<div className="bg-white rounded-lg shadow p-6">
  {/* Card content */}
</div>
```

## Layout Structure

```
AppShell (flex h-screen)
├── Sidebar (fixed left, 64px collapsed / 256px expanded)
│   ├── Logo (BYKO Leiga)
│   ├── Nav items (LayoutDashboard, FolderOpen)
│   ├── Calculator items (Mobile Fence, Columns3, Box, ArrowUpDown, Ruler)
│   └── Bottom (Settings)
├── Main content area
│   ├── Header (user info, logout)
│   └── <Outlet /> (page content via React Router)
```

## Routing

```tsx
// src/App.tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
    <Route index element={<Dashboard />} />
    <Route path="projects" element={<ProjectsPage />} />
    <Route path="calculator/fence" element={<FenceCalculator />} />
    <Route path="calculator/scaffolding" element={<ScaffoldCalculator />} />
    <Route path="calculator/rolling" element={<RollingScaffoldCalculator />} />
    <Route path="calculator/ceiling" element={<CeilingPropsCalculator />} />
    <Route path="calculator/formwork" element={<FormworkCalculator />} />
    <Route path="settings" element={<SettingsPage />} />
  </Route>
</Routes>
```

## Auth Pattern

```tsx
const { user, login, logout, isAdmin } = useAuth()

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
```

## cn() Utility

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
<div className={cn('base-class', isActive && 'active-class', className)} />
```

## Icelandic UI — Common Labels

| English | Icelandic |
|---|---|
| Dashboard | Yfirlit |
| Projects | Verkefni |
| Settings | Stillingar |
| Save | Vista |
| Cancel | Hætta við |
| Delete | Eyða |
| Export PDF | Sækja PDF |
| Export Excel | Sækja Excel |
| Total | Samtals |
| Quantity | Magn |
| Price | Verð |
| Description | Lýsing |
| Date from | Dagsetning frá |
| Date to | Dagsetning til |
| Days | Dagar |
| Search | Leita |
| User | Notandi |
| Admin | Stjórnandi |
