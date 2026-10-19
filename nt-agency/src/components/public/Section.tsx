import { Reveal, cn } from "@/components/ui";

/** Small mono label above section titles, e.g. "01 — Services". */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-[11px] uppercase tracking-[0.2em] text-brand-300/80", className)}>{children}</p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  center,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <Reveal
      className={cn(
        "mb-10 flex flex-wrap items-end justify-between gap-4",
        center && "flex-col items-center text-center",
      )}
    >
      <div className={cn(center && "flex flex-col items-center")}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
        {description && <p className="mt-3 max-w-xl text-slate-400">{description}</p>}
      </div>
      {action}
    </Reveal>
  );
}

/** Title block at the top of inner public pages. */
export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="relative">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 -top-24 h-80" />
      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-16 sm:pt-20">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="text-gradient mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-400">{description}</p>
      </div>
    </div>
  );
}
