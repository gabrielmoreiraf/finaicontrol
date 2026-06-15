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

const GUEST_ONLY_PATHS = ["/login", "/cadastro"];

const PUBLIC_AUTH_PATHS = ["/verificar-email"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isGuestOnly = GUEST_ONLY_PATHS.includes(pathname);
  const isPublicAuth = PUBLIC_AUTH_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isGuestOnly && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (isPublicAuth) {
    return NextResponse.next();
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
    "/login",
    "/cadastro",
    "/verificar-email/:path*",
  ],
};
