-- Usuários que já concluíram o fluxo anterior recebem o plano gratuito.
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan text;
UPDATE users SET plan = 'free' WHERE plan IS NULL AND onboarding_complete = true;
