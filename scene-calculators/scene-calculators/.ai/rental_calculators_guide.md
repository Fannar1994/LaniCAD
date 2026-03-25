# Rental Calculator Implementation Guide

## Overview
The rental calculators integrate with **Inriver PIM** to fetch live product pricing and information. They support two rental types:

1. **Fence Rental** (`fence-rental`) - Construction fences, crowd barriers, traffic barriers
2. **Scaffold Rental** (`scaffold-rental`) - Mobile scaffolds with multiple height options

## Architecture

### File Structure
```
src/scenes/rental/
├── interface.ts              # TypeScript interfaces
├── configuration.ts          # Pricing tables & SKU mappings
├── utils.ts                  # Inriver API & calculations
├── fence-rental.tsx          # Fence calculator UI
├── scaffold-rental.tsx       # Scaffold calculator UI
└── index.ts                  # Exports
```

### Key Components

#### 1. **Inriver PIM Integration** (`utils.ts`)

```typescript
// Load configuration
await loadInriverConfig();

// Fetch pricing for SKUs
const pricing = await getRentalPricing(['01-BAT-GI01-015'], 30);
```

**Features:**
- Automatic authentication with Inriver API
- Session management
- Fallback to default pricing when API unavailable
- Real-time pricing lookups by SKU

#### 2. **Pricing Configuration** (`configuration.ts`)

Stores default pricing tables used when Inriver is unavailable:

- **Fence Pricing**: Tiered pricing (1-30, 30-60, 60-90, 90-120, 120+ days)
- **Scaffold Pricing**: 24h, extra day, weekly rates + deposits
- **Material Quantities**: BOM for each scaffold height

#### 3. **Calculator Components**

Both calculators follow the same pattern:
- User inputs (type, dates, options)
- Validation
- API call for live pricing
- Display results with material breakdown

## Usage

### Fence Rental Calculator

```tsx
import { Calculator } from "@byko/scene-calculators";

<Calculator type="fence-rental" />
```

**Features:**
- 3 fence types: Worksite, Crowd control, Traffic barriers
- Configurable height, thickness, stone type (for worksite)
- Date-based rental calculation
- Live pricing from Inriver PIM

**Example SKUs:**
- `01-BAT-GI01-015` - Worksite fence 3.5x2.0x1.1mm
- `01-BAT-GI01-050` - Crowd control fence
- `01-BAT-VE01-260` - Traffic barrier (white)

### Scaffold Rental Calculator

```tsx
import { Calculator } from "@byko/scene-calculators";

<Calculator type="scaffold-rental" />
```

**Features:**
- 3 scaffold types: Narrow (0.75m), Wide (1.35m), Quicky
- 9 height options (2.5m to 10.5m working height)
- Optional support legs
- Material breakdown table (BOM)
- Deposit calculation

**Example SKUs:**
- `01-PAL-HP01-106` - Aluminum frames B1 2.1M
- `01-PAL-HP01-117` - Floor boards PB25
- `01-PAL-HP01-115` - Adjustable support legs

## Inriver PIM Configuration

### API Config File (`/api_config.json`)

```json
{
  "apiUrl": "https://your-inriver-api.com",
  "apiKey": "YOUR_API_KEY",
  "minDays": 10,
  "credentials": {
    "username": "YOUR_USERNAME",
    "password": "YOUR_PASSWORD",
    "depot": "YOUR_DEPOT_ID"
  },
  "endpoints": {
    "logon": "https://your-inriver-api.com/logon",
    "rates": "https://your-inriver-api.com/rates"
  }
}
```

### Environment Variables (Alternative)

For production, use environment variables:

```env
INRIVER_API_URL=https://your-inriver-api.com
INRIVER_API_KEY=your-api-key
INRIVER_USERNAME=your-username
INRIVER_PASSWORD=your-password
INRIVER_DEPOT=your-depot
```

## API Response Format

### Expected Inriver Rate Response

```json
{
  "value": [
    {
      "Itemno": "01-BAT-GI01-015",
      "DailyRate": 90.00
    }
  ]
}
```

## Fallback Behavior

When Inriver PIM is unavailable:
1. Uses default pricing from `configuration.ts`
2. Shows warning: "⚠ Verð er áætlað - hafðu samband fyrir nákvæmt tilboð"
3. Allows calculator to continue functioning

When Inriver PIM is available:
1. Shows success: "✓ Verð er live úr verðgrunni (Inriver PIM)"
2. Uses real-time pricing

## Calculation Logic

### Fence Rentals

```typescript
// 1. Determine SKUs based on configuration
const skus = getFenceSKUs(config);

// 2. Fetch pricing from Inriver
const pricing = await getRentalPricing(skus, days);

// 3. Calculate cost
const numUnits = Math.ceil(totalMeters / unitLength);
const totalCost = pricing.rate * numUnits * days;
```

### Scaffold Rentals

```typescript
// 1. Get pricing table for scaffold type & height
const pricingTier = getPricingTable(scaffoldType, height);

// 2. Calculate based on rental duration
if (days === 1) cost = pricingTier["24h"];
else if (days <= 6) cost = pricingTier["24h"] + pricingTier.extra * (days - 1);
else cost = (weeks * pricingTier.week) + (extraDays * pricingTier["24h"]);

// 3. Add support legs if selected
if (supportLegs) cost += calculateSupportLegs(days);
```

## Material Breakdown

Scaffolds automatically generate a Bill of Materials:

```typescript
// Example for 4.5m narrow scaffold
[
  { itemno: "01-PAL-HP01-106", name: "Álrammar B1 2,1M", qty: 4 },
  { itemno: "01-PAL-HP01-107", name: "Álrammar B5 1,05M", qty: 2 },
  { itemno: "01-PAL-HP01-117", name: "Gólfborð M/Opi PB25", qty: 2 },
  // ... etc
]
```

## Testing

### Without Inriver PIM
1. Ensure no `api_config.json` exists
2. Calculators use fallback pricing
3. Warning message displays

### With Inriver PIM
1. Create `api_config.json` with valid credentials
2. Verify API calls in Network tab
3. Confirm "live pricing" message appears

## Future Enhancements

- [ ] Add to cart functionality for rental products
- [ ] Email quotes directly from calculator
- [ ] Multi-language support (IS/EN)
- [ ] PDF quote generation
- [ ] Calendar integration for availability
- [ ] Real-time inventory checks via Inriver
