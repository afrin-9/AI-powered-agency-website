import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "./Button";

export function Spinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex animate-fade-in items-center justify-center gap-2 py-16 text-sm text-slate-400" role="status">
      <Loader2 className="h-5 w-5 animate-spin text-brand-400" aria-hidden /> {label}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex animate-fade-in flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-white/2 px-6 py-14 text-center">
      <p className="font-medium text-slate-100">{title}</p>
      {description && <p className="max-w-sm text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      className="animate-fade-in rounded-2xl border border-red-500/25 bg-red-500/7 px-4 py-8 text-center text-sm text-red-300"
      role="alert"
    >
      <p>{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
