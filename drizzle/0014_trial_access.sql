ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "trial_plan" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "trial_expires_at" timestamp with time zone;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trial_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" text NOT NULL,
	"days" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"redeemed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "trial_tokens" ADD CONSTRAINT "trial_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
