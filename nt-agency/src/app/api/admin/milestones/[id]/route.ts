import type { ProjectStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { handle, json, type IdContext } from "@/lib/api";
import { prisma } from "@/lib/db";
import { milestoneUpdateSchema, parseBody } from "@/lib/validation";

export const PATCH = handle(async (req, { params }: IdContext) => {
  await requireRole();
  const { id } = await params;
  const data = await parseBody(req, milestoneUpdateSchema);

  // Update the milestone and keep the project status in sync with progress.
  const result = await prisma.$transaction(async (tx) => {
    const milestone = await tx.milestone.update({ where: { id }, data });
    const all = await tx.milestone.findMany({ where: { projectId: milestone.projectId }, select: { done: true } });
    const done = all.filter((m) => m.done).length;
    const projectStatus: ProjectStatus = done === 0 ? "PLANNED" : done === all.length ? "COMPLETED" : "IN_PROGRESS";
    await tx.project.update({ where: { id: milestone.projectId }, data: { status: projectStatus } });
    return { milestone, projectStatus };
  });
  return json(result);
});

export const DELETE = handle(async (_req, { params }: IdContext) => {
  await requireRole();
  const { id } = await params;
  await prisma.milestone.delete({ where: { id } });
  return json({ ok: true });
});
