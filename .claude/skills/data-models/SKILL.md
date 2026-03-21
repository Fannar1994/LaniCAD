---
name: data-models
description: TypeScript interfaces, product data structures, Supabase schema, and data flow patterns for LániCAD.
argument-hint: What data? (types | products | supabase | schema)
allowed-tools:
  - read_file
  - replace_string_in_file
  - create_file
  - grep_search
---

# Data Models Skill

## TypeScript Types — `src/types/index.ts`

### Calculator Type Enum
```ts
type CalculatorType = 'fence' | 'scaffolding' | 'formwork' | 'rolling' | 'ceiling'
```

### Core Product Types
```ts
interface Product {
  rentalNo: string
  saleNo?: string
  description: string
  unit?: string
}

interface FenceProduct extends Product {
  monthlyRates: MonthlyRates  // 12 tiers
  salePrice?: number
}

interface ScaffoldItem extends Product {
  itemNo: string
  dailyRate: number
  weight?: number
  salePrice?: number
}

interface FormworkItem extends Product {
  system: 'rasto-takko' | 'manto' | 'alufort' | 'id15'
  dayRate: number
  weekRate: number
}

interface RollingScaffoldPricing {
  height: string
  workingHeight: string
  price24h: number
  extraDay: number
  weekPrice: number
}

interface CeilingProp extends Product {
  heightRange: string
  kN: number
  class: 'A' | 'B' | 'C' | 'D' | 'E'
  dayRate: number
  weekRate: number
  salePrice: number
}
```

### Shared Types
```ts
interface LineItem {
  id: string
  rentalNo: string
  description: string
  qty: number
  rate: number
  total: number
  days?: number
}

interface ClientInfo {
  name: string
  kennitala: string
  address: string
  phone: string
  email: string
  project: string
  contact: string
}

interface Project {
  id: string
  user_id: string
  name: string
  type: CalculatorType
  data: Record<string, unknown>
  created_at: string
  updated_at: string
}

interface UserProfile {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  created_at: string
}
```

## Product Data Files

| File | Type | Count | Key Fields |
|---|---|---|---|
| `src/data/fence.ts` | FenceProduct[] | 14 | rentalNo, monthlyRates (12 tiers), salePrice (mobile fences) |
| `src/data/scaffolding.ts` | ScaffoldItem[] | 25 | itemNo, dailyRate, weight, salePrice |
| `src/data/rolling-scaffold.ts` | RollingScaffoldPricing[] | 9×3 | height, price24h, extraDay, weekPrice (mobile scaffolding) |
| `src/data/ceiling-props.ts` | CeilingProp[] + Beam[] | 8+7+5 | dayRate, weekRate, salePrice, class |
| `src/data/formwork.ts` | FormworkItem[] | ~170 | system, dayRate, weekRate |

## MonthlyRates Structure (Mobile Fence)

```ts
interface MonthlyRates {
  month1: number   // Days 1-30
  month2: number   // Days 31-60
  month3: number   // Days 61-90
  month4: number   // Days 91-120
  month5: number   // Days 121-150
  month6: number   // Days 151-180
  month7: number   // Days 181-210
  month8: number   // Days 211-240
  month9: number   // Days 241-270
  month10: number  // Days 271-300
  month11: number  // Days 301-330
  month12: number  // Days 331-360
}
```

## Supabase Schema (Planned)

```sql
-- profiles: extends Supabase auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- projects: saved calculator/CAD projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('fence','scaffolding','formwork','rolling','ceiling')),
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- templates: reusable equipment configurations
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- products: dynamic product catalog (optional — can keep in code)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculator_type TEXT NOT NULL,
  rental_no TEXT,
  sale_no TEXT,
  description TEXT NOT NULL,
  rates JSONB,
  sale_price NUMERIC,
  active BOOLEAN DEFAULT true
);
```

## Data Flow

```
User Input (form)
  → State (React useState)
    → Calculation (src/lib/calculations/)
      → Display (formatted with formatKr)
        → Export (PDF/Excel)
        → Save (localStorage now, Supabase later)
```

## Auth Data Flow

```
Login form → AuthProvider.login()
  → localStorage check (lanicad_users)
    → Set user state + session key
      → ProtectedRoute checks user
        → Render page or redirect to /login
```
