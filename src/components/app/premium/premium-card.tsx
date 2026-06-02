import { cn } from "@/lib/utils";

export function PremiumCard({
  children,
  className,
  glow = false,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "premium-card relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm backdrop-blur-xl dark:border-white/[0.06] dark:bg-card/80 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_8px_32px_-12px_rgba(0,0,0,0.45)]",
        hover &&
          "transition-all duration-300 hover:border-brand/30 hover:shadow-md dark:hover:border-brand/20 dark:hover:shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_12px_40px_-12px_rgba(0,230,118,0.12)]",
        glow && "premium-card-glow",
        className,
      )}
    >
      <div className="relative">{children}</div>
    </div>
  );
}
