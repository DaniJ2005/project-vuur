# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vuur is a full-stack game store application (think Steam-like platform) written primarily in Dutch. The codebase consists of three active projects:

| Project | Tech | Role |
|---------|------|------|
| `App/` | React 19 + TypeScript + Vite 8 + Tailwind 4 | Primary frontend (SPA) |
| `Vuur.Api/` | ASP.NET Core Web API (.NET 10) | Backend REST API |
| `Vuur.Shared/` | .NET 10 class library | Shared DTOs & entities (currently empty) |

> `Vuur.Client/` (Blazor) exists in the solution but is not actively developed.

---

## Commands

### React frontend (`App/`)
```bash
npm run dev       # Vite dev server with hot reload (proxies /api to localhost:5245)
npm run build     # tsc -b && vite build (production)
npm run lint      # ESLint
npm run preview   # Preview production build
```

### API (`Vuur.Api/`)
```bash
dotnet run    # Start API on port 5245; Swagger UI at /swagger (dev only)
dotnet build  # Build only
```

### Docker
```bash
docker-compose up -d                       # Start all services (production config)
docker-compose -f docker-compose.override.yml up -d  # Dev overrides (exposes DB ports)
```

Development API: `http://localhost:5245`
Dev frontend: `http://localhost:5173`
Docker frontend: `http://localhost:80`
Docker API: `http://localhost:8080`
File browser UI: `http://localhost:8081`

There are currently no automated tests in the codebase.

---

## Architecture

### Multi-Database Strategy

| Database | Use Case | Connection |
|----------|----------|------------|
| PostgreSQL 16 | Relational data (users, orders, addresses, roles) | Dapper + raw SQL (no ORM) |
| MongoDB 7 | Product catalog + TTL cache | MongoDB.Driver |
| Redis 7 | Refresh token storage (session management) | StackExchange.Redis |

### Backend (`Vuur.Api/`)

**Tech stack:**
- .NET 10, ASP.NET Core Web API
- Dapper 2.1.35 (raw SQL, no EF Core)
- DbUp for versioned SQL migrations (auto-runs on startup)
- DotNetEnv — loads `.env` from parent directory
- JWT Bearer auth (HS256, access token 15 min, refresh token 7 days)
- Swagger (dev only)

**Features implemented:**
- Auth (register, login, refresh, logout, me)
- Addresses CRUD (owner-only access)
- Wishlist (per-user, unique product constraint)
- Orders (user sees own; admin sees all)
- Payments (admin gets all; user gets own via order)

**Directory layout:**
```
Vuur.Api/
├── Program.cs               # DI registration, middleware, JWT config
├── config/
│   └── EnvironmentVariables.cs
├── Data/
│   ├── PostgresContext.cs   # Dapper connection factory + migration runner
│   ├── MongoContext.cs      # MongoDB client + GetCollection<T>()
│   └── RedisContext.cs      # Redis connection + refresh token helpers
├── Migrations/              # DbUp SQL scripts (V001–V006)
├── mongo-init.js            # MongoDB collection + index init script
└── Features/
    ├── Auth/                # AuthController, AuthService, TokenService, AuthModels
    └── Users/               # User, Role, Address, WishlistItem entities + repos
        Orders/              # Order entity + repo + controller + service
        Payments/            # Payment entity + repo + controller + service
```

**Repository pattern:** Each feature has separate read (`*ReadRepository`) and write (`*Repository`) classes plus a `*Service` for business logic.

### Frontend (`App/src/`)

**Tech stack:**
- React 19.2.6, TypeScript (strict mode)
- React Router 7 (SPA routing)
- React Query (TanStack) 5 — server state
- Axios 1.x — HTTP client with interceptors
- Tailwind CSS 4 via `@tailwindcss/vite` (no `tailwind.config.js`)

**State management:**
- Cart, Wishlist, and Address state live in React Contexts (`src/context/`)
- Auth state in `AuthProvider` (reads current user via `GET /api/auth/me`)
- Server data (orders, etc.) via React Query

**Entry point providers** (`src/main.tsx`):
```
BrowserRouter → QueryClientProvider → AuthProvider → AddressProvider → WishlistProvider → CartProvider
```

**Key routing** (`App.tsx`):

| Route | Auth required | Component |
|-------|--------------|-----------|
| `/` | No | Home |
| `/catalog` | No | Catalog |
| `/game/:id` | No | GameDetail |
| `/login` | No | Login |
| `/register` | No | Register |
| `/checkout` | No | Checkout |
| `/orders` | Yes | Orders |
| `/wishlist` | Yes | Wishlist |
| `/settings` | Yes | Settings |

**Auth flow** (`src/features/auth/`):
- `auth.api.ts` — raw API calls (register, login, logout, me)
- `auth.hooks.ts` — React Query mutations and queries
- `AuthProvider.tsx` — context with `{ user, isLoading, isAuthenticated }`
- `ProtectedRoute.tsx` — redirects to `/login`, saves original location

**API client** (`src/lib/apiClient.ts`):
- Two axios instances: `api` (with interceptors) and `refreshClient` (no interceptors)
- Request interceptor: attaches `Authorization: Bearer {token}`
- Response interceptor: auto-refreshes on 401 (deduplicates concurrent refresh calls)

**Token storage** (`src/lib/tokenStorage.ts`):
- Both tokens stored in `localStorage` (`vuur.access`, `vuur.refresh`)
- Note: production should use httpOnly cookies for the access token

**Styling:** Dark theme — `#0D0D0D` background, `#F25B29` orange accent, `#1E1E1E` card borders.

**Static data:** Game catalog is hardcoded in `src/data/catalogData.ts`. The frontend does **not** call a products API yet (MongoDB products collection exists but no products endpoint).

---

## Database Schema (PostgreSQL)

```sql
roles        (id, role_name, created_at, updated_at)          -- seeded: customer, admin
users        (id, first_name, last_name, email, password_hash, role_id, ...)
addresses    (id, user_id→users CASCADE, street, city, country_code, ...)
orders       (id, user_id→users, products_id TEXT, ...)        -- products_id = MongoDB ObjectId
payments     (id, order_id→orders CASCADE, products_id TEXT, ...)
wishlist     (id, user_id→users CASCADE, products_id TEXT, ...) -- UNIQUE(user_id, products_id)
```

Migrations run automatically on API startup via DbUp (`Vuur.Api/Migrations/V001–V006`).

## MongoDB Collections

- `products` — game catalog, text index on name/description, index on category & price
- `productCache` — TTL index on `expiresAt` (auto-expiring cache layer)

## Redis Keys

- `refresh_token:{token}` → userId (7-day TTL)

---

## API Endpoints

### Auth
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/auth/register` | No | Returns token pair |
| POST | `/api/auth/login` | No | Returns token pair |
| POST | `/api/auth/refresh` | No | Rotates refresh token |
| POST | `/api/auth/logout` | No | Revokes refresh token |
| GET | `/api/auth/me` | JWT | Returns current user |

### Addresses
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/addresses` | JWT | Current user's addresses |
| POST | `/api/addresses` | JWT | Create address |
| PUT | `/api/addresses/{id}` | JWT | Owner only |
| DELETE | `/api/addresses/{id}` | JWT | Owner only |

### Wishlist
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/wishlist` | JWT | Current user's wishlist |
| POST | `/api/wishlist` | JWT | Add product |
| DELETE | `/api/wishlist/{productsId}` | JWT | Remove product |

### Orders
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/orders` | JWT | Own orders; admin sees all |
| GET | `/api/orders/{id}` | JWT | Owner or admin |
| POST | `/api/orders` | JWT | Create order |

### Payments
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/payments` | JWT | Admin only |
| GET | `/api/payments/order/{orderId}` | JWT | Owner or admin |
| POST | `/api/payments` | JWT | Create payment |

---

## Environment Variables

Set in root `.env` (loaded by DotNetEnv on API startup):

```env
# PostgreSQL
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=vuur
POSTGRES_USER=vuur
POSTGRES_PASSWORD=...

# MongoDB
MONGO_ROOT_USER=vuur
MONGO_ROOT_PASSWORD=...

# Redis
REDIS_PASSWORD=...

# JWT
JWT_SECRET=...
JWT_ISSUER=vuur-api
JWT_ACCESS_TOKEN_MINUTES=15
JWT_REFRESH_TOKEN_DAYS=7

# CORS (optional, only needed when frontend runs on a different origin)
CORS_FRONTEND_ORIGIN=http://localhost:5173
```

Frontend uses `App/.env.local`:
```env
VITE_API_URL=http://localhost:5245
```

---

## Docker Services

| Service | Image | Internal port | Dev host port |
|---------|-------|--------------|---------------|
| frontend | nginx:1.27-alpine (served via Nginx) | 80 | 80 |
| api | dotnet/aspnet:10.0-alpine | 8080 | 8080 |
| postgres | postgres:16-alpine | 5432 | 5433 |
| mongo | mongo:7 | 27017 | 27017 |
| redis | redis:7-alpine | 6379 | 6379 |
| filebrowser | filebrowser | 80 | 8081 |

Nginx in the frontend container proxies `/api/*` → `http://api:8080/api/*`.

---

## Current State & Known TODOs

- **Products API missing:** MongoDB `products` collection has indexes but no REST endpoint. Frontend still uses hardcoded `catalogData.ts`.
- **Contexts not wired to API:** `AddressContext` and `WishlistContext` use seed/mock data instead of calling their respective API endpoints.
- **Checkout not persisted:** The checkout flow generates fake product keys in-memory; it does not create `orders` or `payments` records via the API.
- **Vuur.Shared unused:** `Entities/` and `Dtos/` folders exist but are empty.
- **No tests:** No unit or integration tests exist anywhere in the codebase.
- **Token security:** Access token is in localStorage; should be memory-only (with httpOnly cookie for refresh token) in production.
