import { cn } from "@/lib/utils";

export function DashboardPanel({
  children,
  className,
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-card/90 shadow-sm backdrop-blur-sm",
        glow && "before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-brand/10 before:via-transparent before:to-transparent",
        className,
      )}
    >
      <div className="relative">{children}</div>
    </div>
  );
}
