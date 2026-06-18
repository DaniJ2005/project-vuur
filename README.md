# Project Vuur

Een full-stack webshop voor digitale game-keys, gebouwd als schoolproject voor de
Hogeschool Rotterdam. De applicatie bestaat uit een React-frontend en een .NET 10
REST API, die samen draaien via Docker Compose.

## Wat het doet

Gebruikers kunnen door een catalogus van games bladeren, producten in een winkelmand
leggen, afrekenen en na betaling hun game-keys ontvangen. Daarnaast zijn er
verlanglijstjes, reviews, bestelgeschiedenis en een admin-gedeelte voor beheer.

**Belangrijkste features:**
- Productcatalogus met varianten en cursor-paginering
- Winkelmand, bestellingen, betalingen en bonnen
- Genereren en uitleveren van game-keys
- Authenticatie met JWT (access- en refresh-tokens)
- Wishlist en reviews
- Admin-beheer van gebruikers en producten

## Tech stack

| Onderdeel  | Technologie |
|------------|-------------|
| Frontend   | React 19, TypeScript, Vite, Tailwind CSS, React Query, React Router |
| Backend    | .NET 10, Dapper, DbUp (migraties) |
| Databases  | PostgreSQL (kerngegevens), MongoDB (documenten), Redis (cache) |
| Infra      | Docker & Docker Compose, GitHub Actions CI/CD (Docker Hub) |

## Repo-structuur

```
project-vuur/
├── App/          # React + TypeScript frontend (Vite)
├── Vuur.Api/     # .NET 10 REST API (feature-based)
├── Vuur.Tests/   # Unit tests
└── docker-compose.yml
```

## Snel starten

```bash
# 1. Configureer de omgeving
cp .env.example .env   # vul je database-credentials in

# 2. Start de databases (en optioneel de services) via Docker
docker-compose up -d

# 3. Frontend
cd App && npm install && npm run dev

# 4. Backend
cd Vuur.Api && dotnet run
```

De API draait op `http://localhost:5039` (Swagger op `/swagger/index.html` in
development). Zie [App/README.md](App/README.md) en
[Vuur.Api/README.md](Vuur.Api/README.md) voor meer details per onderdeel.
```

