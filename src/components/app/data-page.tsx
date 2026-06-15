import { cn } from "@/lib/utils";

/**
 * Layout de página de dados: ocupa a altura disponível e mantém o conteúdo
 * "de cabeça" (banners, cards, resumo) fixo. O último filho — normalmente uma
 * `ResourceTable` com `fillHeight` — recebe o espaço restante e rola por dentro.
 *
 * Para a altura resolver, depende do `AppShell` expor altura no container
 * principal (`min-h-full` + flex-col).
 */
export function DataPage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("data-page flex flex-col gap-4 lg:h-full lg:min-h-0", className)}>
      {children}
    </div>
  );
}
