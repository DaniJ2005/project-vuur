ALTER TABLE addresses RENAME COLUMN address TO street;

ALTER TABLE addresses
    ADD COLUMN IF NOT EXISTS label        TEXT    NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS house_number TEXT    NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS house_ext    TEXT    NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS post_code    TEXT    NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS is_default   BOOLEAN NOT NULL DEFAULT false;

-- At most one default address per user.
CREATE UNIQUE INDEX IF NOT EXISTS uq_addresses_one_default
    ON addresses (user_id) WHERE is_default;
