import { hashPassword, requireRole } from "@/lib/auth";
import { handle, json } from "@/lib/api";
import { prisma } from "@/lib/db";
import { parseBody, userCreateSchema } from "@/lib/validation";

// Never select passwordHash.
const publicUser = { id: true, name: true, email: true, role: true, createdAt: true } as const;

// Any signed-in user can list users (needed for lead assignment); only admins can create.
export const GET = handle(async () => {
  await requireRole();
  return json({ items: await prisma.user.findMany({ select: publicUser, orderBy: { name: "asc" } }) });
});

export const POST = handle(async (req) => {
  await requireRole("ADMIN");
  const { password, ...rest } = await parseBody(req, userCreateSchema);
  const user = await prisma.user.create({
    data: { ...rest, passwordHash: await hashPassword(password) },
    select: publicUser,
  });
  return json(user, 201);
});
