-- 5 — Partiële unieke index: één standaardadres per gebruiker
-- Aansluitend op: "uq_addresses_one_default" in het rapport
--                 (Constraints die de data-integriteit bewaken)
-- Rubric: geavanceerde SQL-techniek (partiële index) + bewijs integriteit

-- 1: Laat zien dat de index al bestaat (migratie V007)
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'addresses'
  AND indexname = 'uq_addresses_one_default';

-- 2: Toon aan dat de constraint werkt (integriteitstest)
DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Pak een testgebruiker die al een standaardadres heeft
    SELECT user_id INTO v_user_id
    FROM addresses
    WHERE is_default = TRUE
    LIMIT 1;

    -- Probeer een tweede standaardadres voor dezelfde gebruiker in te voegen
    BEGIN
        INSERT INTO addresses (
            id, user_id, label, street, house_number,
            post_code, city, country_code, is_default
        )
        VALUES (
            gen_random_uuid(), v_user_id, 'Werk', 'Werkstraat', 1,
            '3000XX', 'Rotterdam', 'NL', TRUE  -- is_default = TRUE → moet falen!
        );
        RAISE NOTICE 'FOUT: insert slaagde — index werkt niet!';
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE 'OK: unique_violation — partiële index werkt correct.';
    END;
END $$;

-- 3: EXPLAIN ANALYZE — opzoeken van standaardadres per gebruiker
--   Dit is de query die bij elke checkout wordt gebruikt
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT id, street, house_number, post_code, city, country_code
FROM addresses
WHERE user_id = (SELECT user_id FROM addresses WHERE is_default = TRUE LIMIT 1)
  AND is_default = TRUE;


/*
Index aanwezig:  uq_addresses_one_default ON addresses(user_id) WHERE is_default = TRUE
Type:            Partiële unieke index (filtert alleen op is_default = TRUE rijen)

Voordelen t.o.v. gewone unieke index:
  1. Kleiner: indexeert alleen de rijen waar is_default = TRUE (1 per user)
              ipv. alle adresrijen van die gebruiker.
  2. Sneller: de checkout-query (standaardadres ophalen) gebruikt de index
              zonder FALSE-rijen te scannen.
  3. Juiste semantiek: een gebruiker mag meerdere adressen hebben,
              maar slechts één mag is_default = TRUE zijn.

Integriteitstest resultaat: [OK / FOUT — schrijf hier de NOTICE-tekst]

Scan type bij checkout-query: [Index Scan / Seq Scan]
Execution Time (ms):          [X]
*/
