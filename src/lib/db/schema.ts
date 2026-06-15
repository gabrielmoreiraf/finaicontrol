import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  mode: text("mode").notNull().default("personal"),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  plan: text("plan"),
  role: text("role").notNull().default("user"),
  loansEnabled: boolean("loans_enabled").notNull().default(false),
  // Créditos de lançamentos extras (além do limite mensal grátis), concedidos pelo admin.
  entryCredits: integer("entry_credits").notNull().default(0),
  // Trial de acesso completo (ex.: 30 dias). Enquanto ativo, o plano efetivo
  // é elevado para `trialPlan` sem alterar o plano "real" salvo.
  trialPlan: text("trial_plan"),
  trialExpiresAt: timestamp("trial_expires_at", { withTimezone: true }),
  // LGPD (Art. 8º): prova auditável do consentimento dado no cadastro.
  consentAcceptedAt: timestamp("consent_accepted_at", { withTimezone: true }),
  consentVersion: text("consent_version"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Histórico (ledger) de concessões de créditos de lançamentos pelo admin.
export const creditGrants = pgTable("credit_grants", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull().default(""),
  grantedBy: uuid("granted_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Tokens de resgate de trial (ex.: "30 dias grátis"). AMARRADOS a um userId:
// só podem ser resgatados por quem estiver logado naquela conta — não funcionam
// se o link for compartilhado com outra pessoa.
export const trialTokens = pgTable("trial_tokens", {
  id: text("id").primaryKey(), // token
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  plan: text("plan").notNull(), // plano concedido durante o trial (ex.: premium)
  days: integer("days").notNull(), // duração do trial em dias
  status: text("status").notNull().default("pending"), // pending | redeemed | revoked
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(), // validade do LINK
  redeemedAt: timestamp("redeemed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Convites de acesso enviados pelo admin (cadastro por convite, com plano opcional).
export const invitations = pgTable("invitations", {
  id: text("id").primaryKey(), // token
  email: text("email").notNull(),
  plan: text("plan"), // nulo = convidado escolhe o plano
  invitedBy: uuid("invited_by").references(() => users.id, { onDelete: "set null" }),
  status: text("status").notNull().default("pending"), // pending | accepted | revoked
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// LGPD (Art. 37): registro de operações de acesso/alteração de dados pelo admin.
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  targetUserId: uuid("target_user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  profession: text("profession").notNull().default(""),
  fixedMonthlyIncome: numeric("fixed_monthly_income", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  avatarWebp: text("avatar_webp"),
  avatarUpdatedAt: timestamp("avatar_updated_at", { withTimezone: true }),
});

export const incomes = pgTable("incomes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull().default("0"),
  type: text("type").notNull().default("fixed"),
  dayOfMonth: integer("day_of_month"),
  endDate: text("end_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("incomes_user_created_idx").on(t.userId, t.createdAt)]);

export const expenseCategories = pgTable("expense_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull().default("0"),
  category: text("category").notNull().default(""),
  type: text("type").notNull().default("fixed"),
  dayOfMonth: integer("day_of_month"),
  expenseDate: text("expense_date"),
  installmentCount: integer("installment_count"),
  paymentStartDate: text("payment_start_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("expenses_user_created_idx").on(t.userId, t.createdAt),
  index("expenses_user_type_idx").on(t.userId, t.type),
]);

export const debts = pgTable("debts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  balance: numeric("balance", { precision: 14, scale: 2 }).notNull().default("0"),
  monthlyPayment: numeric("monthly_payment", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("debts_user_created_idx").on(t.userId, t.createdAt)]);

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  targetAmount: numeric("target_amount", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  currentAmount: numeric("current_amount", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  // Reserva mensal: quanto o usuário planeja guardar por mês nesta meta.
  monthlyContribution: numeric("monthly_contribution", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("goals_user_created_idx").on(t.userId, t.createdAt)]);

export const loans = pgTable("loans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  borrowerName: text("borrower_name").notNull(),
  principalAmount: numeric("principal_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  remainingPrincipal: numeric("remaining_principal", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  interestRatePercent: numeric("interest_rate_percent", { precision: 8, scale: 4 }),
  paymentMode: text("payment_mode").notNull().default("interest_only"),
  installmentAmount: numeric("installment_amount", { precision: 14, scale: 2 }),
  installmentCount: integer("installment_count"),
  dayOfMonth: integer("day_of_month"),
  startDate: text("start_date").notNull(),
  expectedEndDate: text("expected_end_date"),
  status: text("status").notNull().default("active"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("loans_user_created_idx").on(t.userId, t.createdAt)]);

export const loanPayments = pgTable("loan_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  loanId: uuid("loan_id")
    .notNull()
    .references(() => loans.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  paidAt: text("paid_at").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull().default("0"),
  paymentType: text("payment_type").notNull().default("interest"),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("loan_payments_loan_idx").on(t.loanId),
  index("loan_payments_user_idx").on(t.userId),
]);
