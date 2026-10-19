import type { ActivityType, Category, LeadStatus, ProjectStatus, Timeline } from "@prisma/client";

// Human-readable names for database enums. Lead status labels live in lib/leadWorkflow.ts
// next to the state machine they describe.

export const CATEGORY_LABEL: Record<Category, string> = {
  WEB: "Web",
  MOBILE: "Mobile",
  AI_ML: "AI / ML",
  ECOMMERCE: "E-commerce",
  UI_UX: "UI/UX",
  OTHER: "Other",
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

export const TIMELINE_LABEL: Record<Timeline, string> = {
  RUSH: "Rush (+25%)",
  NORMAL: "Normal",
  FLEXIBLE: "Flexible (-10%)",
};

export const ACTIVITY_LABEL: Record<ActivityType, string> = {
  CREATED: "Lead created",
  STATUS_CHANGE: "Status changed",
  NOTE: "Note",
  ASSIGN: "Assignment",
  AI_TRIAGE: "AI triage",
};

/** Every pipeline stage, in display order. */
export const LEAD_STAGES: LeadStatus[] = ["NEW", "CONTACTED", "PROPOSAL_SENT", "WON", "LOST"];

/** The forward path a lead takes, shown as the progress bar on the lead page. */
export const LEAD_PROGRESS_STEPS: LeadStatus[] = ["NEW", "CONTACTED", "PROPOSAL_SENT", "WON"];
