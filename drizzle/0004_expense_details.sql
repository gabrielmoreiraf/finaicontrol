ALTER TABLE expenses ADD COLUMN IF NOT EXISTS expense_date text;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS installment_count integer;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_start_date text;
