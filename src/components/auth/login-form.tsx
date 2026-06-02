"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { AuthField } from "@/components/auth/auth-field";
import { signInAction, type AuthState } from "@/lib/actions/auth";
import { notify } from "@/lib/toast";

const initialState: AuthState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  useEffect(() => {
    if (state.error) notify.error(state.error);
  }, [state.error]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <AuthField
        id="login-email"
        name="email"
        label="E-MAIL"
        type="email"
        placeholder="seu@email.com"
        icon={Mail}
        autoComplete="email"
        required
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.4em" }}>
        <AuthField
          id="login-password"
          name="password"
          label="SENHA"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          autoComplete="current-password"
          required
          revealToggle
        />
        <button
          type="button"
          className="self-end font-medium tracking-wide text-brand transition-opacity hover:opacity-80"
          style={{ fontSize: "0.8em" }}
          title="Em breve"
        >
          Esqueceu a senha?
        </button>
      </div>

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
        {pending ? "Entrando..." : "Entrar"}
        {!pending && <ArrowRight style={{ width: "1.1em", height: "1.1em" }} aria-hidden />}
      </button>

      <p className="text-center text-white/50" style={{ fontSize: "0.9em", paddingTop: "0.25em" }}>
        Novo por aqui?{" "}
        <Link href="/cadastro" className="font-semibold text-brand hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
