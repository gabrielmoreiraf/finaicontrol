ALTER TABLE "goals" ADD COLUMN IF NOT EXISTS "monthly_contribution" numeric(14, 2) DEFAULT '0' NOT NULL;
