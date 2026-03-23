# LániCAD — Project Roadmap

> Last updated: 2026-03-23

## Project Vision

LániCAD is a 2D/3D CAD system for construction equipment rental. It serves four goals simultaneously:
1. **Production tool** for BYKO Leiga employees
2. **Portfolio showcase** of modern full-stack skills
3. **Potential product** for other construction rental companies
4. **Learning project** for React, Three.js, TypeScript, and CAD systems

---

## Phase 1: Stabilize & Ship (Weeks 1-3)
> Goal: Get LániCAD usable by real people at BYKO Leiga

### 1.1 Database Migration — Turso (libSQL)
- [ ] Migrate `server/index.js` from `pg` pool to `@libsql/client`
- [ ] Update all SQL queries for SQLite compatibility (JSONB → JSON text, etc.)
- [ ] Test all CRUD operations (projects, templates, products, users)
- [ ] Update `.claude/API.md` and `CLAUDE.md` to reflect Turso
- [ ] Deploy and verify on Turso free tier

### 1.2 Bug Fixes & Polish
- [ ] Test all 5 calculators end-to-end (input → calculate → export PDF/Excel)
- [ ] Fix any broken PDF export layouts
- [ ] Verify offline mode works correctly (no API = calculators still function)
- [ ] Fix responsive/mobile layout issues
- [ ] Test auth flow: login → session persist → logout → re-login
- [ ] Verify project save/load round-trips correctly for all calculator types

### 1.3 Print-Ready PDF Layouts
- [ ] Design professional invoice template matching BYKO Leiga branding
- [ ] Add company logo placement in PDF header
- [ ] Ensure all 5 calculators produce clean, print-friendly PDFs
- [ ] Add page numbers, date stamps, document reference numbers

### 1.4 Real User Testing
- [ ] Deploy to staging (GitHub Pages + Turso)
- [ ] Create 3-5 real-world test scenarios (one per calculator)
- [ ] Have BYKO Leiga staff test with actual rental quotes
- [ ] Collect feedback, log bugs in GitHub Issues
- [ ] Fix critical bugs from testing

---

## Phase 2: Complete the CAD Engine (Weeks 4-7)
> Goal: Make the 2D drawing and PDF import features production-ready

### 2.1 2D Drawing Generators
- [ ] Fence layout drawing (Maker.js) — top-down panel arrangement with gates
- [ ] Scaffolding elevation drawing — side view with levels, braces, platforms
- [ ] Formwork plan drawing — panel layout with corners, tie bars
- [ ] Rolling scaffold drawing — front/side elevation
- [ ] Ceiling props grid drawing — floor plan with prop positions and beam spans
- [ ] Wire each generator to its calculator's "Skoða teikningu" button

### 2.2 PDF Import & OCR
- [ ] Complete PDF → SVG background layer in Drawing page
- [ ] Integrate Tesseract.js OCR for text extraction from uploaded plans
- [ ] Add measurement extraction from architectural PDFs
- [ ] Build UI for placing equipment on imported floor plans

### 2.3 DXF Integration
- [ ] Add "Import DXF" button to Drawing page (parser already exists)
- [ ] Add "Export DXF" button for calculator drawings
- [ ] Test with real DXF files from architects

---

## Phase 3: Professional Features (Weeks 8-12)
> Goal: Features that differentiate LániCAD as a serious product

### 3.1 Client Portal
- [ ] Generate shareable read-only links for quotes/projects
- [ ] Client can view quote, PDF, and 3D visualization without login
- [ ] Optional: client approval workflow (accept/reject quote)

### 3.2 Multi-Project Reporting
- [ ] Side-by-side comparison of multiple quotes
- [ ] Equipment utilization dashboard (what's rented, what's available)
- [ ] Revenue reporting by calculator type, time period, client
- [ ] Export consolidated reports as PDF/Excel

### 3.3 Advanced 3D Features
- [ ] Site context (ground plane, building outline import)
- [ ] Measurement tools in 3D view (distances, angles)
- [ ] Screenshot/render export from 3D scene
- [ ] Multi-equipment scene composition (fence + scaffold on same site)

### 3.4 E2E Testing
- [ ] Set up Playwright
- [ ] Write tests for critical paths: login → calculator → save → export
- [ ] Add to GitHub Actions CI pipeline
- [ ] Coverage for all 5 calculators

---

## Phase 4: Scale & Monetize (Weeks 13+)
> Goal: Turn LániCAD into a product others can use

### 4.1 Multi-Tenant Support
- [ ] Company/organization accounts
- [ ] Custom product catalogs per company
- [ ] Custom branding (logo, colors) per tenant
- [ ] Billing/subscription infrastructure

### 4.2 Mobile Experience
- [ ] PWA optimization (service worker, offline-first)
- [ ] Touch-friendly calculator UI
- [ ] Mobile-optimized 3D viewer
- [ ] Camera-based measurement (stretch goal)

### 4.3 Integrations
- [ ] API for third-party ERP systems
- [ ] Webhook notifications (quote created, approved, etc.)
- [ ] Email quote delivery
- [ ] Integration with accounting software (Navision, SAP, etc.)

### 4.4 Analytics & AI
- [ ] Usage analytics dashboard
- [ ] AI-powered quote suggestions based on project type
- [ ] Automatic equipment optimization (minimize rental cost)
- [ ] Historical pricing analysis

---

## Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Turso migration | High | Medium | **P1** |
| Bug fixes & polish | High | Low | **P1** |
| Print-ready PDFs | High | Low | **P1** |
| Real user testing | Critical | Low | **P1** |
| 2D drawing generators | Medium | High | **P2** |
| PDF import/OCR | Medium | High | **P2** |
| E2E tests | Medium | Medium | **P2** |
| Client portal | High | Medium | **P3** |
| Multi-project reporting | Medium | Medium | **P3** |
| Multi-tenant | High | High | **P4** |
| Mobile PWA | Medium | Medium | **P4** |

---

## Success Metrics

- **Phase 1**: BYKO Leiga staff can create and export a real rental quote
- **Phase 2**: Drawings generated from calculator data, PDF plans importable
- **Phase 3**: Clients receive shareable quote links, E2E tests in CI
- **Phase 4**: Second company onboarded, revenue generated
