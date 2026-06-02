-- Papel do usuário: 'user' (padrão) ou 'admin' (acesso master).
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';
