import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

/** Label + control + error (or hint) message. */
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
