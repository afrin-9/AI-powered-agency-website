import { Brain, Code2, Layers, Palette, ShoppingCart, Smartphone, type LucideIcon } from "lucide-react";
import type { Category } from "@prisma/client";

export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  WEB: Code2,
  MOBILE: Smartphone,
  AI_ML: Brain,
  ECOMMERCE: ShoppingCart,
  UI_UX: Palette,
  OTHER: Layers,
};
