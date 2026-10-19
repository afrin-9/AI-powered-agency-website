import { clientIp, handle, json } from "@/lib/api";
import { createLead } from "@/lib/leads";
import { rateLimit } from "@/lib/rateLimit";
import { leadCreateSchema, parseBody } from "@/lib/validation";

// Public: website inquiry / quote request.
export const POST = handle(async (req) => {
  rateLimit(`lead:${clientIp(req)}`, 5, 10 * 60 * 1000);
  const input = await parseBody(req, leadCreateSchema);
  return json(await createLead(input), 201);
});
