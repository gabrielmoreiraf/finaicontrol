"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, ShieldCheck } from "lucide-react";
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
import { updateCustomerAccessAction } from "@/lib/actions/admin";
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
  const [plan, setPlan] = useState<SubscriptionPlan>(customer.plan ?? "free");
  const [isAdminRole, setIsAdminRole] = useState(customer.role === "admin");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isSelf = customer.id === currentAdminId;
  const nextRole = isAdminRole ? "admin" : "user";
  const planChanged = plan !== (customer.plan ?? "free");
  const roleChanged = nextRole !== customer.role;
  const hasChanges = planChanged || roleChanged;

  function save() {
    setConfirmOpen(false);
    const formData = new FormData();
    formData.set("userId", customer.id);
    formData.set("plan", plan);
    formData.set("role", nextRole);

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
        <InfoRow label="Profissão" value={customer.profession || "—"} />
        <InfoRow
          label="Renda fixa"
          value={customer.fixedMonthlyIncome > 0 ? currency.format(customer.fixedMonthlyIncome) : "—"}
        />
        <InfoRow
          label="Outras rendas"
          value={
            [
              customer.hasVariableIncome ? "Variável" : null,
              customer.hasExtraIncome ? "Extra" : null,
            ]
              .filter(Boolean)
              .join(" · ") || "—"
          }
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

        <Button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || isPending}
          className="btn-brand w-full"
        >
          {isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
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
