import Link from "next/link";
import { BRAND_ASSETS } from "@/lib/brand";

/** Logo de login/cadastro: img nativa evita wrappers/alturas extras do Next/Image. */
export function AuthBrandMark() {
  return (
    <Link
      href="/"
      className="auth-brand-mark block w-full transition-opacity hover:opacity-90"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BRAND_ASSETS.logo}
        alt={BRAND_ASSETS.name}
        width={2000}
        height={2000}
        decoding="async"
        fetchPriority="high"
        className="auth-brand-mark__img"
      />
    </Link>
  );
}
