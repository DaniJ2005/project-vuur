-- 4 — Game Keys Lookup via OrderItem
-- Aansluitend op: verwijdering van status-kolom uit game_keys
-- en toevoeging van index idx_game_keys_order_item_id
-- Rubric: indexoptimalisatie + query performance

-- 1: verwijder de index (beginsituatie)
DROP INDEX IF EXISTS idx_game_keys_order_item_id;

ANALYZE game_keys;

-- METING A — ZONDER index
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id,
key_code,
order_item_id
FROM game_keys
WHERE order_item_id = (
SELECT order_item_id
FROM game_keys
WHERE order_item_id IS NOT NULL
LIMIT 1
);

-- 2: maak de index opnieuw aan
CREATE INDEX IF NOT EXISTS idx_game_keys_order_item_id
ON game_keys(order_item_id);

ANALYZE game_keys;

-- METING B — MET index
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id,
key_code,
order_item_id
FROM game_keys
WHERE order_item_id = (
SELECT order_item_id
FROM game_keys
WHERE order_item_id IS NOT NULL
LIMIT 1
);

-- Optionele join-test:
-- Simuleert ophalen van game keys voor een order

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT gk.id,
gk.key_code,
oi.id
FROM order_items oi
JOIN game_keys gk
ON gk.order_item_id = oi.id
WHERE oi.id = (
SELECT id
FROM order_items
LIMIT 1
);

/*

| Meting              | Zonder index | Met index  | Verschil |
| ------------------- | ------------ | ---------- | -------- |
| Scan type           | Seq Scan     | Index Scan |          |
| Buffers gelezen     |              |            |          |
| Rijen gescand       | ~10000       | 1          |          |
| Execution Time (ms) |              |            |          |
| Planning Time (ms)  |              |            |          |

Verwachting:

Zonder index:

* Seq Scan op game_keys
* volledige tabelscan

Met index:

* Index Scan op idx_game_keys_order_item_id
* directe lookup via foreign key

Doel:
Aantonen dat het ophalen van een game key voor een
besteld product schaalbaar blijft bij groeiende datasets.
*/
