-- 2 — Admin analytics: top-5 best verkochte producten
-- Aansluitend op: "Admin-Dashboard" + aggregaties in het rapport
--                 (GROUP BY, SUM, COUNT(DISTINCT ...) )
-- Rubric: geavanceerde SQL + prestatieoptimalisatie

-- 1: verwijder index (beginsituatie)
DROP INDEX IF EXISTS idx_order_items_product_id;

-- METING A — ZONDER index
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
    oi.product_id,
    oi.product_name,
    oi.platform,
    COUNT(DISTINCT oi.order_id)   AS aantal_bestellingen,
    SUM(oi.quantity)              AS totaal_verkocht,
    SUM(oi.unit_price * oi.quantity) AS totale_omzet,
    ROUND(AVG(oi.unit_price), 2)  AS gemiddelde_prijs
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE o.status IN ('paid', 'fulfilled')
GROUP BY oi.product_id, oi.product_name, oi.platform
ORDER BY totaal_verkocht DESC
LIMIT 5;


-- 2: index aanmaken
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
ANALYZE order_items;

-- METING B — MET index
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
    oi.product_id,
    oi.product_name,
    oi.platform,
    COUNT(DISTINCT oi.order_id)      AS aantal_bestellingen,
    SUM(oi.quantity)                 AS totaal_verkocht,
    SUM(oi.unit_price * oi.quantity) AS totale_omzet,
    ROUND(AVG(oi.unit_price), 2)     AS gemiddelde_prijs
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE o.status IN ('paid', 'fulfilled')
GROUP BY oi.product_id, oi.product_name, oi.platform
ORDER BY totaal_verkocht DESC
LIMIT 5;


/*
| Meting                        | Zonder index | Met index | Verschil |
|-------------------------------|-------------|-----------|----------|
| Scan type (order_items)       | Seq Scan    |           |          |
| Join strategie                |             |           |          |
| Execution Time (ms)           |             |           |          |
| Rijen gescand                 | ~10000      |           |          |

Conclusie: [schrijf hier wat je ziet]
*/
