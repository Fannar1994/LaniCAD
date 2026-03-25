You are helping me convert an existing Excel-based rental offer workbook
("Leigutilboð Rasto-Takko.xlsx") into a React + TypeScript calculator /
offer generator.

Your job is to:
1) Reverse-engineer the Excel logic and structure.
2) Encode the calculations as pure, well-documented TypeScript functions.
3) Build a React component that reproduces the offer sheet behaviour.
4) Treat the workbook as the single source of truth – no invented logic.

========================================
CONTEXT – RASTO / TAKKO FORMWORK OFFERS
========================================

This workbook is for generating rental offers ("Leigutilboð") for a
Rasto/Takko formwork system (wall formwork panels and accessories).

In typical practice, such an offer consists of:
- Project information (customer, project name, dates).
- Design / quantity summary from the formwork system:
  - Total formwork area (m²).
  - Broken down per system component (panels, corners, ties, walers, braces,
    props, etc.).
- Rental parameters:
  - Rental period (days, weeks or months).
  - Daily/weekly/monthly rates per item.
  - Discounts, surcharges, mobilization/demobilization if applicable.
- Output:
  - Itemized list with quantities, rates and totals.
  - Subtotals and grand total, usually with and without VAT.

You must derive any numbers or relationships you use directly from
"Leigutilboð Rasto-Takko.xlsx". If the workbook encodes panel areas,
rates, discounts or VAT, copy those exactly in code.

==============================
MAP THE EXCEL STRUCTURE FIRST
==============================

Inspect "Leigutilboð Rasto-Takko.xlsx" and identify:

1. Input section(s):
   - Project and customer data:
     - Customer name, project name/ID, site, contact info, reference numbers.
   - Time/rental parameters:
     - Start date, end date, number of rental days, weeks or months.
     - Any explicit duration cells the sheet uses.
   - Technical/quantity inputs:
     - Total formwork area (m²) or per-wall areas if present.
     - If this workbook is fed by another calculator, check whether the
       quantities per item are input or computed.

2. Items / offer lines table:
   - Columns typically include:
     - Söluvrn      (sales item number)
     - Leigunumer   (rental code)
     - Heiti        (item name, e.g. "Rasto panel 90x270", "Takko panel", ties)
     - Magn         (quantity)
     - Ein.verð     (unit rental rate, usually per day or per period)
     - Tímabil      (days/weeks/months, if present)
     - Afsláttur    (discount %, if used)
     - Línusamtals  (line total ex. VAT)
   - At the bottom:
     - Subtotals for formwork items.
     - Any additional service lines (transport, cleaning, design fee, etc.).
     - VAT calculation and final total.
     - Possibly both ex. and inc. VAT totals.

3. Hidden / helper areas:
   - VAT rate.
   - Conversion between daily and monthly rates (e.g. 30 days).
   - Any lookups (e.g. VLOOKUP or INDEX/MATCH to get unit rates from codes).
   - Discount logic (e.g. discount applied only above certain area/duration).

Before writing code, create a documentation comment in the TS file that:
- Lists all user inputs (name, type, units).
- Lists all important outputs.
- Describes in plain language how the workbook goes from inputs → item lines
  → totals.

=================
WHAT TO BUILD
=================

Goal:
Build a React + TypeScript component that behaves like the main offer sheet in
"Leigutilboð Rasto-Takko.xlsx":

- User inputs:
  - Project and customer info (for now this can just be captured as strings).
  - Rental period: start date/end date or directly a number of days/weeks.
  - Any technical/quantity inputs the workbook expects (e.g. m², number of
    repeats, or item quantities if not computed automatically).
  - Any discount fields or toggles that exist in the workbook.

- Calculations:
  - If the workbook computes item quantities from m² or other geometry, mirror
    that exactly.
  - Compute line totals for each item using the workbook’s formulas:
    - quantity × unit rate × duration, applying any discounts as in Excel.
  - Compute:
    - Subtotals per category if present.
    - Total ex. VAT.
    - VAT amount.
    - Total inc. VAT.
  - Any additional totals (e.g. “estimated monthly cost”, “transport cost”)
    that appear on the sheet.

Important:
- Do NOT invent new pricing or discount logic. Only implement what the
  workbook actually does.
- If the workbook uses `ROUND`, `ROUNDUP` or specific decimal precision,
  replicate that exactly.
- If it uses lookups to fetch unit prices from another sheet, implement the
  identical mapping in code (hard-coded mapping table or imported JSON).

====================
TECH REQUIREMENTS
====================

- React 18 + TypeScript.
- Main component: `RastoTakkoOfferCalculator.tsx`.
- Functional components with hooks only (no classes).

Types:
- Define clear types based on the workbook, for example:

  ```ts
  type ProjectInfo = {
    customerName: string;
    projectName: string;
    projectLocation: string;
    reference: string;
    // add more fields if the sheet uses them
  };

  type RentalParameters = {
    startDate?: Date;
    endDate?: Date;
    rentalDays: number;
    // if workbook models by weeks or months, add those as well
  };

  type OfferItemRow = {
    salesCode: string;     // Söluvrn
    rentalCode: string;    // Leigunumer
    name: string;          // Heiti
    quantity: number;      // Magn
    unitRate: number;      // Ein.verð (per chosen period)
    discountPercent: number; // if used
    lineTotalExVat: number;
  };

  type OfferTotals = {
    subtotalExVat: number;
    vatAmount: number;
    totalInclVat: number;
  };

  type RastoTakkoOfferResult = {
    project: ProjectInfo;
    rental: RentalParameters;
    items: OfferItemRow[];
    totals: OfferTotals;
  };
