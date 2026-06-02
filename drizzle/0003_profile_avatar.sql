ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "avatar_webp" text;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "avatar_updated_at" timestamp with time zone;
