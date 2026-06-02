"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { AuthField } from "@/components/auth/auth-field";
import { signUpAction, type AuthState } from "@/lib/actions/auth";
import { notify } from "@/lib/toast";

const initialState: AuthState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  useEffect(() => {
    if (state.error) notify.error(state.error);
  }, [state.error]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
