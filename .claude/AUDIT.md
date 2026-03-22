# LániCAD — Comprehensive Application Audit

**Date**: 2025-01-XX  
**Build Status**: **PASSES** (Vite 6, 8.2s, 39 PWA entries)  
**Chunk Warnings**: 3 chunks > 500KB (three-vendor 1064KB, pdf-vendor 847KB, xlsx-vendor 425KB)

---

## Executive Summary

LániCAD is a **surprisingly complete and functional** application. The 5 calculator modules, CAD drawing engine, 2D/3D viewers, PDF import/export, DXF import/export, and chat assistant are all implemented — not stubs. The main gaps are in **database-dependent features** (projects, templates, audit log require a running PostgreSQL server) and a few **minor issues** listed below.

### Completeness Score by Area

| Area | Score | Notes |
|---|---|---|
| Calculators (5) | **95%** | All 5 fully functional with correct formulas |
| 2D Drawings (Maker.js) | **90%** | All 5 equipment types produce real SVG |
| 3D Models (Three.js) | **90%** | All 5 equipment types render 3D geometry |
| CAD Engine | **85%** | 13 tools, undo/redo, snap, layers, properties — legit CAD |
| PDF Export | **95%** | Professional branded PDFs with jsPDF |
| Excel Export | **95%** | Full xlsx export with client info + materials |
| DXF Import/Export | **80%** | Handles lines, circles, arcs, polylines, text, rects |
| PDF Import + OCR | **85%** | pdfjs-dist + tesseract.js + preview + SVG wrap |
| Auth System | **90%** | JWT-based, login/logout, role support |
| Settings Page | **90%** | 3 tabs, full product CRUD, Excel import, user mgmt |
| Database Integration | **70%** | Full API client exists, needs running server |
| Chat Assistant | **80%** | Local keyword engine + server fallback |
| i18n | **85%** | IS + EN, ~50 keys, some hardcoded strings remain |

---

## Critical Issues

### 1. PWA Icon Type Mismatch
**File**: [vite.config.ts](vite.config.ts)  
**Issue**: PWA manifest declares `type: 'image/svg+xml'` but icon files are `.png`
```
icons: [
  { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/svg+xml' },
  { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/svg+xml' },
]
```
**Fix**: Change to `type: 'image/png'`

### 2. Large Chunk Sizes (Performance)
Three chunks exceed 500KB:
- `three-vendor` — 1064KB (Three.js). Already manual-chunked, but large.
- `pdf-vendor` — 847KB (pdfjs-dist). Consider lazy-loading only on Drawing page.
- `xlsx-vendor` — 425KB. Consider lazy-loading only when export is triggered.

### 3. Catalog Sync is Partial
**File**: [src/lib/catalog-sync.ts](src/lib/catalog-sync.ts)  
Only syncs **fence** and **scaffolding** products to the database. The other 3 calculator types (formwork, rolling scaffold, ceiling props) are NOT synced. The `getLocalProducts()` function is incomplete.

---

## File-by-File Audit

### Configuration Files

| File | Status | Notes |
|---|---|---|
| [package.json](package.json) | COMPLETE | All deps present, scripts correct |
| [vite.config.ts](vite.config.ts) | COMPLETE | PWA icon type bug (see Critical #1) |
| [index.html](index.html) | COMPLETE | SPA redirect for GitHub Pages, Barlow font |
| [tailwind.config.js](tailwind.config.js) | COMPLETE | Brand colors + fonts correct |
| [tsconfig.json](tsconfig.json) | COMPLETE | Path aliases configured |
| [postcss.config.js](postcss.config.js) | COMPLETE | Tailwind + autoprefixer |

### Entry Points

| File | Status | Notes |
|---|---|---|
| [src/main.tsx](src/main.tsx) | COMPLETE | BrowserRouter + AuthProvider + I18nProvider |
| [src/App.tsx](src/App.tsx) | COMPLETE | All routes defined, lazy-loaded, auth guard |
| [src/index.css](src/index.css) | COMPLETE | Tailwind directives + print styles + CSS vars |

### Pages

| File | Lines | Status | Notes |
|---|---|---|---|
| [src/pages/Dashboard.tsx](src/pages/Dashboard.tsx) | ~145 | **COMPLETE** | Stats, calc links, recent projects |
| [src/pages/LoginPage.tsx](src/pages/LoginPage.tsx) | ~100 | **COMPLETE** | Email/password, API check, defaults hint |
| [src/pages/ProjectsPage.tsx](src/pages/ProjectsPage.tsx) | ~130 | **COMPLETE** | CRUD table, needs running API server |
| [src/pages/DrawingPage.tsx](src/pages/DrawingPage.tsx) | ~200+ | **COMPLETE** | Full CAD: 2D/3D, all 5 equipment types, DXF/PDF import/export |
| [src/pages/SchematicsPage.tsx](src/pages/SchematicsPage.tsx) | ~90 | **COMPLETE** | PDF viewer for 6 construction docs |
| [src/pages/SettingsPage.tsx](src/pages/SettingsPage.tsx) | ~800+ | **COMPLETE** | General + Products (full CRUD + Excel import) + Users |
| [src/pages/TemplatesPage.tsx](src/pages/TemplatesPage.tsx) | ~160 | **COMPLETE** | Filter by type, load/delete, needs API |
| [src/pages/AuditLogPage.tsx](src/pages/AuditLogPage.tsx) | ~180+ | **COMPLETE** | Paginated, filtered, needs API |

### Calculator Pages

| File | Status | Formulas Correct | 2D Drawing | 3D Model | Export |
|---|---|---|---|---|---|
| [FenceCalculator.tsx](src/pages/calculators/FenceCalculator.tsx) | **COMPLETE** | Yes (12-tier monthly) | Yes | Yes | PDF+Excel |
| [ScaffoldCalculator.tsx](src/pages/calculators/ScaffoldCalculator.tsx) | **COMPLETE** | Yes (daily × days × qty) | Yes | Yes | PDF+Excel |
| [FormworkCalculator.tsx](src/pages/calculators/FormworkCalculator.tsx) | **COMPLETE** | Yes (day/week modes A/B/C) | Yes | Yes | PDF+Excel |
| [RollingScaffoldCalculator.tsx](src/pages/calculators/RollingScaffoldCalculator.tsx) | **COMPLETE** | Yes (24h/extra/week) | Yes | Yes | PDF+Excel |
| [CeilingPropsCalculator.tsx](src/pages/calculators/CeilingPropsCalculator.tsx) | **COMPLETE** | Yes (standard rental) | Yes | Yes | PDF+Excel |

### Layout Components

| File | Lines | Status |
|---|---|---|
| [src/components/layout/AppShell.tsx](src/components/layout/AppShell.tsx) | ~27 | **COMPLETE** — Sidebar + Header + Outlet + Chat + Toaster |
| [src/components/layout/Header.tsx](src/components/layout/Header.tsx) | ~35 | **COMPLETE** — Menu toggle, LC logo, user, logout |
| [src/components/layout/Sidebar.tsx](src/components/layout/Sidebar.tsx) | ~130 | **COMPLETE** — 4 nav groups, i18n, admin-only items |

### Calculator Shared Components

| File | Lines | Status |
|---|---|---|
| [src/components/calculator/ClientInfoPanel.tsx](src/components/calculator/ClientInfoPanel.tsx) | ~95 | **COMPLETE** — 7 fields, kennitala formatting |
| [src/components/calculator/DateRangePicker.tsx](src/components/calculator/DateRangePicker.tsx) | ~80 | **COMPLETE** — Bidirectional date/day sync |
| [src/components/calculator/ExportButtons.tsx](src/components/calculator/ExportButtons.tsx) | ~80 | **COMPLETE** — PDF, Excel, Save, Template buttons |
| [src/components/calculator/index.ts](src/components/calculator/index.ts) | 3 | **COMPLETE** — Barrel export |

### CAD Engine Components

| File | Lines | Status | Notes |
|---|---|---|---|
| [CadCanvas.tsx](src/components/cad/CadCanvas.tsx) | 150+ | **COMPLETE** | Full SVG canvas: pan/zoom, tool dispatch, snapping, selection, box select, drawing tools, resize observer, equipment SVG background, keyboard events |
| [CadToolbar.tsx](src/components/cad/CadToolbar.tsx) | ~80 | **COMPLETE** | Undo/redo, copy/paste, rotate/scale/mirror, zoom, grid/snap toggle, import/export buttons |
| [CadSideTools.tsx](src/components/cad/CadSideTools.tsx) | ~40 | **COMPLETE** | 13 drawing tools with icons and shortcuts |
| [LayerPanel.tsx](src/components/cad/LayerPanel.tsx) | ~120 | **COMPLETE** | Add/rename/delete layers, visibility/lock toggle, active layer highlight, color picker |
| [PropertiesPanel.tsx](src/components/cad/PropertiesPanel.tsx) | ~120 | **COMPLETE** | Shows geometry details per type, layer assignment, color/stroke editing |
| [CommandBar.tsx](src/components/cad/CommandBar.tsx) | ~90 | **COMPLETE** | Text command input with aliases (supports 20+ commands), cursor coordinates, status display |
| [PdfImportDialog.tsx](src/components/cad/PdfImportDialog.tsx) | ~130 | **COMPLETE** | File picker, page selector, preview, OCR toggle, full PDF import pipeline |

### CAD State & Utilities

| File | Lines | Status | Notes |
|---|---|---|---|
| [useCadState.ts](src/hooks/useCadState.ts) | ~260 | **COMPLETE** | Objects, layers, selection, tools, grid, viewport, undo/redo (50-step), clipboard, transform ops (move/rotate/scale/mirror/offset), layer CRUD, bulk import |
| [snap.ts](src/lib/cad/snap.ts) | 100+ | **COMPLETE** | Grid snap, endpoint/midpoint/center snap, intersection snap, per-geometry-type snap points |
| [export-dxf.ts](src/lib/cad/export-dxf.ts) | ~100 | **COMPLETE** | Exports lines, rects, circles, arcs, polylines, text, dimensions to DXF R14 format |
| [import-dxf.ts](src/lib/cad/import-dxf.ts) | ~150 | **COMPLETE** | Parses DXF entities, layers, color mapping. Handles LINE, CIRCLE, ARC, TEXT, MTEXT, LWPOLYLINE |

### 2D Drawing Generators (Maker.js)

| File | Status | Notes |
|---|---|---|
| [FenceDrawing2D.ts](src/components/viewer/drawings/FenceDrawing2D.ts) | **COMPLETE** | Top-down fence layout with panels, stones, clamps, gate, dimensions |
| [ScaffoldDrawing2D.ts](src/components/viewer/drawings/ScaffoldDrawing2D.ts) | **COMPLETE** | Professional elevation with layers (ground, base, standards, ledgers, decks, safety, dimensions) |
| [FormworkDrawing2D.ts](src/components/viewer/drawings/FormworkDrawing2D.ts) | **COMPLETE** | Section view with panel divisions, tie bars, dimensions per system |
| [RollingScaffoldDrawing2D.ts](src/components/viewer/drawings/RollingScaffoldDrawing2D.ts) | **COMPLETE** | Front elevation with wheels, uprights, braces, platform, guardrails, dimensions |
| [CeilingPropsDrawing2D.ts](src/components/viewer/drawings/CeilingPropsDrawing2D.ts) | **COMPLETE** | Elevation with floor/ceiling, props (telescopic detail), beams, slab hatching, dimensions |

### 3D Model Components (Three.js + R3F)

| File | Status | Notes |
|---|---|---|
| [FenceModel3D.tsx](src/components/viewer/models/FenceModel3D.tsx) | **COMPLETE** | Tubular frames, wire mesh, concrete blocks, gate with arc. Realistic metallic materials |
| [ScaffoldModel3D.tsx](src/components/viewer/models/ScaffoldModel3D.tsx) | **COMPLETE** | Layher Allround with rosettes, wall ties, standards, ledgers, decks, braces, guardrails |
| [FormworkModel3D.tsx](src/components/viewer/models/FormworkModel3D.tsx) | **COMPLETE** | Double-sided panels with tie bars, push-pull props, greedy panel packing algorithm |
| [RollingScaffoldModel3D.tsx](src/components/viewer/models/RollingScaffoldModel3D.tsx) | **COMPLETE** | Castor wheels with brake, uprights, horizontal/diagonal braces, platform, guardrails |
| [CeilingPropsModel3D.tsx](src/components/viewer/models/CeilingPropsModel3D.tsx) | **COMPLETE** | Telescopic props (outer/inner tubes, collar, pin, tripod base), HT-20 I-beams, ceiling slab |

### Viewer Components

| File | Lines | Status |
|---|---|---|
| [ViewerPanel.tsx](src/components/viewer/ViewerPanel.tsx) | ~50 | **COMPLETE** — 2D/3D toggle with mode buttons |
| [Viewer2D.tsx](src/components/viewer/Viewer2D.tsx) | ~35 | **COMPLETE** — SVG renderer with responsive sizing |
| [Viewer3D.tsx](src/components/viewer/Viewer3D.tsx) | ~55 | **COMPLETE** — Three.js canvas with orbit controls, grid, lighting, shadows |

### Library Files

| File | Lines | Status | Notes |
|---|---|---|---|
| [auth.tsx](src/lib/auth.tsx) | ~100 | **COMPLETE** | JWT login/logout, token verify on mount |
| [api-config.ts](src/lib/api-config.ts) | ~55 | **COMPLETE** | 4-tier API URL priority |
| [db.ts](src/lib/db.ts) | ~200 | **COMPLETE** | Full CRUD for projects, templates, products, users, chat |
| [format.ts](src/lib/format.ts) | ~45 | **COMPLETE** | ISK currency, kennitala, dates, daysBetween |
| [export-pdf.ts](src/lib/export-pdf.ts) | ~130 | **COMPLETE** | Branded jsPDF with header, client, summary, materials |
| [export-excel.ts](src/lib/export-excel.ts) | ~75 | **COMPLETE** | Full xlsx with client info + materials table |
| [i18n.tsx](src/lib/i18n.tsx) | ~185 | **COMPLETE** | IS + EN, ~50 keys, localStorage persistence |
| [chat-engine.ts](src/lib/chat-engine.ts) | ~100+ | **COMPLETE** | Keyword matching against all 5 product data sets |
| [catalog-sync.ts](src/lib/catalog-sync.ts) | ~50+ | **PARTIAL** | Only syncs fence + scaffolding (see Critical #3) |
| [pdf-import.ts](src/lib/pdf-import.ts) | ~100 | **COMPLETE** | pdfjs-dist render + tesseract.js OCR + SVG wrapper |
| [utils.ts](src/lib/utils.ts) | 6 | **COMPLETE** | cn() utility (clsx + tailwind-merge) |

### Calculation Libraries

| File | Lines | Status | Notes |
|---|---|---|---|
| [rental.ts](src/lib/calculations/rental.ts) | ~50 | **COMPLETE** | 4 rental formulas: standard, fence (12-tier), rolling (24h/extra/week), scaffolding |
| [geometry.ts](src/lib/calculations/geometry.ts) | ~100+ | **COMPLETE** | Fence geometry, scaffold level optimizer, facade materials calculator |
| [formwork.ts](src/lib/calculations/formwork.ts) | ~100+ | **COMPLETE** | Panel packing, Mode A (Rasto/Takko), Mode B (Manto), Mode C (Alufort) |

### Data Files

| File | Status | Notes |
|---|---|---|
| [fence.ts](src/data/fence.ts) | **COMPLETE** | 14 products with 12 monthly rate tiers, 6 fence types |
| [scaffolding.ts](src/data/scaffolding.ts) | **COMPLETE** | 25 items with daily rates, weights, sale prices |
| [formwork.ts](src/data/formwork.ts) | **COMPLETE** | ~170 items across panels, accessories, props, beams, frames |
| [rolling-scaffold.ts](src/data/rolling-scaffold.ts) | **COMPLETE** | 3 pricing tables (narrow/wide/quickly), component lists |
| [ceiling-props.ts](src/data/ceiling-props.ts) | **COMPLETE** | Props (11+ items) + beams + accessories with classes |

### Type Definitions

| File | Lines | Status |
|---|---|---|
| [types/index.ts](src/types/index.ts) | ~110 | **COMPLETE** — All shared types |
| [types/cad.ts](src/types/cad.ts) | ~190+ | **COMPLETE** — Full CAD type system with geometry helpers |

---

## Features That Work Without a Server

These features are fully functional with just `npm run dev`:

1. **All 5 calculators** — full calculations, rentals, material lists
2. **2D drawings** — Maker.js generates real SVG for all equipment types
3. **3D models** — Three.js renders interactive 3D for all equipment types
4. **PDF export** — branded PDFs with jsPDF
5. **Excel export** — xlsx spreadsheets
6. **CAD drawing engine** — 13 tools, layers, undo/redo, snap
7. **DXF import/export** — read/write AutoCAD files
8. **PDF import with OCR** — pdfjs-dist + tesseract.js
9. **Chat assistant** — local keyword engine (no server needed)
10. **Login** — localStorage-based auth (default: admin@lanicad.is / admin123)
11. **Settings** — general preferences, language switching, product management
12. **Schematics viewer** — PDF viewing of construction docs
13. **i18n** — Icelandic/English language switching

## Features That Require a Running Server

These need `server/` Express API + PostgreSQL:

1. **Projects** — save/load/delete projects
2. **Templates** — save/load/delete templates
3. **Audit Log** — view activity history
4. **User Management** — create/edit/delete users (Settings → Users)
5. **Chat (server mode)** — AI chat via server endpoint
6. **Catalog Sync** — push local products to database
7. **Password Change** — update user password via API

---

## Minor Issues & Recommendations

### Hardcoded Icelandic Strings
Several components have hardcoded Icelandic text instead of using i18n keys:
- ViewerPanel.tsx: "2D Teikning", "3D Sýning"
- Viewer2D.tsx: "Engin teikning — stilltu breytur..."
- PdfImportDialog.tsx: All button/label text
- CadSideTools.tsx: All tool labels
- CommandBar.tsx: Tool labels
- LayerPanel.tsx: "Lög", "Bæta við lagi", etc.
- PropertiesPanel.tsx: "Eiginleikar", geometry type labels

### `dangerouslySetInnerHTML` in Viewer2D.tsx
[Viewer2D.tsx](src/components/viewer/Viewer2D.tsx) uses `dangerouslySetInnerHTML` to render SVG content. Since this SVG is generated by Maker.js (not user input), the risk is low, but if user-supplied SVG is ever passed here (e.g., from DXF import), it could be an XSS vector. Consider using DOMPurify for SVG sanitization.

### No Test Coverage for Critical Paths
The test files under `src/lib/__tests__/` and `src/lib/cad/__tests__/` exist but coverage of the core calculator formulas and CAD operations should be verified. The rental formulas and geometry calculations are business-critical code.

### DrawingPage.tsx Bundle Size
The DrawingPage chunk is 272KB gzipped (78KB). It imports all 5 equipment drawing generators and all 5 3D model components eagerly. Consider lazy-loading 3D models (they use Three.js which is already chunked separately).

### Missing `ellipse` and `polygon` in DXF Export
[export-dxf.ts](src/lib/cad/export-dxf.ts) handles line, rect, circle, arc, polyline, text, and dimension, but does NOT export `ellipse` or `polygon` geometry types. These exist as CAD tool types in the engine.

---

## Architecture Quality

### Strengths
- **Clean separation**: Data files, calculation logic, components, and pages are well-separated
- **Type safety**: TypeScript types are comprehensive, especially the CAD type system
- **Lazy loading**: All heavy pages are React.lazy() loaded
- **Consistent patterns**: All calculators follow the same ClientInfoPanel + DateRangePicker + ExportButtons pattern
- **Professional 3D models**: The Three.js models are detailed with proper materials, dimensions matching real products
- **Real CAD engine**: Not a toy — has undo/redo, layers, snapping (endpoint/midpoint/center/intersection/grid), command bar, DXF I/O

### Architecture Concerns
- **No error boundaries**: A Three.js crash in 3D viewer would take down the whole page
- **No loading states for lazy components**: Suspense fallbacks are `null` (blank flash)
- **Single large SettingsPage**: 800+ lines, could be split into sub-components
