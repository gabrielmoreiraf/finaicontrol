import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { ThemeProvider } from "@teispace/next-themes";
import { getTheme } from "@teispace/next-themes/server";
import { ToastFromUrl } from "@/components/app/toast-from-url";
import { ShapeGridBackground } from "@/components/react-bits/shape-grid-background";
import { Toaster } from "@/components/ui/sonner";
import { BRAND_ASSETS } from "@/lib/brand";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinIA Control | Controle financeiro inteligente com IA",
  description:
    "Organize receitas, despesas, dívidas e metas com inteligência artificial. Controle financeiro pessoal com projeções, alertas e assistente financeiro.",
  keywords: [
    "controle financeiro",
    "finanças pessoais",
    "IA financeira",
    "renda variável",
    "gestão financeira",
  ],
  icons: {
    icon: [{ url: BRAND_ASSETS.icon, type: "image/png" }],
    apple: BRAND_ASSETS.icon,
  },
  openGraph: {
    title: "FinIA Control | Controle financeiro inteligente com IA",
    description:
      "Organize receitas, despesas, dívidas e metas com inteligência artificial.",
    images: [{ url: BRAND_ASSETS.logo, width: 1200, height: 630, alt: BRAND_ASSETS.name }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialTheme = await getTheme({ themes: ["light", "dark", "system"] });

  return (
    <html lang="pt-BR" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          storage="local"
          initialTheme={initialTheme ?? undefined}
        >
          <ShapeGridBackground />
          <div className="relative z-10">{children}</div>
          <Suspense fallback={null}>
            <ToastFromUrl />
          </Suspense>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
