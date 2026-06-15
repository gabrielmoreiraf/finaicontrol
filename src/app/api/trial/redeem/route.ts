import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { redeemTrialToken } from "@/lib/auth/trial";

/**
 * Resgate do trial via link do e-mail.
 *
 * SEGURANÇA: o resgate exige estar logado E ser exatamente o usuário a quem o
 * token foi emitido (verificado em `redeemTrialToken`). Se não estiver logado,
 * mandamos para o login preservando o destino (`redirect`), para voltar e
 * resgatar após autenticar — assim o link não funciona para outra pessoa.
 */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const token = request.nextUrl.searchParams.get("token");

  const back = (toast: string) => NextResponse.redirect(`${origin}/dashboard?toast=${toast}`);

  if (!token) return back("trial-invalido");

  const user = await getCurrentUser();
  if (!user) {
    const target = `/api/trial/redeem?token=${encodeURIComponent(token)}`;
    return NextResponse.redirect(`${origin}/login?redirect=${encodeURIComponent(target)}`);
  }

  const result = await redeemTrialToken(token, user.id);
  switch (result) {
    case "ok":
      return back("trial-ativado");
    case "wrong_user":
      return back("trial-outro-usuario");
    case "expired":
      return back("trial-expirado");
    default:
      return back("trial-invalido");
  }
}
