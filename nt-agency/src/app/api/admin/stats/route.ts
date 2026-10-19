import { requireRole } from "@/lib/auth";
import { handle, json } from "@/lib/api";
import { getPipelineStats } from "@/lib/leads";

export const GET = handle(async () => {
  await requireRole();
  return json(await getPipelineStats());
});
