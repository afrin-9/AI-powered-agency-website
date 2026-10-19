import { scoreHex } from "@/constants/colors";

/** Circular 0–100 lead score gauge. The arc animates in when `shown` flips to true. */
export function ScoreRing({ score, shown = true }: { score: number; shown?: boolean }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-20 w-20 place-items-center">
      <svg viewBox="0 0 72 72" className="absolute inset-0 -rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={scoreHex(score)}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={shown ? c * (1 - score / 100) : c}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="text-center">
        <p className="text-xl font-semibold leading-none text-white">{score}</p>
        <p className="mt-0.5 text-[10px] text-slate-500">score</p>
      </div>
    </div>
  );
}
