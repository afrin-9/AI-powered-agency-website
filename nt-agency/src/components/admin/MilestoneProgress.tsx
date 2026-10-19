/** Compact progress bar with a "done/total milestones" caption, used in the projects table. */
export function MilestoneProgress({ milestones }: { milestones: Array<{ done: boolean }> }) {
  const done = milestones.filter((m) => m.done).length;
  const pct = milestones.length ? Math.round((done / milestones.length) * 100) : 0;
  return (
    <div className="w-28">
      <div className="h-1.5 rounded-full bg-night-800">
        <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-400">
        {done}/{milestones.length} milestones
      </p>
    </div>
  );
}
