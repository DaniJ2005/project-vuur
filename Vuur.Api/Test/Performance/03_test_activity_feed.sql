-- 3 — Activity feed (UNION ALL, zoals in AdminController)
-- Aansluitend op: "UNION ALL activity-feed (AdminController)" in rapport
-- Rubric: geavanceerde SQL + prestatieoptimalisatie

-- 1: verwijder indexes (beginsituatie)
DROP INDEX IF EXISTS idx_orders_created_at;
DROP INDEX IF EXISTS idx_users_created_at;

-- METING A — ZONDER indexes
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
'order'            AS event_type,
o.id::text         AS event_id,
o.created_at,
o.customer_email   AS actor,
o.status           AS detail,
o.total_amount     AS bedrag
FROM orders o

UNION ALL

SELECT
'registratie'      AS event_type,
u.id::text         AS event_id,
u.created_at,
u.email            AS actor,
r.role_name        AS detail,
NULL::numeric      AS bedrag
FROM users u
JOIN roles r
ON r.id = u.role_id

ORDER BY created_at DESC
LIMIT 50;

-- 2: indexes aanmaken op created_at
CREATE INDEX IF NOT EXISTS idx_orders_created_at
ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_created_at
ON users(created_at DESC);

ANALYZE orders;
ANALYZE users;

-- METING B — MET indexes
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
'order'            AS event_type,
o.id::text         AS event_id,
o.created_at,
o.customer_email   AS actor,
o.status           AS detail,
o.total_amount     AS bedrag
FROM orders o

UNION ALL

SELECT
'registratie'      AS event_type,
u.id::text         AS event_id,
u.created_at,
u.email            AS actor,
r.role_name        AS detail,
NULL::numeric      AS bedrag
FROM users u
JOIN roles r
ON r.id = u.role_id

ORDER BY created_at DESC
LIMIT 50;

/*

| Meting              | Zonder index | Met index | Verschil |
| ------------------- | ------------ | --------- | -------- |
| Scan type (orders)  | Seq Scan     |           |          |
| Scan type (users)   | Seq Scan     |           |          |
| Sort-node aanwezig  | Ja           |           |          |
| Execution Time (ms) |              |           |          |

Conclusie: [schrijf hier wat je ziet]
*/
