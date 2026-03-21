# LániCAD — PostgreSQL + Express API Reference

> Database schema and REST API patterns for LániCAD backend.

## Architecture

```
Frontend (Vite SPA)  →  Express API (server/)  →  PostgreSQL
```

- Frontend uses `fetch()` via `src/lib/db.ts`
- Express server connects to PostgreSQL via `pg` pool
- Auth: JWT tokens stored in localStorage, verified server-side

## Environment Variables

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:3001/api
```

### Server (`server/.env`)
```env
DATABASE_URL=postgresql://lanicad:yourpassword@localhost:5432/lanicad
JWT_SECRET=change-this-to-a-random-secret
PORT=3001
```

## Database Schema — `server/schema.sql`

### `users`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| email | TEXT | NOT NULL, UNIQUE |
| password_hash | TEXT | NOT NULL (bcrypt) |
| name | TEXT | DEFAULT '' |
| role | TEXT | CHECK ('admin', 'user'), DEFAULT 'user' |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### `projects`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| user_id | UUID | FK → users(id), ON DELETE CASCADE |
| name | TEXT | NOT NULL |
| type | TEXT | CHECK ('fence','scaffolding','formwork','rolling','ceiling') |
| client | JSONB | DEFAULT '{}' |
| data | JSONB | DEFAULT '{}' |
| line_items | JSONB | DEFAULT '[]' |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() (auto-trigger) |

### `templates`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| user_id | UUID | FK → users(id), ON DELETE SET NULL |
| type | TEXT | CHECK (5 calculator types) |
| name | TEXT | NOT NULL |
| description | TEXT | DEFAULT '' |
| config | JSONB | DEFAULT '{}' |
| is_public | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### `products`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| calculator_type | TEXT | CHECK (5 calculator types) |
| rental_no | TEXT | NOT NULL, UNIQUE |
| sale_no | TEXT | DEFAULT '' |
| description | TEXT | NOT NULL |
| category | TEXT | DEFAULT '' |
| rates | JSONB | DEFAULT '{}' |
| sale_price | NUMERIC(12,2) | DEFAULT 0 |
| weight | NUMERIC(8,2) | DEFAULT 0 |
| active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() (auto-trigger) |

## REST API Endpoints

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | No | Login, returns JWT + user |

### Projects
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/projects` | JWT | List user's projects |
| GET | `/api/projects/:id` | JWT | Get single project |
| POST | `/api/projects` | JWT | Create project |
| PUT | `/api/projects/:id` | JWT | Update project |
| DELETE | `/api/projects/:id` | JWT | Delete project |

### Templates
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/templates` | JWT | List templates (own + public) |
| POST | `/api/templates` | JWT | Create template |
| DELETE | `/api/templates/:id` | JWT | Delete template |

### Products
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | No | List active products |
| POST | `/api/products` | JWT | Upsert product (by rental_no) |

### Health
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | DB connectivity check |

## Frontend Data Layer — `src/lib/db.ts`

Uses `fetch()` with JWT Bearer tokens:

```ts
// Fetch projects
const projects = await fetchProjects()

// Create project
const project = await createProject({ name, type, client, data, line_items })

// Delete project
await deleteProject(id)
```

## Setup

1. Install PostgreSQL
2. Create database: `createdb lanicad`
3. Run schema: `psql -d lanicad -f server/schema.sql`
4. Copy `server/.env.example` → `server/.env`, fill in credentials
5. `cd server && npm install && npm run dev`
6. Copy `.env.example` → `.env` (frontend)
7. `npm run dev` (frontend)
