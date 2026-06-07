-- Add amount column to wishlist table if it doesn't exist
ALTER TABLE wishlist
ADD COLUMN IF NOT EXISTS amount INT NOT NULL DEFAULT 1;
