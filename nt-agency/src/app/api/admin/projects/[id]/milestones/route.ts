import { requireRole } from "@/lib/auth";
import { ApiError, handle, json, type IdContext } from "@/lib/api";
import { prisma } from "@/lib/db";
import { milestoneSchema, parseBody } from "@/lib/validation";

export const POST = handle(async (req, { params }: IdContext) => {
  await requireRole();
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id }, select: { id: true } });
  if (!project) throw new ApiError(404, "Project not found");
  const data = await parseBody(req, milestoneSchema);
  const position = await prisma.milestone.count({ where: { projectId: id } });
  return json(await prisma.milestone.create({ data: { ...data, projectId: id, position } }), 201);
});
