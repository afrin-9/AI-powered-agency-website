import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function money(n: number | null | undefined) {
  if (n == null) return "—";
  return `$${n.toLocaleString("en-US")}`;
}

// ---------- Button ----------

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-[0_0_0_1px_rgb(167_139_250/0.4)_inset,0_8px_24px_-8px_rgb(124_58_237/0.7)] hover:bg-brand-500",
  secondary: "border border-white/10 bg-white/4 text-slate-100 hover:border-white/20 hover:bg-white/8",
  ghost: "text-slate-300 hover:bg-white/6 hover:text-white",
  danger: "bg-red-600/90 text-white hover:bg-red-500",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  disabled,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md"; loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
        size === "sm" ? "h-8 px-3" : "h-10 px-4",
        variants[variant],
        className,
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

// ---------- Form controls ----------

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-300">
        {label}
      </label>
      {children}
      {error ? (
        <p className="animate-fade-in text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

const inputBase =
  "w-full rounded-lg border bg-night-950/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 transition-colors duration-200 hover:border-white/20 focus:border-brand-400/60 focus:outline-none focus:ring-4 focus:ring-brand-500/15";

const borderFor = (invalid?: boolean) => (invalid ? "border-red-400/70" : "border-white/10");

export function Input({ invalid, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input {...props} aria-invalid={invalid || undefined} className={cn(inputBase, "h-10", borderFor(invalid), className)} />
  );
}

export function Textarea({
  invalid,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea {...props} aria-invalid={invalid || undefined} className={cn(inputBase, borderFor(invalid), className)} />
  );
}

export function Select({
  invalid,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(inputBase, "h-10", borderFor(invalid), className)}
    >
      {children}
    </select>
  );
}

// ---------- Display ----------

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-white/8 bg-night-900/70 backdrop-blur-sm", className)}>
      {children}
    </div>
  );
}

/** Page title row used across the admin area. */
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="mb-2 text-xs text-slate-500">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

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

// Interactive pieces that need hooks live in a client module.
export { HydrationMarker, Modal, Reveal } from "./ui-client";
