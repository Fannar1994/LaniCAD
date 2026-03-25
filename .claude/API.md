# LániCAD — Turso (libSQL) + Express API Reference

> Database schema and REST API patterns for LániCAD backend.

## Architecture

```
Frontend (Vite SPA)  →  Express API (server/)  →  Turso (libSQL)
```

- Frontend uses `fetch()` via `src/lib/db.ts`
- Express server connects to Turso via `@libsql/client`
- Auth: JWT tokens stored in localStorage, verified server-side
- Local dev uses `file:local.db` (SQLite file), production uses Turso cloud

## Environment Variables

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:3001/api
```

### Server (`server/.env`)
```env
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
JWT_SECRET=change-this-to-a-random-secret
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

For local development without Turso cloud:
```env
TURSO_DATABASE_URL=file:local.db
# No auth token needed for local file
```

## Database Schema — `server/schema.sql`

> All IDs are TEXT generated via `lower(hex(randomblob(16)))`. Timestamps use `datetime('now')`. JSON stored as TEXT.

### `users`

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PK, DEFAULT lower(hex(randomblob(16))) |
| email | TEXT | NOT NULL, UNIQUE |
| password_hash | TEXT | NOT NULL (bcrypt) |
| name | TEXT | DEFAULT '' |
| role | TEXT | CHECK ('admin', 'user'), DEFAULT 'user' |
| created_at | TEXT | DEFAULT datetime('now') |

### `projects`

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PK, DEFAULT lower(hex(randomblob(16))) |
| user_id | TEXT | FK → users(id), ON DELETE CASCADE |
| name | TEXT | NOT NULL |
| type | TEXT | CHECK ('fence','scaffolding','formwork','rolling','ceiling') |
| client | TEXT | JSON, DEFAULT '{}' |
| data | TEXT | JSON, DEFAULT '{}' |
| line_items | TEXT | JSON, DEFAULT '[]' |
| created_at | TEXT | DEFAULT datetime('now') |
| updated_at | TEXT | DEFAULT datetime('now') |

### `templates`

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PK, DEFAULT lower(hex(randomblob(16))) |
| user_id | TEXT | FK → users(id), ON DELETE SET NULL |
| type | TEXT | CHECK (5 calculator types) |
| name | TEXT | NOT NULL |
| description | TEXT | DEFAULT '' |
| config | TEXT | JSON, DEFAULT '{}' |
| is_public | INTEGER | DEFAULT 0 |
| created_at | TEXT | DEFAULT datetime('now') |

### `products`

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PK, DEFAULT lower(hex(randomblob(16))) |
| calculator_type | TEXT | CHECK (5 calculator types) |
| rental_no | TEXT | NOT NULL, UNIQUE |
| sale_no | TEXT | DEFAULT '' |
| description | TEXT | NOT NULL |
| category | TEXT | DEFAULT '' |
| rates | TEXT | JSON, DEFAULT '{}' |
| sale_price | REAL | DEFAULT 0 |
| weight | REAL | DEFAULT 0 |
| active | INTEGER | DEFAULT 1 |
| created_at | TEXT | DEFAULT datetime('now') |
| updated_at | TEXT | DEFAULT datetime('now') |

### `audit_log`

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PK, DEFAULT lower(hex(randomblob(16))) |
| user_id | TEXT | FK → users(id), ON DELETE SET NULL |
| user_email | TEXT | |
| action | TEXT | NOT NULL |
| entity_type | TEXT | |
| entity_id | TEXT | |
| details | TEXT | |
| ip_address | TEXT | |
| created_at | TEXT | DEFAULT datetime('now') |

### `request_queue`

| Column | Type | Constraints |
|---|---|---|
| id | TEXT | PK, DEFAULT lower(hex(randomblob(16))) |
| method | TEXT | CHECK ('GET','POST','PUT','DELETE') |
| path | TEXT | NOT NULL |
| headers | TEXT | JSON, DEFAULT '{}' |
| body | TEXT | JSON |
| status | TEXT | CHECK ('pending','processing','completed','failed'), DEFAULT 'pending' |
| response | TEXT | |
| error | TEXT | |
| created_at | TEXT | DEFAULT datetime('now') |
| processed_at | TEXT | |

## REST API Endpoints

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | No | Login, returns JWT + user |
| GET | `/api/auth/me` | JWT | Get current user profile |
| PUT | `/api/auth/password` | JWT | Change password |

### Users (Admin)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | List all users |
| POST | `/api/users` | Admin | Create user |
| PUT | `/api/users/:id` | Admin | Update user |
| DELETE | `/api/users/:id` | Admin | Delete user |

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
| PUT | `/api/templates/:id` | JWT | Update template |
| DELETE | `/api/templates/:id` | JWT | Delete template |

### Products
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | No | List active products |
| POST | `/api/products` | JWT | Upsert product (by rental_no) |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |

### Audit Log
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/audit-log` | Admin | List audit entries (paginated) |

### Queue
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/queue` | No | Queue a request for offline processing |
| GET | `/api/queue` | Admin | List queue entries |
| POST | `/api/queue/process` | Admin | Manually process pending queue items |

### Chat (AI)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/chat` | JWT | Send message to AI assistant |

### Health
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | DB connectivity + queue status |

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

1. Install Turso CLI: `curl -sSfL https://get.tur.so/install.sh | bash`
2. Create database: `turso db create lanicad`
3. Get URL: `turso db show lanicad --url`
4. Create token: `turso db tokens create lanicad`
5. Copy `server/.env.example` → `server/.env`, fill in `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
6. Run schema: connect to Turso shell (`turso db shell lanicad`) and paste `server/schema.sql`
7. `cd server && npm install && npm run dev`
8. Copy `.env.example` → `.env` (frontend)
9. `npm run dev` (frontend)

### Local Development (no Turso account needed)

Set `TURSO_DATABASE_URL=file:local.db` in `server/.env`. The `@libsql/client` will create a local SQLite file. Schema is auto-created on first run via `server/schema.sql`.

## Query Patterns

```js
// libSQL uses ? placeholders (not $1, $2 like PostgreSQL)
const result = await db.execute({
  sql: 'SELECT * FROM projects WHERE user_id = ? AND type = ?',
  args: [userId, type]
})

// Rows are in result.rows, affected count in result.rowsAffected
const rows = result.rows

// JSON stored as TEXT — serialize/deserialize manually
await db.execute({
  sql: 'INSERT INTO projects (name, client, data) VALUES (?, ?, ?)',
  args: [name, JSON.stringify(client), JSON.stringify(data)]
})
```
