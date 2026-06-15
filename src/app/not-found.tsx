import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="flex size-16 items-center justify-center rounded-2xl border border-brand/30 bg-brand/10 text-brand">
          <Compass className="size-8" aria-hidden />
        </div>
        <p className="mt-6 text-5xl font-black tracking-tight text-brand">404</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          Página não encontrada
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O endereço que você tentou acessar não existe ou foi movido.
        </p>
        <div className="mt-8">
          <Button asChild className="btn-brand gap-2" size="lg">
            <Link href="/dashboard">
              <Home className="size-4" aria-hidden />
              Voltar para o início
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
