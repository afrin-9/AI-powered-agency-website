/** Numbered step heading used to group fields in the quote form. */
export function FormStep({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/5 pb-3">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500/15 font-mono text-xs text-brand-200 ring-1 ring-brand-400/30">
        {n}
      </span>
      <h2 className="text-sm font-medium text-white">{title}</h2>
    </div>
  );
}
