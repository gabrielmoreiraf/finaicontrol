"use client";

import { useActionState, useEffect, useState } from "react";
import { Briefcase, Lock, Mail, Pencil, PiggyBank, Save, User, X } from "lucide-react";
import { SettingsField, settingsInputClass } from "@/components/app/settings-field";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { updateProfileAction, type ProfileState } from "@/lib/actions/profile";
import { notify, TOAST_MESSAGES } from "@/lib/toast";
import { cn } from "@/lib/utils";

const initialState: ProfileState = {};

const lockedInputClass = "cursor-default text-muted-foreground";

export function ProfileForm({
  email,
  emailVerified,
  defaultName,
  defaultProfession,
  defaultIncome,
}: {
  email: string;
  emailVerified: boolean;
  defaultName: string;
  defaultProfession: string;
  defaultIncome: number;
}) {
  const [editing, setEditing] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  useEffect(() => {
    if (state.error) notify.error(state.error);
    if (state.success) {
      notify.success(state.message ?? TOAST_MESSAGES.profile.updated);
      setEditing(false);
    }
  }, [state.error, state.success, state.message]);

  function handleCancel() {
    setEditing(false);
    setFormKey((key) => key + 1);
  }

  return (
    <form key={formKey} action={formAction} className="space-y-4">
      <SettingsField
        id="email"
        label="E-mail"
        icon={Mail}
        trailing={
          emailVerified ? (
            <span className="inline-flex items-center gap-0.5 rounded-full border border-brand/30 bg-brand/15 px-2 py-0.5 text-[10px] font-semibold text-brand">
              Verificado ✓
            </span>
          ) : null
        }
      >
        <input
          id="email"
          type="email"
          value={email}
          readOnly
          tabIndex={-1}
          className={cn(settingsInputClass, lockedInputClass, "truncate")}
        />
      </SettingsField>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3 shrink-0" aria-hidden />
          {editing ? "Modo de edição ativo" : "Dados pessoais bloqueados"}
        </p>
        {!editing && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 gap-1.5 rounded-lg text-brand hover:bg-brand/10 hover:text-brand"
            onClick={() => setEditing(true)}
          >
            <Pencil className="size-3.5" aria-hidden />
            Editar
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SettingsField id="name" label="Nome" icon={User}>
          <input
            id="name"
            name="name"
            defaultValue={defaultName}
            required={editing}
            readOnly={!editing}
            tabIndex={editing ? 0 : -1}
            className={cn(settingsInputClass, !editing && lockedInputClass)}
          />
        </SettingsField>

        <SettingsField id="profession" label="Profissão" icon={Briefcase}>
          <input
            id="profession"
            name="profession"
            defaultValue={defaultProfession}
            placeholder="Ex: Designer, Desenvolvedor, Empresário"
            readOnly={!editing}
            tabIndex={editing ? 0 : -1}
            className={cn(settingsInputClass, !editing && lockedInputClass)}
          />
        </SettingsField>
      </div>

      <SettingsField id="fixedMonthlyIncome" label="Renda fixa mensal" icon={PiggyBank}>
        <CurrencyInput
          id="fixedMonthlyIncome"
          name="fixedMonthlyIncome"
          defaultValue={defaultIncome}
          placeholder="R$ 0,00"
          disabled={!editing}
          embedded
        />
      </SettingsField>

      {state.error && editing && <p className="text-sm text-destructive">{state.error}</p>}

      {editing && (
        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:gap-3">
          <Button type="submit" className="btn-brand rounded-xl gap-2" disabled={pending}>
            <Save className="size-4" aria-hidden />
            {pending ? "Salvando..." : "Salvar alterações"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-white/10"
            disabled={pending}
            onClick={handleCancel}
          >
            <X className="size-4" aria-hidden />
            Cancelar
          </Button>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground sm:ml-auto">
            <Lock className="size-3 shrink-0" aria-hidden />
            Alterações salvas com segurança
          </p>
        </div>
      )}
    </form>
  );
}
