import { requireRole } from "@/lib/auth";
import { handle, json } from "@/lib/api";
import { prisma } from "@/lib/db";
import { parseBody, projectSchema } from "@/lib/validation";

export const GET = handle(async () => {
  await requireRole();
  const items = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      service: { select: { id: true, name: true } },
      client: { select: { id: true, name: true, company: true } },
      milestones: { select: { done: true } },
    },
  });
  return json({ items });
});

export const POST = handle(async (req) => {
  await requireRole();
  const data = await parseBody(req, projectSchema);
  return json(await prisma.project.create({ data }), 201);
});
