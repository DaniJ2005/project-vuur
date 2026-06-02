-- Orders become self-contained historical records. Line items move to their own
-- table (with price-at-purchase); the delivery address is snapshotted and nullable
-- because key-only orders ship nothing; game keys get a dedicated inventory table.

-- 1. Orders: allow anonymous buyers + snapshot contact, shipping and totals -------
ALTER TABLE orders
    ALTER COLUMN user_id DROP NOT NULL;            -- anonymous orders allowed (FK stays, NULL ok)

ALTER TABLE orders
    DROP COLUMN IF EXISTS products_id;             -- replaced by order_items

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS customer_email      TEXT          NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS customer_first_name TEXT          NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS customer_last_name  TEXT          NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS status              TEXT          NOT NULL DEFAULT 'pending', -- pending|paid|fulfilled|cancelled
    ADD COLUMN IF NOT EXISTS requires_shipping   BOOLEAN       NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS shipping_method     TEXT,
    ADD COLUMN IF NOT EXISTS shipping_price      NUMERIC(10,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_amount        NUMERIC(10,2) NOT NULL DEFAULT 0,
    -- Delivery-address snapshot. NULL for key-only orders. Recipient name is the
    -- customer_* fields above, so the address holds location only (matches the
    -- addresses table after V007).
    ADD COLUMN IF NOT EXISTS ship_street         TEXT,
    ADD COLUMN IF NOT EXISTS ship_house_number   TEXT,
    ADD COLUMN IF NOT EXISTS ship_house_ext      TEXT,
    ADD COLUMN IF NOT EXISTS ship_post_code      TEXT,
    ADD COLUMN IF NOT EXISTS ship_city           TEXT,
    ADD COLUMN IF NOT EXISTS ship_country_code   TEXT;

-- Physical orders must carry a full address; key-only orders need none.
ALTER TABLE orders
    ADD CONSTRAINT chk_orders_shipping CHECK (
        requires_shipping = false
        OR (ship_street       IS NOT NULL
            AND ship_house_number IS NOT NULL
            AND ship_post_code    IS NOT NULL
            AND ship_city         IS NOT NULL
            AND ship_country_code IS NOT NULL)
    );

-- 2. Order line items: one row per product, with price/name snapshot -------------
CREATE TABLE IF NOT EXISTS order_items (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id     UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id   TEXT          NOT NULL,                 -- MongoDB ObjectId (reference)
    product_name TEXT          NOT NULL,                 -- snapshot at purchase
    product_type TEXT          NOT NULL,                 -- 'key' | 'disc'
    platform     TEXT,                                   -- snapshot for display
    unit_price   NUMERIC(10,2) NOT NULL,                 -- price at purchase
    quantity     INT           NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);

-- 3. Game-key inventory, assigned to an order line on purchase -------------------
CREATE TABLE IF NOT EXISTS game_keys (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    TEXT        NOT NULL,                  -- MongoDB ObjectId of the key product
    key_code      TEXT        NOT NULL UNIQUE,           -- activation code (treat as secret)
    status        TEXT        NOT NULL DEFAULT 'available', -- available | reserved | sold
    order_item_id UUID        REFERENCES order_items(id) ON DELETE SET NULL,
    assigned_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Supports the atomic "grab one available key for this product" claim:
--   UPDATE game_keys SET status='sold', order_item_id=$1, assigned_at=now()
--   WHERE id = (SELECT id FROM game_keys
--               WHERE product_id=$2 AND status='available'
--               LIMIT 1 FOR UPDATE SKIP LOCKED) RETURNING key_code;
CREATE INDEX IF NOT EXISTS idx_game_keys_product_status ON game_keys (product_id, status);
 