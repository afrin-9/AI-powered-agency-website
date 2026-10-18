import type { AiSource, Category, Timeline, Urgency } from "@prisma/client";

export interface TriageInput {
  name: string;
  company?: string | null;
  message: string;
  serviceName?: string | null;
  budget?: number | null;
  timeline?: Timeline;
  features?: number;
}

export interface TriageResult {
  category: Category;
  urgency: Urgency;
  score: number;
  summary: string;
  draftReply: string;
  source: AiSource;
}
