import { DEVELOPER_CREDIT } from "@/lib/brand";
import { cn } from "@/lib/utils";

type FooterCopyrightProps = {
  variant?: "default" | "auth";
  className?: string;
};

export function FooterCopyright({ variant = "default", className }: FooterCopyrightProps) {
  const isAuth = variant === "auth";

  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        isAuth ? "text-[11px] text-white/45 sm:text-xs" : "text-sm text-muted-foreground",
        className,
      )}
    >
      <p>© {new Date().getFullYear()} FinIA Control. Todos os direitos reservados.</p>
      <p>
        Desenvolvido por{" "}
        <a
          href={DEVELOPER_CREDIT.linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "font-medium transition-colors",
            isAuth ? "text-emerald-400/80 hover:text-emerald-400" : "text-brand hover:underline",
          )}
        >
          {DEVELOPER_CREDIT.name}
        </a>
      </p>
    </div>
  );
}
