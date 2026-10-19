import { requireRole } from "@/lib/auth";
import { handle, json } from "@/lib/api";
import { prisma } from "@/lib/db";
import { clientSchema, parseBody } from "@/lib/validation";

export const GET = handle(async () => {
  await requireRole();
  const items = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { projects: true } },
      // The lead this client was converted from, if any.
      leads: { select: { id: true }, orderBy: { createdAt: "asc" }, take: 1 },
    },
  });
  return json({ items });
});

export const POST = handle(async (req) => {
  await requireRole();
  const data = await parseBody(req, clientSchema);
  return json(await prisma.client.create({ data }), 201);
});
