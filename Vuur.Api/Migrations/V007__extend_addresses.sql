-- Extend addresses with the location fields the frontend address book needs.
-- V003 only stored address/city/country_code; the UI also captures a label,
-- split house number, postcode and a default flag. The recipient name comes
-- from the user account, so it is not duplicated here.

-- Rename the column to match the Address.Street property so Dapper's SELECT *
-- maps it correctly (it previously came back as `address`, leaving Street null).
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
