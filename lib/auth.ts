import { prisma } from "./prisma";

export async function canEdit(pin?: string): Promise<boolean> {
  // For now, simplified - no user email check, just PIN
  if (!pin) return false;

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });
  return String(pin) === String(settings?.editorPIN || "");
}

export async function validatePin(pin: string): Promise<{ ok: boolean }> {
  const ok = await canEdit(pin);
  return { ok };
}
