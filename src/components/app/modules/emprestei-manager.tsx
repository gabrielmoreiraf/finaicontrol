"use client";

import { Crown } from "lucide-react";
import { OpenPlansButton } from "@/components/app/plans-modal";
import { PlanLimitedIcon } from "@/components/app/plan-gate";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CurrencyInput, fieldControlClass } from "@/components/ui/currency-input";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActionResult } from "@/lib/actions/result";
import {
  LOAN_PAYMENT_MODE_LABELS,
  LOAN_PAYMENT_TYPE_LABELS,
  LOAN_STATUS_LABELS,
  buildFixedInstallmentSummary,
  buildLoanPaymentSummary,
  calculateFixedInstallmentTotalDue,
  suggestPaymentAmount,
  type LoanPaymentMode,
  type LoanPaymentType,
  type LoanRow,
} from "@/lib/finance/loans";
import { EMPTY_DISPLAY } from "@/lib/empty-display";
import { brl } from "@/lib/finance/format";
import { notify } from "@/lib/toast";
import {
  canCreateLoanBorrower,
  FREE_LOAN_BORROWER_LIMIT,
  getLoanBorrowerLimit,
  getLoanLimitBadgeSublabel,
  getLoanLimitContextMessage,
} from "@/lib/plans/loan-limit";
import { getPlanLabel } from "@/lib/plans";
import type { SubscriptionPlan } from "@/types/finance";
import { cn } from "@/lib/utils";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Pencil, Trash2 } from "lucide-react";

const PAYMENT_MODE_OPTIONS = Object.entries(LOAN_PAYMENT_MODE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const PAYMENT_TYPE_OPTIONS = Object.entries(LOAN_PAYMENT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const LOAN_FIELDS = [
  { name: "borrowerName", label: "Quem pegou emprestado", type: "text" as const, required: true, placeholder: "Ex: João" },
  { name: "principalAmount", label: "Valor emprestado", type: "currency" as const, required: true },
  {
    name: "paymentMode",
    label: "Forma de pagamento",
    type: "select" as const,
    required: true,
    options: PAYMENT_MODE_OPTIONS,
  },
  {
    name: "interestRatePercent",
    label: "Juros (% ao mês)",
    type: "number" as const,
    step: "0.01",
    min: 0,
    placeholder: "Ex: 5",
  },
  {
    name: "installmentAmount",
    label: "Valor da parcela",
    type: "currency" as const,
    showWhen: { field: "paymentMode", values: ["fixed_installments"] },
  },
  {
    name: "installmentCount",
    label: "Número de parcelas",
    type: "number" as const,
    min: 1,
    required: true,
    showWhen: { field: "paymentMode", values: ["fixed_installments"] },
  },
  {
    name: "dayOfMonth",
    label: "Dia do vencimento",
    type: "number" as const,
    min: 1,
    max: 31,
    required: true,
    placeholder: "Ex: 10",
    showWhen: { field: "paymentMode", values: ["interest_only", "fixed_installments"] },
  },
  { name: "startDate", label: "Data do empréstimo", type: "date" as const, required: true },
  {
    name: "expectedEndDate",
    label: "Data prevista de quitação",
    type: "date" as const,
    showWhen: { field: "paymentMode", values: ["single", "interest_only"] },
  },
  { name: "notes", label: "Observações", type: "text" as const, placeholder: "Combinado, garantias, etc." },
];

type FieldDef = (typeof LOAN_FIELDS)[number];

function isFieldVisible(field: FieldDef, values: Record<string, string>) {
  if (!field.showWhen) return true;
  return field.showWhen.values.includes(values[field.showWhen.field] ?? "");
}

function buildInitialValues(item?: LoanRow): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of LOAN_FIELDS) {
    if (item) {
      const raw = item[field.name as keyof LoanRow];
      values[field.name] = raw != null && raw !== "" ? String(raw) : "";
    } else if (field.name === "paymentMode") {
      values[field.name] = "interest_only";
    } else if (field.name === "startDate") {
      values[field.name] = new Date().toISOString().slice(0, 10);
    } else {
      values[field.name] = "";
    }
  }
  return values;
}

function applyActionResult(result: ActionResult) {
  if (result.ok) {
    notify.success(result.message ?? "Operação concluída.");
    return true;
  }
  notify.error(result.error);
  return false;
}

const statusStyles = {
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  paid: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  overdue: "border-red-500/30 bg-red-500/10 text-red-400",
  cancelled: "border-white/10 bg-white/5 text-muted-foreground",
};

function sanitizeDayOfMonth(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 2);
  if (!digits) return "";
  const num = Number(digits);
  if (Number.isNaN(num) || num < 1) return "";
  return String(Math.min(31, num));
}

function LoanFormFields({
  values,
  onChange,
  idPrefix,
}: {
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  idPrefix?: string;
}) {
  const visible = LOAN_FIELDS.filter((field) => isFieldVisible(field, values));
  const principal = Number(values.principalAmount) || 0;
  const installmentCount = Number(values.installmentCount) || 0;
  const installmentAmount = Number(values.installmentAmount) || 0;
  const interestRate = values.interestRatePercent ? Number(values.interestRatePercent) : null;
  const paymentMode = (values.paymentMode as LoanPaymentMode) || "interest_only";
  const fixedSummary =
    paymentMode === "fixed_installments" && installmentAmount > 0 && installmentCount > 0
      ? buildFixedInstallmentSummary(
          principal,
          installmentAmount,
          installmentCount,
          interestRate,
        )
      : null;
  const paymentSummary = buildLoanPaymentSummary(paymentMode, principal, interestRate, {
    installmentAmount: installmentAmount || null,
    installmentCount: installmentCount || null,
    startDate: values.startDate || null,
    expectedEndDate: values.expectedEndDate || null,
  });
  const minInstallment = fixedSummary?.minimumInstallment ?? null;
  const totalDue =
    principal > 0 && installmentCount > 0
      ? calculateFixedInstallmentTotalDue(principal, interestRate, installmentCount)
      : 0;
  const installmentTooLow = fixedSummary?.isBelowMinimum ?? false;
  const rate = interestRate ?? 0;

  function fieldLabel(field: FieldDef) {
    if (field.name === "expectedEndDate" && paymentMode === "interest_only") {
      return "Previsão de quitação";
    }
    return field.label;
  }

  function fieldRequired(field: FieldDef) {
    if (field.name === "expectedEndDate") return paymentMode === "single";
    return "required" in field && field.required === true;
  }

  return (
    <>
      {visible.map((field) => {
        const id = idPrefix ? `${idPrefix}-${field.name}` : field.name;
        return (
          <div key={field.name} className="space-y-1.5">
            <Label htmlFor={id}>{fieldLabel(field)}</Label>
            {field.type === "currency" ? (
              <CurrencyInput
                id={id}
                name={field.name}
                value={values[field.name]}
                onValueChange={(value) => onChange(field.name, value)}
                required={fieldRequired(field)}
                placeholder="R$ 0,00"
              />
            ) : field.type === "select" ? (
              <FormSelect
                id={id}
                name={field.name}
                options={field.options ?? []}
                value={values[field.name]}
                onValueChange={(value) => onChange(field.name, value)}
                required={fieldRequired(field)}
              />
            ) : (
              <Input
                id={id}
                name={field.name}
                type={field.name === "dayOfMonth" ? "text" : field.type}
                inputMode={field.name === "dayOfMonth" ? "numeric" : undefined}
                step={field.step}
                min={field.min}
                max={"max" in field ? field.max : undefined}
                maxLength={field.name === "dayOfMonth" ? 2 : undefined}
                value={values[field.name]}
                onChange={(event) => {
                  const next =
                    field.name === "dayOfMonth"
                      ? sanitizeDayOfMonth(event.target.value)
                      : event.target.value;
                  onChange(field.name, next);
                }}
                required={fieldRequired(field)}
                placeholder={
                  field.name === "expectedEndDate" && paymentMode === "interest_only"
                    ? "Opcional, para calcular o total com juros"
                    : field.placeholder
                }
                className={fieldControlClass}
              />
            )}
            {field.name === "expectedEndDate" && paymentMode === "interest_only" && (
              <p className="text-xs text-muted-foreground">
                Opcional. Com a data, o total inclui juros mensais até a quitação.
              </p>
            )}
            {field.name === "installmentAmount" && minInstallment != null && installmentCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Mínimo: {brl(minInstallment)} ({installmentCount} parcela
                {installmentCount === 1 ? "" : "s"} · total mínimo {brl(totalDue)})
              </p>
            )}
          </div>
        );
      })}
      {principal > 0 && paymentSummary && (
        <div
          className={cn(
            "sm:col-span-2 lg:col-span-3 space-y-2 rounded-lg border px-4 py-3 text-sm",
            installmentTooLow
              ? "border-destructive/30 bg-destructive/5 text-destructive"
              : "border-brand/20 bg-brand/5 text-brand",
          )}
        >
          {paymentSummary.incompleteMessage ? (
            <p>{paymentSummary.incompleteMessage}</p>
          ) : paymentSummary.totalToPay != null ? (
            <>
              <p className="text-base font-semibold">
                Total a pagar: {brl(paymentSummary.totalToPay)}
              </p>
              {paymentSummary.subtitle && (
                <p className="text-sm">{paymentSummary.subtitle}</p>
              )}
              {paymentSummary.details.length > 0 && (
                <p className="text-sm text-current/80">{paymentSummary.details.join(" · ")}</p>
              )}
            </>
          ) : null}
          {installmentTooLow && (
            <p className="text-xs">
              A parcela não cobre principal + juros. Ajuste o valor ou reduza o número de parcelas.
            </p>
          )}
          {rate > 0 && paymentMode !== "interest_only" && (
            <p
              className={cn(
                "text-xs",
                installmentTooLow ? "text-destructive/80" : "text-brand/80",
              )}
            >
              {installmentTooLow
                ? `Juros de atraso: ${rate}% ao mês (proporcional aos dias), além do combinado acima.`
                : `Em caso de atraso, juros extras de ${rate}% ao mês (proporcional aos dias).`}
            </p>
          )}
          {rate > 0 && paymentMode === "interest_only" && (
            <p className="text-xs text-brand/80">
              Em caso de atraso, juros extras de {rate}% ao mês (proporcional aos dias).
            </p>
          )}
        </div>
      )}
    </>
  );
}

function LoanCard({
  loan,
  isPending,
  onEdit,
  onDelete,
  onPay,
}: {
  loan: LoanRow;
  isPending: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onPay: () => void;
}) {
  return (
    <article className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold sm:text-lg">{loan.borrowerName}</h3>
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                statusStyles[loan.status],
              )}
            >
              {LOAN_STATUS_LABELS[loan.status]}
            </span>
            <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">
              {LOAN_PAYMENT_MODE_LABELS[loan.paymentMode]}
            </span>
          </div>
          <p className="text-2xl font-bold text-brand">
            {loan.totalDueNow > loan.remainingPrincipal
              ? brl(loan.totalDueNow)
              : brl(loan.remainingPrincipal)}
          </p>
          <p className="text-sm text-muted-foreground">
            Emprestado: {brl(loan.principalAmount)}
            {loan.interestRatePercent ? ` · ${loan.interestRatePercent}% ao mês` : ""}
            {loan.isOverdue && loan.overdueDays > 0 ? ` · ${loan.overdueDays} dia(s) em atraso` : ""}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          {loan.status !== "paid" && (
            <Button type="button" variant="outline" size="sm" onClick={onPay} disabled={isPending}>
              <Banknote className="size-4" />
              Recebi
            </Button>
          )}
          <Button type="button" variant="ghost" size="icon" onClick={onEdit} aria-label="Editar">
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            disabled={isPending}
            aria-label="Excluir"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-white/[0.04] bg-black/20 px-3 py-2">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {loan.paymentMode === "single" ? "Valor devido" : "Previsto/mês"}
          </dt>
          <dd className="mt-0.5 text-sm font-medium">{brl(loan.monthlyDue)}</dd>
        </div>
        {loan.lateInterest > 0 && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-red-300">
              Juros de atraso
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-red-200">{brl(loan.lateInterest)}</dd>
          </div>
        )}
        <div className="rounded-lg border border-white/[0.04] bg-black/20 px-3 py-2">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Próximo venc.
          </dt>
          <dd className="mt-0.5 text-sm font-medium">{loan.nextDueLabel ?? EMPTY_DISPLAY}</dd>
        </div>
        <div className="rounded-lg border border-white/[0.04] bg-black/20 px-3 py-2">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Total a receber
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-brand">{brl(loan.totalDueNow)}</dd>
        </div>
        <div className="rounded-lg border border-white/[0.04] bg-black/20 px-3 py-2">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Recebido
          </dt>
          <dd className="mt-0.5 text-sm font-medium">{brl(loan.totalReceived)}</dd>
        </div>
      </dl>

      {loan.notes && (
        <p className="mt-3 text-sm text-muted-foreground">{loan.notes}</p>
      )}

      {loan.payments.length > 0 && (
        <div className="mt-4 rounded-lg border border-white/[0.04] bg-black/20 px-3 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Pagamentos recebidos
          </p>
          <ul className="mt-2 space-y-1.5">
            {loan.payments.slice(0, 5).map((payment) => (
              <li key={payment.id} className="flex justify-between gap-2 text-sm">
                <span>
                  {payment.paidAt.split("-").reverse().join("/")} ·{" "}
                  {LOAN_PAYMENT_TYPE_LABELS[payment.paymentType]}
                  {payment.note ? ` (${payment.note})` : ""}
                </span>
                <span className="font-medium text-brand">{brl(payment.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export function EmpresteiManager({
  items,
  planId,
  createAction,
  updateAction,
  deleteAction,
  registerPaymentAction,
}: {
  items: LoanRow[];
  planId: SubscriptionPlan;
  createAction: (formData: FormData) => Promise<ActionResult>;
  updateAction: (formData: FormData) => Promise<ActionResult>;
  deleteAction: (formData: FormData) => Promise<ActionResult>;
  registerPaymentAction: (formData: FormData) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const canCreate = canCreateLoanBorrower(planId, items.length);
  const borrowerLimit = getLoanBorrowerLimit(planId);
  const limitContextMessage = getLoanLimitContextMessage(planId);
  const limitBadgeSublabel = getLoanLimitBadgeSublabel(planId);
  const [createValues, setCreateValues] = useState(() => buildInitialValues());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [payLoan, setPayLoan] = useState<LoanRow | null>(null);
  const [paymentType, setPaymentType] = useState<LoanPaymentType>("interest");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [paymentNote, setPaymentNote] = useState("");

  useEffect(() => {
    if (!payLoan) return;
    const suggested = suggestPaymentAmount(payLoan, paymentType);
    setPaymentAmount(suggested > 0 ? String(suggested) : "");
  }, [payLoan, paymentType]);

  function runAction(
    action: (formData: FormData) => Promise<ActionResult>,
    formData: FormData,
    onSuccess?: () => void,
  ) {
    startTransition(async () => {
      const ok = applyActionResult(await action(formData));
      if (ok) {
        onSuccess?.();
        router.refresh();
      }
    });
  }

  function valuesToFormData(values: Record<string, string>, id?: string) {
    const formData = new FormData();
    if (id) formData.set("id", id);
    for (const [key, value] of Object.entries(values)) {
      if (value !== "") formData.set(key, value);
    }
    return formData;
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/70 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardTitle className="text-lg">Novo empréstimo</CardTitle>
            {borrowerLimit != null && limitBadgeSublabel && (
              <div
                className="flex flex-col items-end gap-0.5"
                title={limitContextMessage ?? undefined}
              >
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1">
                  <PlanLimitedIcon title={limitContextMessage ?? "Bônus limitado"} />
                  <span className="text-xs font-semibold text-emerald-300">
                    {items.length}/{borrowerLimit} pessoas
                  </span>
                </div>
                <span className="text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground">
                  {limitBadgeSublabel}
                </span>
              </div>
            )}
          </div>
          {limitContextMessage && canCreate && (
            <p className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
              {planId === "free" ? (
                <>
                  <span className="font-medium text-emerald-300">
                    Emprestei é um bônus do plano Gratuito
                  </span>
                  . Você pode cadastrar até {FREE_LOAN_BORROWER_LIMIT} pessoas.{" "}
                </>
              ) : (
                <>
                  Seu plano {getPlanLabel(planId)} permite até {FREE_LOAN_BORROWER_LIMIT} pessoas
                  no Emprestei.{" "}
                </>
              )}
              <span className="font-medium text-foreground">No Premium IA, o cadastro é ilimitado.</span>
            </p>
          )}
        </CardHeader>
        <CardContent>
          {!canCreate ? (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-5 sm:px-5">
              <p className="font-medium text-amber-100">
                Limite do plano {getPlanLabel(planId)} atingido ({FREE_LOAN_BORROWER_LIMIT} pessoas)
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {planId === "free" ? (
                  <>
                    Este limite existe porque o Emprestei é um bônus do plano Gratuito. Assine o{" "}
                  </>
                ) : (
                  <>Seu plano atual permite até {FREE_LOAN_BORROWER_LIMIT} pessoas. Assine o </>
                )}
                <span className="font-medium text-foreground">Premium IA</span> para cadastrar
                quantas pessoas precisar, sem limite.
              </p>
              <OpenPlansButton currentPlanId={planId} size="sm" className="btn-brand mt-4 rounded-xl">
                <Crown className="size-4" aria-hidden />
                Ver plano Premium IA
              </OpenPlansButton>
            </div>
          ) : (
            <form
              id="create-loan-form"
              onSubmit={(event) => {
                event.preventDefault();
                runAction(createAction, valuesToFormData(createValues), () =>
                  setCreateValues(buildInitialValues()),
                );
              }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <LoanFormFields
                values={createValues}
                onChange={(name, value) =>
                  setCreateValues((current) => ({ ...current, [name]: value }))
                }
              />
            </form>
          )}
        </CardContent>
        {canCreate && (
          <CardFooter className="justify-end border-border/40 bg-card/95 backdrop-blur-sm">
            <Button
              type="submit"
              form="create-loan-form"
              disabled={isPending}
              className="btn-brand shrink-0"
            >
              {isPending ? "Salvando..." : "Cadastrar empréstimo"}
            </Button>
          </CardFooter>
        )}
      </Card>

      {items.length > 0 && (
        <Card className="border-border/50 bg-card/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Empréstimos ({items.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((loan) =>
              editingId === loan.id ? (
                <form
                  key={loan.id}
                  onSubmit={(event) => {
                    event.preventDefault();
                    runAction(updateAction, valuesToFormData(editValues, loan.id), () =>
                      setEditingId(null),
                    );
                  }}
                  className="rounded-xl border border-brand/30 bg-brand/5 p-4 space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <LoanFormFields
                      values={editValues}
                      onChange={(name, value) =>
                        setEditValues((current) => ({ ...current, [name]: value }))
                      }
                      idPrefix={`edit-${loan.id}`}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isPending} className="btn-brand">
                      Salvar
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  isPending={isPending}
                  onEdit={() => {
                    setEditingId(loan.id);
                    setEditValues(buildInitialValues(loan));
                  }}
                  onDelete={() => setDeleteId(loan.id)}
                  onPay={() => {
                    setPayLoan(loan);
                    setPaymentType(
                      loan.paymentMode === "single"
                        ? "full"
                        : loan.paymentMode === "fixed_installments"
                          ? "both"
                          : "interest",
                    );
                    setPaidAt(new Date().toISOString().slice(0, 10));
                    setPaymentNote("");
                  }}
                />
              ),
            )}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteId != null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir empréstimo?</AlertDialogTitle>
            <AlertDialogDescription>
              O histórico de pagamentos também será removido. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (!deleteId) return;
                const formData = new FormData();
                formData.set("id", deleteId);
                runAction(deleteAction, formData, () => setDeleteId(null));
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={payLoan != null} onOpenChange={(open) => !open && setPayLoan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar pagamento</DialogTitle>
            <DialogDescription>
              {payLoan ? (
                <>
                  {payLoan.borrowerName} · principal {brl(payLoan.remainingPrincipal)}
                  {payLoan.lateInterest > 0 && (
                    <> · juros de atraso {brl(payLoan.lateInterest)}</>
                  )}
                  {payLoan.totalDueNow > 0 && (
                    <> · total sugerido {brl(payLoan.totalDueNow)}</>
                  )}
                </>
              ) : (
                ""
              )}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!payLoan) return;
              const formData = new FormData();
              formData.set("loanId", payLoan.id);
              formData.set("paidAt", paidAt);
              formData.set("amount", paymentAmount);
              formData.set("paymentType", paymentType);
              formData.set("note", paymentNote);
              runAction(registerPaymentAction, formData, () => setPayLoan(null));
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="paymentType">Tipo</Label>
              <FormSelect
                id="paymentType"
                name="paymentType"
                options={PAYMENT_TYPE_OPTIONS}
                value={paymentType}
                onValueChange={(value) => setPaymentType(value as LoanPaymentType)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="paidAt">Data do pagamento</Label>
              <Input
                id="paidAt"
                name="paidAt"
                type="date"
                value={paidAt}
                onChange={(event) => setPaidAt(event.target.value)}
                required
                className={fieldControlClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">Valor recebido</Label>
              <CurrencyInput
                id="amount"
                name="amount"
                value={paymentAmount}
                onValueChange={setPaymentAmount}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="paymentNote">Observação</Label>
              <Input
                id="paymentNote"
                name="note"
                value={paymentNote}
                onChange={(event) => setPaymentNote(event.target.value)}
                placeholder="Opcional"
                className={fieldControlClass}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setPayLoan(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="btn-brand">
                {isPending ? "Salvando..." : "Confirmar pagamento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
