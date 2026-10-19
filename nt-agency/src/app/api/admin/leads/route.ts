import { requireRole } from "@/lib/auth";
import { handle, json } from "@/lib/api";
import { listLeads } from "@/lib/leads";
import { leadListQuerySchema } from "@/lib/validation";

export const GET = handle(async (req) => {
  await requireRole();
  const query = leadListQuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  return json(await listLeads(query));
});
