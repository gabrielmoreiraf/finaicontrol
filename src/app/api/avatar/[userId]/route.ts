import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  // M7: avatares não são públicos — exige sessão válida.
  const viewer = await getCurrentUser();
  if (!viewer) {
    return new NextResponse(null, { status: 401 });
  }

  const { userId } = await context.params;

  // B1: só o próprio dono ou um admin pode acessar o avatar (evita IDOR/enumeração).
  if (viewer.id !== userId && viewer.role !== "admin") {
    return new NextResponse(null, { status: 403 });
  }

  const [profile] = await db
    .select({ avatarWebp: profiles.avatarWebp, avatarUpdatedAt: profiles.avatarUpdatedAt })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  if (!profile?.avatarWebp) {
    return new NextResponse(null, { status: 404 });
  }

  const buffer = Buffer.from(profile.avatarWebp, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
      ...(profile.avatarUpdatedAt
        ? { "Last-Modified": profile.avatarUpdatedAt.toUTCString() }
        : {}),
    },
  });
}
