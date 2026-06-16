-- Game keys tabel wordt nu alleen gebruikt voor opslag bij een order, en dus niet als inventaris van beschikbare keys. De status van een key is daarom niet meer relevant, en we kunnen deze kolom verwijderen.
ALTER TABLE game_keys DROP COLUMN IF EXISTS status;

-- Indexeer de kolom waarop we daadwerkelijk zoeken (sleutels worden opgehaald op basis van order_item_id, en de foreign key wordt in PostgreSQL niet automatisch geïndexeerd).
CREATE INDEX IF NOT EXISTS idx_game_keys_order_item_id ON game_keys (order_item_id);
