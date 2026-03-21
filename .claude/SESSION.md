# LániCAD — Session Log

> This file tracks the current session's progress, decisions, and context.

---

## Current State (2026-07)

### Project Status: Feature Complete (Core)
LániCAD is a fully functional 2D/3D CAD system for construction equipment rental with 5 calculators, project management, templates, AI chat, and 2D/3D visualization.

### Latest Session Work
1. **Templates Management UI** — Created TemplatesPage with list/filter/delete, Vista snidmat button in all 5 calculators, template loading into calculators via location.state, sidebar + route added
2. **Save Project Feature** — All 5 calculators can save/update projects to PostgreSQL (with toast feedback)
3. **Dashboard Rewrite** — Stats, 5 calculator links, 2 tool links, recent projects feed
4. **Toast Notifications** — Installed sonner, integrated into AppShell

### Architecture
| Layer | Tech | Status |
|---|---|---|
| Frontend | Vite 6 + React 19 + TypeScript + Tailwind + shadcn/ui | Complete |
| Backend | Express + PostgreSQL (port 3001 to 54937) | Complete |
| Auth | JWT + localStorage AuthProvider | Complete |
| 2D Engine | Maker.js to SVG | Complete |
| 3D Engine | Three.js + React Three Fiber | Complete |
| AI Chat | Claude Sonnet 4 via Express | Complete |
| Tests | Vitest — 108/108 passing | Complete |
| CI/CD | GitHub Actions to GitHub Pages | Complete |

### 10 Routes
`/` Dashboard, `/projects`, `/templates`, `/calculator/{fence,scaffolding,rolling,ceiling,formwork}`, `/drawing`, `/schematics`, `/settings`, `/login`
