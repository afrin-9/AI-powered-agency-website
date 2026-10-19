import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { ChatWidget } from "@/components/public/ChatWidget";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-slate-900 px-4 py-1.5 text-center text-xs text-slate-300">
        Concept project for NT Tech Innovation — demo content, not an official website.
      </div>
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-slate-600 sm:grid-cols-3">
          <div>
            <p className="font-semibold text-slate-900">NT Tech Innovation</p>
            <p className="mt-2">Web, mobile and AI solutions for growing businesses.</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-slate-900">Explore</p>
            <Link href="/services" className="block hover:text-slate-900">
              Services
            </Link>
            <Link href="/portfolio" className="block hover:text-slate-900">
              Portfolio
            </Link>
            <Link href="/about" className="block hover:text-slate-900">
              About &amp; FAQ
            </Link>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-slate-900">Work with us</p>
            <Link href="/quote" className="block hover:text-slate-900">
              Get an instant quote
            </Link>
            <Link href="/login" className="block hover:text-slate-900">
              Team login
            </Link>
          </div>
        </div>
        <p className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Concept demo
        </p>
      </footer>
      <ChatWidget />
    </div>
  );
}
