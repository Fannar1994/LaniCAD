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

## Remaining / Future
- [ ] PDF import/OCR (PDF.js + Tesseract.js)
- [ ] DXF/DWG import
- [ ] Offline mode / service worker
- [ ] Product catalog sync with PostgreSQL
- [ ] Multi-language support (currently Icelandic only)
