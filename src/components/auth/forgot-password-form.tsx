"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { AuthField } from "@/components/auth/auth-field";
import {
  requestPasswordResetAction,
  type RequestResetState,
} from "@/lib/actions/password-reset";
import { notify } from "@/lib/toast";

const initialState: RequestResetState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  useEffect(() => {
    if (state.error) notify.error(state.error);
    if (state.success) notify.success(state.success);
  }, [state.error, state.success]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="text-white/70" style={{ fontSize: "0.95em", lineHeight: 1.5 }}>
        Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova
        senha.
      </p>

      <AuthField
        id="forgot-email"
        name="email"
        label="E-MAIL"
        type="email"
        placeholder="seu@email.com"
        icon={Mail}
        autoComplete="email"
        required
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

      {state.success && (
        <p
          className="rounded-lg border border-brand/30 bg-brand/10 text-brand"
          style={{ fontSize: "0.9em", padding: "0.5em 0.75em" }}
        >
          {state.success}
        </p>
      )}

      {state.devResetUrl && (
        <div
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200"
          style={{ fontSize: "0.85em", padding: "0.75em" }}
        >
          <p className="font-semibold">Redefinição manual (desenvolvimento)</p>
          <p className="mt-1 text-white/70">
            Resend não está configurado. Use o link abaixo para redefinir a senha:
          </p>
          <a
            href={state.devResetUrl}
            className="mt-2 block break-all font-medium text-brand hover:underline"
          >
            {state.devResetUrl}
          </a>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="auth-submit-btn flex w-full items-center justify-center rounded-xl bg-brand font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ gap: "0.5em", paddingTop: "0.95em", paddingBottom: "0.95em", fontSize: "0.95em" }}
      >
        {pending ? "Enviando..." : "Enviar link de redefinição"}
        {!pending && <ArrowRight style={{ width: "1.1em", height: "1.1em" }} aria-hidden />}
      </button>

      <p className="text-center text-white/50" style={{ fontSize: "0.9em", paddingTop: "0.25em" }}>
        Lembrou a senha?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
