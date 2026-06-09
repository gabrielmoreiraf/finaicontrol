ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "loans_enabled" boolean DEFAULT false NOT NULL;
