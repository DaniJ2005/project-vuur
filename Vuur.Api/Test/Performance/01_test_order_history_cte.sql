-- TEST 1 — Order history per klant
-- Aansluitend op: "Bestelflow met transactie" in het rapport
-- Rubric: geavanceerde SQL-query + prestatieoptimalisatie

-- 1: Zorg dat er GEEN index op user_id staat (beginsituatie)
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_order_items_order_id;

-- METING A — ZONDER indexes
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
WITH klant_orders AS (
SELECT
o.id              AS order_id,
o.status,
o.total_amount,
o.customer_email,
o.ship_city,
o.created_at
FROM orders o
WHERE o.user_id = (
SELECT id
FROM users
WHERE email LIKE 'testuser%@vuur.store'
LIMIT 1
)
),
order_details AS (
SELECT
ko.order_id,
ko.status,
ko.total_amount,
ko.customer_email,
ko.ship_city,
ko.created_at,
COUNT(oi.id)       AS aantal_items,
SUM(oi.unit_price) AS items_subtotaal,
STRING_AGG(oi.product_name, ', ') AS productnamen
FROM klant_orders ko
JOIN order_items oi
ON oi.order_id = ko.order_id
GROUP BY
ko.order_id,
ko.status,
ko.total_amount,
ko.customer_email,
ko.ship_city,
ko.created_at
)
SELECT *
FROM order_details
ORDER BY created_at DESC;

-- 2: Maak de FK-indexes aan
CREATE INDEX IF NOT EXISTS idx_orders_user_id
ON orders(user_id);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
ON order_items(order_id);

ANALYZE orders;
ANALYZE order_items;

-- METING B — MET indexes
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
WITH klant_orders AS (
SELECT
o.id              AS order_id,
o.status,
o.total_amount,
o.customer_email,
o.ship_city,
o.created_at
FROM orders o
WHERE o.user_id = (
SELECT id
FROM users
WHERE email LIKE 'testuser%@vuur.store'
LIMIT 1
)
),
order_details AS (
SELECT
ko.order_id,
ko.status,
ko.total_amount,
ko.customer_email,
ko.ship_city,
ko.created_at,
COUNT(oi.id)       AS aantal_items,
SUM(oi.unit_price) AS items_subtotaal,
STRING_AGG(oi.product_name, ', ') AS productnamen
FROM klant_orders ko
JOIN order_items oi
ON oi.order_id = ko.order_id
GROUP BY
ko.order_id,
ko.status,
ko.total_amount,
ko.customer_email,
ko.ship_city,
ko.created_at
)
SELECT *
FROM order_details
ORDER BY created_at DESC;

/*

| Meting                  | Zonder index | Met index | Verschil |
| ----------------------- | ------------ | --------- | -------- |
| Scan type (orders)      |              |           |          |
| Scan type (order_items) |              |           |          |
| Execution Time (ms)     |              |           |          |
| Buffers hit             |              |           |          |

Conclusie: [schrijf hier wat je ziet]
*/
