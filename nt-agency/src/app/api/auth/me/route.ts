import { requireRole } from "@/lib/auth";
import { handle, json } from "@/lib/api";

export const GET = handle(async () => {
  const session = await requireRole();
  return json({ user: { id: session.sub, name: session.name, email: session.email, role: session.role } });
});
