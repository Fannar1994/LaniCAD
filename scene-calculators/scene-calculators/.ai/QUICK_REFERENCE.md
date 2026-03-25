# 🚀 Quick Reference - Rental Calculators

## Usage

```tsx
import { Calculator } from "@byko/scene-calculators";

// Fence rental calculator
<Calculator type="fence-rental" />

// Scaffold rental calculator
<Calculator type="scaffold-rental" />
```

## File Locations

| File | Path |
|------|------|
| **Fence Calculator** | `src/scenes/rental/fence-rental.tsx` |
| **Scaffold Calculator** | `src/scenes/rental/scaffold-rental.tsx` |
| **Configuration** | `src/scenes/rental/configuration.ts` |
| **Inriver API** | `src/scenes/rental/utils.ts` |
| **Types** | `src/scenes/rental/interface.ts` |
| **API Config** | `api_config.json` (create from .example) |

## Inriver PIM Setup

```json
{
  "apiUrl": "https://your-inriver-api.com",
  "apiKey": "YOUR_API_KEY",
  "credentials": {
    "username": "YOUR_USERNAME",
    "password": "YOUR_PASSWORD",
    "depot": "YOUR_DEPOT"
  }
}
```

## Key Functions

```typescript
// Load Inriver config (auto-called on mount)
await loadInriverConfig();

// Get pricing for SKUs
const pricing = await getRentalPricing(['01-BAT-GI01-015'], 30);
// Returns: { rate: 90, source: 'api' | 'fallback' }

// Calculate days between dates
const days = calculateDaysBetween('2025-01-01', '2025-01-31'); // 31

// Calculate scaffold cost
const cost = calculateScaffoldCost(pricingTier, days);

// Format numbers
formatIcelandicNumber(1234567); // "1.234.567"
formatIcelandicDate('2025-01-15'); // "15.01.2025"
```

## Common SKUs

### Fences
- `01-BAT-GI01-015` - Worksite 3.5×2.0×1.1mm
- `01-BAT-GI01-052` - Worksite 3.5×1.2×1.1mm
- `01-BAT-GI01-053` - Worksite 3.5×2.0×1.7mm
- `01-BAT-GI01-050` - Crowd control 2.5×1.2m
- `01-BAT-VE01-260` - Traffic barrier white
- `01-BAT-VE01-265` - Traffic barrier red
- `01-BAT-GI01-054` - Concrete stones
- `01-BAT-GI01-0541` - PVC stones
- `01-BAT-GI01-097` - Fence clamps

### Scaffolds
- `01-PAL-HP01-106` - Aluminum frames B1 2.1M
- `01-PAL-HP01-107` - Aluminum frames B5 1.05M
- `01-PAL-HP01-117` - Floor boards PB25
- `01-PAL-HP01-108` - Handrails H25
- `01-PAL-HP01-109` - Diagonal braces D25
- `01-PAL-HP01-111` - Wheels 200MM
- `01-PAL-HP01-115` - Adjustable support legs
- `01-PAL-HP01-127` - Quicky base unit
- `01-PAL-HP01-126` - Floor board PB20
- `01-PAL-HP01-124` - Handrail H20

## Pricing Tiers

### Fence (per day rate by SKU)
| Days | Tier |
|------|------|
| 1-30 | Highest rate |
| 31-60 | ~50% discount |
| 61-90 | ~75% discount |
| 91-120 | ~87% discount |
| 121+ | ~87% discount |

### Scaffold (time-based)
| Days | Rate Type |
|------|-----------|
| 1 | 24h rate |
| 2-6 | 24h + extra × (days-1) |
| 7+ | (weeks × week rate) + (extra days × 24h) |

## Testing

### Without Inriver PIM
1. Don't create `api_config.json`
2. Uses fallback pricing
3. Shows: "⚠ Verð er áætlað"

### With Inriver PIM
1. Create `api_config.json` with credentials
2. Uses live pricing
3. Shows: "✓ Verð er live úr verðgrunni"

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot find module" errors | Normal in monorepo - build will resolve |
| No pricing data | Check `configuration.ts` fallback values |
| API authentication fails | Verify credentials in `api_config.json` |
| Wrong pricing tier | Check `getPricingTier()` in `utils.ts` |
| Missing materials | Update `SCAFFOLD_MATERIALS` in config |

## Customization

```typescript
// Add new SKU pricing (configuration.ts)
export const FENCE_PRICING = {
  "NEW-SKU": {
    "1-30": 100,
    "30-60": 50,
    // ...
  }
};

// Change minimum rental days
export const MIN_RENTAL_DAYS = 7;

// Add new material
export const SCAFFOLD_MATERIALS = {
  "NEW-SKU": {
    "2.5": 1,  // Quantity for 2.5m height
    "3.5": 2,  // Quantity for 3.5m height
    // ...
  }
};
```

## Documentation

- **Full Guide**: `RENTAL_INTEGRATION.md`
- **Implementation**: `.ai/rental_calculators_guide.md`
- **Summary**: `.ai/IMPLEMENTATION_SUMMARY.md`
- **Session Log**: `.ai/session_log.md`
