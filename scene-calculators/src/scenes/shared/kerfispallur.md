You are helping me convert the following Excel-based scaffold calculator
("Vinnupallatafla með forsendum – tvöföld handrið") into a React + TypeScript
calculator.

I’ll describe the structure and expected behaviour. Your job is to:
1) reverse-engineer the Excel logic from the file
2) reproduce it as pure calculation functions
3) build a React calculator UI around it.

================================
EXCEL STRUCTURE (SPECIFICATION)
================================

The sheet has up to 20 platform columns:

- Header row (simplified):
  | Pallur nr. | 1 | 2 | 3 | ... | 20 |

User input rows:

- "Einingafjöldi:"           (number of bays/sections per pallur)
- "Fjöldi 2m hæða"           (count of 2.0 m frame heights)
- "Fjöldi 0,7m hæða"         (count of 0.7 m frame heights)
- "Hæsta standhæð í m"       (highest standing height in meters)
- "Mesta vinnuhæð í m"       (max working height in meters)
- "Fjöldi endalokana"        (number of end closures / end handrails)

Beneath that is the main items table:

Columns:
- Söluvrn        (sales item number)
- Leigunumer     (rental code)
- Heiti          (item description, e.g. "RAMMAR 2,0M", "GÓLFBORÐ 1,8M")
- Then 20 quantity columns (one per Pallur nr 1–20)
- A "Samtals" quantity column (total quantity over all pallar)
- "Ein.verð"     (unit price – daily)
- "Samtals"      (line total per day, excluding or incl. VAT depending on Excel)
- There are also helper columns with weight, m² etc. – reuse what is in Excel.

Example rows:
- 97100000 / 01-PAL-VP01-000  | RAMMAR 2,0M
- 97100002 / 01-PAL-VP01-002  | GÓLFBORÐ 1,8M
- 971000101 / 01-PAL-VP01-0101| TVÖFÖLD HANDRIÐ
- 97100006 / 01-PAL-VP01-006  | LAPPIR 50CM
- …
At the bottom:
- Row showing "Fermetrafjöldi:" per pallur and a total "Fermetrar" sum.
- A row "Samtals dagleiga með virðisaukaskatti" with a total daily price.
- A row "Mánaðarleiga (30d) m/vsk" with monthly price.

Treat the attached XLSX as the single source of truth for all formulas.

=============
WHAT TO BUILD
=============

Goal:
Build a React + TypeScript component that reproduces the same logic:

- The user inputs the same fields as in the sheet:
  - For each pallur (1..N): Einingafjöldi, Fjöldi 2m hæða, Fjöldi 0,7m hæða,
    Hæsta standhæð í m, Mesta vinnuhæð í m, Fjöldi endalokana.
  - It’s fine if we only support a subset of pallar (e.g. up to 10 or 20),
    but it must be configurable.

- Based on these inputs, calculate:
  - All item quantities per pallur (those 20 quantity columns).
  - The per-row "Samtals" quantity (sum over pallar).
  - "Fermetrafjöldi" per pallur and total "Fermetrar".
  - Line totals (quantity * Ein.verð).
  - The grand totals:
    - "Samtals dagleiga með virðisaukaskatti"
    - "Mánaðarleiga (30d) m/vsk"

IMPORTANT:
- Reverse-engineer the formulas directly from the Excel file, do NOT hard-code
  the example numbers I pasted. For each calculated column, mirror the same
  mathematical logic as the cell formulas in the XLSX.
- In code comments, document in plain English what each calculation does
  (e.g. “ferm2 = totalDeckLengthMeters * workingHeight / something”).

==================
TECH REQUIREMENTS
==================

- React 18 + TypeScript.
- One main component: `ScaffoldDoubleGuardrailCalculator.tsx`.
- Functional components with hooks – no class components.
- No external UI library required; semantic HTML + simple CSS/Tailwind classes
  for layout is enough.

State & types:
- Define types like:

  ```ts
  type PallurInput = {
    pallurNr: number;
    einingafjoldi: number;
    fjoldi2mHaeda: number;
    fjoldi0_7mHaeda: number;
    haestaStandhaed: number;
    mestaVinnuhaed: number;
    fjoldiEndalokana: number;
  };

  type ItemRow = {
    salesCode: string;
    rentalCode: string;
    name: string;
    unitPrice: number;
    quantitiesPerPallur: number[]; // length N
    totalQuantity: number;
    lineTotal: number;
  };

  type CalculatorResult = {
    items: ItemRow[];
    fermetrafjoldiPerPallur: number[];
    totalFermetrar: number;
    dailyTotalWithVat: number;
    monthlyTotalWithVat: number;
  };
