import {
  Bot,
  Brain,
  Code2,
  Layers,
  MessageSquareText,
  Palette,
  Plus,
  ShoppingCart,
  Smartphone,
  UserRound,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { ActivityType, Category } from "@prisma/client";

export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  WEB: Code2,
  MOBILE: Smartphone,
  AI_ML: Brain,
  ECOMMERCE: ShoppingCart,
  UI_UX: Palette,
  OTHER: Layers,
};

export const ACTIVITY_ICON: Record<ActivityType, LucideIcon> = {
  CREATED: Plus,
  STATUS_CHANGE: Workflow,
  NOTE: MessageSquareText,
  ASSIGN: UserRound,
  AI_TRIAGE: Bot,
};
