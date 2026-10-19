import { requireRole } from "@/lib/auth";
import { ApiError, handle, json, type IdContext } from "@/lib/api";
import { prisma } from "@/lib/db";
import { parseBody, projectSchema } from "@/lib/validation";

export const GET = handle(async (_req, { params }: IdContext) => {
  await requireRole();
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      service: true,
      client: true,
      milestones: { orderBy: { position: "asc" } },
      lead: { select: { id: true, name: true } },
    },
  });
  if (!project) throw new ApiError(404, "Project not found");
  return json(project);
});

export const PATCH = handle(async (req, { params }: IdContext) => {
  await requireRole();
  const { id } = await params;
  const data = await parseBody(req, projectSchema.partial());
  return json(await prisma.project.update({ where: { id }, data }));
});

export const DELETE = handle(async (_req, { params }: IdContext) => {
  await requireRole("ADMIN");
  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return json({ ok: true });
});
