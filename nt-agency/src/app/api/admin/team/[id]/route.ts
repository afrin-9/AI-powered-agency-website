import { requireRole } from "@/lib/auth";
import { handle, json, type IdContext } from "@/lib/api";
import { prisma } from "@/lib/db";
import { parseBody, teamMemberSchema } from "@/lib/validation";

export const PATCH = handle(async (req, { params }: IdContext) => {
  await requireRole();
  const { id } = await params;
  const data = await parseBody(req, teamMemberSchema.partial());
  return json(await prisma.teamMember.update({ where: { id }, data }));
});

export const DELETE = handle(async (_req, { params }: IdContext) => {
  await requireRole("ADMIN");
  const { id } = await params;
  await prisma.teamMember.delete({ where: { id } });
  return json({ ok: true });
});
