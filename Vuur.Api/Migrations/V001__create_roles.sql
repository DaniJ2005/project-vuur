CREATE TABLE IF NOT EXISTS roles (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name   TEXT        NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO roles (id, role_name) VALUES
    (gen_random_uuid(), 'customer'),
    (gen_random_uuid(), 'admin')
ON CONFLICT (role_name) DO NOTHING;