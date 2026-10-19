import { requireRole } from "@/lib/auth";
import { ApiError, handle, json, type IdContext } from "@/lib/api";
import { prisma } from "@/lib/db";
import { parseBody, userUpdateSchema } from "@/lib/validation";

export const PATCH = handle(async (req, { params }: IdContext) => {
  const session = await requireRole("ADMIN");
  const { id } = await params;
  const data = await parseBody(req, userUpdateSchema);
  if (id === session.sub && data.role && data.role !== "ADMIN") {
    throw new ApiError(400, "You cannot remove your own admin role");
  }
  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true },
  });
  return json(user);
});

export const DELETE = handle(async (_req, { params }: IdContext) => {
  const session = await requireRole("ADMIN");
  const { id } = await params;
  if (id === session.sub) throw new ApiError(400, "You cannot delete your own account");
  await prisma.user.delete({ where: { id } });
  return json({ ok: true });
});
