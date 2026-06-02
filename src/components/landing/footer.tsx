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
        <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-3 md:items-start md:gap-x-12 lg:gap-x-20">
          <div className="space-y-4">
            {/* O PNG do logo é quadrado com ~32% de transparência em cima e ~36%
                embaixo. overflow-hidden + translate recortam esse espaço morto
                p/ o logo ficar justo e o texto perto. */}
            <div className="h-9 overflow-hidden sm:h-10 xl:h-11">
              <BrandLogo
                variant="full"
                size="xl"
                priority
                className="-translate-y-[31%]"
                imageClassName="object-left object-top"
              />
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Plataforma financeira inteligente para pessoa física. Organize
              receitas, despesas, dívidas, empréstimos e metas, com IA baseada
              nos seus dados reais.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className={columnTitleClass}>Links rápidos</h3>
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

          <div className="space-y-4">
            <h3 className={columnTitleClass}>Sobre</h3>
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
