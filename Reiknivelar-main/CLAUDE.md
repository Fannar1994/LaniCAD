# Reiknivelar – CLAUDE.md

## Project Overview

**Reiknivelar** (Icelandic: "Calculators") is a collection of construction/rental calculators for **BYKO Leiga**. Deployed as a static site via GitHub Pages at https://fannar1994.github.io/Reiknivelar/

## Tech Stack

- **Vanilla HTML5, CSS3, JavaScript** – no frameworks, no build tools
- **html2pdf.js** (v0.10.2 CDN) – PDF generation
- **XLSX** (v0.18.5 CDN) – Excel export
- **Google Fonts** – Barlow, Barlow Condensed
- **Deployment** – GitHub Pages via `.github/workflows/static.yml` on push to `main`

## Architecture

```
/
├── index.html                         # Landing page (card grid linking to calculators)
├── Girdingar_reiknivel.html           # Industrial fence calculator
├── hjolapallar_reiknivel_sp.html      # Pallet racking calculator
├── loftastodir.html                   # Ceiling post calculator
├── motareiknivel-byko-v11.html        # Concrete form calculator
├── vinnupalla-reiknivel.html          # Work platform calculator (largest, ~3500 lines)
├── vinnupalla-reiknivel_new.html      # Work platform calculator (new version)
├── favicon_io/                        # Favicon assets
├── scripts/validate.py                # HTML validation script (runs in CI)
├── .github/workflows/static.yml       # GitHub Pages deploy workflow
├── .github/workflows/ci.yml           # CI validation workflow for PRs
├── .claude/skills/                    # Claude Code skill files for AI-assisted dev
└── .nojekyll                          # Disables Jekyll processing
```

Each calculator is a **self-contained HTML file** with inline `<style>` and `<script>`. This is intentional – it keeps each calculator independently deployable and avoids cross-file dependency issues.

## Coding Rules

### HTML Structure

- All UI text is in **Icelandic** (`lang="is"`)
- Every calculator file must include `<meta charset="UTF-8">` and `<meta name="viewport" ...>`
- Use favicon links: `favicon_io/favicon.ico` and `favicon_io/apple-touch-icon.png`

### CSS Conventions

- Use CSS custom properties (variables) defined in `:root` for theming:
  - `--color-border`, `--color-surface`, `--color-bg`, `--color-muted`
  - `--color-dark: #404042` (header background)
  - `--color-accent: #f5c800` (yellow accent stripe)
  - `--radius-sm`, `--radius-md`, `--radius-lg`
- Font stack: `'Barlow', system-ui, Arial, sans-serif`
- Headers use: `'Barlow Condensed', system-ui, sans-serif`
- Include `.print-only` and `@media print` styles for PDF/print output
- All styles are inline `<style>` within each HTML file

### JavaScript Conventions

- All scripts are inline `<script>` at the bottom of each HTML file
- Use `const`/`let` (never `var`)
- Use descriptive function names in camelCase
- Product/item catalogues are defined as arrays of objects with `id`, `name`, `unit`, `price` properties
- Calculation functions should be pure where possible (input → output, no side effects)
- DOM manipulation uses `document.getElementById()` and `document.querySelector()`
- Number formatting: use the shared regex-based helpers (`fmtInt`, `fmtNum`) for Icelandic-style number formatting (dot thousands separator); do not mix in `.toLocaleString(...)`

### Design Language

- Dark header (`#404042`) with yellow accent stripe (`#f5c800`) on the left edge
- Grid-based blueprint pattern overlay on headers
- Card-based layouts with subtle shadows
- Eyebrow text above titles: uppercase, letterspaced, accent-colored
- Responsive design using CSS Grid/Flexbox

## Workflow

- **Deploy**: Push to `main` triggers GitHub Pages deployment automatically
- **No build step**: Files are served as-is
- **Testing**: Manual browser testing – open HTML files directly or via local server
- **PDF export**: Test html2pdf output in Chrome (best compatibility)
- **Excel export**: Test XLSX output opens correctly in Excel/LibreOffice

## Common Pitfalls

- Do NOT extract CSS/JS into separate files – the inline pattern is intentional
- Do NOT add npm/node dependencies – this is a zero-build static site
- Preserve number formatting consistency – always use the shared `fmtInt` / `fmtNum` helpers for user-visible numbers (avoid mixing in `.toLocaleString(...)`)
- When adding new calculators, also add a card to `index.html` and update `README.md`
- CDN scripts (html2pdf, XLSX) must use specific pinned versions, not `latest`

## Pull Request Workflow

- PRs target the `main` branch
- CI automatically runs `python3 scripts/validate.py` on every PR (`.github/workflows/ci.yml`)
- Branch protection requires the CI check to pass before merge
- Deployment to GitHub Pages triggers automatically on push to `main`

### Claude Code / Claude Desktop App Integration

This repository is configured for **Claude Code** AI-assisted development via the Claude Desktop app:

- **`CLAUDE.md`** – Project conventions and coding rules (this file)
- **`.claude/settings.json`** – Permissions for allowed commands
- **`.claude/skills/`** – Skill files that guide Claude through common tasks:
  - `new-calculator.md` – How to create a new calculator
  - `update-pricing.md` – How to update product pricing
  - `review-pull-requests.md` – How to review and manage pull requests

#### Using Claude Desktop for PR Reviews

1. Open Claude Desktop and connect to this repository via Claude Code
2. Ask Claude to review open pull requests – it will check for stale PRs, validate HTML conventions, and identify needed changes
3. Claude can incorporate changes from PRs, fix validation issues, and update `index.html`/`README.md` as needed
4. Use the `review-pull-requests` skill for structured PR review workflow
