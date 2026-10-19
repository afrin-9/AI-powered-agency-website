import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
