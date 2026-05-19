# Vuur.Api

A modern .NET 10 REST API with PostgreSQL, MongoDB, and Redis integration, featuring JWT authentication and Swagger documentation.

## Quick Start

### Prerequisites
- .NET 10 SDK
- PostgreSQL 14+
- MongoDB
- Redis
- Docker & Docker Compose (optional)

### Setup

1. **Clone and configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

2. **Restore dependencies**
   ```bash
   dotnet restore
   ```

3. **Run with Docker** (recommended)
   ```bash
   docker-compose up -d
   dotnet run
   ```

4. **Or run locally**
   - Ensure PostgreSQL, MongoDB, and Redis are running
   - Update connection strings in `.env`
   - Run: `dotnet run`

The API will start at `https://localhost:7039` and `http://localhost:5039`

---

## Database

### PostgreSQL (Primary Data)
- **Purpose**: User accounts, orders, payments, wishlist
- **Driver**: Npgsql (raw SQL via Dapper)
- **Connection**: `POSTGRES_CONNECTION_STRING` in `.env`

### MongoDB (Document Storage)
- **Purpose**: Flexible document storage, caching
- **Connection**: `MONGO_CONNECTION_STRING` in `.env`

### Redis (Cache)
- **Purpose**: Session caching, real-time data
- **Connection**: `REDIS_CONNECTION_STRING` in `.env`

---

## Migrations

Migrations are **automatic** — DbUp runs them on startup.

### Adding a New Migration

1. **Create a SQL file** in `Migrations/` folder
   ```bash
   # Naming convention: V###__description.sql
   # Example: V008__add_products_table.sql
   ```

2. **Write your SQL**
   ```sql
   -- Migration description
   CREATE TABLE products (
       id SERIAL PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. **Run the app** — migrations execute automatically before the API starts
   ```bash
   dotnet run
   ```

**Key points:**
- DbUp tracks executed migrations in `_SchemaVersions` table
- Only new migrations run (safe to run multiple times)
- Each migration runs in its own transaction
- Naming must follow `V###__*.sql` pattern

---

## Swagger (API Documentation)

Swagger is enabled in **development mode only**.

### Access Swagger UI
- Navigate to: `http://localhost:5039/swagger/index.html`
- Or HTTPS: `https://localhost:7039/swagger/index.html`

### Authenticate in Swagger

1. Click the **Authorize** button (top right)
2. Paste your JWT token, no quotes
3. Click **Authorize** → now all requests include the token

### Generate an API Token
- Call `POST /auth/login` with credentials
- Response includes `accessToken` — copy and paste into Swagger Authorize

---

## Authentication

- **Type**: JWT Bearer tokens
- **Config**: `appsettings.json` (Jwt:Secret, Jwt:Issuer)
- **Token expiry**: 15 minutes (access) + 7 days (refresh)

### Making Authenticated Requests

```bash
# Get token
curl -X POST http://localhost:5039/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'

# Use token
curl http://localhost:5039/users/profile \
  -H "Authorization: Bearer <token>"
```

---

## Project Structure

```
Vuur.Api/
├── Data/                    # Database contexts & migrations runner
│   ├── PostgresContext.cs   # PostgreSQL connection
│   ├── MongoContext.cs      # MongoDB connection
│   ├── RedisContext.cs      # Redis connection
│   └── MigrationRunner.cs   # DbUp migration orchestrator
├── Features/                # Feature-based organization
│   ├── Auth/                # Authentication & tokens
│   ├── Users/               # User management
│   ├── Orders/              # Order processing
│   ├── Payments/            # Payment handling
│   ├── Addresses/           # Address management
│   └── Wishlist/            # User wishlists
├── Migrations/              # .sql migration files (V###__)
├── Program.cs               # Startup & DI configuration
├── appsettings.json         # Default configuration
├── .env.example             # Environment template
└── docker-compose.yml       # Local dev containers
```

---

## Development Tips

### Run the API
```bash
dotnet run                          # Development mode (Swagger enabled)
dotnet run --configuration Release  # Production mode
```

## Environment Variables

Create a `.env` file from `.env.example`:

**Note**: `.env` is in `.gitignore` — never commit secrets.

---

## Dependencies

- **Npgsql** (v10.0.0) — PostgreSQL driver
- **Dapper** (v2.1.35) — SQL query mapper
- **DbUp-PostgreSQL** (v5.0.37) — Migration runner
- **MongoDB.Driver** (v2.26.0) — MongoDB client
- **StackExchange.Redis** (v2.7.33) — Redis client
- **Swashbuckle.AspNetCore** (v6.6.2) — Swagger/OpenAPI
- **Microsoft.AspNetCore.Authentication.JwtBearer** (v8.0.0) — JWT auth
