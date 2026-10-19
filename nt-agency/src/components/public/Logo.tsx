import Link from "next/link";
import { cn } from "@/lib/utils";

/** "NT" mark with the company name, linking home. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 font-semibold tracking-tight text-white", className)}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-linear-to-br from-brand-400 to-brand-700 text-[13px] font-bold shadow-[0_0_20px_-4px_rgb(139_92_246/0.8)]">
        NT
      </span>
      <span className="leading-tight">
        NT Tech <span className="text-slate-400">Innovation</span>
      </span>
    </Link>
  );
}
