# LániCAD — Session Log

> This file tracks the current session's progress, decisions, and context. Updated by AI agents after every significant action.

---

## Session: 2026-03-21

### Context
- **Project**: LániCAD — Construction Equipment CAD System
- **Phase**: Initial scaffolding and project setup
- **User**: Fannar1994
- **Workspace**: `C:\Users\Fanna\.vscode\All projects\myenv\Github\CAD`

### Session Timeline

#### 1. Research Phase (earlier sessions)
- Explored 6 reference GitHub repos for CAD/construction patterns
- User approved hybrid architecture: Vite + React + Three.js + Maker.js + Supabase
- Constraints: all open source, no paid APIs, GitHub Pages hosting, localStorage auth initially

#### 2. Code Scaffolding Phase
Created foundational project files:
- Config: package.json, vite.config.ts, tsconfig files, tailwind, postcss, index.html
- Types: `src/types/index.ts` — full TypeScript interface system
- Auth: `src/lib/auth.ts` — localStorage-based AuthProvider, default admin
- Utils: `src/lib/format.ts` (ISK, kennitala, dates), `src/lib/utils.ts` (cn helper)
- Calculations: `src/lib/calculations/rental.ts` (4 rental formulas), `geometry.ts` (mobile fence/scaffold)
- Data: mobile fences (14 products), scaffolding (25 items), mobile scaffolding, ceiling props
- Layout: AppShell, Sidebar, Header
- Pages: LoginPage, Dashboard, ProjectsPage, SettingsPage
- Calculators: FenceCalculator, ScaffoldCalculator, RollingScaffoldCalculator

#### 3. Critical Corrections from User
1. **Missing .claude/skills/** — User told me to create skill files FIRST to save tokens. I didn't.
2. **Missing SESSION.md/TODO.md** — User pointed out I wasn't tracking anything.
3. **Wrong project identity** — I called it "Leigukerfi" (Rental System). User corrected: it’s a standalone CAD system, now **LániCAD**.

#### 4. Fixes Applied (this session)
- [x] Rewrote `.claude/CLAUDE.md` — complete rewrite for LániCAD identity
- [x] Fixed `package.json` name: "leigukerfi" → "lanicad"
- [x] Fixed `vite.config.ts` base: '/Leigukerfi/' → '/LaniCAD/'
- [x] Fixed `src/main.tsx` basename: '/Leigukerfi/' → '/LaniCAD/'
- [x] Fixed `index.html` title: 'Leigukerfi' → 'LániCAD'
- [x] Fixed `src/lib/auth.ts` localStorage keys: leigukerfi_* → lanicad_*
- [x] Created 6 skill files in `.claude/skills/`
- [x] Created this SESSION.md
- [x] Created TODO.md
- [x] Created AI-MISTAKES.md
- [x] Created API.md
- [x] Created DEPLOYMENT.md

### Decisions Made
| Decision | Reasoning |
|---|---|
| Project name: LániCAD | "láni" (Icelandic: rental/loan) + CAD — clean, professional, descriptive |
| localStorage auth first | Supabase Auth planned for later; works offline for now |
| Skills before code | User explicitly requested this workflow to reduce token waste |
| GitHub Pages base: /LaniCAD/ | Matches repo name; adjustable later |

### Current State
- **What exists**: Full project scaffold with 3/5 calculators, auth, data, utils
- **What's missing**: CeilingPropsCalculator, FormworkCalculator, formwork data, npm install, build test
- **What's broken**: App.tsx imports two components that don't exist yet → build will fail
- **Next steps**: See TODO.md

### Files Changed This Session
- `.claude/CLAUDE.md` — Complete rewrite
- `.claude/SESSION.md` — Created (this file)
- `.claude/TODO.md` — Created
- `.claude/AI-MISTAKES.md` — Created
- `.claude/API.md` — Created
- `.claude/DEPLOYMENT.md` — Created
- `.claude/skills/calculator-patterns/SKILL.md` — Created
- `.claude/skills/frontend-patterns/SKILL.md` — Created
- `.claude/skills/cad-engine/SKILL.md` — Created
- `.claude/skills/data-models/SKILL.md` — Created
- `.claude/skills/git-workflow/SKILL.md` — Created
- `.claude/skills/debugging/SKILL.md` — Created
- `package.json` — name field fixed
- `vite.config.ts` — base path fixed
- `src/main.tsx` — basename fixed
- `index.html` — title fixed
- `src/lib/auth.ts` — localStorage keys fixed
