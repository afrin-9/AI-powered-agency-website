import type { LeadStatus } from "@prisma/client";

/**
 * Sales pipeline state machine. WON and LOST are terminal.
 * NEW -> CONTACTED -> PROPOSAL_SENT -> WON, and any open stage can be marked LOST.
 */
export const LEAD_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  NEW: ["CONTACTED", "LOST"],
  CONTACTED: ["PROPOSAL_SENT", "LOST"],
  PROPOSAL_SENT: ["WON", "LOST"],
  WON: [],
  LOST: [],
};

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  PROPOSAL_SENT: "Proposal sent",
  WON: "Won",
  LOST: "Lost",
};

export const OPEN_STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "PROPOSAL_SENT"];

export function canTransition(from: LeadStatus, to: LeadStatus): boolean {
  return LEAD_TRANSITIONS[from].includes(to);
}

export function nextStatuses(from: LeadStatus): LeadStatus[] {
  return LEAD_TRANSITIONS[from];
}

export function isTerminal(status: LeadStatus): boolean {
  return LEAD_TRANSITIONS[status].length === 0;
}
