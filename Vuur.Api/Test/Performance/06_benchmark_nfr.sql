-- BENCHMARK

\timing on

-- TEST A: Get all orders
SELECT
    o.status,
    COUNT(*)                         AS aantal_orders,
    SUM(o.total_amount)               AS totale_omzet,
    ROUND(AVG(o.total_amount), 2)     AS gemiddeld_orderbedrag
FROM orders o
WHERE o.created_at >= NOW() - interval '30 days'
GROUP BY o.status
ORDER BY aantal_orders DESC;


-- TEST B: Wishlist van een gebruiker (wordt getoond op profielpagina)
SELECT
    w.id,
    w.products_id,
    w.created_at
FROM wishlist w
WHERE w.user_id = (
    SELECT id FROM users WHERE email LIKE 'testuser%@vuur.store' LIMIT 1
)
ORDER BY w.created_at DESC;

\timing off
