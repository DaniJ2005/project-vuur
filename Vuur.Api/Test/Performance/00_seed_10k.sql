-- VUUR — SEED SCRIPT (10.000 rijen per tabel)
-- Tabellen: roles, users, addresses, orders, order_items,
--            game_keys, payments, wishlist
-- Draai éénmalig vóór de performance tests
-- Vereiste: migraties V001–V009 zijn al uitgevoerd
-- ============================================================

-- Controleer hoeveel rijen er al zijn
SELECT 'users' AS tabel, COUNT(*) AS huidig FROM users
UNION ALL SELECT 'orders',      COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'game_keys',   COUNT(*) FROM game_keys;

--USERS (10.000 extra testgebruikers)
INSERT INTO users (
    id,
    first_name,
    last_name,
    email,
    password_hash,
    role_id,
    created_at
)
SELECT
    gen_random_uuid(),
    'Test',
    'User ' || i,
    'testuser' || i || '@vuur.store',
    '$2a$11$' || substring(md5(i::text || 'salt'), 1, 53),
    (SELECT id FROM roles WHERE role_name = 'customer' LIMIT 1),
    NOW() - (random() * interval '365 days')
FROM generate_series(1, 10000) AS s(i)
ON CONFLICT (email) DO NOTHING;

--ADDRESSES
INSERT INTO addresses (
    id,
    user_id,
    label,
    street,
    house_number,
    house_ext,
    post_code,
    city,
    country_code,
    is_default,
    created_at
)
SELECT
    gen_random_uuid(),
    u.id,
    'Thuis',
    'Teststraat',
    (1 + (row_number() OVER () % 999))::text,
    '',
    '3000' || lpad((row_number() OVER () % 100)::text, 2, '0') || ' AB',
    (ARRAY['Rotterdam','Amsterdam','Den Haag','Utrecht','Eindhoven'])
        [1 + (row_number() OVER () % 5)::int],
    'NL',
    TRUE,
    NOW() - (random() * interval '300 days')
FROM users u
WHERE u.email LIKE 'testuser%@vuur.store'
ON CONFLICT DO NOTHING;

-- ORDERS
INSERT INTO orders (
    id,
    user_id,
    customer_email,
    customer_first_name,
    customer_last_name,
    status,
    requires_shipping,
    shipping_method,
    shipping_price,
    total_amount,
    ship_street,
    ship_house_number,
    ship_house_ext,
    ship_post_code,
    ship_city,
    ship_country_code,
    created_at
)
SELECT
    gen_random_uuid(),
    u.id,
    u.email,
    'Test',
    'Gebruiker',
    (ARRAY['pending','paid','fulfilled','cancelled'])
        [1 + (row_number() OVER () % 4)::int],
    TRUE,
    'PostNL',
    round((random() * 10)::numeric, 2),
    round((random() * 150 + 5)::numeric, 2),
    'Teststraat',
    (1 + (row_number() OVER () % 999))::text,
    '',
    '3012 AB',
    'Rotterdam',
    'NL',
    NOW() - (random() * interval '180 days')
FROM users u
WHERE u.email LIKE 'testuser%@vuur.store'
LIMIT 10000;

-- ORDER_ITEMS
INSERT INTO order_items (
    id,
    order_id,
    product_id,
    product_name,
    product_type,
    platform,
    unit_price,
    quantity,
    created_at
)
SELECT
    gen_random_uuid(),
    o.id,
    'mock-product-' || (1 + (row_number() OVER () % 200))::text,
    'Game ' || (1 + (row_number() OVER () % 200))::text,
    (ARRAY['key','disc'])[1 + (row_number() OVER () % 2)::int],
    (ARRAY['PC','PlayStation','Xbox','Nintendo'])
        [1 + (row_number() OVER () % 4)::int],
    round((random() * 60 + 5)::numeric, 2),
    1,
    o.created_at
FROM orders o
WHERE o.id NOT IN (SELECT DISTINCT order_id FROM order_items)
LIMIT 10000;

-- GAME_KEYS
INSERT INTO game_keys (
    id,
    product_id,
    key_code,
    created_at
)
SELECT
    gen_random_uuid(),
    'mock-product-' || (1 + (i % 200))::text,
    upper(
        substring(md5(i::text || 'key'), 1, 5) || '-' ||
        substring(md5(i::text || 'key2'), 1, 5) || '-' ||
        substring(md5(i::text || 'key3'), 1, 5) || '-' ||
        substring(md5(i::text || 'key4'), 1, 5)
    ),
    NOW() - (random() * interval '90 days')
FROM generate_series(1, 10000) AS s(i)
ON CONFLICT DO NOTHING;

-- WISHLIST (5.000 verlanglijst-items)
INSERT INTO wishlist (
    id,
    user_id,
    products_id,
    created_at
)
SELECT DISTINCT ON (u.id, pid)
    gen_random_uuid(),
    u.id,
    pid,
    NOW() - (random() * interval '60 days')
FROM (
    SELECT id
    FROM users
    WHERE email LIKE 'testuser%@vuur.store'
    LIMIT 5000
) u
CROSS JOIN LATERAL (
    SELECT 'mock-product-' || (1 + (random() * 199)::int)::text AS pid
) p
ON CONFLICT (user_id, products_id) DO NOTHING;

-- ── Eindcontrole
SELECT 'users'       AS tabel, COUNT(*) FROM users
UNION ALL SELECT 'addresses',   COUNT(*) FROM addresses
UNION ALL SELECT 'orders',      COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'game_keys',   COUNT(*) FROM game_keys
UNION ALL SELECT 'wishlist',    COUNT(*) FROM wishlist;