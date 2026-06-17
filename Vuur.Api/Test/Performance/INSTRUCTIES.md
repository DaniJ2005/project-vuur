# VUUR — Performance test instructies


## Voorbereidingen

De database werd volledig opnieuw opgebouwd met:
- docker compose down -v
- docker compose up -d postgres mongo redis

Vervolgens moet je de basis migraties uitvoeren:
- cd vuur.api
- dotnet run

Dan moet je de test bestanden naar docker kopieren
- docker cp "Vuur.Api\Test\Performance" vuur_postgres:/performance

En controleer met:
- docker exec vuur_postgres ls /performance


Vervolgens kan je test bestanden uitvoeren met:
- docker exec -it vuur_postgres psql -U vuur -d vuur -f /performance/**bestandsnaam**


---

## Stap 1 — Tabellen vullen

Draai `00_seed_10k.sql`

---

## Stap 2 — Tests uitvoeren

Voer de scripts 01 t/m 05 **in volgorde** uit.

### Hoe lees je de output?

```
Seq Scan on orders  (cost=... rows=10000 ...)
                    (actual time=0.01..8.4 rows=10000 loops=1)
  Filter: (user_id = '...')
  Rows Removed by Filter: 9998
Execution Time: 8.441 ms    ← dit noteer je
```

Sleutelwoorden:
- **`Seq Scan`** → leest ALLE rijen, langzaam bij grote tabellen
- **`Index Scan`** → gebruikt de index, leest alleen relevante rijen
- **`Bitmap Heap Scan`** → combinatie van index + heap, tussenweg
- **`Sort`-node aanwezig** → PostgreSQL moet nog sorteren (geen DESC-index)
- **`Sort`-node verdwenen** → index in goede richting, sortering gratis

---

## Stap 3 — Benchmark (5 min)

Draai `06_benchmark_nfr.sql` met `\timing on` in psql.

**Daarna — API timing via browser:**
1. `dotnet run --project Vuur.API`
2. Open Chrome → `http://localhost:[port]/api/products`
3. F12 → Network → ververs pagina (F5)
4. Klik op het `products`-request → "Time" rechtsonder
5. Screenshot → dit is Bijlage F

Doe dit twee keer: eerst met lege Redis (cache miss), dan direct daarna
(cache hit). Het verschil bewijst de cache-first strategie.

