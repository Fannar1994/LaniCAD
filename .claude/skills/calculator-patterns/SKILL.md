---
name: calculator-patterns
description: Rental/sale calculator formulas, data structures, and UI patterns for all 5 LániCAD calculator modules (mobile fence, scaffolding, formwork, mobile scaffolding, ceiling props).
argument-hint: Which calculator? (mobile-fence | scaffolding | formwork | mobile-scaffolding | ceiling)
allowed-tools:
  - read_file
  - replace_string_in_file
  - create_file
  - grep_search
---

# Calculator Patterns Skill

## Overview

LániCAD has 5 calculator modules. Each follows a shared pattern:
1. **Data file** in `src/data/` — product catalog with rental/sale prices
2. **Calculator component** in `src/pages/calculators/` — React form + results table
3. **Calculation logic** in `src/lib/calculations/` — shared rental cost and geometry functions
4. **PDF/Excel export** — jsPDF for PDF, XLSX for Excel

## Rental Cost Formulas

### Standard Rental (formwork, ceiling props)
```ts
if (days < 7) {
  cost = dayRate × days × qty
} else {
  cost = weekRate × Math.ceil(days / 7) × qty
}
```

### Mobile Fence Rental (12-tier monthly declining rates)
```ts
// 12 periods of 30 days each, rates decline per period
// Minimum rental: 10 days
// Rate tiers: period1Rate > period2Rate > ... > period12Rate
for (period 1..12) {
  if (daysRemaining > 0) {
    periodDays = Math.min(30, daysRemaining)
    cost += periodRate[period] × periodDays × qty
    daysRemaining -= periodDays
  }
}
```

### Mobile Scaffolding Rental
```ts
if (days === 1) cost = price24h
else if (days <= 6) cost = price24h + extraDayPrice × (days - 1)
else cost = weekPrice × Math.floor(days / 7) + price24h × (days % 7)
```

### Scaffolding Rental
```ts
cost = totalDays × dailyRate × qty
// Period discount may apply for longer rentals
```

## Data File Patterns

### Location: `src/data/`
- `fence.ts` — 14 products, FenceProduct type, 12-tier MonthlyRates (mobile fences)
- `scaffolding.ts` — 25 items, ScaffoldItem type, dailyRate + weight
- `rolling-scaffold.ts` — NARROW/WIDE/QUICKLY pricing, 9 heights each (mobile scaffolding)
- `ceiling-props.ts` — 8 props + 7 beams + 5 accessories, day/week/sale rates
- `formwork.ts` — ~170 items (TBD), FormworkItem type, day/week rates

### Common Data Fields
```ts
interface Product {
  rentalNo: string    // Leiguvörunúmer
  saleNo?: string     // Söluvörunúmer
  description: string // Icelandic description
  dayRate?: number    // Day rate in ISK
  weekRate?: number   // Week rate in ISK
  salePrice?: number  // Sale price in ISK
}
```

## Calculator Component Pattern

```tsx
export function XxxCalculator() {
  // 1. State: dates, quantities, selected products
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [items, setItems] = useState<LineItem[]>([])

  // 2. Calculate totals when inputs change
  const totalDays = daysBetween(startDate, endDate)
  const totalCost = items.reduce((sum, item) => sum + item.total, 0)

  // 3. Client info for PDF header
  const [client, setClient] = useState<ClientInfo>({...})

  // 4. Export functions
  const handlePdfExport = () => { /* jsPDF */ }
  const handleExcelExport = () => { /* XLSX */ }

  return (
    <div className="space-y-6">
      {/* Client info form */}
      {/* Date pickers with bidirectional sync */}
      {/* Product selection table */}
      {/* Results summary with totals */}
      {/* Export buttons */}
    </div>
  )
}
```

## Export Patterns

### PDF Export (jsPDF + jspdf-autotable)
```ts
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const doc = new jsPDF()
doc.setFont('helvetica')
doc.text('BYKO Leiga — Tilboð', 14, 20)
autoTable(doc, {
  head: [['Vörunúmer', 'Lýsing', 'Magn', 'Verð', 'Samtals']],
  body: items.map(i => [i.rentalNo, i.description, i.qty, formatKr(i.rate), formatKr(i.total)]),
  startY: 40,
})
doc.save('tilbod.pdf')
```

### Excel Export (XLSX)
```ts
import * as XLSX from 'xlsx'

const ws = XLSX.utils.aoa_to_sheet([
  ['Vörunúmer', 'Lýsing', 'Magn', 'Verð', 'Samtals'],
  ...items.map(i => [i.rentalNo, i.description, i.qty, i.rate, i.total]),
])
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, 'Tilboð')
XLSX.writeFile(wb, 'tilbod.xlsx')
```

## Currency Formatting

Always use `formatKr()` from `src/lib/format.ts`:
```ts
formatKr(1234567) // → "1.234.567 kr"
```

## Checklist for New Calculator

- [ ] Create data file in `src/data/`
- [ ] Add route in `src/App.tsx`
- [ ] Add nav link in `src/components/layout/Sidebar.tsx`
- [ ] Create calculator component in `src/pages/calculators/`
- [ ] Wire up rental calculation from `src/lib/calculations/rental.ts`
- [ ] Add PDF + Excel export
- [ ] Test with realistic data
