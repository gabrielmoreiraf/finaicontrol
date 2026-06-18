"use client";

import { useActionState, useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, Lock, Pencil, Save, X } from "lucide-react";
import { SettingsField, settingsInputClass } from "@/components/app/settings-field";
import { PasswordChecklist } from "@/components/auth/password-checklist";
import { Button } from "@/components/ui/button";
import { changePasswordAction, type ProfileState } from "@/lib/actions/profile";
import { notify, TOAST_MESSAGES } from "@/lib/toast";

const initialState: ProfileState = {};

function SettingsPasswordField({
  id,
  label,
  name,
  autoComplete,
  minLength,
  onValueChange,
}: {
  id: string;
  label: string;
  name: string;
  autoComplete: string;
  minLength?: number;
  onValueChange?: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <SettingsField
      id={id}
      label={label}
      icon={Lock}
      trailing={
        <button
          type="button"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        >
          {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      }
    >
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required
        minLength={minLength}
        onChange={onValueChange ? (event) => onValueChange(event.target.value) : undefined}
        className={settingsInputClass}
      />
    </SettingsField>
  );
}

export function ChangePasswordForm() {
  const [editing, setEditing] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);

  useEffect(() => {
    if (state.error) notify.error(state.error);
    if (state.success) {
      notify.success(state.message ?? TOAST_MESSAGES.profile.passwordUpdated);
      // Reagimos ao resultado da server action (sistema externo) — setState aqui é intencional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditing(false);
      setFormKey((key) => key + 1);
      setNewPassword("");
    }
  }, [state.error, state.success, state.message]);

  function handleCancel() {
    setEditing(false);
    setFormKey((key) => key + 1);
  }

  return (
    <div className="space-y-4 border-t border-white/10 pt-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <KeyRound className="size-4 text-brand" aria-hidden />
          <h3 className="text-sm font-semibold">Alterar senha</h3>
        </div>
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

      {!editing ? (
        <p className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-xs text-muted-foreground">
          <Lock className="size-3 shrink-0" aria-hidden />
          Clique em editar para alterar sua senha com segurança.
        </p>
      ) : (
        <form key={formKey} action={formAction} className="space-y-4">
          <SettingsPasswordField
            id="currentPassword"
            name="currentPassword"
            label="Senha atual"
            autoComplete="current-password"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsPasswordField
              id="newPassword"
              name="newPassword"
              label="Nova senha"
              autoComplete="new-password"
              onValueChange={setNewPassword}
            />
            <SettingsPasswordField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirmar nova senha"
              autoComplete="new-password"
            />
          </div>

          <PasswordChecklist password={newPassword} className="sm:grid-cols-2" />

          <div className="flex flex-wrap gap-3">
            <Button type="submit" className="btn-brand rounded-xl gap-2" disabled={pending}>
              <Save className="size-4" aria-hidden />
              {pending ? "Alterando..." : "Salvar senha"}
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
          </div>
        </form>
      )}
    </div>
  );
}
