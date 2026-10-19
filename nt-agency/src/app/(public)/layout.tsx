import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Logo } from "@/components/public/Logo";
import { ChatWidget } from "@/components/public/ChatWidget";
import { AskNixoButton } from "@/components/public/Nixo";
import { FOOTER_LINKS } from "@/data/navigation";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      <div className="border-b border-white/5 px-4 py-1.5 text-center text-[11px] tracking-wide text-slate-500">
        Concept project for NT Tech Innovation — demo content, not an official website.
      </div>
      <Navbar />
      <main className="flex-1">{children}</main>

      <footer className="px-3 pb-3 pt-16 sm:px-4">
        <div className="surface mx-auto max-w-6xl rounded-3xl p-8 sm:p-10">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <Logo />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
                Web, mobile and AI products for startups and SMEs in Bangladesh and beyond.
              </p>
              <AskNixoButton className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-brand-200 transition-colors hover:border-brand-400/40 hover:bg-brand-500/10">
                Questions? Ask Nixo
              </AskNixoButton>
            </div>
            {FOOTER_LINKS.map((col) => (
              <div key={col.title}>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-slate-300 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col justify-between gap-2 border-t border-white/5 pt-6 text-xs text-slate-500 sm:flex-row">
            <p>© {new Date().getFullYear()} NT Tech Innovation · Concept demo</p>
            <p>Built with Next.js, PostgreSQL and Claude</p>
          </div>
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}
