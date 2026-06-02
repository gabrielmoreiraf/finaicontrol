import {
  boolean,
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
  hasVariableIncome: boolean("has_variable_income").notNull().default(false),
  hasExtraIncome: boolean("has_extra_income").notNull().default(false),
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
});

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
});

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
});

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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

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
});

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
});
