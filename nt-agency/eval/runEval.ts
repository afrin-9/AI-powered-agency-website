/**
 * Evaluates the two AI features and writes a markdown report to eval/results.md.
 *  1. Inquiry triage: category and urgency accuracy on a hand-labelled set, keyword baseline vs Claude.
 *  2. Website assistant: replies must contain an expected fact, or decline out-of-scope questions.
 *
 * Usage: npm run eval              (Claude is skipped when ANTHROPIC_API_KEY is empty)
 *        npm run eval -- --no-chat (triage only, no database needed)
 */
import { readFileSync, writeFileSync } from "node:fs";

try {
  process.loadEnvFile(".env");
} catch {
  // .env is optional
}

type Labelled = {
  id: number;
  message: string;
  timeline: "RUSH" | "NORMAL" | "FLEXIBLE";
  category: string;
  urgency: string;
};
type ChatCase = { q: string; expectAny?: string[]; refuse?: boolean };
type Prediction = { category: string; urgency: string } | null;

const CATEGORIES = ["WEB", "MOBILE", "AI_ML", "ECOMMERCE", "UI_UX", "OTHER"];
const REFUSAL_MARKERS = [
  "don't have",
  "do not have",
  "not able",
  "unable",
  "can't help",
  "cannot help",
  "only help",
  "only answer",
  "not something",
  "get a quote",
  "contact",
];

const pct = (n: number, d: number) => `${Math.round((n / d) * 100)}%`;

async function main() {
  // Imported after loading .env so the AI client sees the API key.
  const { fallbackTriage } = await import("../src/lib/ai/fallbackClassifier");
  const { llmTriage } = await import("../src/lib/ai/triage");
  const { aiEnabled, AI_MODEL } = await import("../src/lib/ai/client");

  const data: Labelled[] = JSON.parse(readFileSync("eval/inquiries.json", "utf8"));
  const runLlm = aiEnabled();
  const lines = [
    "# AI evaluation results",
    "",
    `Run: ${new Date().toISOString()}  `,
    `Model: ${runLlm ? AI_MODEL : "(no API key: Claude skipped)"}`,
    "",
  ];

  // ---------- 1. Triage ----------
  const results: Record<string, Prediction[]> = { "Keyword baseline": [] };
  if (runLlm) results["Claude (LLM)"] = [];
  let llmFailures = 0;

  console.log(`Triage: ${data.length} labelled inquiries${runLlm ? ` (LLM: ${AI_MODEL})` : " (baseline only)"}`);
  for (const item of data) {
    const input = { name: "Eval User", message: item.message, timeline: item.timeline, features: 3 };
    results["Keyword baseline"].push(fallbackTriage(input));
    if (runLlm) {
      const r = await llmTriage(input);
      if (!r) llmFailures++;
      results["Claude (LLM)"].push(r);
      process.stdout.write(".");
    }
  }
  if (runLlm) process.stdout.write("\n");

  lines.push(
    `## 1. Inquiry triage (${data.length} hand-labelled inquiries)`,
    "",
    "| Method | Category accuracy | Urgency accuracy |",
    "|---|---|---|",
  );
  for (const [name, preds] of Object.entries(results)) {
    const cat = preds.filter((p, i) => p?.category === data[i].category).length;
    const urg = preds.filter((p, i) => p?.urgency === data[i].urgency).length;
    lines.push(`| ${name} | ${cat}/${data.length} (${pct(cat, data.length)}) | ${urg}/${data.length} (${pct(urg, data.length)}) |`);
    console.log(`${name.padEnd(18)} category ${pct(cat, data.length).padStart(4)}  urgency ${pct(urg, data.length).padStart(4)}`);
  }
  if (runLlm && llmFailures) {
    lines.push("", `Claude calls that failed (the app would use the keyword fallback): ${llmFailures}`);
  }

  for (const [name, preds] of Object.entries(results)) {
    lines.push(
      "",
      `### Category confusion matrix: ${name}`,
      "",
      `| actual \\ predicted | ${CATEGORIES.join(" | ")} | failed |`,
      `|---|${CATEGORIES.map(() => "---").join("|")}|---|`,
    );
    for (const actual of CATEGORIES) {
      const rows = preds.filter((_, i) => data[i].category === actual);
      const counts = CATEGORIES.map((p) => rows.filter((x) => x?.category === p).length);
      lines.push(`| **${actual}** | ${counts.join(" | ")} | ${rows.filter((x) => !x).length} |`);
    }
    const misses = data
      .map((d, i) => ({ d, p: preds[i] }))
      .filter(({ d, p }) => p?.category !== d.category)
      .slice(0, 8)
      .map(({ d, p }) => `- #${d.id} expected ${d.category}, got ${p?.category ?? "none"}: "${d.message.slice(0, 80)}..."`);
    if (misses.length) lines.push("", "Sample category errors:", ...misses);
  }

  // ---------- 2. Chat ----------
  if (!process.argv.includes("--no-chat")) {
    const { answerChat } = await import("../src/lib/ai/chat");
    const { prisma } = await import("../src/lib/db");
    const cases: ChatCase[] = JSON.parse(readFileSync("eval/chat-questions.json", "utf8"));
    console.log(`Chat: ${cases.length} questions`);

    let pass = 0;
    const rows: string[] = [];
    for (const c of cases) {
      const { reply, source } = await answerChat([{ role: "user", content: c.q }]);
      const text = reply.toLowerCase();
      const ok = c.refuse
        ? REFUSAL_MARKERS.some((m) => text.includes(m))
        : (c.expectAny ?? []).some((e) => text.includes(e.toLowerCase()));
      if (ok) pass++;
      const preview = reply.replace(/\s+/g, " ").replace(/\|/g, "/").slice(0, 110);
      rows.push(`| ${c.q} | ${c.refuse ? "decline" : "answer"} | ${source} | ${ok ? "✅" : "❌"} | ${preview} |`);
    }
    await prisma.$disconnect();
    console.log(`Chat: ${pass}/${cases.length} passed`);

    lines.push(
      "",
      `## 2. Website assistant (${cases.length} questions)`,
      "",
      `Passed: **${pass}/${cases.length} (${pct(pass, cases.length)})**. An answer passes if it contains an expected fact; ` +
        "an out-of-scope question passes if the bot declines or redirects.",
      "",
      "| Question | Expected | Source | Pass | Reply (truncated) |",
      "|---|---|---|---|---|",
      ...rows,
    );
  }

  writeFileSync("eval/results.md", lines.join("\n") + "\n");
  console.log("Report written to eval/results.md");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
