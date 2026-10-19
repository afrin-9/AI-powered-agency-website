import { requireRole } from "@/lib/auth";
import { handle, json, type IdContext } from "@/lib/api";
import { changeLeadStatus } from "@/lib/leads";
import { leadStatusUpdateSchema, parseBody } from "@/lib/validation";

export const PATCH = handle(async (req, { params }: IdContext) => {
  const session = await requireRole();
  const { id } = await params;
  const { status, note } = await parseBody(req, leadStatusUpdateSchema);
  return json(await changeLeadStatus(id, status, session.sub, note));
});
