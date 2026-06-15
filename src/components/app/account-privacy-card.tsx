"use client";

import { useActionState, useEffect, useState } from "react";
import { Download, ShieldAlert, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteAccountAction, type DeleteAccountState } from "@/lib/actions/account";
import { notify } from "@/lib/toast";

const initialState: DeleteAccountState = {};

export function AccountPrivacyCard() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(deleteAccountAction, initialState);

  useEffect(() => {
    if (state.error) notify.error(state.error);
  }, [state.error]);

  return (
    <Card className="border-border/50 bg-card/80">
      <CardHeader>
        <CardTitle className="text-base">Privacidade e dados</CardTitle>
        <CardDescription>
          Exporte ou exclua seus dados pessoais a qualquer momento (LGPD).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Exportar meus dados</p>
            <p className="text-xs text-muted-foreground">
              Baixe um arquivo JSON com todas as suas informações.
            </p>
          </div>
          <Button asChild variant="outline" className="shrink-0 gap-1.5 rounded-xl border-white/10">
            <a href="/api/me/export" download>
              <Download className="size-4" aria-hidden />
              Exportar
            </a>
          </Button>
        </div>

        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
            <div className="flex-1">
              <p className="text-sm font-semibold text-destructive">Excluir minha conta</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Remove permanentemente sua conta e todos os dados (receitas, despesas,
                dívidas, metas e empréstimos). Esta ação é irreversível.
              </p>
              <Button
                variant="destructive"
                className="mt-3 gap-1.5"
                onClick={() => setOpen(true)}
              >
                <Trash2 className="size-4" aria-hidden />
                Excluir conta
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir conta permanentemente</DialogTitle>
            <DialogDescription>
              Digite sua senha para confirmar. Todos os seus dados serão apagados e não
              poderão ser recuperados.
            </DialogDescription>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="delete-password">Senha</Label>
              <Input
                id="delete-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>
            {state.error && (
              <p role="alert" className="text-sm text-destructive">
                {state.error}
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-white/10"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" className="gap-1.5" disabled={pending}>
                <Trash2 className="size-4" aria-hidden />
                {pending ? "Excluindo..." : "Excluir definitivamente"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
