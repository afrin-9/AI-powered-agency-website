import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui";

/** Dashboard metric tile: label, big value, hint and an icon tile. */
export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="h-full p-5 transition-colors duration-300 hover:border-white/15">
      <div className="flex items-start justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-lg border border-brand-400/20 bg-brand-500/10">
          <Icon className="h-4 w-4 text-brand-300" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </Card>
  );
}
