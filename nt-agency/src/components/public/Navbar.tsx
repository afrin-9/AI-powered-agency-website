"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/components/ui";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Work" },
  { href: "/about", label: "About" },
];

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

/** Floating pill navigation that tightens up once the page is scrolled. */
export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu after navigating.
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
      <nav
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between rounded-2xl border px-3 py-2 transition-all duration-300 sm:px-4",
          scrolled || open
            ? "border-white/10 bg-night-900/75 shadow-lg shadow-black/30 backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "relative rounded-lg px-3 py-2 text-sm transition-colors duration-200",
                isActive(l.href) ? "text-white" : "text-slate-400 hover:text-white",
              )}
            >
              {l.label}
              <span
                className={cn(
                  "absolute inset-x-3 -bottom-0.5 h-px bg-linear-to-r from-transparent via-brand-400 to-transparent transition-opacity duration-300",
                  isActive(l.href) ? "opacity-100" : "opacity-0",
                )}
              />
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:text-white">
            Team login
          </Link>
          <Link
            href="/quote"
            className="group inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-4 text-sm font-medium text-night-950 transition-all hover:bg-brand-100 active:scale-[0.97]"
          >
            Get a quote
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/5 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl animate-pop-in rounded-2xl border border-white/10 bg-night-900/95 p-2 backdrop-blur-xl md:hidden">
          {[...links, { href: "/quote", label: "Get a quote" }, { href: "/login", label: "Team login" }].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "block rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-white/5",
                isActive(l.href) ? "font-medium text-white" : "text-slate-300",
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
