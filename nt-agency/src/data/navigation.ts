import {
  Briefcase,
  Building2,
  Inbox,
  Layers,
  LayoutDashboard,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavLink = { href: string; label: string };

export const PUBLIC_NAV: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Work" },
  { href: "/about", label: "About" },
];

export const FOOTER_LINKS: Array<{ title: string; links: NavLink[] }> = [
  {
    title: "Services",
    links: [
      { href: "/services", label: "All services" },
      { href: "/quote", label: "Instant estimate" },
      { href: "/portfolio", label: "Our work" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/about#faq", label: "FAQ" },
      { href: "/login", label: "Team login" },
    ],
  },
];

export type AdminNavItem = NavLink & { icon: LucideIcon; adminOnly?: boolean };

export const ADMIN_NAV: Array<{ title: string; items: AdminNavItem[] }> = [
  {
    title: "Sales",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/leads", label: "Leads", icon: Inbox },
    ],
  },
  {
    title: "Delivery",
    items: [
      { href: "/admin/projects", label: "Projects", icon: Briefcase },
      { href: "/admin/clients", label: "Clients", icon: Building2 },
    ],
  },
  {
    title: "Website",
    items: [
      { href: "/admin/services", label: "Services", icon: Layers },
      { href: "/admin/team", label: "Team page", icon: Users },
    ],
  },
  {
    title: "Settings",
    items: [{ href: "/admin/users", label: "Users", icon: UserCog, adminOnly: true }],
  },
];
