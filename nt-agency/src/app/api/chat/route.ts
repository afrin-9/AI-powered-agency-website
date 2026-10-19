import { clientIp, handle, json } from "@/lib/api";
import { answerChat } from "@/lib/ai/chat";
import { rateLimit } from "@/lib/rateLimit";
import { chatSchema, parseBody } from "@/lib/validation";

export const POST = handle(async (req) => {
  rateLimit(`chat:${clientIp(req)}`, 20, 5 * 60 * 1000);
  const { messages } = await parseBody(req, chatSchema);
  return json(await answerChat(messages));
});
