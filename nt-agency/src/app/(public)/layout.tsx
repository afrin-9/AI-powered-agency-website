import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { ChatWidget } from "@/components/public/ChatWidget";
import { AskNixoButton } from "@/components/public/Nixo";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-black px-4 py-1.5 text-center text-xs text-brand-200/80">
        Concept project for NT Tech Innovation — demo content, not an official website.
      </div>
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="bg-linear-to-b from-transparent to-black/60 pt-8 text-slate-400">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm sm:grid-cols-3">
          <div>
            <p className="font-semibold text-white">NT Tech Innovation</p>
            <p className="mt-2">Web, mobile and AI solutions for growing businesses.</p>
            <AskNixoButton className="mt-4 text-brand-300 hover:text-brand-200">Questions? Ask Nixo →</AskNixoButton>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-white">Explore</p>
            <Link href="/services" className="block hover:text-white">
              Services
            </Link>
            <Link href="/portfolio" className="block hover:text-white">
              Portfolio
            </Link>
            <Link href="/about" className="block hover:text-white">
              About &amp; FAQ
            </Link>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-white">Work with us</p>
            <Link href="/quote" className="block hover:text-white">
              Get an instant quote
            </Link>
            <Link href="/login" className="block hover:text-white">
              Team login
            </Link>
          </div>
        </div>
        <p className="border-t border-white/5 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Concept demo
        </p>
      </footer>
      <ChatWidget />
    </div>
  );
}
