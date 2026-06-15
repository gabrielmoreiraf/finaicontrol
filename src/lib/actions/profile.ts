"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { profiles, users } from "@/lib/db/schema";
import { getCurrentUser, invalidateOtherSessions } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { convertAvatarToWebp, validateAvatarFile } from "@/lib/avatar/process-upload";
import { TOAST_MESSAGES } from "@/lib/toast/messages";

export type ProfileState = { error?: string; success?: boolean; message?: string };

function revalidateProfilePaths() {
  revalidatePath("/configuracoes");
  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
}

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const profession = String(formData.get("profession") ?? "").trim();
  const fixedMonthlyIncome = (Number(formData.get("fixedMonthlyIncome") ?? 0) || 0).toFixed(2);

  if (!name) {
    return { error: "O nome não pode ficar vazio." };
  }

  await db.update(users).set({ name }).where(eq(users.id, user.id));
  await db
    .update(profiles)
    .set({ profession, fixedMonthlyIncome })
    .where(eq(profiles.userId, user.id));

  revalidateProfilePaths();
  return { success: true, message: TOAST_MESSAGES.profile.updated };
}

export async function uploadAvatarAction(formData: FormData): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const file = formData.get("avatar");
  if (!(file instanceof File)) {
    return { error: "Selecione uma imagem PNG ou JPG." };
  }

  const validationError = validateAvatarFile(file);
  if (validationError) return { error: validationError };

  try {
    const webpBuffer = await convertAvatarToWebp(file);
    const now = new Date();

    await db
      .update(profiles)
      .set({
        avatarWebp: webpBuffer.toString("base64"),
        avatarUpdatedAt: now,
      })
      .where(eq(profiles.userId, user.id));

    revalidateProfilePaths();
    return { success: true, message: TOAST_MESSAGES.profile.avatarUpdated };
  } catch {
    return { error: "Não foi possível processar a imagem. Tente outro arquivo." };
  }
}

export async function removeAvatarAction(): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await db
    .update(profiles)
    .set({ avatarWebp: null, avatarUpdatedAt: null })
    .where(eq(profiles.userId, user.id));

  revalidateProfilePaths();
  return { success: true, message: TOAST_MESSAGES.profile.avatarRemoved };
}

export async function changePasswordAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Preencha todos os campos de senha." };
  }

  if (newPassword.length < 6) {
    return { error: "A nova senha deve ter ao menos 6 caracteres." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "A confirmação não coincide com a nova senha." };
  }

  if (currentPassword === newPassword) {
    return { error: "A nova senha deve ser diferente da atual." };
  }

  const [row] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!row || !(await verifyPassword(currentPassword, row.passwordHash))) {
    return { error: "Senha atual incorreta." };
  }

  const passwordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));

  // Segurança (M6): desconecta as outras sessões, mantendo apenas a atual.
  await invalidateOtherSessions(user.id);

  revalidateProfilePaths();
  return { success: true, message: TOAST_MESSAGES.profile.passwordUpdated };
}
