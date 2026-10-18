import type { Category, Urgency } from "@prisma/client";
import type { TriageInput, TriageResult } from "./types";

/**
 * Self-built baseline classifier: weighted keyword matching.
 * Used when no API key is configured or the LLM call fails, and as a baseline in the evaluation.
 */
const CATEGORY_KEYWORDS: Record<Exclude<Category, "OTHER">, Record<string, number>> = {
  WEB: { website: 3, "web app": 3, landing: 2, wordpress: 2, portal: 2, dashboard: 2, react: 1, nextjs: 1, cms: 2, site: 2, saas: 2, "web application": 3, redesign: 1 },
  MOBILE: { mobile: 3, android: 3, ios: 3, "app store": 3, "play store": 3, flutter: 2, "react native": 3, iphone: 2, "mobile app": 3, smartphone: 2 },
  AI_ML: { ai: 3, "machine learning": 3, chatbot: 3, ml: 2, "computer vision": 3, prediction: 2, recommendation: 2, nlp: 3, llm: 3, gpt: 2, "artificial intelligence": 3, classify: 2, forecast: 2, automation: 1, model: 1 },
  ECOMMERCE: { ecommerce: 3, "e-commerce": 3, shop: 2, store: 2, cart: 3, checkout: 3, payment: 2, shopify: 3, products: 2, woocommerce: 3, marketplace: 2, bkash: 2, inventory: 1, "online store": 3, sell: 2 },
  UI_UX: { design: 2, "ui/ux": 3, ui: 2, ux: 2, figma: 3, prototype: 2, wireframe: 3, branding: 2, logo: 2, mockup: 2, "user experience": 3, redesign: 2 },
};

const URGENCY_KEYWORDS: Record<Urgency, Record<string, number>> = {
  HIGH: { urgent: 3, asap: 3, immediately: 3, "this week": 3, deadline: 2, launch: 1, "next week": 2, critical: 3, down: 2, broken: 2, emergency: 3, "as soon as possible": 3, quickly: 2 },
  LOW: { exploring: 2, "no rush": 3, someday: 3, "just curious": 3, "later this year": 2, "next year": 2, flexible: 2, idea: 1, "thinking about": 2, eventually: 2 },
  MEDIUM: { "next month": 2, soon: 1, "few weeks": 2, planning: 1 },
};

function scoreKeywords(text: string, table: Record<string, number>) {
  let score = 0;
  for (const [kw, weight] of Object.entries(table)) {
    // word-boundary match so "ai" doesn't match "said"
    const pattern = new RegExp(`(^|[^a-z])${kw.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}([^a-z]|$)`, "i");
    if (pattern.test(text)) score += weight;
  }
  return score;
}

export function classifyCategory(text: string): Category {
  let best: Category = "OTHER";
  let bestScore = 0;
  for (const [cat, table] of Object.entries(CATEGORY_KEYWORDS)) {
    const s = scoreKeywords(text, table);
    if (s > bestScore) {
      best = cat as Category;
      bestScore = s;
    }
  }
  return bestScore >= 2 ? best : "OTHER";
}

export function classifyUrgency(text: string, timeline?: TriageInput["timeline"]): Urgency {
  const high = scoreKeywords(text, URGENCY_KEYWORDS.HIGH) + (timeline === "RUSH" ? 3 : 0);
  const low = scoreKeywords(text, URGENCY_KEYWORDS.LOW) + (timeline === "FLEXIBLE" ? 2 : 0);
  if (high >= 3 && high > low) return "HIGH";
  if (low >= 2 && low > high) return "LOW";
  return "MEDIUM";
}

/** Lead score 0-100 from simple, explainable signals. */
export function scoreLead(input: TriageInput, category: Category, urgency: Urgency): number {
  let score = 30;
  if (input.budget) score += input.budget >= 10000 ? 25 : input.budget >= 3000 ? 15 : 5;
  if (urgency === "HIGH") score += 15;
  else if (urgency === "MEDIUM") score += 8;
  if (category !== "OTHER") score += 10;
  if (input.company) score += 8;
  const words = input.message.split(/\s+/).length;
  if (words >= 40) score += 10;
  else if (words >= 20) score += 5;
  if (input.features && input.features >= 5) score += 5;
  return Math.max(0, Math.min(100, score));
}

const CATEGORY_LABEL: Record<Category, string> = {
  WEB: "web development",
  MOBILE: "mobile app development",
  AI_ML: "AI / machine learning",
  ECOMMERCE: "e-commerce",
  UI_UX: "UI/UX design",
  OTHER: "your project",
};

export function fallbackTriage(input: TriageInput): TriageResult {
  const text = `${input.serviceName ?? ""} ${input.message}`;
  const category = classifyCategory(text);
  const urgency = classifyUrgency(input.message, input.timeline);
  const firstSentence = input.message.split(/(?<=[.!?])\s+/)[0] ?? input.message;
  const summary = firstSentence.length > 160 ? `${firstSentence.slice(0, 157)}...` : firstSentence;
  const firstName = input.name.split(" ")[0];
  return {
    category,
    urgency,
    score: scoreLead(input, category, urgency),
    summary,
    draftReply: `Hi ${firstName},\n\nThank you for reaching out to NT Tech Innovation about ${CATEGORY_LABEL[category]}. We've reviewed your message and would love to learn more about your goals, timeline and budget. Could you share a convenient time for a 20-minute discovery call this week?\n\nBest regards,\nNT Tech Innovation`,
    source: "FALLBACK",
  };
}
