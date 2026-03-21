# LániCAD — Deployment Guide

## Architecture

```
GitHub (main branch)
  → GitHub Actions (build on push)
    → GitHub Pages (static SPA at https://fannar1994.github.io/LaniCAD/)

Supabase (free tier, when connected)
  → PostgreSQL database
  → Auth service
  → REST API (auto-generated from schema)
  → Realtime (optional)
```

## Current Status: LOCAL DEVELOPMENT ONLY

GitHub repo not yet created. Running locally with `npm run dev`.

## Prerequisites

- Node.js 20+ (LTS)
- npm 10+
- Git
- GitHub account (Fannar1994)

## Local Development

```bash
cd "C:\Users\Fanna\.vscode\All projects\myenv\Github\CAD"
npm install          # Install dependencies (first time)
npm run dev          # Vite dev server at http://localhost:5173
```

## Build & Preview

```bash
npm run build        # TypeScript check + Vite production build → dist/
npm run preview      # Preview production build locally
```

Build output goes to `dist/` (gitignored).

## GitHub Pages Setup

### 1. Create Repository
```bash
# From project root
git init
git add .
git commit -m "feat: initial LániCAD setup"
git remote add origin https://github.com/Fannar1994/LaniCAD.git
git push -u origin main
```

### 2. GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy LániCAD to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 3. Enable GitHub Pages
1. Go to repo Settings → Pages
2. Source: "GitHub Actions"
3. Push to main → auto-deploys

### 4. Vite Base Path
Must match repo name in `vite.config.ts`:
```ts
base: '/LaniCAD/'
```
And in `src/main.tsx`:
```tsx
<BrowserRouter basename="/LaniCAD/">
```

## Supabase Setup (When Ready)

### 1. Create Supabase Project
- Go to https://supabase.com → New Project
- Region: EU West (closest to Iceland)
- Free tier: 500MB database, 50MB storage

### 2. Get Credentials
- Project URL: `https://xxxxx.supabase.co`
- Anon key: `eyJ...` (safe to expose publicly)

### 3. Configure Environment
Create `.env` (gitignored):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Schema
Execute SQL from `.claude/API.md` in Supabase SQL Editor.

### 5. Enable RLS
Apply Row Level Security policies from `.claude/API.md`.

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | .env (local) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | .env (local) | Supabase public API key |
| `GITHUB_TOKEN` | GitHub Actions (auto) | Deployment auth |

**Important**: The Supabase anon key is designed to be public. RLS policies protect the data, not the key.

## Pre-Deployment Checklist

- [ ] `npm run build` passes with zero errors
- [ ] All 5 calculator routes work in `npm run dev`
- [ ] Login/logout works
- [ ] No console errors in browser
- [ ] Base path matches repo name
- [ ] `.env` is in `.gitignore`
- [ ] GitHub Actions workflow file exists
