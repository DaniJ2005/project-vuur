-- Orders bewaren hun eigen gegevens.
-- Producten staan nu in order_items met de prijs van het moment van aankoop.
-- Verzending wordt als snapshot opgeslagen.
-- Voor game keys is er een aparte voorraad tabel.

-- Orders: gastbestellingen toestaan + klant- en verzendgegevens opslaan
ALTER TABLE orders
    ALTER COLUMN user_id DROP NOT NULL;  -- gebruiker mag leeg zijn

ALTER TABLE orders
    DROP COLUMN IF EXISTS products_id;  -- vervangen door order_items

ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS customer_email      TEXT          NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS customer_first_name TEXT          NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS customer_last_name  TEXT          NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS status              TEXT          NOT NULL DEFAULT 'pending', -- pending|paid|fulfilled|cancelled
    ADD COLUMN IF NOT EXISTS requires_shipping   BOOLEAN       NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS shipping_method     TEXT,
    ADD COLUMN IF NOT EXISTS shipping_price      NUMERIC(10,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_amount        NUMERIC(10,2) NOT NULL DEFAULT 0,
    -- Adres op moment van bestellen.
    -- Voor key-only bestellingen blijven deze velden leeg.
    ADD COLUMN IF NOT EXISTS ship_street         TEXT,
    ADD COLUMN IF NOT EXISTS ship_house_number   TEXT,
    ADD COLUMN IF NOT EXISTS ship_house_ext      TEXT,
    ADD COLUMN IF NOT EXISTS ship_post_code      TEXT,
    ADD COLUMN IF NOT EXISTS ship_city           TEXT,
    ADD COLUMN IF NOT EXISTS ship_country_code   TEXT;

-- Als er verzonden moet worden, moet het adres compleet zijn.
ALTER TABLE orders
    ADD CONSTRAINT chk_orders_shipping CHECK (
        requires_shipping = false
        OR (ship_street       IS NOT NULL
            AND ship_house_number IS NOT NULL
            AND ship_post_code    IS NOT NULL
            AND ship_city         IS NOT NULL
            AND ship_country_code IS NOT NULL)
    );

-- Productregels binnen een bestelling
CREATE TABLE IF NOT EXISTS order_items (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id     UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id   TEXT          NOT NULL, -- MongoDB ObjectId
    product_name TEXT          NOT NULL, -- naam bij aankoop
    product_type TEXT          NOT NULL, -- key | disc
    platform     TEXT,
    unit_price   NUMERIC(10,2) NOT NULL, -- prijs bij aankoop
    quantity     INT           NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);

-- Voorraad van game keys
CREATE TABLE IF NOT EXISTS game_keys (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    TEXT        NOT NULL, -- MongoDB ObjectId
    key_code      TEXT        NOT NULL UNIQUE,
    status        TEXT        NOT NULL DEFAULT 'available', -- available | reserved | sold
    order_item_id UUID        REFERENCES order_items(id) ON DELETE SET NULL,
    assigned_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Handig voor het pakken van een beschikbare key.
CREATE INDEX IF NOT EXISTS idx_game_keys_product_status ON game_keys (product_id, status);