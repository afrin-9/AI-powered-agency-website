import Anthropic from "@anthropic-ai/sdk";
import { AGENCY_SYSTEM_PROMPT, CLAUDE_MODEL, anthropic } from "@/lib/ai";
import { chatRequestSchema } from "@/lib/validations";

export const runtime = "nodejs";

/** Streams Claude's reply as plain text. Body: { messages: [{ role, content }] } */
export async function POST(req: Request) {
  const parsed = chatRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues }, { status: 400 });
  }

  const stream = anthropic.beta.messages.stream({
    model: CLAUDE_MODEL,
    // Capped for a public website chat; raise for longer-form generation.
    max_tokens: 4096,
    output_config: { effort: "medium" },
    system: AGENCY_SYSTEM_PROMPT,
    messages: parsed.data.messages,
    // If a safety classifier declines, the API re-runs the request on a recommended fallback model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\nSorry, I can't help with that request."));
        }
        controller.close();
      } catch (err) {
        if (err instanceof Anthropic.APIError) {
          console.error("Anthropic API error", err.status, err.message);
        } else {
          console.error("Chat stream failed", err);
        }
        controller.error(err);
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
