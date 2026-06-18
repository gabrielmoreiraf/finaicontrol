"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { AuthField } from "@/components/auth/auth-field";
import { PasswordChecklist } from "@/components/auth/password-checklist";
import {
  resetPasswordAction,
  type ResetPasswordState,
} from "@/lib/actions/password-reset";
import { notify } from "@/lib/toast";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState,
  );
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (state.error) notify.error(state.error);
  }, [state.error]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />

      <p className="text-white/70" style={{ fontSize: "0.95em", lineHeight: 1.5 }}>
        Crie uma nova senha forte para sua conta.
      </p>

      <AuthField
        id="reset-password"
        name="password"
        label="NOVA SENHA"
        type="password"
        placeholder="••••••••"
        icon={Lock}
        autoComplete="new-password"
        required
        revealToggle
        onValueChange={setPassword}
      />
      <PasswordChecklist password={password} className="-mt-1" />

      <AuthField
        id="reset-password-confirm"
        name="confirmPassword"
        label="CONFIRMAR SENHA"
        type="password"
        placeholder="••••••••"
        icon={Lock}
        autoComplete="new-password"
        required
        minLength={6}
        revealToggle
      />

      {state.error && (
        <p
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-300"
          style={{ fontSize: "0.9em", padding: "0.5em 0.75em" }}
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="auth-submit-btn flex w-full items-center justify-center rounded-xl bg-brand font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ gap: "0.5em", paddingTop: "0.95em", paddingBottom: "0.95em", fontSize: "0.95em" }}
      >
        {pending ? "Salvando..." : "Redefinir senha"}
        {!pending && <ArrowRight style={{ width: "1.1em", height: "1.1em" }} aria-hidden />}
      </button>

      <p className="text-center text-white/50" style={{ fontSize: "0.9em", paddingTop: "0.25em" }}>
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Voltar para o login
        </Link>
      </p>
    </form>
  );
}
