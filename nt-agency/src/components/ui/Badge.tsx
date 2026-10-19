import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const badgeColors = {
  slate: "bg-white/6 text-slate-300 ring-white/10",
  blue: "bg-blue-500/10 text-blue-300 ring-blue-400/20",
  amber: "bg-amber-500/10 text-amber-300 ring-amber-400/20",
  violet: "bg-violet-500/10 text-violet-300 ring-violet-400/20",
  green: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20",
  red: "bg-red-500/10 text-red-300 ring-red-400/20",
  indigo: "bg-brand-500/15 text-brand-200 ring-brand-400/25",
} as const;

export type BadgeColor = keyof typeof badgeColors;

export function Badge({ color = "slate", children }: { color?: BadgeColor; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        badgeColors[color],
      )}
    >
      {children}
    </span>
  );
}
