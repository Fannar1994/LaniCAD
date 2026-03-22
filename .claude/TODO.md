# LániCAD — Active TODO

> Checked items completed. Unchecked items are pending. Updated after every task.

## Infrastructure (DONE)
- [x] Project scaffolding (Vite + React + TypeScript + Tailwind)
- [x] .claude/ docs (CLAUDE.md, skills/, SESSION.md, TODO.md, API.md, DEPLOYMENT.md)
- [x] PostgreSQL + Express API backend (server/)
- [x] GitHub Actions CI/CD (deploy.yml)
- [x] Auth system (JWT + localStorage AuthProvider)

## Core Features (DONE)
- [x] All 5 calculators: Fence, Scaffolding, Formwork, Rolling, Ceiling
- [x] PDF export (jsPDF) for all calculators
- [x] Excel export (xlsx) for all calculators
- [x] Project save/load from all 5 calculators (create + update)
- [x] Templates management (save/load/delete, TemplatesPage)
- [x] Dashboard with stats, quick links, recent projects
- [x] Settings page (General, Products, Users tabs)
- [x] AI Chat panel (Claude Sonnet 4 via Express)
- [x] 2D Drawing viewer (Maker.js → SVG)
- [x] 3D Schematics viewer (Three.js + React Three Fiber)
- [x] Toast notifications (sonner)
- [x] 108 calculation tests passing (vitest)
- [x] 137 tests passing (vitest) — added DXF + i18n tests

## Remaining / Future
- [x] PDF import/OCR (PDF.js + Tesseract.js)
- [x] DXF/DWG import
- [x] Offline mode / service worker (PWA)
- [x] Product catalog sync with PostgreSQL
- [x] Multi-language support (IS + EN)

## Next — Polish & Production Readiness
- [x] Code-split large bundle (dynamic imports for Three.js, PDF.js, Tesseract)
- [ ] Real user testing & bug fixes
- [x] Responsive / mobile layout improvements
- [ ] Print-friendly PDF layouts for all calculators
- [x] Role-based access control (restrict routes by role)
- [x] Audit log (track user actions in PostgreSQL)
- [x] Unit tests for new features (DXF parser, i18n, catalog sync)
- [ ] End-to-end tests (Playwright)
- [x] Product image uploads in Settings > Vörur
- [ ] Multi-project comparison / reporting dashboard
- [ ] Client portal (read-only link sharing)
