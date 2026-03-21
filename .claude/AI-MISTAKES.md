# LániCAD — AI Mistakes & Lessons Learned

> This file documents mistakes made by AI agents during development, what went wrong, and how to avoid repeating them. Transparency is key — every mistake is a lesson.

---

## Mistake #1: Wrong Project Identity
- **Date**: 2026-03-21
- **What happened**: Named the entire project "Leigukerfi" (Rental System) instead of treating it as a standalone CAD system. Wrote CLAUDE.md, package.json, vite.config, and all references with the wrong name.
- **Root cause**: Assumed the project was a "rental system" based on the equipment types, without confirming the project identity with the user.
- **Impact**: Every file referenced the wrong project name. User had to correct this explicitly.
- **Fix**: Rewrote CLAUDE.md entirely. Updated package.json (name), vite.config.ts (base), main.tsx (basename), index.html (title), auth.ts (localStorage keys). Project is now **LániCAD**.
- **Lesson**: **Always confirm the project identity with the user before naming anything.** Don't assume — ask.

## Mistake #2: Skipped Skills Setup
- **Date**: 2026-03-21
- **What happened**: Jumped straight into writing code without creating `.claude/skills/` first. User had explicitly asked for this to reduce token usage.
- **Root cause**: Prioritized visible output (code files) over infrastructure (skill files). Did not follow user's instruction order.
- **Impact**: Wasted tokens by not having reusable skill references. User had to remind me twice.
- **Fix**: Created 6 SKILL.md files with YAML frontmatter: calculator-patterns, frontend-patterns, cad-engine, data-models, git-workflow, debugging.
- **Lesson**: **Always create .claude/skills/ FIRST before writing any code.** Skills save tokens on every future interaction.

## Mistake #3: No Session/Progress Tracking
- **Date**: 2026-03-21
- **What happened**: Did not create SESSION.md, TODO.md, or any progress tracking files. User had to point out that Villi Pípari's project (which we researched) had these files and we should follow the same pattern.
- **Root cause**: Focused on code output, not on process transparency.
- **Impact**: No way to track what was done, what's pending, or what decisions were made. User couldn't see progress without asking.
- **Fix**: Created SESSION.md (full session log), TODO.md (task tracking), AI-MISTAKES.md (this file), API.md, DEPLOYMENT.md.
- **Lesson**: **Transparency first.** Before writing code, ensure: CLAUDE.md ✓, skills/ ✓, SESSION.md ✓, TODO.md ✓, AI-MISTAKES.md ✓.

## Mistake #4: Imported Non-Existent Components
- **Date**: 2026-03-21 (earlier session)
- **What happened**: In `src/App.tsx`, imported `CeilingPropsCalculator` and `FormworkCalculator` which don't exist yet. This will cause a build failure.
- **Root cause**: Wrote the router setup optimistically before creating all the components it references.
- **Impact**: `npm run build` will fail until these files are created.
- **Fix**: Need to create both calculator components before building. Tracked in TODO.md.
- **Lesson**: **Never import components that don't exist.** Either create them first, or use lazy loading with a fallback, or comment out the import until the file exists.

---

## Prevention Checklist (for AI agents)

Before starting any session:
1. Read `.claude/CLAUDE.md` — confirm project identity and tech stack
2. Read `.claude/SESSION.md` — understand current state
3. Read `.claude/TODO.md` — know what's pending
4. Read `.claude/AI-MISTAKES.md` — don't repeat mistakes
5. Check `.claude/skills/` — load relevant skills for the task

Before writing code:
1. Confirm the correct project name (LániCAD, NOT Leigukerfi or ByggiCAD)
2. Use correct localStorage keys (lanicad_*, NOT leigukerfi_* or byggicad_*)
3. Use correct base path (/LaniCAD/, NOT /Leigukerfi/ or /ByggiCAD/)
4. Don't import files that don't exist
5. Test build after changes

After every task:
1. Update SESSION.md with what was done
2. Update TODO.md — check off completed items
3. If a mistake was made, document it here immediately
4. Commit and push to GitHub
