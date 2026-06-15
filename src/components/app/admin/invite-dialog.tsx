"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, Ticket, Trash2, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/ui/form-select";
import { Label } from "@/components/ui/label";
import { sendInviteAction, revokeInviteAction } from "@/lib/actions/admin";
import { getPlanLabel } from "@/lib/plans";
import type { PendingInvitation } from "@/lib/auth/invitation";
import { notify } from "@/lib/toast";

// Radix Select não aceita value="" — usamos o sentinel "any" para "sem plano".
const ANY_PLAN = "any";

const PLAN_OPTIONS = [
  { value: ANY_PLAN, label: "Deixar o convidado escolher" },
  { value: "free", label: "Gratuito" },
  { value: "plus", label: "Plus" },
  { value: "premium", label: "Premium IA" },
];

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function InviteDialog({ invitations }: { invitations: PendingInvitation[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState(ANY_PLAN);
  const [isSending, startSending] = useTransition();
  const [isRevoking, startRevoking] = useTransition();

  function send() {
    if (!email.trim()) {
      notify.error("Informe o e-mail do convidado.");
      return;
    }
    const formData = new FormData();
    formData.set("email", email.trim());
    formData.set("plan", plan === ANY_PLAN ? "" : plan);

    startSending(async () => {
      const result = await sendInviteAction(formData);
      if (result.ok) {
        notify.success(result.message ?? "Convite enviado.");
        setEmail("");
        setPlan(ANY_PLAN);
        router.refresh();
      } else {
        notify.error(result.error);
      }
    });
  }

  function revoke(id: string) {
    const formData = new FormData();
    formData.set("id", id);
    startRevoking(async () => {
      const result = await revokeInviteAction(formData);
      if (result.ok) {
        notify.success(result.message ?? "Convite revogado.");
        router.refresh();
      } else {
        notify.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="btn-brand gap-2">
          <UserPlus className="size-4" aria-hidden />
          Convidar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] gap-4 overflow-y-auto sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="size-5 text-brand" aria-hidden />
            Convidar para o sistema
          </DialogTitle>
          <DialogDescription>
            Envie um convite por e-mail. Você pode já definir o plano ou deixar o
            convidado escolher no cadastro.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4 dark:border-white/[0.06]">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">E-mail do convidado</Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="convidado@email.com"
                className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-brand/40 focus:ring-2 focus:ring-brand/15 dark:border-white/[0.08] dark:bg-card/60"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invite-plan">Plano</Label>
            <FormSelect
              id="invite-plan"
              name="plan"
              options={PLAN_OPTIONS}
              value={plan}
              onValueChange={setPlan}
            />
          </div>

          <Button
            type="button"
            onClick={send}
            disabled={isSending}
            className="btn-brand w-full"
          >
            {isSending ? "Enviando..." : "Enviar convite"}
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            Convites pendentes {invitations.length > 0 && `(${invitations.length})`}
          </h3>
          {invitations.length === 0 ? (
            <p className="rounded-lg border border-border bg-card py-4 text-center text-xs text-muted-foreground dark:border-white/[0.06]">
              Nenhum convite pendente.
            </p>
          ) : (
            <ul className="space-y-2">
              {invitations.map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 text-sm dark:border-white/[0.06]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {inv.plan ? getPlanLabel(inv.plan) : "Plano à escolha"} · expira em{" "}
                      {dateFormatter.format(new Date(inv.expiresAt))}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => revoke(inv.id)}
                    disabled={isRevoking}
                    aria-label={`Revogar convite de ${inv.email}`}
                    title="Revogar convite"
                    className="shrink-0 text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
