"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { FooterCopyright } from "@/components/brand/footer-copyright";
import { footerLinks } from "@/lib/landing-data";

const columnTitleClass =
  "text-sm font-semibold uppercase tracking-wider text-foreground";

export function Footer() {
  return (
    <footer className="relative border-t border-border/40 bg-muted/20 backdrop-blur-xl dark:bg-black/40">
      <div className="landing-container py-14">
        <div className="grid w-full grid-cols-1 gap-y-10 md:grid-cols-3 md:grid-rows-[auto_auto] md:gap-x-12 md:gap-y-6 lg:gap-x-20">
          <div className="md:col-start-1 md:row-start-1">
            <BrandLogo
              variant="full"
              size="xl"
              priority
              imageClassName="object-left object-top"
            />
          </div>

          <div className="md:col-start-1 md:row-start-2">
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Plataforma financeira inteligente para pessoa física. Organize
              receitas, despesas, dívidas, empréstimos e metas, com IA baseada
              nos seus dados reais.
            </p>
          </div>

          <div className="md:col-start-2 md:row-start-1 md:self-start">
            <h3 className={columnTitleClass}>Links rápidos</h3>
          </div>

          <div className="md:col-start-2 md:row-start-2">
            <ul className="space-y-2.5">
              {footerLinks.map((link) => (
                <li key={`${link.label}-${link.href}`}>
                  {"external" in link && link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground transition-colors hover:text-brand"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-start-3 md:row-start-1 md:self-start">
            <h3 className={columnTitleClass}>Sobre</h3>
          </div>

          <div className="md:col-start-3 md:row-start-2">
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              O FinIA Control vai além de anotar gastos: funciona como um
              assistente financeiro que ajuda você a entender sua vida
              financeira, prever problemas e tomar melhores decisões.
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-border/40 pt-8">
          <FooterCopyright className="items-center text-center" />
        </div>
      </div>
    </footer>
  );
}
