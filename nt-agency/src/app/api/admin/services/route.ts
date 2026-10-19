import { requireRole } from "@/lib/auth";
import { handle, json } from "@/lib/api";
import { prisma } from "@/lib/db";
import { parseBody, serviceSchema } from "@/lib/validation";

export const GET = handle(async () => {
  await requireRole();
  const items = await prisma.service.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { leads: true, projects: true } } },
  });
  return json({ items });
});

export const POST = handle(async (req) => {
  await requireRole();
  const data = await parseBody(req, serviceSchema);
  return json(await prisma.service.create({ data }), 201);
});
