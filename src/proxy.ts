import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookieName } from "@/lib/auth/session-cookie";

const SESSION_COOKIE = getSessionCookieName();

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/receitas",
  "/despesas",
  "/dividas",
  "/emprestei",
  "/metas",
  "/ia",
  "/admin",
  "/configuracoes",
  "/onboarding",
  "/escolher-plano",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  // Só a guarda de rota protegida fica no edge (rápida, baseada na presença do
  // cookie). O redirecionamento "já logado → dashboard" das páginas de login/
  // cadastro foi movido para as próprias páginas (server-side), que validam a
  // sessão no banco. Motivo: o edge só enxerga a PRESENÇA do cookie; quando ele
  // existe mas é inválido (logout, sessão expirada/revogada), redirecionar aqui
  // brigava com o redirect do layout (/login ↔ /dashboard) e travava em loop.
  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/receitas/:path*",
    "/despesas/:path*",
    "/dividas/:path*",
    "/emprestei/:path*",
    "/metas/:path*",
    "/ia/:path*",
    "/admin/:path*",
    "/configuracoes/:path*",
    "/onboarding/:path*",
    "/escolher-plano",
  ],
};
