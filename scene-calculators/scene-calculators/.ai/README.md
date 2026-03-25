# AI Context Management

This folder contains documentation to maintain consistency across AI-assisted coding sessions.

## 📁 Files Overview

### `architecture.md`
**When to use**: Start of every new chat session  
**Contains**: Tech stack, project structure, key patterns, dependencies

### `session_log.md`
**When to use**: Beginning and end of each session  
**Contains**: Current work, files involved, last actions, next steps

### `common_mistakes.md`
**When to use**: Before making any code changes  
**Contains**: Repetitive errors to avoid (imports, styling, state, etc.)

### `component_conventions.md`
**When to use**: When creating or modifying components  
**Contains**: File structure, code templates, existing reference components

---

## 🚀 How to Use

### Starting a New AI Session

1. Open a fresh chat/thread
2. Paste this prompt:

```
I'm working on the scene-calculators project. Read these context files:
- .ai/architecture.md
- .ai/session_log.md  
- .ai/common_mistakes.md

Current task: [describe your task]
Files involved: [list files]
```

### During Development

- Reference `.ai/component_conventions.md` when building new components
- Check `.ai/common_mistakes.md` before major changes
- Use existing components as templates (listed in conventions)

### Ending a Session

Update `.ai/session_log.md`:
- Move current work to "Session History"
- Document what was completed
- Note any blockers or next steps

---

## 💡 Quick Tips

**For short tasks**: Just reference `common_mistakes.md`

**For new features**: Load all `.ai/` docs at session start

**Long chat getting messy?**: 
1. Update `session_log.md`
2. Start fresh chat
3. Paste architecture + session log

**AI going rogue?**: Point it to `component_conventions.md` and existing component examples

---

## 🔄 Maintenance

Update these docs when:
- Architecture changes (new packages, patterns)
- New repetitive mistakes emerge
- New component patterns are established
- Major features are completed

Keep docs **short and scannable** - context window is precious!
