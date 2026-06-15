CREATE INDEX IF NOT EXISTS "debts_user_created_idx" ON "debts" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "expenses_user_created_idx" ON "expenses" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "expenses_user_type_idx" ON "expenses" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "goals_user_created_idx" ON "goals" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "incomes_user_created_idx" ON "incomes" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "loan_payments_loan_idx" ON "loan_payments" USING btree ("loan_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "loan_payments_user_idx" ON "loan_payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "loans_user_created_idx" ON "loans" USING btree ("user_id","created_at");
