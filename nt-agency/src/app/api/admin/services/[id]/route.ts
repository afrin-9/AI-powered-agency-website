import { requireRole } from "@/lib/auth";
import { handle, json, type IdContext } from "@/lib/api";
import { prisma } from "@/lib/db";
import { parseBody, serviceSchema } from "@/lib/validation";

export const PATCH = handle(async (req, { params }: IdContext) => {
  await requireRole();
  const { id } = await params;
  const data = await parseBody(req, serviceSchema.partial());
  return json(await prisma.service.update({ where: { id }, data }));
});

// Leads and projects keep their history: their serviceId becomes null (onDelete: SetNull).
export const DELETE = handle(async (_req, { params }: IdContext) => {
  await requireRole("ADMIN");
  const { id } = await params;
  await prisma.service.delete({ where: { id } });
  return json({ ok: true });
});
