import { Loader2 } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="size-7 animate-spin text-brand" aria-hidden />
        <p className="text-sm">Carregando...</p>
        <span className="sr-only" role="status" aria-live="polite">
          Carregando conteúdo
        </span>
      </div>
    </div>
  );
}
