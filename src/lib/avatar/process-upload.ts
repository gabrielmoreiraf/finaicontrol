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

const ALLOWED_SHARP_FORMATS = new Set(["jpeg", "png", "webp"]);

export async function convertAvatarToWebp(file: File): Promise<Buffer> {
  const input = Buffer.from(await file.arrayBuffer());

  // M4: limita os pixels (anti decompression bomb) e valida o formato REAL da
  // imagem via metadata do sharp — não confia no MIME enviado pelo cliente.
  const image = sharp(input, { limitInputPixels: 24_000_000, failOn: "error" });
  const { format } = await image.metadata();
  if (!format || !ALLOWED_SHARP_FORMATS.has(format)) {
    throw new Error("Arquivo de imagem inválido.");
  }

  return image
    .rotate()
    .resize(512, 512, { fit: "cover", withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}

export function buildAvatarUrl(userId: string, updatedAt: Date | null): string | null {
  if (!updatedAt) return null;
  return `/api/avatar/${userId}?v=${updatedAt.getTime()}`;
}
