import { requireRole } from "@/lib/auth";
import { ApiError, handle, json, type IdContext } from "@/lib/api";
import { prisma } from "@/lib/db";

export const GET = handle(async (_req, { params }: IdContext) => {
  await requireRole();
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      service: true,
      assignedTo: { select: { id: true, name: true } },
      client: true,
      project: { select: { id: true, title: true, status: true } },
      activities: { orderBy: { createdAt: "desc" }, include: { user: { select: { name: true } } } },
    },
  });
  if (!lead) throw new ApiError(404, "Lead not found");
  return json(lead);
});

export const DELETE = handle(async (_req, { params }: IdContext) => {
  await requireRole("ADMIN");
  const { id } = await params;
  await prisma.lead.delete({ where: { id } });
  return json({ ok: true });
});
