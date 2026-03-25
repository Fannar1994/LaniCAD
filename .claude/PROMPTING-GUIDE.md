# Claude Code Prompting Guide for L├íniCAD

> How to write effective prompts and configure your project for maximum productivity with Claude Code in VS Code.

---

## Part 1: CLAUDE.md Setup (Already Done Well)

Your `.claude/CLAUDE.md` is solid. Here are improvements to make it even better:

### Add a "Current Phase" Section
Add this to the top of CLAUDE.md so Claude always knows what to focus on:

```markdown
## Current Phase
Phase 1: Stabilize & Ship ΓÇö See ROADMAP.md for details.
Focus: Turso migration, bug fixes, PDF polish, real user testing.
```

### Add a "Do NOT" Section
Prevent common AI mistakes by being explicit:

```markdown
## Do NOT
- Do not add new npm dependencies without asking first
- Do not refactor working code unless explicitly asked
- Do not change the database schema without updating API.md
- Do not create new pages ΓÇö all routes are defined, focus on improving existing ones
- Do not add English text to the UI ΓÇö everything must be Icelandic
- Do not use console.log in production code ΓÇö use proper error handling
```

### Add File Ownership
Tell Claude which files are "hot" and which are stable:

```markdown
## File Status
### Actively Changing (read before editing)
- server/index.js ΓÇö Express API, currently migrating to Turso
- src/lib/db.ts ΓÇö Frontend data layer
- src/pages/calculators/*.tsx ΓÇö Calculator pages

### Stable (don't touch unless asked)
- src/data/*.ts ΓÇö Product data (verified against Excel sources)
- src/lib/calculations/rental.ts ΓÇö Core formulas (137 tests cover these)
- src/components/ui/ ΓÇö shadcn components
```

---

## Part 2: How to Write Good Prompts

### The Golden Rule
**Be specific about WHAT you want, WHERE it goes, and HOW it should work.**

### Bad vs Good Prompts

| Bad | Good |
|-----|------|
| "Fix the PDF export" | "The fence calculator PDF export is missing the client's kennitala in the header. Fix it in `src/lib/export-pdf.ts`" |
| "Add a feature" | "Add a 'Afrit' (duplicate) button to the ProjectsPage that copies an existing project with '(afrit)' appended to the name" |
| "Make it look better" | "In the Dashboard, the calculator cards should have a subtle hover shadow effect using Tailwind's `hover:shadow-lg transition-shadow`" |
| "Fix the database" | "In `server/index.js`, the `/api/projects` GET endpoint returns 500 when the user has no projects. It should return an empty array instead" |
| "Write tests" | "Write Vitest tests for the `calcFenceGeometry()` function in `src/lib/calculations/rental.ts`. Test with 50m, 100m, and 200m fence lengths" |

### Prompt Templates for Common Tasks

#### Bug Fix
```
Bug: [describe what's wrong]
Expected: [what should happen]
Actual: [what happens instead]
File: [which file(s) to look at]
Steps to reproduce: [how to trigger the bug]
```

#### New Feature
```
Add [feature name] to [page/component].
- It should [behavior 1]
- It should [behavior 2]
- UI text in Icelandic: "[text]"
- Place it [where in the UI]
- Use existing [pattern/component] as reference
```

#### Refactor
```
Refactor [what] in [file].
Current problem: [why it needs refactoring]
Keep: [what must not change]
Change: [what should change]
Run tests after to verify nothing broke.
```

#### Database Change
```
Add [column/table] to the database.
1. Update server/schema.sql
2. Update server/index.js endpoints
3. Update src/lib/db.ts frontend calls
4. Update src/types/index.ts interfaces
5. Update .claude/API.md documentation
```

### Context-Setting Prompts
Start sessions with context to save time:

```
I'm working on the fence calculator (src/pages/calculators/FenceCalculator.tsx).
The data file is src/data/fence.ts. Read both before making changes.
```

```
I'm fixing the Express API. Read server/index.js and .claude/API.md first.
The server runs on port 3001 and uses PostgreSQL (migrating to Turso).
```

### Multi-Step Task Prompts
For big tasks, break them down yourself:

```
I need to add a "Discount %" field to all calculators. Do this in order:

1. First, read all 5 calculator files to understand the current pattern
2. Add a discount state variable and input field to each calculator
3. Apply the discount to the total calculation
4. Include discount in PDF and Excel exports
5. Run `npm run build` to verify no errors
6. Run `npm test` to verify tests still pass

Do steps 1-2 first, then show me the changes before continuing.
```

### Checkpoint Prompts
Ask Claude to pause and verify:

```
After making the change, run `npm run build` and `npm test`.
If either fails, fix the issues before continuing.
Show me the test output.
```

---

## Part 3: VS Code-Specific Tips

### Use @ References
In VS Code's Claude Code panel, you can reference files directly:
- `@src/pages/calculators/FenceCalculator.tsx` ΓÇö points Claude to a specific file
- `@src/lib/` ΓÇö points to a directory

### Use /commands
- `/commit` ΓÇö Let Claude create a commit with a good message
- `/review` ΓÇö Ask Claude to review recent changes
- Type `/` to see all available commands

### Session Management
- Start each session with: "Read CLAUDE.md, ROADMAP.md, and TODO.md"
- End each session with: "Update SESSION.md and TODO.md with what we did"
- This keeps Claude oriented across sessions

### Iterative Development Flow
Best workflow for building features:

1. **Plan**: "I want to add X. What files need to change?"
2. **Read**: "Read [files] before making changes"
3. **Implement**: "Now make the changes"
4. **Verify**: "Run build and tests"
5. **Review**: "Show me a summary of all changes"
6. **Commit**: "/commit"

---

## Part 4: Project-Specific Prompt Patterns

### Calculator Work
```
Working on [calculator name] calculator.
Files: src/pages/calculators/[Name]Calculator.tsx, src/data/[name].ts
Read the calculator-patterns skill first: .claude/skills/calculator-patterns/SKILL.md
```

### CAD/Drawing Work
```
Working on 2D/3D visualization.
Read the cad-engine skill: .claude/skills/cad-engine/SKILL.md
Main files: src/components/viewer/, src/lib/cad/
```

### API Work
```
Working on the Express API.
Read: server/index.js, .claude/API.md, server/schema.sql
After changes, test with: node server/test-api.js
```

### Styling Work
```
Working on UI styling. Using Tailwind CSS + shadcn/ui.
Design tokens: dark gray (#404042), yellow accent (#f5c800)
Fonts: Barlow, Barlow Condensed
Read: .claude/skills/frontend-patterns/SKILL.md
```

---

## Part 5: Common Mistakes to Avoid

1. **Don't say "improve"** ΓÇö Be specific about what to improve and how
2. **Don't say "fix everything"** ΓÇö Point to one specific bug at a time
3. **Don't skip the read step** ΓÇö Always have Claude read files before editing
4. **Don't forget build verification** ΓÇö Always end with `npm run build`
5. **Don't let Claude add dependencies** ΓÇö Ask it to check if existing deps can solve the problem first
6. **Don't accept large refactors** ΓÇö If Claude wants to restructure a working file, push back
7. **Don't forget Icelandic** ΓÇö Remind Claude that all UI text must be in Icelandic

---

## Part 6: Power User Techniques

### Parallel Agents
For big tasks, ask Claude to use parallel agents:
```
Search for all uses of `fetchProjects` across the codebase
and simultaneously check if the API endpoint handles errors correctly.
```

### Skills System
Your `.claude/skills/` directory contains pre-written context. Reference them:
```
Read the calculator-patterns skill before modifying any calculator.
```

### Diff Review
After changes, ask:
```
Show me a git diff of everything you changed.
```

### Rollback Safety
Before risky changes:
```
Before making changes, create a git stash so we can roll back if needed.
```
