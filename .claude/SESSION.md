# LániCAD — Session Log

> This file tracks the current session's progress, decisions, and context.

---

## Current State (2026-07)

### Project Status: Phase 1 — Stabilize & Ship (In Progress)
LániCAD is a fully functional 2D/3D CAD system for construction equipment rental with 5 calculators, project management, templates, AI chat, and 2D/3D visualization. Currently stabilizing for real-world use at BYKO Leiga.

### Latest Session Work
1. **Gátskjöldur naming fix** — Fixed inconsistency "Gátaskjöldur" → "Gátskjöldur" in fence.ts (2 places)
2. **Phase 2.2 PDF Import & OCR** — Enhanced PDF import system:
   - Added dedicated `pdf-background` layer (renders behind all content, locked by default)
   - Added native PDF text extraction via `page.getTextContent()` (fast, no OCR needed for digital PDFs)
   - Added measurement extraction parser (mm, m, cm patterns) → structured `ExtractedMeasurement[]`
   - Enhanced PdfImportDialog with measurements display (blue tags) and collapsible extracted text panel
   - PDFs now import at 0.6 opacity on background layer instead of equipment layer
3. **All 178 tests passing**, build clean

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
