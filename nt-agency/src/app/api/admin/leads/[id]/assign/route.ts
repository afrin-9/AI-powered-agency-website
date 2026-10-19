import { requireRole } from "@/lib/auth";
import { handle, json, type IdContext } from "@/lib/api";
import { assignLead } from "@/lib/leads";
import { leadAssignSchema, parseBody } from "@/lib/validation";

export const PATCH = handle(async (req, { params }: IdContext) => {
  const session = await requireRole();
  const { id } = await params;
  const { userId } = await parseBody(req, leadAssignSchema);
  await assignLead(id, userId, session.sub);
  return json({ ok: true });
});
