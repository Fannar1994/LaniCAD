# LániCAD — Deployment Guide

## Architecture

```
GitHub (main branch)
  → GitHub Actions (build on push)
    → GitHub Pages (static SPA at https://fannar1994.github.io/LaniCAD/)

Express API (server/)
  → PostgreSQL database
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

## PostgreSQL + Express Setup

### 1. Install PostgreSQL
Download and install PostgreSQL from https://www.postgresql.org/download/

### 2. Create Database
```bash
createdb lanicad
```

### 3. Run Schema
```bash
psql -d lanicad -f server/schema.sql
```

### 4. Configure Server
```bash
cd server
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secret
npm install
npm run dev
```

### 5. Configure Frontend
Create `.env` in project root:
```env
VITE_API_URL=http://localhost:3001/api
```

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_API_URL` | .env (frontend) | Express API URL |
| `DATABASE_URL` | server/.env | PostgreSQL connection string |
| `JWT_SECRET` | server/.env | JWT signing secret |
| `PORT` | server/.env | Express API port |
| `GITHUB_TOKEN` | GitHub Actions (auto) | Deployment auth |

## Pre-Deployment Checklist

- [ ] `npm run build` passes with zero errors
- [ ] All 5 calculator routes work in `npm run dev`
- [ ] Login/logout works
- [ ] No console errors in browser
- [ ] Base path matches repo name
- [ ] `.env` is in `.gitignore`
- [ ] GitHub Actions workflow file exists
