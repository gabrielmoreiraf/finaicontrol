"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { Mail, RefreshCw } from "lucide-react";
import {
  resendVerificationEmailAction,
  type VerifyEmailState,
} from "@/lib/actions/verify-email";
import { notify } from "@/lib/toast";

const initialState: VerifyEmailState = {};

type VerifyEmailPendingProps = {
  email: string;
  emailSent?: boolean;
  devVerificationUrl?: string | null;
  errorMessage?: string | null;
};

export function VerifyEmailPending({
  email,
  emailSent = true,
  devVerificationUrl,
  errorMessage,
}: VerifyEmailPendingProps) {
  const [state, formAction, pending] = useActionState(
    resendVerificationEmailAction,
    initialState,
  );

  useEffect(() => {
    if (state.error) notify.error(state.error);
    if (state.success) notify.success(state.success);
  }, [state.error, state.success]);

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex items-center justify-center rounded-xl border border-brand/30 bg-brand/10"
        style={{ padding: "1.25em" }}
      >
        <Mail className="text-brand" style={{ width: "2em", height: "2em" }} aria-hidden />
      </div>

      <p className="text-center text-white/70" style={{ fontSize: "0.95em", lineHeight: 1.5 }}>
        {emailSent ? (
          <>
            Enviamos um link de confirmação para{" "}
            <span className="font-semibold text-white">{email}</span>. Abra o e-mail e clique no
            link para ativar sua conta.
          </>
        ) : (
          <>
            Não foi possível enviar o e-mail para{" "}
            <span className="font-semibold text-white">{email}</span>.{" "}
            {devVerificationUrl
              ? "Use o link de confirmação abaixo para ativar sua conta."
              : "Tente reenviar ou use o e-mail vinculado à sua conta Resend."}
          </>
        )}
      </p>

      {(errorMessage || state.error) && (
        <p
          className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-300"
          style={{ fontSize: "0.9em", padding: "0.5em 0.75em" }}
        >
          {errorMessage ?? state.error}
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

      {devVerificationUrl && (
        <div
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200"
          style={{ fontSize: "0.85em", padding: "0.75em" }}
        >
          <p className="font-semibold">Confirmação manual (desenvolvimento)</p>
          <p className="mt-1 text-white/70">
            No modo de teste do Resend, e-mails só chegam na conta vinculada ao serviço. Use o link
            abaixo para confirmar:
          </p>
          <a
            href={devVerificationUrl}
            className="mt-2 block break-all font-medium text-brand hover:underline"
          >
            {devVerificationUrl}
          </a>
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          disabled={pending}
          className="auth-submit-btn flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 font-semibold text-white transition-opacity hover:bg-white/10 disabled:opacity-60"
          style={{ gap: "0.5em", paddingTop: "0.85em", paddingBottom: "0.85em", fontSize: "0.9em" }}
        >
          <RefreshCw style={{ width: "1em", height: "1em" }} aria-hidden />
          {pending ? "Reenviando..." : "Reenviar e-mail de confirmação"}
        </button>
      </form>

      <p className="text-center text-white/50" style={{ fontSize: "0.9em" }}>
        Já confirmou?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
