-- CREATE ROLES
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'vuur_admin') THEN
        CREATE ROLE vuur_admin LOGIN PASSWORD 'changeme_admin';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'vuur_dev') THEN
        CREATE ROLE vuur_dev LOGIN PASSWORD 'changeme_dev';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'vuur_support') THEN
        CREATE ROLE vuur_support LOGIN PASSWORD 'changeme_support';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'vuur_readonly') THEN
        CREATE ROLE vuur_readonly LOGIN PASSWORD 'changeme_readonly';
    END IF;
END
$$;

-- ADMIN — full access
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vuur_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vuur_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL PRIVILEGES ON TABLES TO vuur_admin;


-- SAFE VIEWS
-- Users without password_hash
CREATE OR REPLACE VIEW v_users_safe AS
    SELECT id, first_name, last_name, email, role_id, created_at, updated_at
    FROM users;

-- Orders without full customer PII
CREATE OR REPLACE VIEW v_orders_safe AS
    SELECT id, user_id, status, total_amount, requires_shipping,
           shipping_method, shipping_price, created_at, updated_at
    FROM orders;

-- Game keys without the actual key_code
CREATE OR REPLACE VIEW v_game_keys_safe AS
    SELECT id, product_id, status, order_item_id, assigned_at, created_at, updated_at
    FROM game_keys;

-- Payments without products_id details
CREATE OR REPLACE VIEW v_payments_safe AS
    SELECT id, order_id, created_at, updated_at
    FROM payments;


-- DEV — reads safe views + non-sensitive tables
GRANT USAGE ON SCHEMA public TO vuur_dev;

-- Safe views only
GRANT SELECT ON v_users_safe TO vuur_dev;
GRANT SELECT ON v_orders_safe TO vuur_dev;
GRANT SELECT ON v_game_keys_safe TO vuur_dev;
GRANT SELECT ON v_payments_safe TO vuur_dev;

-- Non-sensitive tables — full read
GRANT SELECT ON order_items TO vuur_dev;
GRANT SELECT ON wishlist TO vuur_dev;
GRANT SELECT ON roles TO vuur_dev;
GRANT SELECT ON addresses TO vuur_dev;

-- Devs can write to non-sensitive tables
GRANT INSERT, UPDATE, DELETE ON order_items TO vuur_dev;
GRANT INSERT, UPDATE, DELETE ON wishlist TO vuur_dev;


-- SUPPORT — read orders/users, can update order status
GRANT USAGE ON SCHEMA public TO vuur_support;

GRANT SELECT ON v_users_safe TO vuur_support;
GRANT SELECT ON v_orders_safe TO vuur_support;
GRANT SELECT ON order_items TO vuur_support;
GRANT SELECT ON addresses TO vuur_support;

-- Support can only update the status column on orders
-- We use a security function for this
CREATE OR REPLACE FUNCTION update_order_status(order_uuid UUID, new_status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER  -- runs with owner privileges, not caller
AS $$
BEGIN
    UPDATE orders SET status = new_status WHERE id = order_uuid;
END;
$$;

GRANT EXECUTE ON FUNCTION update_order_status(UUID, TEXT) TO vuur_support;


-- READONLY — testers/interns, no PII at all
GRANT USAGE ON SCHEMA public TO vuur_readonly;

GRANT SELECT ON order_items TO vuur_readonly;
GRANT SELECT ON wishlist TO vuur_readonly;
GRANT SELECT ON roles TO vuur_readonly;
GRANT SELECT ON v_game_keys_safe TO vuur_readonly;

-- Explicitly NO access to users, addresses, orders, payments