# Reiknivelar

**GitHub Pages URL:** https://fannar1994.github.io/Reiknivelar/

A collection of Icelandic construction/rental calculators for **BYKO Leiga**, published via GitHub Pages.

## Calculators

| Calculator | File | Description |
|---|---|---|
| [Girðinga reiknivél](Girdingar_reiknivel.html) | `Girdingar_reiknivel.html` | Industrial fence calculator |
| [Hjólapalla reiknivél](hjolapallar_reiknivel_sp.html) | `hjolapallar_reiknivel_sp.html` | Pallet racking calculator |
| [Loftastoðir](loftastodir.html) | `loftastodir.html` | Ceiling post calculator |
| [Steypumótareiknivél](motareiknivel-byko-v11.html) | `motareiknivel-byko-v11.html` | Concrete form calculator |
| [Vinnupalla reiknivél](vinnupalla-reiknivel.html) | `vinnupalla-reiknivel.html` | Work platform calculator |
| [Vinnupalla reiknivél (ný útgáfa)](vinnupalla-reiknivel_new.html) | `vinnupalla-reiknivel_new.html` | Work platform calculator (new version) |

## Tech Stack

- **Vanilla HTML5, CSS3, JavaScript** – no frameworks, no build tools
- **html2pdf.js** (v0.10.2) – PDF quote generation
- **XLSX** (v0.18.5) – Excel export
- **GitHub Pages** – static site deployment

## Development

Each calculator is a self-contained HTML file with inline CSS and JavaScript. There is no build step – files are served as-is.

### Validation

Run the validation script to check all HTML files for required meta tags and conventions:

```bash
python3 scripts/validate.py
```

### Adding a New Calculator

1. Copy an existing calculator HTML file as a template
2. Update the header, title, and product catalogue
3. Add a card to `index.html`
4. Update this README

### AI-Assisted Development

This project includes a `CLAUDE.md` file and `.claude/skills/` directory for AI-assisted development with Claude Code. See `CLAUDE.md` for project conventions and coding rules.

## Publishing (GitHub Pages)

The site is deployed from the **`main`** branch, folder **`/(root)`**.
An `index.html` landing page at the repo root links to each calculator.
Deployment is automatic via GitHub Actions on push to `main`.
