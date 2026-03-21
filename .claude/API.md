# LániCAD — Supabase API Reference

> Database schema, RLS policies, and API patterns for when Supabase is connected.

## Status: PLANNED (not yet connected)

Currently using localStorage for auth and data. Supabase will be connected later for:
- Persistent user auth (replacing localStorage)
- Project save/load across devices
- Product catalog management
- Row-Level Security for multi-user access

## Environment Variables

```env
# .env (gitignored)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

The anon key is **safe to expose** — Supabase designed it to be public. RLS policies protect data.

## Supabase Client — `src/lib/supabase.ts`

```ts
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Conditional: works without config (returns null client)
export const supabase = url && key ? createClient(url, key) : null
```

## Database Schema

### `profiles`
Extends Supabase `auth.users` with app-specific fields.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, references auth.users(id) |
| email | TEXT | NOT NULL |
| name | TEXT | — |
| role | TEXT | CHECK ('admin', 'user'), DEFAULT 'user' |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### `projects`
Saved calculator/CAD projects per user.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| user_id | UUID | FK → profiles(id), ON DELETE CASCADE |
| name | TEXT | NOT NULL |
| type | TEXT | CHECK ('fence','scaffolding','formwork','rolling','ceiling') |
| data | JSONB | NOT NULL, DEFAULT '{}' |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### `templates`
Reusable equipment configurations (shared across users).

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| type | TEXT | NOT NULL |
| name | TEXT | NOT NULL |
| config | JSONB | NOT NULL, DEFAULT '{}' |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### `products`
Dynamic product catalog (optional — products are currently hardcoded in `src/data/`).

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| calculator_type | TEXT | NOT NULL |
| rental_no | TEXT | — |
| sale_no | TEXT | — |
| description | TEXT | NOT NULL |
| rates | JSONB | — |
| sale_price | NUMERIC | — |
| active | BOOLEAN | DEFAULT true |

## RLS Policies (Planned)

```sql
-- profiles: users can read own profile, admins can read all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- projects: users manage own projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all projects" ON projects FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- templates: everyone reads, admins write
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads templates" ON templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage templates" ON templates FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- products: everyone reads, admins write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads products" ON products FOR SELECT USING (true);
CREATE POLICY "Admins manage products" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

## API Usage Patterns

### Fetch projects
```ts
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .order('updated_at', { ascending: false })
```

### Save project
```ts
const { data, error } = await supabase
  .from('projects')
  .upsert({
    id: projectId || undefined,
    user_id: user.id,
    name: projectName,
    type: calculatorType,
    data: projectData,
    updated_at: new Date().toISOString(),
  })
  .select()
  .single()
```

### Auth flow (future)
```ts
// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})

// Get session
const { data: { session } } = await supabase.auth.getSession()

// Sign out
await supabase.auth.signOut()
```
