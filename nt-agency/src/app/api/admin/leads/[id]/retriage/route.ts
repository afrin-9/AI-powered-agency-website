import { requireRole } from "@/lib/auth";
import { handle, json, type IdContext } from "@/lib/api";
import { applyTriage } from "@/lib/leads";
import { rateLimit } from "@/lib/rateLimit";

export const POST = handle(async (_req, { params }: IdContext) => {
  const session = await requireRole();
  // Each re-run can hit the LLM, so cap it per user.
  rateLimit(`retriage:${session.sub}`, 20, 60 * 1000);
  const { id } = await params;
  return json(await applyTriage(id, session.sub));
});
