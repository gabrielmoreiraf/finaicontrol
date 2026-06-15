import "server-only";

import { db } from "@/lib/db/client";
import { auditLogs } from "@/lib/db/schema";

/**
 * LGPD (Art. 37): registra operações do admin sobre dados de titulares.
 * Falhas no log NÃO devem quebrar a operação principal — apenas são reportadas.
 */
export async function recordAudit(
  actorId: string,
  action: string,
  targetUserId?: string | null,
): Promise<void> {
  try {
    await db.insert(auditLogs).values({ actorId, action, targetUserId: targetUserId ?? null });
  } catch (error) {
    console.error("[audit] falha ao registrar operação", action, error);
  }
}
