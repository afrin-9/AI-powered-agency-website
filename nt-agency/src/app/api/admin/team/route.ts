import { requireRole } from "@/lib/auth";
import { handle, json } from "@/lib/api";
import { prisma } from "@/lib/db";
import { parseBody, teamMemberSchema } from "@/lib/validation";

export const GET = handle(async () => {
  await requireRole();
  return json({ items: await prisma.teamMember.findMany({ orderBy: { position: "asc" } }) });
});

export const POST = handle(async (req) => {
  await requireRole();
  const data = await parseBody(req, teamMemberSchema);
  return json(await prisma.teamMember.create({ data }), 201);
});
