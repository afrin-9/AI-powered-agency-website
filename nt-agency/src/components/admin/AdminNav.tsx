"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Briefcase,
  Building2,
  Inbox,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCog,
  Users,
  X,
} from "lucide-react";
import type { Role } from "@prisma/client";
import { cn } from "@/components/ui";
import { api } from "@/lib/fetcher";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
  { href: "/admin/projects", label: "Projects", icon: Briefcase },
  { href: "/admin/clients", label: "Clients", icon: Building2 },
  { href: "/admin/services", label: "Services", icon: Layers },
  { href: "/admin/team", label: "Team page", icon: Users },
  { href: "/admin/users", label: "Users", icon: UserCog, adminOnly: true },
];

export function AdminNav({ user }: { user: { name: string; role: Role } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
    router.refresh();
  }

  const items = NAV.filter((n) => !n.adminOnly || user.role === "ADMIN");
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  const links = (
    <nav className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          aria-current={isActive(href) ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
            isActive(href) ? "bg-brand-500/10 text-brand-300" : "text-slate-300 hover:bg-night-800",
          )}
        >
          <Icon className="h-4 w-4" /> {label}
        </Link>
      ))}
    </nav>
  );

  const account = (
    <div className="border-t border-white/10 pt-4">
      <p className="text-sm font-medium">{user.name}</p>
      <p className="text-xs text-slate-400">{user.role === "ADMIN" ? "Administrator" : "Staff"}</p>
      <button onClick={logout} className="mt-3 flex items-center gap-2 text-sm text-slate-300 hover:text-red-400">
        <LogOut className="h-4 w-4" /> Log out
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-night-900 px-4 py-3 lg:hidden">
        <Link href="/admin" className="font-semibold">
          NT Admin
        </Link>
        <button onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="space-y-4 border-b border-white/10 bg-night-900 p-4 lg:hidden">
          {links}
          {account}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col justify-between border-r border-white/10 bg-night-900 p-4 lg:flex">
        <div>
          <Link href="/admin" className="mb-6 flex items-center gap-2 px-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-linear-to-br from-brand-400 to-brand-700 text-xs font-bold text-white">
              NT
            </span>
            Admin
          </Link>
          {links}
          <Link href="/" target="_blank" className="mt-6 block px-3 text-xs text-slate-400 hover:text-slate-100">
            View website ↗
          </Link>
        </div>
        {account}
      </aside>
    </>
  );
}
