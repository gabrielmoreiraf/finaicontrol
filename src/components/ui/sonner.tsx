"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const APP_ROUTE_PREFIXES = [
  "/dashboard",
  "/receitas",
  "/despesas",
  "/dividas",
  "/emprestei",
  "/metas",
  "/investimentos",
  "/relatorios",
  "/ia",
  "/configuracoes",
];

function useToastOffset() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 63.9375rem)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const isAppRoute = APP_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isAppRoute) return 16;
  return isMobile ? 140 : 76;
}

export function Toaster(props: ToasterProps) {
  const offset = useToastOffset();

  return (
    <Sonner
      theme="dark"
      position="top-right"
      offset={offset}
      gap={10}
      visibleToasts={4}
      richColors={false}
      toastOptions={{
        classNames: {
          toast:
            "finia-toast group !rounded-xl !border !border-white/10 !bg-card/95 !text-foreground !shadow-xl !backdrop-blur-xl",
          title: "!text-sm !font-semibold",
          description: "!text-xs !text-muted-foreground",
          actionButton: "!rounded-lg !bg-brand !text-black !font-medium",
          cancelButton: "!rounded-lg !border-white/10 !bg-white/5",
          success: "!border-brand/25",
          error: "!border-red-500/30",
          warning: "!border-amber-500/30",
          info: "!border-sky-500/30",
        },
      }}
      {...props}
    />
  );
}
