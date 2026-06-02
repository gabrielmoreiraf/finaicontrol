"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { BRAND_ASSETS } from "@/lib/brand";
import { navAuthLinks, navLinks } from "@/lib/landing-data";
import { cn } from "@/lib/utils";

const PillNav = dynamic(() => import("@/components/PillNav"), { ssr: false });

const pillNavColors = {
  baseColor: "#10b981",
  pillColor: "transparent",
  pillTextColor: "#e5e7eb",
  hoveredPillTextColor: "#022c22",
} as const;

const allMobileLinks = [...navLinks, ...navAuthLinks];

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string>();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  useEffect(() => {
    const sectionIds = navLinks
      .map((link) => link.href.replace("#", ""))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveHref(`#${visible.target.id}`);
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5] },
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-[100]">
      {/* Mobile */}
      <div className="w-full md:hidden">
        <div
          className={cn(
            "flex h-12 items-center justify-between gap-3 border-b px-3 backdrop-blur-xl",
            "border-border/60 bg-background/95 dark:border-white/10 dark:bg-background/95",
            "pt-[max(0px,env(safe-area-inset-top))]",
          )}
        >
          <BrandLogo
            variant="icon"
            size="sm"
            href="/"
            priority
            className="!w-auto shrink-0"
          />
          <button
            type="button"
            className="relative z-10 flex size-11 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-border/60 bg-muted/50 text-foreground active:scale-[0.98] dark:border-white/10 dark:bg-white/[0.08]"
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-menu"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {menuOpen && (
          <nav
            id="landing-mobile-menu"
            className="max-h-[min(70vh,calc(100dvh-3rem))] overflow-y-auto border-b border-border/60 bg-background px-3 py-3 dark:border-white/10"
          >
            <ul className="flex flex-col gap-0.5">
              {allMobileLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex min-h-11 touch-manipulation items-center rounded-lg px-3 text-[0.9375rem] font-medium transition-colors",
                      activeHref === item.href
                        ? "bg-brand/15 text-brand"
                        : "text-foreground active:bg-muted/60",
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/cadastro"
              className="mt-3 flex min-h-11 touch-manipulation items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white active:bg-brand-dark"
              onClick={() => setMenuOpen(false)}
            >
              Começar agora
            </Link>
          </nav>
        )}
      </div>

      {/* Desktop */}
      <div className="pointer-events-none hidden justify-center px-4 pt-4 sm:pt-5 md:flex">
        <div
          className={cn(
            "pointer-events-auto flex w-max max-w-[calc(100%-1rem)] items-center gap-1.5 rounded-full border p-1.5",
            "border-emerald-400/12 bg-emerald-500/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl",
          )}
        >
          {mounted ? (
            <>
              <PillNav
                logo={BRAND_ASSETS.icon}
                logoAlt={BRAND_ASSETS.name}
                homeHref="/"
                items={navLinks}
                mobileItems={navAuthLinks}
                activeHref={activeHref}
                className="pill-nav--finia pill-nav--glass"
                ease="power2.easeOut"
                baseColor={pillNavColors.baseColor}
                pillColor={pillNavColors.pillColor}
                pillTextColor={pillNavColors.pillTextColor}
                hoveredPillTextColor={pillNavColors.hoveredPillTextColor}
                initialLoadAnimation
                containerClassName="pill-nav-container--header"
              />

              <div className="mx-0.5 h-6 w-px bg-white/10" />

              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href="/login"
                  className="inline-flex h-9 items-center justify-center rounded-full px-3.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-white/10"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="inline-flex h-9 items-center justify-center rounded-full bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  Começar agora
                </Link>
              </div>
            </>
          ) : (
            <div className="h-9 w-44 rounded-full" aria-hidden />
          )}
        </div>
      </div>
    </header>
  );
}
