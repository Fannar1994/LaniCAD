# Skill: Create a New Calculator

When asked to create a new calculator for Reiknivelar, follow these steps:

## Steps

1. **Copy an existing calculator** as a template (use `Girdingar_reiknivel.html` for simpler ones, `vinnupalla-reiknivel.html` for complex ones)
2. **Update the header** section:
   - Change the eyebrow text (e.g., "BYKO LEIGA")
   - Change the `<h1>` title to the new calculator name
   - Update the `<title>` tag
3. **Define the product catalogue** as a JavaScript array of objects:
   ```js
   const items = [
     { id: 'ITEM-001', name: 'Lýsing', unit: 'stk', price: 0 },
     // ...
   ];
   ```
4. **Implement calculation logic** in a dedicated function (e.g., `calculate()`)
5. **Add result display** using card-based layout with summary tables
6. **Add PDF export** using html2pdf.js (already loaded via CDN)
7. **Add Excel export** using XLSX library if needed
8. **Add the calculator to `index.html`** – create a new card in the `.grid` section
9. **Update `README.md`** – add the new calculator to the list

## Checklist

- [ ] HTML file created with proper `<meta>` tags and favicon links
- [ ] CSS variables match existing design system (`:root` vars)
- [ ] Header follows dark header + yellow accent stripe pattern
- [ ] All UI text is in Icelandic
- [ ] Responsive layout works on mobile
- [ ] PDF export tested
- [ ] Card added to `index.html`
- [ ] `README.md` updated
