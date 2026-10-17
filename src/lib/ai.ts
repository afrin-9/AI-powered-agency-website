import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic();

export const CLAUDE_MODEL = "claude-opus-5-5";

export const AGENCY_SYSTEM_PROMPT = `You are the assistant on an AI-powered digital agency's website.
Help visitors understand the agency's services, scope potential projects, and decide whether to get in touch.
Be concise and friendly. If you don't know a specific fact about the agency (pricing, team, past clients), say so and suggest using the contact form.`;
