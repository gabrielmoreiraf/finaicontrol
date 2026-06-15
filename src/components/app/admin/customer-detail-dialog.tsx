"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Coins, Mail, Rocket, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormSelect } from "@/components/ui/form-select";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/app/premium/user-avatar";
import {
  grantEntryCreditsAction,
  grantTrialAction,
  logCustomerViewAction,
  updateCustomerAccessAction,
} from "@/lib/actions/admin";
import type { AdminCustomer } from "@/lib/admin/customers";
import type { SubscriptionPlan } from "@/types/finance";
import { notify } from "@/lib/toast";

const PLAN_OPTIONS = [
  { value: "free", label: "Gratuito" },
  { value: "plus", label: "Plus" },
  { value: "premium", label: "Premium IA" },
];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 py-2 text-sm last:border-0 dark:border-white/[0.06]">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function CustomerDetailForm({
  customer,
  currentAdminId,
  onDone,
}: {
  customer: AdminCustomer;
  currentAdminId: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // LGPD (Art. 37): registra que este admin visualizou os dados deste cliente.
  useEffect(() => {
    void logCustomerViewAction(customer.id);
  }, [customer.id]);

  const [plan, setPlan] = useState<SubscriptionPlan>(customer.plan ?? "free");
  const [isAdminRole, setIsAdminRole] = useState(customer.role === "admin");
  const [loansEnabled, setLoansEnabled] = useState(customer.loansEnabled);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [creditAmount, setCreditAmount] = useState("5");
  const [creditReason, setCreditReason] = useState("");
  const [isGranting, startGranting] = useTransition();

  const [trialDays, setTrialDays] = useState("30");
  const [isTrialing, startTrial] = useTransition();

  const trialActive = customer.trialActive;

  function applyTrial(days: number) {
    const formData = new FormData();
    formData.set("userId", customer.id);
    formData.set("days", String(days));
    startTrial(async () => {
      const result = await grantTrialAction(formData);
      if (result.ok) {
        notify.success(result.message ?? "Acesso atualizado.");
        router.refresh();
        onDone();
      } else {
        notify.error(result.error);
      }
    });
  }

  function grantCredits() {
    const amount = Math.trunc(Number(creditAmount));
    if (!Number.isFinite(amount) || amount === 0) {
      notify.error("Informe uma quantidade de créditos (diferente de zero).");
      return;
    }
    const formData = new FormData();
    formData.set("userId", customer.id);
    formData.set("amount", String(amount));
    formData.set("reason", creditReason);

    startGranting(async () => {
      const result = await grantEntryCreditsAction(formData);
      if (result.ok) {
        notify.success(result.message ?? "Créditos registrados.");
        setCreditReason("");
        router.refresh();
        onDone();
      } else {
        notify.error(result.error);
      }
    });
  }

  const isSelf = customer.id === currentAdminId;
  const nextRole = isAdminRole ? "admin" : "user";
  const planChanged = plan !== (customer.plan ?? "free");
  const roleChanged = nextRole !== customer.role;
  const loansChanged = loansEnabled !== customer.loansEnabled;
  const hasChanges = planChanged || roleChanged || loansChanged;

  function save() {
    setConfirmOpen(false);
    const formData = new FormData();
    formData.set("userId", customer.id);
    formData.set("plan", plan);
    formData.set("role", nextRole);
    formData.set("loansEnabled", String(loansEnabled));

    startTransition(async () => {
      const result = await updateCustomerAccessAction(formData);
      if (result.ok) {
        notify.success(result.message ?? "Atualizado.");
        router.refresh();
        onDone();
      } else {
        notify.error(result.error);
      }
    });
  }

  function handleSave() {
    if (roleChanged) {
      setConfirmOpen(true);
      return;
    }
    save();
  }

  return (
    <>
      <DialogHeader className="flex-row items-center gap-3 space-y-0 text-left">
        <UserAvatar name={customer.name} imageUrl={customer.avatarUrl} size="xl" />
        <div className="min-w-0">
          <DialogTitle className="truncate text-lg">{customer.name}</DialogTitle>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
            <Mail className="size-3.5 shrink-0" aria-hidden />
            {customer.email}
          </p>
          <span
            className={
              customer.role === "admin"
                ? "mt-1.5 inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-500/15 px-2 py-0.5 text-[0.6875rem] font-semibold text-violet-700 dark:text-violet-300"
                : "mt-1.5 inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[0.6875rem] font-medium text-muted-foreground"
            }
          >
            {customer.role === "admin" ? (
              <>
                <ShieldCheck className="size-3" aria-hidden /> Admin
              </>
            ) : (
              "Cliente"
            )}
          </span>
        </div>
      </DialogHeader>

      <div className="px-1">
        <InfoRow label="Cadastro" value={dateFormatter.format(new Date(customer.createdAt))} />
        <InfoRow
          label="E-mail verificado"
          value={customer.emailVerified ? "Sim" : "Não"}
        />
        <InfoRow
          label="Onboarding"
          value={customer.onboardingComplete ? "Concluído" : "Pendente"}
        />
        <InfoRow
          label="Créditos de lançamentos"
          value={
            <span className="inline-flex items-center gap-1.5">
              <Coins className="size-3.5 text-amber-500" aria-hidden />
              {customer.entryCredits}
            </span>
          }
        />
        <InfoRow
          label="Acesso trial"
          value={
            trialActive ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Rocket className="size-3.5" aria-hidden />
                até {dateFormatter.format(new Date(customer.trialExpiresAt!))}
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )
          }
        />
        <InfoRow label="Profissão" value={customer.profession || "—"} />
        <InfoRow
          label="Renda fixa"
          value={customer.fixedMonthlyIncome > 0 ? currency.format(customer.fixedMonthlyIncome) : "—"}
        />
        <InfoRow
          label="Forma de pagamento"
          value={<span className="text-muted-foreground">— (Stripe)</span>}
        />
        <InfoRow
          label="Vencimento"
          value={<span className="text-muted-foreground">— (Stripe)</span>}
        />
      </div>

      <div className="mt-1 space-y-4 rounded-xl border border-border bg-muted/30 p-4 dark:border-white/[0.06]">
        <div className="space-y-1.5">
          <Label htmlFor="admin-plan">Plano</Label>
          <FormSelect
            id="admin-plan"
            name="plan"
            options={PLAN_OPTIONS}
            value={plan}
            onValueChange={(value) => setPlan(value as SubscriptionPlan)}
          />
        </div>

        <label
          className={
            "flex items-start gap-3 rounded-lg border border-border p-3 dark:border-white/[0.06]" +
            (isSelf ? " opacity-60" : " cursor-pointer")
          }
        >
          <Checkbox
            checked={isAdminRole}
            onCheckedChange={(checked) => setIsAdminRole(checked === true)}
            disabled={isSelf}
            className="mt-0.5"
          />
          <span className="text-sm">
            <span className="font-medium">Conta admin (acesso master)</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {isSelf
                ? "Você não pode remover seu próprio acesso admin."
                : "Libera o painel admin e todas as funcionalidades."}
            </span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 dark:border-white/[0.06]">
          <Checkbox
            checked={loansEnabled}
            onCheckedChange={(checked) => setLoansEnabled(checked === true)}
            className="mt-0.5"
          />
          <span className="text-sm">
            <span className="font-medium">Liberar módulo Emprestei</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Recurso oculto por padrão. Marque para liberar empréstimos a pessoas
              para este cliente.
            </span>
          </span>
        </label>

        <Button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || isPending}
          className="btn-brand w-full"
        >
          {isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>

      <div className="mt-3 space-y-3 rounded-xl border border-border bg-muted/30 p-4 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Coins className="size-4 text-amber-500" aria-hidden />
          <h3 className="text-sm font-medium">Liberar créditos de lançamentos</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Concede lançamentos extras além do limite mensal do plano Gratuito (5/mês).
          Saldo atual: <span className="font-medium text-foreground">{customer.entryCredits}</span>.
          Use um valor negativo para corrigir. Tudo fica registrado no histórico.
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="credit-amount">Quantidade</Label>
            <input
              id="credit-amount"
              type="number"
              inputMode="numeric"
              value={creditAmount}
              onChange={(event) => setCreditAmount(event.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none transition-colors focus:border-brand/40 focus:ring-2 focus:ring-brand/15 dark:border-white/[0.08] dark:bg-card/60"
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="credit-reason">Motivo (opcional)</Label>
            <input
              id="credit-reason"
              type="text"
              maxLength={200}
              value={creditReason}
              onChange={(event) => setCreditReason(event.target.value)}
              placeholder="Ex.: cortesia de teste"
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand/40 focus:ring-2 focus:ring-brand/15 dark:border-white/[0.08] dark:bg-card/60"
            />
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={grantCredits}
          disabled={isGranting}
          className="w-full"
        >
          {isGranting ? "Registrando..." : "Registrar créditos"}
        </Button>
      </div>

      <div className="mt-3 space-y-3 rounded-xl border border-border bg-muted/30 p-4 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Rocket className="size-4 text-emerald-500" aria-hidden />
          <h3 className="text-sm font-medium">Liberar acesso completo (trial)</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Dá acesso a todo o sistema (Premium) por tempo limitado, sem mexer no plano real.
          {trialActive ? (
            <>
              {" "}
              Ativo até{" "}
              <span className="font-medium text-foreground">
                {dateFormatter.format(new Date(customer.trialExpiresAt!))}
              </span>
              .
            </>
          ) : (
            " Nenhum trial ativo no momento."
          )}
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-24 space-y-1.5">
            <Label htmlFor="trial-days">Dias</Label>
            <input
              id="trial-days"
              type="number"
              inputMode="numeric"
              min={1}
              value={trialDays}
              onChange={(event) => setTrialDays(event.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none transition-colors focus:border-brand/40 focus:ring-2 focus:ring-brand/15 dark:border-white/[0.08] dark:bg-card/60"
            />
          </div>
          <Button
            type="button"
            onClick={() => applyTrial(Math.max(1, Math.trunc(Number(trialDays) || 0)))}
            disabled={isTrialing}
            className="btn-brand flex-1"
          >
            {isTrialing ? "Liberando..." : `Liberar ${Math.max(1, Math.trunc(Number(trialDays) || 0))} dias`}
          </Button>
          {trialActive && (
            <Button
              type="button"
              variant="outline"
              onClick={() => applyTrial(0)}
              disabled={isTrialing}
            >
              Remover
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar mudança de acesso</AlertDialogTitle>
            <AlertDialogDescription>
              {nextRole === "admin"
                ? `Tornar ${customer.name} um administrador? Ele passará a ver os dados de todos os clientes e ter acesso total ao sistema.`
                : `Remover o acesso admin de ${customer.name}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="btn-brand" onClick={save}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function CustomerDetailDialog({
  customer,
  open,
  onOpenChange,
  currentAdminId,
}: {
  customer: AdminCustomer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAdminId: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] gap-3 overflow-y-auto sm:max-w-lg">
        {customer && (
          <CustomerDetailForm
            key={customer.id}
            customer={customer}
            currentAdminId={currentAdminId}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
