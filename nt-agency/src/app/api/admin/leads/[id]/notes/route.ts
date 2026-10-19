import { requireRole } from "@/lib/auth";
import { handle, json, type IdContext } from "@/lib/api";
import { addLeadNote } from "@/lib/leads";
import { leadNoteSchema, parseBody } from "@/lib/validation";

export const POST = handle(async (req, { params }: IdContext) => {
  const session = await requireRole();
  const { id } = await params;
  const { note } = await parseBody(req, leadNoteSchema);
  return json(await addLeadNote(id, session.sub, note), 201);
});
