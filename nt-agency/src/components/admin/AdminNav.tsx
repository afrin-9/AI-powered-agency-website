"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, LogOut, Menu, X } from "lucide-react";
import type { Role } from "@prisma/client";
import { cn, initials } from "@/lib/utils";
import { ADMIN_NAV } from "@/data/navigation";
import { api } from "@/lib/fetcher";

export function AdminNav({ user }: { user: { name: string; role: Role } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  async function logout() {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
    router.refresh();
  }

  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));
  const groups = ADMIN_NAV.map((g) => ({ ...g, items: g.items.filter((i) => !i.adminOnly || user.role === "ADMIN") })).filter(
    (g) => g.items.length > 0,
  );

  const nav = (
    <nav className="space-y-6">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">{group.title}</p>
          <div className="space-y-0.5">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                    active ? "bg-white/6 text-white" : "text-slate-400 hover:bg-white/3 hover:text-slate-100",
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brand-400 transition-all duration-300",
                      active ? "opacity-100" : "scale-y-0 opacity-0",
                    )}
                  />
                  <Icon className={cn("h-4 w-4 transition-colors", active ? "text-brand-300" : "text-slate-500 group-hover:text-slate-300")} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const account = (
    <div className="rounded-xl border border-white/6 bg-white/2 p-3">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-linear-to-br from-brand-400/40 to-brand-700/40 text-xs font-semibold text-brand-100 ring-1 ring-brand-400/30">
          {initials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs text-slate-500">{user.role === "ADMIN" ? "Administrator" : "Staff"}</p>
        </div>
        <button
          onClick={logout}
          className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-2.5 px-2 font-semibold tracking-tight">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-linear-to-br from-brand-400 to-brand-700 text-xs font-bold text-white shadow-[0_0_20px_-4px_rgb(139_92_246/0.8)]">
        NT
      </span>
      <span>
        NT Tech <span className="font-normal text-slate-500">CRM</span>
      </span>
    </Link>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-night-950/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        {brand}
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-slate-300 hover:bg-white/5"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="animate-pop-in space-y-6 border-b border-white/5 bg-night-950 p-4 lg:hidden">
          {nav}
          {account}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/5 bg-night-950/60 p-4 lg:flex">
        <div className="mb-8 pt-1">{brand}</div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <Link
          href="/"
          target="_blank"
          className="mb-3 flex items-center gap-1.5 px-3 text-xs text-slate-500 transition-colors hover:text-slate-200"
        >
          View website <ArrowUpRight className="h-3 w-3" />
        </Link>
        {account}
      </aside>
    </>
  );
}
