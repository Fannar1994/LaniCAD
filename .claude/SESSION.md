# LániCAD — Session Log

> This file tracks the current session's progress, decisions, and context.

---

## Current State (2026-07)

### Project Status: Phase 1 — Stabilize & Ship (In Progress)
LániCAD is a fully functional 2D/3D CAD system for construction equipment rental with 5 calculators, project management, templates, AI chat, and 2D/3D visualization. Currently stabilizing for real-world use at BYKO Leiga.

### Latest Session Work (45eb031)
1. **Professional PDF Template** — Complete rewrite of export-pdf.ts with BYKO Leiga branding, two-column client/period layout, terms section, dark total box with gold text
2. **Offline Save Queue** — Added localStorage-based queue in db.ts that catches network failures on mutations, auto-retries on reconnect
3. **FormworkCalculator State Restore** — Fixed 26 mode A-F state variables that were saved but never restored from initData
4. **Responsive Breakpoints** — Changed all `sm:grid-cols-3` to `md:grid-cols-3` in DateRangePicker, ScaffoldCalculator, FormworkCalculator for better tablet layout
5. **TemplateNameDialog** — Replaced all prompt() calls with modal dialogs across all 5 calculators (previous commit 04ad846)
6. **Kennitala Validation** — Added format validation in ClientInfoPanel
7. **Accessibility** — Added aria-labels to ExportButtons, zero-price warnings in scaffold calculator
8. **Auth Security** — Hardened: localhost-only offline bypass, 401 auto-logout, admin route guards, JWT secret warning (commit cef04ad)
9. **Phase 2.1 Drawing Generators** — FormworkCalculator ViewerPanel visible for all 6 systems, scale bars + LániCAD branding on Fence/Rolling/Ceiling drawings (commit c88dd8f)
10. **Calculator → DrawingPage Bridge** — Added "Opna í teikniborði" button to all 5 calculators, DrawingPage reads navigation state to pre-fill equipment params

### Architecture
| Layer | Tech | Status |
|---|---|---|
| Frontend | Vite 6 + React 19 + TypeScript + Tailwind + shadcn/ui | Complete |
| Backend | Express + Turso (libSQL) | Complete |
| Auth | JWT + localStorage AuthProvider | Complete |
| 2D Engine | Maker.js → SVG | Complete |
| 3D Engine | Three.js + React Three Fiber | Complete |
| PDF Export | jsPDF + jspdf-autotable (professional template) | Complete |
| Offline | Service worker PWA + save queue | Complete |
| Tests | Vitest — 178/178 passing | Complete |
| CI/CD | GitHub Actions → GitHub Pages | Complete |

### 10 Routes
`/` Dashboard, `/projects`, `/templates`, `/calculator/{fence,scaffolding,rolling,ceiling,formwork}`, `/drawing`, `/schematics`, `/settings`, `/login`
