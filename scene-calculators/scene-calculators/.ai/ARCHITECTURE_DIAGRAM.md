# System Architecture - Rental Calculators

## Component Hierarchy

```
Calculator (Main Entry Point)
│
├─ type="fence-rental"
│  └─ FenceRental Component
│     ├─ Radio buttons (fence type)
│     ├─ Options (height, thickness, stones)
│     ├─ Date inputs
│     └─ Calculate button
│        └─ getRentalPricing() → Inriver API or fallback
│
├─ type="scaffold-rental"
│  └─ ScaffoldRental Component
│     ├─ Radio buttons (scaffold type)
│     ├─ Height options
│     ├─ Support legs checkbox
│     ├─ Date inputs
│     └─ Calculate button
│        └─ calculateScaffoldCost() → pricing tables
│
├─ type="girðing" (existing)
│  └─ Girding Component
│
└─ type="pallur" (existing)
   └─ Pallur Component
```

## Data Flow - Fence Rental

```
┌─────────────────┐
│  User Inputs    │
│  - Fence type   │
│  - Meters       │
│  - Dates        │
│  - Options      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validation     │
│  - Check dates  │
│  - Check meters │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Determine SKUs │
│  Based on type  │
│  & configuration│
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  getRentalPricing()     │
│  ┌───────────┐          │
│  │ Try Inriver API      │
│  │ ├─ Authenticate      │
│  │ ├─ Fetch rates       │
│  │ └─ Return live price │
│  └───────┬───┘          │
│          │ Fail         │
│          ▼              │
│  ┌───────────┐          │
│  │ Fallback   │         │
│  │ Use config │         │
│  │ pricing    │         │
│  └───────────┘          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────┐
│  Calculate Cost │
│  - Daily rate   │
│  - × Units      │
│  - × Days       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Display Result │
│  - Total cost   │
│  - Breakdown    │
│  - Source badge │
│  - Warnings     │
└─────────────────┘
```

## Data Flow - Scaffold Rental

```
┌─────────────────┐
│  User Inputs    │
│  - Type         │
│  - Height       │
│  - Support legs │
│  - Dates        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validation     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Get Pricing Table      │
│  ┌─────────────┐        │
│  │ If Quicky   │        │
│  │ → QUICKY_   │        │
│  │   PRICING   │        │
│  ├─────────────┤        │
│  │ If Narrow   │        │
│  │ → NARROW_   │        │
│  │   SCAFFOLD_ │        │
│  │   PRICING   │        │
│  ├─────────────┤        │
│  │ If Wide     │        │
│  │ → WIDE_     │        │
│  │   SCAFFOLD_ │        │
│  │   PRICING   │        │
│  └─────────────┘        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────┐
│  Calculate Cost │
│  ┌─────────┐    │
│  │ Day 1:  │    │
│  │ 24h rate│    │
│  ├─────────┤    │
│  │ Days 2-6│    │
│  │ + extra │    │
│  ├─────────┤    │
│  │ Days 7+ │    │
│  │ weeks + │    │
│  │ extra   │    │
│  └─────────┘    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate BOM    │
│ ┌─────────────┐ │
│ │ Query       │ │
│ │ SCAFFOLD_   │ │
│ │ MATERIALS   │ │
│ │ for height  │ │
│ └─────────────┘ │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Display Result │
│  - Total cost   │
│  - Support legs │
│  - Deposit      │
│  - BOM table    │
└─────────────────┘
```

## Inriver PIM Integration

```
┌──────────────────────────────────┐
│  loadInriverConfig()             │
│  ┌────────────────────────────┐  │
│  │ Fetch /api_config.json     │  │
│  │                            │  │
│  │ {                          │  │
│  │   "apiUrl": "...",         │  │
│  │   "apiKey": "...",         │  │
│  │   "credentials": {...}     │  │
│  │ }                          │  │
│  └────────────────────────────┘  │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  authenticateInriver()           │
│  ┌────────────────────────────┐  │
│  │ POST /logon                │  │
│  │ Body: {                    │  │
│  │   USERNAME,                │  │
│  │   PASSWORD,                │  │
│  │   DEPOT                    │  │
│  │ }                          │  │
│  │                            │  │
│  │ Response:                  │  │
│  │ { SessionID: "abc123" }    │  │
│  └────────────────────────────┘  │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  fetchInriverRate(sku)           │
│  ┌────────────────────────────┐  │
│  │ GET /rates?$filter=        │  │
│  │   Itemno eq '01-BAT-...'   │  │
│  │                            │  │
│  │ Headers: {                 │  │
│  │   SessionID: "abc123",     │  │
│  │   x-api-key: "..."         │  │
│  │ }                          │  │
│  │                            │  │
│  │ Response:                  │  │
│  │ {                          │  │
│  │   value: [{               │  │
│  │     Itemno: "01-BAT-...", │  │
│  │     DailyRate: 90.00      │  │
│  │   }]                       │  │
│  │ }                          │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

## Configuration Structure

```
src/scenes/rental/
│
├─ interface.ts
│  ├─ RentalType
│  ├─ FenceType
│  ├─ ScaffoldType
│  ├─ PricingTier
│  ├─ FenceRentalConfig
│  ├─ ScaffoldRentalConfig
│  ├─ InriverProduct
│  ├─ InriverPriceResponse
│  └─ RentalResultDisplay
│
├─ configuration.ts
│  ├─ MIN_RENTAL_DAYS = 10
│  ├─ FENCE_DIMENSION_MAPPING
│  │  └─ "3.5_2.0_1.1" → "01-BAT-GI01-015"
│  ├─ FENCE_PRICING
│  │  └─ { "01-BAT-GI01-015": { "1-30": 90, ... } }
│  ├─ NARROW_SCAFFOLD_PRICING
│  │  └─ { "2.5": { "24h": 4717, extra: 2359, ... } }
│  ├─ WIDE_SCAFFOLD_PRICING
│  ├─ QUICKY_PRICING
│  ├─ SUPPORT_LEGS_PRICING
│  ├─ SCAFFOLD_MATERIALS
│  │  └─ { "01-PAL-HP01-106": { "2.5": 2, "3.5": 4, ... } }
│  └─ MATERIAL_NAMES
│
├─ utils.ts
│  ├─ loadInriverConfig()
│  ├─ authenticateInriver()
│  ├─ fetchInriverRate(sku)
│  ├─ getRentalPricing(skus, days)
│  ├─ calculateScaffoldCost(tier, days)
│  ├─ getPricingTier(days)
│  ├─ calculateDaysBetween(start, end)
│  ├─ formatIcelandicDate(date)
│  ├─ formatIcelandicNumber(num)
│  └─ getTodayDate()
│
├─ fence-rental.tsx
│  └─ FenceRental Component
│     ├─ State: config, result, loading, error
│     ├─ Effects: Load Inriver config
│     ├─ Handlers: Type change, input change, calculate
│     └─ Render: Form + Results
│
└─ scaffold-rental.tsx
   └─ ScaffoldRental Component
      ├─ State: config, result, error
      ├─ Handlers: Type change, calculate
      └─ Render: Form + Results + BOM Table
```

## State Management

### Fence Rental State
```typescript
{
  config: {
    fenceType: "worksite" | "crowd" | "traffic",
    height?: "1.2" | "2.0",
    thickness?: "1.1" | "1.7",
    stoneType?: string,
    totalMeters: number,
    startDate: string,  // YYYY-MM-DD
    endDate: string     // YYYY-MM-DD
  },
  result: {
    totalCost: number,
    dailyRate?: number,
    days: number,
    source: "api" | "fallback",
    warning?: string
  } | null,
  loading: boolean,
  error: string | null
}
```

### Scaffold Rental State
```typescript
{
  config: {
    scaffoldType: "narrow" | "wide" | "quicky",
    height?: string,  // "2.5", "3.5", ..., "10.5"
    supportLegs: boolean,
    startDate: string,
    endDate: string
  },
  result: {
    rentalCost: number,
    supportLegsCost: number,
    deposit: number,
    days: number,
    materials: Array<{
      itemno: string,
      name: string,
      qty: number
    }>
  } | null,
  error: string | null
}
```

## Error Handling

```
┌─────────────────────┐
│  User Action        │
└──────────┬──────────┘
           │
           ▼
     ┌────────────┐
     │ Try Block  │
     └─────┬──────┘
           │
   Success │  Failure
           ▼         ▼
     ┌─────────┐  ┌────────┐
     │ Display │  │ Catch  │
     │ Result  │  │ Block  │
     └─────────┘  └────┬───┘
                       │
                       ▼
                 ┌──────────────┐
                 │ Set Error    │
                 │ Message      │
                 └──────────────┘
                       │
                       ▼
                 ┌──────────────┐
                 │ Display      │
                 │ Error to     │
                 │ User         │
                 └──────────────┘
```

## Security Layers

```
┌─────────────────────────────────┐
│  1. Environment Variables       │
│     (Production)                │
│     INRIVER_API_KEY=***         │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  2. Config File                 │
│     (Development)               │
│     api_config.json (gitignored)│
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  3. Session Management          │
│     SessionID cached in memory  │
│     (not persisted)             │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  4. HTTPS Communication         │
│     All API calls encrypted     │
└─────────────────────────────────┘
```
