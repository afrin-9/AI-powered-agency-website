import { CalendarCheck, Globe2, Layers, LifeBuoy, ReceiptText, Sparkles, type LucideIcon } from "lucide-react";

// Copy for the home page sections. Sample content for this concept site.

export const PROCESS_STEPS = [
  { title: "Discovery", text: "We map your goals, users and scope in a free consultation." },
  { title: "Design", text: "Wireframes and clickable prototypes before any code is written." },
  { title: "Build", text: "Short sprints with weekly demos, so you always see progress." },
  { title: "Launch", text: "Deployment, handover training and 30 days of free support." },
];

export const WHY_US: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: ReceiptText,
    title: "Transparent pricing",
    text: "A base price plus a fixed cost per feature. See your range instantly, before any call.",
  },
  {
    icon: CalendarCheck,
    title: "Weekly demos",
    text: "You see working software every week, not a big reveal at the end.",
  },
  {
    icon: LifeBuoy,
    title: "30 days of support",
    text: "Every launch includes a month of free bug fixes, with maintenance plans after.",
  },
  {
    icon: Globe2,
    title: "Local and international",
    text: "We work in English or Bangla and accept bank transfer, bKash and international payments.",
  },
  {
    icon: Sparkles,
    title: "AI where it helps",
    text: "Chatbots, forecasting and LLM integrations that solve a real problem, not a buzzword.",
  },
  {
    icon: Layers,
    title: "Modern, proven stack",
    text: "Next.js, Node, Flutter, Python and PostgreSQL, deployed on AWS or Vercel.",
  },
];

/** Facts strip under the hero; values that come from the database are filled in by the page. */
export const HERO_FACTS = {
  replyTime: "1 day",
  freeSupport: "30 days",
};
