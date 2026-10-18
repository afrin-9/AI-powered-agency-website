import Anthropic from "@anthropic-ai/sdk";

export const AI_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

let client: Anthropic | null | undefined;

/** Returns an Anthropic client, or null when no API key is configured (app then uses local fallbacks). */
export function getAnthropic(): Anthropic | null {
  if (client !== undefined) return client;
  client = process.env.ANTHROPIC_API_KEY ? new Anthropic({ timeout: 30_000, maxRetries: 1 }) : null;
  return client;
}

export function aiEnabled() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
