import "server-only";

import sharp from "sharp";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png"]);

export function validateAvatarFile(file: File): string | null {
  if (!file || file.size === 0) {
    return "Selecione uma imagem PNG ou JPG.";
  }

  if (file.size > MAX_BYTES) {
    return "A imagem deve ter no máximo 5 MB.";
  }

  const mime = file.type.toLowerCase();
  if (!ALLOWED_MIME.has(mime)) {
    return "Use apenas arquivos PNG ou JPG.";
  }

  return null;
}

export async function convertAvatarToWebp(file: File): Promise<Buffer> {
  const input = Buffer.from(await file.arrayBuffer());

  return sharp(input)
    .rotate()
    .resize(512, 512, { fit: "cover", withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}

export function buildAvatarUrl(userId: string, updatedAt: Date | null): string | null {
  if (!updatedAt) return null;
  return `/api/avatar/${userId}?v=${updatedAt.getTime()}`;
}
