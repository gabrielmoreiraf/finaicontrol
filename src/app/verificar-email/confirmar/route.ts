import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { createSession } from "@/lib/auth/session";
import { getPostAuthPath } from "@/lib/auth/post-auth-redirect";
import { markEmailVerified, verifyEmailToken, getEmailForVerificationToken } from "@/lib/auth/verification-token";
import type { SubscriptionPlan } from "@/types/finance";

function redirectToVerifyEmail(
  origin: string,
  error: string,
  email?: string | null,
): NextResponse {
  const params = new URLSearchParams({ error });
  if (email) params.set("email", email);
  return NextResponse.redirect(`${origin}/verificar-email?${params}`);
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const origin = request.nextUrl.origin;

  if (!token) {
    return redirectToVerifyEmail(origin, "token-invalido");
  }

  const userId = await verifyEmailToken(token);
  if (!userId) {
    const email = await getEmailForVerificationToken(token);
    return redirectToVerifyEmail(origin, "token-expirado", email);
  }

  await markEmailVerified(userId);

  const rows = await db
    .select({ onboardingComplete: users.onboardingComplete, plan: users.plan })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  await createSession(userId);

  const user = rows[0];
  const destination = getPostAuthPath({
    plan: (user?.plan as SubscriptionPlan | null) ?? null,
    onboardingComplete: user?.onboardingComplete ?? false,
  });
  return NextResponse.redirect(`${origin}${destination}?toast=email-verified`);
}
