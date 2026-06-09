"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="flex size-16 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive">
          <AlertTriangle className="size-8" aria-hidden />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">
          Algo deu errado
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tivemos um problema ao carregar esta página. Você pode tentar de novo
          ou voltar para o início.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-muted-foreground/70">
            Código do erro: {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset} className="btn-brand gap-2" size="lg">
            <RotateCcw className="size-4" aria-hidden />
            Tentar novamente
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 rounded-xl">
            <Link href="/dashboard">
              <Home className="size-4" aria-hidden />
              Ir para o início
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
