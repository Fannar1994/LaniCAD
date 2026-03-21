---
name: git-workflow
description: Git commands, branching strategy, commit conventions, and GitHub Pages deployment workflow for LániCAD.
argument-hint: What git operation? (commit | push | branch | deploy)
allowed-tools:
  - run_in_terminal
  - read_file
---

# Git Workflow Skill

## Repository Info

- **Owner**: Fannar1994
- **Repo**: LaniCAD
- **Default branch**: main
- **Hosting**: GitHub Pages (auto-deploy via GitHub Actions)
- **Local path**: `C:\Users\Fanna\.vscode\All projects\myenv\Github\CAD`

## Commit Convention

```
<type>: <short description in English>

Types:
  feat:     New feature
  fix:      Bug fix
  refactor: Code restructuring (no behavior change)
  docs:     Documentation only
  style:    Formatting, whitespace (no code change)
  chore:    Build, config, tooling
  data:     Product data updates
  skill:    AI skill/instruction changes
```

## Pre-Push Checklist

1. `npm run build` — MUST pass with zero errors
2. Check for TypeScript errors: `npx tsc --noEmit`
3. Review changed files: `git diff --stat`
4. Commit with meaningful message
5. Push to main

## Common Commands

```bash
# Status and staging
git status
git add .
git add -p              # Interactive staging

# Commit
git commit -m "feat: add ceiling props calculator"

# Push
git push origin main

# New branch (for large features)
git checkout -b feature/formwork-calculator
git push -u origin feature/formwork-calculator

# Merge back to main
git checkout main
git merge feature/formwork-calculator
git push origin main
```

## GitHub Pages Deployment

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Vite Base Path

For GitHub Pages, the base path in `vite.config.ts` must match the repo name:
```ts
base: '/LaniCAD/'
```

And `BrowserRouter` basename in `src/main.tsx`:
```tsx
<BrowserRouter basename="/LaniCAD/">
```

## Critical Rules

1. **ALWAYS `npm run build` before pushing** — broken builds break the live site
2. **Never force push to main** — ask user first
3. **Never commit secrets** — all env vars are in `.env` (gitignored)
4. **Supabase anon key is OK to expose** — it's designed to be public
5. **Commit frequently** — small, focused commits over large batches
