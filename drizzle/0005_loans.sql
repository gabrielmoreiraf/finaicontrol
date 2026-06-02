CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  borrower_name text NOT NULL,
  principal_amount numeric(14, 2) DEFAULT '0' NOT NULL,
  remaining_principal numeric(14, 2) DEFAULT '0' NOT NULL,
  interest_rate_percent numeric(8, 4),
  payment_mode text DEFAULT 'interest_only' NOT NULL,
  installment_amount numeric(14, 2),
  installment_count integer,
  day_of_month integer,
  start_date text NOT NULL,
  expected_end_date text,
  status text DEFAULT 'active' NOT NULL,
  notes text DEFAULT '' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS loan_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  loan_id uuid NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paid_at text NOT NULL,
  amount numeric(14, 2) DEFAULT '0' NOT NULL,
  payment_type text DEFAULT 'interest' NOT NULL,
  note text DEFAULT '' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
