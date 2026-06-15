"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error-boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-white/10 bg-white/[0.02] p-8">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive">
          <AlertTriangle className="size-7" aria-hidden />
        </div>
        <h1 className="mt-5 text-xl font-bold text-foreground">
          Não foi possível carregar
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ocorreu um erro ao montar esta tela. Tente novamente — seus dados estão
          seguros.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-muted-foreground/70">
            Código: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset} className="btn-brand gap-2">
            <RotateCcw className="size-4" aria-hidden />
            Tentar novamente
          </Button>
          <Button asChild variant="outline" className="gap-2 rounded-xl border-white/10">
            <Link href="/dashboard">
              <Home className="size-4" aria-hidden />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
