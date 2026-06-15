import "server-only";

import { randomBytes } from "node:crypto";
import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { invitations } from "@/lib/db/schema";
import type { SubscriptionPlan } from "@/types/finance";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

export type ValidInvitation = {
  token: string;
  email: string;
  plan: SubscriptionPlan | null;
};

export type PendingInvitation = {
  id: string;
  email: string;
  plan: SubscriptionPlan | null;
  status: string;
  expiresAt: string;
  createdAt: string;
};

/**
 * Cria um convite de acesso para `email`, opcionalmente já com `plan` definido
 * (null = o convidado escolhe o plano no cadastro). Substitui convites pendentes
 * anteriores para o mesmo e-mail para evitar tokens duplicados. Retorna o token.
 */
export async function createInvitation(params: {
  email: string;
  plan: SubscriptionPlan | null;
  invitedBy: string;
}): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

  await db
    .delete(invitations)
    .where(and(eq(invitations.email, params.email), eq(invitations.status, "pending")));

  await db.insert(invitations).values({
    id: token,
    email: params.email,
    plan: params.plan,
    invitedBy: params.invitedBy,
    status: "pending",
    expiresAt,
  });

  return token;
}

/** Retorna o convite se ele existe, está pendente e não expirou; senão null. */
export async function getValidInvitation(token: string): Promise<ValidInvitation | null> {
  if (!token) return null;

  const rows = await db
    .select({ email: invitations.email, plan: invitations.plan })
    .from(invitations)
    .where(
      and(
        eq(invitations.id, token),
        eq(invitations.status, "pending"),
        gt(invitations.expiresAt, new Date()),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    token,
    email: row.email,
    plan: (row.plan as SubscriptionPlan | null) ?? null,
  };
}

/** Marca um convite como aceito (chamado quando o cadastro é concluído). */
export async function markInvitationAccepted(token: string): Promise<void> {
  await db
    .update(invitations)
    .set({ status: "accepted", acceptedAt: new Date() })
    .where(and(eq(invitations.id, token), eq(invitations.status, "pending")));
}

/** Revoga um convite pendente (admin). */
export async function revokeInvitation(id: string): Promise<void> {
  await db
    .update(invitations)
    .set({ status: "revoked" })
    .where(and(eq(invitations.id, id), eq(invitations.status, "pending")));
}

/** Lista convites pendentes (não expirados) para o painel admin. */
export async function listPendingInvitations(): Promise<PendingInvitation[]> {
  const rows = await db
    .select({
      id: invitations.id,
      email: invitations.email,
      plan: invitations.plan,
      status: invitations.status,
      expiresAt: invitations.expiresAt,
      createdAt: invitations.createdAt,
    })
    .from(invitations)
    .where(and(eq(invitations.status, "pending"), gt(invitations.expiresAt, new Date())))
    .orderBy(desc(invitations.createdAt));

  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    plan: (r.plan as SubscriptionPlan | null) ?? null,
    status: r.status,
    expiresAt: r.expiresAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
  }));
}
