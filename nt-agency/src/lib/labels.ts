import type { Category, LeadStatus, ProjectStatus, Timeline, Urgency } from "@prisma/client";
import type { BadgeColor } from "@/components/ui";

export const CATEGORY_LABEL: Record<Category, string> = {
  WEB: "Web",
  MOBILE: "Mobile",
  AI_ML: "AI / ML",
  ECOMMERCE: "E-commerce",
  UI_UX: "UI/UX",
  OTHER: "Other",
};

export const STATUS_COLOR: Record<LeadStatus, BadgeColor> = {
  NEW: "blue",
  CONTACTED: "amber",
  PROPOSAL_SENT: "violet",
  WON: "green",
  LOST: "red",
};

export const URGENCY_COLOR: Record<Urgency, BadgeColor> = {
  HIGH: "red",
  MEDIUM: "amber",
  LOW: "slate",
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

export const PROJECT_STATUS_COLOR: Record<ProjectStatus, BadgeColor> = {
  PLANNED: "slate",
  IN_PROGRESS: "blue",
  COMPLETED: "green",
};

export const TIMELINE_LABEL: Record<Timeline, string> = {
  RUSH: "Rush (+25%)",
  NORMAL: "Normal",
  FLEXIBLE: "Flexible (-10%)",
};

export function scoreColor(score: number | null | undefined): BadgeColor {
  if (score == null) return "slate";
  if (score >= 70) return "green";
  if (score >= 45) return "amber";
  return "red";
}
