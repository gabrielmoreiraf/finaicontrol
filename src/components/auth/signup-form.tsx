"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Lock, Mail, Ticket, User } from "lucide-react";
import { AuthField } from "@/components/auth/auth-field";
import { signUpAction, type AuthState } from "@/lib/actions/auth";
import type { SubscriptionPlan } from "@/types/finance";
import { notify } from "@/lib/toast";

const initialState: AuthState = {};

type InviteInfo = { token: string; email: string; plan: SubscriptionPlan | null };

export function SignupForm({ invite = null }: { invite?: InviteInfo | null }) {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  useEffect(() => {
    if (state.error) notify.error(state.error);
  }, [state.error]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {invite && <input type="hidden" name="inviteToken" value={invite.token} />}

      {invite && (
        <p
          className="flex items-start gap-2 rounded-xl border border-brand/30 bg-brand/10 text-white/80"
          style={{ fontSize: "0.82em", lineHeight: 1.45, padding: "0.6em 0.8em" }}
        >
          <Ticket className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
          <span>
            Convite válido para <span className="font-medium text-white">{invite.email}</span>.
            Seu e-mail já vem confirmado.
          </span>
        </p>
      )}

      <AuthField
        id="name"
        name="name"
        label="NOME"
        placeholder="Como podemos te chamar?"
        icon={User}
        autoComplete="name"
        required
      />

      <AuthField
        id="email"
        name="email"
        label="E-MAIL"
        type="email"
        placeholder="seu@email.com"
        icon={Mail}
        autoComplete="email"
        required
        defaultValue={invite?.email}
        readOnly={Boolean(invite)}
      />

      <AuthField
        id="password"
        name="password"
        label="SENHA"
        type="password"
        placeholder="Mínimo de 6 caracteres"
        icon={Lock}
        autoComplete="new-password"
        minLength={6}
        required
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

      <label
        className="flex items-start gap-2 text-white/60"
        style={{ fontSize: "0.82em", lineHeight: 1.45 }}
      >
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 size-4 shrink-0 accent-brand"
        />
        <span>
          Li e aceito a{" "}
          <span className="font-medium text-brand">Política de Privacidade</span> e os{" "}
          <span className="font-medium text-brand">Termos de Uso</span>, e autorizo o
          tratamento dos meus dados conforme descrito.
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="auth-submit-btn flex w-full items-center justify-center rounded-xl bg-brand font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ gap: "0.5em", paddingTop: "0.95em", paddingBottom: "0.95em", fontSize: "0.95em" }}
      >
        {pending ? "Criando conta..." : "Criar conta"}
        {!pending && <ArrowRight style={{ width: "1.1em", height: "1.1em" }} aria-hidden />}
      </button>

      <p className="text-center text-white/50" style={{ fontSize: "0.9em", paddingTop: "0.25em" }}>
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
