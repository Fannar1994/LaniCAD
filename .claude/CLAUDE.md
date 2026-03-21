# LániCAD — Construction Equipment CAD System

LániCAD is a general-purpose 2D/3D CAD system for construction equipment rental and sales. It provides interactive calculators, 2D plan generation (SVG), 3D visualization, and PDF import/export — built for BYKO Leiga’s product catalog (scaffolding, mobile fences, concrete formwork, mobile scaffolding, ceiling props).

> **Project Identity**: LániCAD (Icelandic *láni* = rental/loan + CAD). This is a **standalone, fresh project** — not "Leigukerfi."

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Vite 6 + React 19 + TypeScript + Tailwind CSS + shadcn/ui | SPA with component library |
| 2D Drawing Engine | Maker.js (MIT) | 2D production drawing generation (SVG) |
| 3D Engine | Three.js + React Three Fiber | 3D scaffolding/formwork visualization |
| PDF Read | PDF.js + Tesseract.js | Client-side PDF reading and OCR (no paid APIs) |
| PDF Write | jsPDF | Export professional PDF documents |
| Calculators | Existing formulas, modernized into React components | Fence, scaffolding, concrete form calculators |
| Database | Supabase (PostgreSQL) — free tier | Projects, templates, users (client SDK, no backend) |
| Auth | localStorage-based (future: Supabase Auth + RLS) | AuthProvider with useAuth() hook |
| Hosting | GitHub Pages (auto-deploy via GitHub Actions) | Static SPA hosting |

## Repository

- **Owner**: Fannar1994
- **GitHub**: `https://github.com/Fannar1994/LaniCAD`
- **Local workspace**: `C:\Users\Fanna\.vscode\All projects\myenv\Github\CAD`

## Quick Start

```bash
npm install
npm run dev          # Vite dev server at http://localhost:5173
npm run build        # Always verify build passes before pushing
npm run preview      # Preview production build locally
```

## Directory Structure

```
.claude/
  CLAUDE.md          # This file — project instructions for AI agents
  SESSION.md         # Current session context and progress
  TODO.md            # Active task tracking
  AI-MISTAKES.md     # Lessons learned from AI mistakes
  API.md             # Supabase schema and API reference
  DEPLOYMENT.md      # Deployment and hosting instructions
  skills/            # Skill files for AI token efficiency
    calculator-patterns/SKILL.md
    frontend-patterns/SKILL.md
    cad-engine/SKILL.md
    data-models/SKILL.md
    git-workflow/SKILL.md
    debugging/SKILL.md


Reiknivelar-main/    # Original HTML calculators (reference — being ported to React)
Steypumót/           # Reference docs: Hünnebeck manuals, pricing Excel files
```

## 5 Calculator Modules

| Key | Name (IS) | Description | Products |
|---|---|---|---|
| `fence` | Girðingar | Mobile fences / iðnaðargirðingar (3.5m/2.5m/2.1m), stones, clamps, gates | 14 products, 12-tier monthly rates |
| `scaffolding` | Vinnupallar | Facade scaffolding (Layher Allround), multi-facade | 25 items, daily rates + weights |
| `formwork` | Steypumót | Concrete formwork: Rasto-Takko, Manto, Alufort, ID-15 | ~170 items, day/week rates |
| `rolling` | Hjólapallar | Mobile scaffolding (narrow/wide/quickly) | 9 heights, 24h/extra/week pricing |
| `ceiling` | Loftastoðir | Ceiling props (Classes A-E) + HT-20 beams | 27 items, day/week/sale prices |

## Calculation Patterns (Critical)

### Rental Cost Formulas
- **Standard** (formwork, ceiling): `days < 7 → dayRate × days × qty; else weekRate × ceil(days/7) × qty`
- **Mobile fence**: 12 periods of 30 days with declining rates, minimum 10 days
- **Mobile scaffolding**: `1 day = 24h price; 2-6 days = 24h + extra × (days-1); 7+ = week × fullWeeks + 24h × extraDays`
- **Scaffolding**: `totalDays × dailyRate × qty` with period discount

### Shared Patterns
- **Currency**: ISK formatted with dot thousands separator, comma decimal: `1.234.567 kr`
- **Kennitala**: `DD.MM.YY-NNNN` auto-format
- **Date handling**: Start/end dates → inclusive day count, bidirectional sync
- **PDF export**: jsPDF for programmatic, window.print() for layout-heavy pages
- **Excel export**: XLSX.utils.aoa_to_sheet pattern
- **Design tokens**: `--color-dark: #404042`, `--color-accent: #f5c800`, fonts: Barlow/Barlow Condensed

## Auth (Current Implementation)

- **localStorage-based** AuthProvider with useAuth() hook
- Default admin: `admin@byko.is` / `admin123`
- Roles: `admin`, `user`
- Storage keys: `lanicad_users`, `lanicad_session`
- Users created/managed in Settings page (admin only)
- **Future**: Migrate to Supabase Auth with RLS

## Supabase Database Schema (Planned)

| Table | Description |
|---|---|
| `profiles` | User profiles (id, email, name, role, created_at) |
| `projects` | Saved CAD projects (id, user_id, name, type, data JSONB, created_at, updated_at) |
| `templates` | Reusable equipment templates (id, type, name, config JSONB) |
| `products` | Product catalog (id, calculator_type, rental_no, sale_no, description, rates JSONB, sale_price) |

## Settings Page

| Section | Description | Admin Only |
|---|---|---|
| Almennt | General preferences | No |
| Vörur | Product catalog management | No |
| Notendur | User creation/management | Yes |

## Deployment

```
GitHub (main) → GitHub Pages (frontend SPA, auto-deploy via GitHub Actions)
                       ↓
              Supabase (PostgreSQL + Auth + REST API — free tier, when ready)
```

- Push to `main` → GitHub Actions builds and deploys to GitHub Pages
- **Always `npm run build` locally before pushing**
- Supabase client connects directly from browser (anon key + RLS = secure)
- No backend server needed — all via Supabase client SDK

## Important Rules

1. **All open source** — every dependency must be MIT, Apache 2.0, or similarly permissive
2. **No paid APIs** — no OpenAI, no Azure, no paid services. AI features use browser-only tools (PDF.js, Tesseract.js)
3. **Build before push** — always run `npm run build` and verify success before `git push`
4. **GitHub Pages safe** — no server-side secrets, no environment variables with API keys
5. **Supabase anon key is safe** — it's designed to be public, RLS protects data
6. **Icelandic UI** — all user-facing text in Icelandic
7. **BYKO Leiga branding** — use the established design tokens (dark gray + yellow accent)
8. **Skills first** — always check `.claude/skills/` before writing code, to save tokens
9. **Track everything** — update SESSION.md, TODO.md, and AI-MISTAKES.md as you work
10. **Transparency** — every action, mistake, and decision gets documented
