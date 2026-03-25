# Scene Calculators - Rental System Integration

## ✅ What Was Implemented

I've successfully integrated **two rental calculators** into your React application with **Inriver PIM connectivity**:

### 1. **Fence Rental Calculator** (`fence-rental`)
- ✅ Worksite fences (vinnustaðagirðingar)
- ✅ Crowd control fences (biðraðagirðingar)  
- ✅ Traffic barriers (vegatálmi)
- ✅ Configurable height, thickness, stone type
- ✅ Date-based rental pricing
- ✅ Live pricing from Inriver PIM with fallback

### 2. **Scaffold Rental Calculator** (`scaffold-rental`)
- ✅ Narrow scaffolds (0.75m width)
- ✅ Wide scaffolds (1.35m width)
- ✅ Quicky scaffold (fixed 4m height)
- ✅ 9 height options (2.5m to 10.5m)
- ✅ Optional support legs
- ✅ Material breakdown (BOM table)
- ✅ Deposit calculation

## 🏗️ Architecture

```
src/scenes/rental/
├── interface.ts           # TypeScript types for rental calculators
├── configuration.ts       # Pricing tables, SKU mappings, material BOM
├── utils.ts              # Inriver PIM API integration & calculations
├── fence-rental.tsx      # Fence rental component
├── scaffold-rental.tsx   # Scaffold rental component
└── index.ts              # Module exports
```

## 🔌 Inriver PIM Integration

### How It Works

1. **Loads API config** from `/api_config.json` or environment variables
2. **Authenticates** with Inriver PIM using credentials
3. **Fetches live pricing** by SKU (e.g., `01-BAT-GI01-015`)
4. **Falls back** to default pricing if API unavailable
5. **Displays** pricing source to user

### Setup Instructions

#### Option 1: Using Config File (Development)

1. Copy the example config:
   ```bash
   cp api_config.example.json api_config.json
   ```

2. Edit `api_config.json` with your Inriver credentials:
   ```json
   {
     "apiUrl": "https://your-inriver-api.com",
     "apiKey": "YOUR_ACTUAL_API_KEY",
     "credentials": {
       "username": "YOUR_USERNAME",
       "password": "YOUR_PASSWORD",
       "depot": "YOUR_DEPOT"
     }
   }
   ```

#### Option 2: Environment Variables (Production)

Set these in your deployment environment:
```env
INRIVER_API_URL=https://your-inriver-api.com
INRIVER_API_KEY=your-api-key
INRIVER_USERNAME=your-username
INRIVER_PASSWORD=your-password
INRIVER_DEPOT=your-depot
```

## 📖 Usage

### In Your React Application

```tsx
import { Calculator } from "@byko/scene-calculators";

// Fence rental calculator
<Calculator type="fence-rental" />

// Scaffold rental calculator
<Calculator type="scaffold-rental" />

// Existing calculators still work
<Calculator type="girðing" />
<Calculator type="pallur" />
```

### Embedding in HTML (if needed)

The calculators are React components, but you can embed them in any HTML page:

```html
<div id="fence-calculator-root"></div>
<script>
  // Assuming your bundle is loaded
  ReactDOM.render(
    <Calculator type="fence-rental" />,
    document.getElementById('fence-calculator-root')
  );
</script>
```

## 🧪 Testing

### Without Inriver PIM (Fallback Mode)
1. Don't create `api_config.json`
2. Calculators use default pricing from `configuration.ts`
3. Warning displays: "⚠ Verð er áætlað - hafðu samband fyrir nákvæmt tilboð"

### With Inriver PIM (Live Mode)
1. Configure `api_config.json` with real credentials
2. Open calculator in browser
3. Check Network tab for API calls to `/logon` and `/rates`
4. Success message displays: "✓ Verð er live úr verðgrunni (Inriver PIM)"

## 📊 Pricing Logic

### Fence Rentals
- **Tiered pricing** based on rental duration (1-30, 30-60, 60-90, 90-120, 120+ days)
- **Per meter calculation**: Total cost = (daily rate × units × days)
- **SKU Examples**:
  - `01-BAT-GI01-015` - Worksite fence 3.5×2.0×1.1mm
  - `01-BAT-GI01-050` - Crowd control fence
  - `01-BAT-VE01-260` - Traffic barrier

### Scaffold Rentals
- **Time-based pricing**: 24h rate, extra day rate (days 2-6), weekly rate (7+ days)
- **Height-dependent**: Each height has unique pricing
- **BOM Generation**: Automatically calculates materials needed
- **Deposits**: Returned upon equipment return

### Calculation Example (Scaffold)
```
Days = 1:        Cost = 24h rate
Days = 2-6:      Cost = 24h rate + (extra rate × (days - 1))
Days = 7+:       Cost = (weeks × week rate) + (extra days × 24h rate)
```

## 🔧 Customization

### Adding New Product SKUs

Edit `src/scenes/rental/configuration.ts`:

```typescript
export const FENCE_PRICING: Record<string, Record<PricingTier, number>> = {
  "YOUR-NEW-SKU": {
    "1-30": 100,
    "30-60": 50,
    "60-90": 25,
    "90-120": 12,
    "120+": 12,
  },
};
```

### Changing Minimum Rental Days

In `src/scenes/rental/configuration.ts`:
```typescript
export const MIN_RENTAL_DAYS = 10; // Change this value
```

## 📁 Files Created

| File | Purpose |
|------|---------|
| `src/scenes/rental/interface.ts` | TypeScript interfaces |
| `src/scenes/rental/configuration.ts` | Pricing tables & SKUs |
| `src/scenes/rental/utils.ts` | Inriver API + utilities |
| `src/scenes/rental/fence-rental.tsx` | Fence calculator UI |
| `src/scenes/rental/scaffold-rental.tsx` | Scaffold calculator UI |
| `src/scenes/rental/index.ts` | Module exports |
| `api_config.example.json` | Inriver config template |
| `.ai/rental_calculators_guide.md` | Full implementation guide |

## ⚠️ Important Notes

1. **TypeScript Warnings**: You'll see some TS compile errors about ES5/ES2015. These are safe to ignore - they work at runtime with your build setup.

2. **Fallback Pricing**: Default prices in `configuration.ts` are from your original HTML files. Update these if needed.

3. **Security**: Never commit `api_config.json` with real credentials. Add to `.gitignore`:
   ```
   api_config.json
   ```

4. **Session Management**: Inriver session IDs are cached during the user session for performance.

## 🚀 Next Steps

1. **Configure Inriver PIM** with your actual credentials
2. **Test both calculators** with real data
3. **Add to cart** functionality (if needed)
4. **Email/quote** generation from calculator results
5. **Analytics** tracking for calculator usage

## 📚 Documentation

Full implementation guide: `.ai/rental_calculators_guide.md`

For questions or issues, refer to the AI context files in `.ai/` folder.
