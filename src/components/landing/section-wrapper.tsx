"use client";

import ShinyText from "@/components/ShinyText";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  variant?: "default" | "muted" | "accent";
}

export function SectionWrapper({
  children,
  className,
  id,
  variant = "default",
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn("relative py-12 md:py-20 lg:py-28", className)}
    >
      {variant !== "default" && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 -z-[1]",
            variant === "muted" &&
              "bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,var(--tw-gradient-stops))] from-foreground/[0.04] via-foreground/[0.02] to-transparent",
            variant === "accent" &&
              "bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,var(--tw-gradient-stops))] from-brand/[0.08] via-brand/[0.03] to-transparent",
          )}
        />
      )}
      <div className="landing-container">{children}</div>
    </section>
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-12 max-w-3xl md:mb-16",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow && (
        <div className="mb-3">
          <ShinyText
            text={eyebrow.toUpperCase()}
            speed={4}
            color="var(--brand-text)"
            shineColor="#8b5cf6"
            className="text-sm font-semibold tracking-wider"
          />
        </div>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
