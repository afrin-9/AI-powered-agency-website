import { requireRole } from "@/lib/auth";
import { ApiError, handle, json, type IdContext } from "@/lib/api";
import { prisma } from "@/lib/db";
import { clientSchema, parseBody } from "@/lib/validation";

export const GET = handle(async (_req, { params }: IdContext) => {
  await requireRole();
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: { projects: { include: { milestones: true } }, leads: true },
  });
  if (!client) throw new ApiError(404, "Client not found");
  return json(client);
});

export const PATCH = handle(async (req, { params }: IdContext) => {
  await requireRole();
  const { id } = await params;
  const data = await parseBody(req, clientSchema.partial());
  return json(await prisma.client.update({ where: { id }, data }));
});

export const DELETE = handle(async (_req, { params }: IdContext) => {
  await requireRole("ADMIN");
  const { id } = await params;
  const projects = await prisma.project.count({ where: { clientId: id } });
  if (projects > 0) throw new ApiError(409, "This client has projects. Remove or reassign them first.");
  await prisma.client.delete({ where: { id } });
  return json({ ok: true });
});
