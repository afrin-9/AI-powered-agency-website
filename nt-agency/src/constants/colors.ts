import type { LeadStatus, ProjectStatus, Urgency } from "@prisma/client";
import type { BadgeColor } from "@/components/ui";

// Colour for each status, used by badges, charts and the board view.

export const STATUS_COLOR: Record<LeadStatus, BadgeColor> = {
  NEW: "blue",
  CONTACTED: "amber",
  PROPOSAL_SENT: "violet",
  WON: "green",
  LOST: "red",
};

/** Dot shown next to each column title on the leads board. */
export const STAGE_DOT: Record<LeadStatus, string> = {
  NEW: "bg-blue-400",
  CONTACTED: "bg-amber-400",
  PROPOSAL_SENT: "bg-violet-400",
  WON: "bg-emerald-400",
  LOST: "bg-red-400",
};

/** Gradient for each bar in the dashboard's "Pipeline by stage" chart. */
export const STAGE_BAR: Record<LeadStatus, string> = {
  NEW: "from-blue-500 to-blue-400",
  CONTACTED: "from-amber-500 to-amber-400",
  PROPOSAL_SENT: "from-violet-500 to-violet-400",
  WON: "from-emerald-500 to-emerald-400",
  LOST: "from-red-500/80 to-red-400/80",
};

export const URGENCY_COLOR: Record<Urgency, BadgeColor> = {
  HIGH: "red",
  MEDIUM: "amber",
  LOW: "slate",
};

export const PROJECT_STATUS_COLOR: Record<ProjectStatus, BadgeColor> = {
  PLANNED: "slate",
  IN_PROGRESS: "blue",
  COMPLETED: "green",
};

/** Score thresholds: 70+ is a strong lead, 45+ is worth a look, below that is weak. */
export const SCORE_THRESHOLDS = { strong: 70, fair: 45 } as const;

export function scoreColor(score: number | null | undefined): BadgeColor {
  if (score == null) return "slate";
  if (score >= SCORE_THRESHOLDS.strong) return "green";
  if (score >= SCORE_THRESHOLDS.fair) return "amber";
  return "red";
}

/** Same thresholds as scoreColor, as raw colours for the SVG score ring. */
export function scoreHex(score: number) {
  if (score >= SCORE_THRESHOLDS.strong) return "#34d399";
  if (score >= SCORE_THRESHOLDS.fair) return "#fbbf24";
  return "#f87171";
}
