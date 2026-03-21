---
name: debugging
description: Common errors, troubleshooting patterns, and fix strategies for LániCAD (Vite, React, TypeScript, Tailwind, Three.js).
argument-hint: What error? (build | runtime | type | style | 3d)
allowed-tools:
  - read_file
  - replace_string_in_file
  - run_in_terminal
  - grep_search
  - get_errors
---

# Debugging Skill

## Build Errors

### "Module not found" / Import errors
```
Cannot find module '@/pages/calculators/FormworkCalculator'
```
**Fix**: The file doesn't exist yet. Check `src/App.tsx` imports match actual files:
```bash
# List existing calculator files
ls src/pages/calculators/
```

### TypeScript strict mode errors
```
Property 'X' does not exist on type 'Y'
```
**Fix**: Check `src/types/index.ts` — add missing properties or use optional chaining.

### Vite build failures
```bash
npm run build   # tsc -b && vite build
```
- First runs TypeScript compilation (`tsc -b`)
- Then Vite bundling
- Fix TS errors first, then Vite errors

## Runtime Errors

### "useAuth must be used within AuthProvider"
**Cause**: Component rendered outside `<AuthProvider>` tree.
**Fix**: Ensure `main.tsx` wraps `<App>` with `<AuthProvider>`.

### localStorage parse errors
```
SyntaxError: Unexpected token in JSON at position 0
```
**Fix**: Clear corrupted localStorage:
```ts
localStorage.removeItem('lanicad_users')
localStorage.removeItem('lanicad_session')
```

### React Router "No routes matched"
**Cause**: Path mismatch or basename wrong.
**Fix**: Check `vite.config.ts` base matches `BrowserRouter` basename in `main.tsx`.

## Styling Issues

### Tailwind classes not working
1. Check `tailwind.config.js` content paths include `./src/**/*.{js,ts,jsx,tsx}`
2. Check `src/index.css` has `@tailwind base; @tailwind components; @tailwind utilities;`
3. Check PostCSS config loads tailwindcss and autoprefixer

### Font not loading
Barlow fonts loaded via Google Fonts in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

## Three.js / React Three Fiber Issues

### Canvas blank / not rendering
1. Container must have explicit height: `className="h-[500px]"`
2. Check `<Canvas>` has children (lights, meshes)
3. Check camera position isn't inside a mesh

### "R3F: Hooks can only be used within the Canvas component"
**Fix**: Move hook usage inside a component that's a child of `<Canvas>`.

### Performance: too many draw calls
**Fix**: Use `<Instances>` from @react-three/drei for repeated geometry (scaffold tubes).

## Common Fix Workflow

1. Run `npm run build` to get error list
2. Read the error message carefully
3. Check the file and line number
4. Look at `src/types/index.ts` for type issues
5. Check imports in `src/App.tsx` for missing components
6. Test fix with `npm run dev`

## Known Issues to Watch

- `CeilingPropsCalculator.tsx` — imported in App.tsx but NOT YET CREATED
- `FormworkCalculator.tsx` — imported in App.tsx but NOT YET CREATED
- `src/data/formwork.ts` — NOT YET CREATED
- npm install has not been run yet — node_modules doesn't exist
