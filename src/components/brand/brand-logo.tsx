import Image from "next/image";
import Link from "next/link";
import { BRAND_ASSETS } from "@/lib/brand";
import { cn } from "@/lib/utils";

type BrandLogoSize = "sm" | "md" | "lg" | "xl";

interface BrandLogoProps {
  variant?: "icon" | "full";
  /** Tamanho base (preset compartilhado). Para um tamanho exclusivo de um
   *  local, NÃO altere o preset: passe `imageClassName` com a altura desejada
   *  (ex.: "h-64 w-auto"), que sobrescreve o preset via tailwind-merge. */
  size?: BrandLogoSize;
  /** Link de navegação. Passe `null` para renderizar sem link (não clicável). */
  href?: string | null;
  className?: string;
  /** Classes aplicadas à imagem. Sobrescrevem o tamanho do preset neste local. */
  imageClassName?: string;
  priority?: boolean;
  /** Fundo escuro fixo (ex.: login): uma imagem só, evita altura fantasma entre variantes. */
  preferOnDark?: boolean;
}

const sizeStyles: Record<
  BrandLogoSize,
  { icon: string; full: string; iconPx: number; fullW: number; fullH: number }
> = {
  sm: {
    icon: "h-9 w-9",
    full: "h-9 w-auto max-w-[200px] sm:h-10 sm:max-w-[220px]",
    iconPx: 36,
    fullW: 200,
    fullH: 48,
  },
  md: {
    icon: "h-10 w-10",
    full: "h-11 w-auto max-w-[240px] sm:h-12 sm:max-w-[260px]",
    iconPx: 40,
    fullW: 260,
    fullH: 56,
  },
  lg: {
    icon: "h-12 w-12",
    full: "h-16 w-auto max-w-[300px] sm:h-[4.5rem] sm:max-w-[360px]",
    iconPx: 48,
    fullW: 360,
    fullH: 72,
  },
  xl: {
    icon: "h-20 w-20",
    full: "h-24 w-auto max-w-[min(100%,560px)] sm:h-28 sm:max-w-[680px] xl:h-32 xl:max-w-[760px]",
    iconPx: 80,
    fullW: 760,
    fullH: 224,
  },
};

export function BrandLogo({
  variant = "full",
  size = "sm",
  href = "/",
  className,
  imageClassName,
  priority = false,
  preferOnDark = false,
}: BrandLogoProps) {
  const isIcon = variant === "icon";
  const styles = sizeStyles[size];

  const image = !isIcon && preferOnDark ? (
    <Image
      src={BRAND_ASSETS.logo}
      alt={BRAND_ASSETS.name}
      width={styles.fullW}
      height={styles.fullH}
      priority={priority}
      className={cn("object-contain", styles.full, imageClassName)}
    />
  ) : isIcon ? (
    <Image
      src={BRAND_ASSETS.icon}
      alt={BRAND_ASSETS.name}
      width={styles.iconPx}
      height={styles.iconPx}
      priority={priority}
      className={cn("object-contain", styles.icon, imageClassName)}
    />
  ) : (
    <>
      <Image
        src={BRAND_ASSETS.logoLight}
        alt={BRAND_ASSETS.name}
        width={styles.fullW}
        height={styles.fullH}
        priority={priority}
        className={cn("object-contain dark:hidden", styles.full, imageClassName)}
      />
      <Image
        src={BRAND_ASSETS.logo}
        alt={BRAND_ASSETS.name}
        width={styles.fullW}
        height={styles.fullH}
        priority={priority}
        className={cn("hidden object-contain dark:block", styles.full, imageClassName)}
      />
    </>
  );

  if (!href) {
    return (
      <span className={cn("inline-flex shrink-0 items-center", className)}>
        {image}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center justify-start transition-opacity hover:opacity-90",
        isIcon ? "w-auto" : "w-full max-w-full",
        className,
      )}
    >
      {image}
    </Link>
  );
}
