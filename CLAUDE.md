# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vuur is a full-stack game store application (think Steam-like) written primarily in Dutch. It consists of four projects in the `project-vuur/` root:

| Project | Tech | Role |
|---------|------|------|
| `App/` | React 19 + TypeScript 6 + Vite 8 + Tailwind 4 | Primary frontend |
| `Vuur.Client/` | ASP.NET Blazor Server + Tailwind 4 | Alternate frontend |
| `Vuur.Api/` | ASP.NET Core Web API (.NET 10) + Swagger | Backend REST API |
| `Vuur.Shared/` | .NET 10 class library | Shared DTOs & entities |

## Commands

### React frontend (`App/`)
```bash
npm run dev       # Vite dev server (hot reload)
npm run build     # tsc -b && vite build (production)
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Blazor client (`Vuur.Client/`)
```bash
npm run build:css   # Compile Tailwind CSS once
npm run watch:css   # Watch Tailwind CSS changes
dotnet run          # Run Blazor server (auto-compiles Tailwind via MSBuild)
```

### API (`Vuur.Api/`)
```bash
dotnet run    # Start API; Swagger UI available at root
dotnet build  # Build only
```

### Docker
```bash
docker-compose up   # Run API in container on port 8008
```

There are currently no automated tests in the codebase.

## Architecture

### React App (`App/src/`)

**State management:** Cart state lives entirely in `App.tsx` (no Context, no external store). `addToCart`, `changeQty`, and `removeFromCart` are passed down as props.

**Key types** (`types/game.ts`):
- `CatalogGame` — full game listing (id, title, platform, genre, type `"key"|"disc"`, price, discountPercent, rating, etc.)
- `CartGame` — lightweight cart entry (id, title, platform, price, type)

**Data:** Game catalog is hardcoded in `data/catalogData.tsx` (16 games). No API calls yet.

**Routing:** Vite-based SPA. `Home.tsx` exists but is commented out; `Catalog.tsx` is the active page with platform/genre/type filters and price sorting.

**Styling:** Tailwind v4 via `@tailwindcss/vite` plugin (no `tailwind.config.js` needed). Dark theme colors: `#0D0D0D` background, `#F25B29` orange accent, `#1E1E1E` card borders.

### Blazor Client (`Vuur.Client/`)

Mirrors the React app's structure and data. `Models/GameModels.cs` contains the game catalog (same 16 games), `CartService` (static class), and `CartItem`. Pages: Home, Catalog, GameDetail, CheckoutKey, CheckoutDisc, Login, Register.

### API (`Vuur.Api/`)

Currently a scaffold — only a `WeatherForecastController` placeholder exists. No game endpoints implemented yet.

### Shared Library (`Vuur.Shared/`)

`Entities/` and `Dtos/` folders exist but are empty. Intended to hold shared models between API and clients.

## Current State & Intended Direction

- The React frontend and Blazor client both use **hardcoded data** — neither connects to the API.
- The API needs game CRUD endpoints before the frontends can be wired up.
- `Vuur.Shared` is prepared for DTOs that the API and clients will share.
- Blazor Login/Register and Checkout pages exist as UI shells but have no backend logic.
- The solution file (`Vuur.sln`) links all three .NET projects together.
