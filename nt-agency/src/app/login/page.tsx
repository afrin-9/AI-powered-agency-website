import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Team login" };

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-night-950 px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgb(124_58_237/0.4),transparent_55%)]"
      />
      <div className="relative w-full max-w-sm">
        <Link href="/" className="mb-6 flex flex-col items-center gap-3 font-semibold text-white">
          <Image
            src="/nixo/nixo-face.webp"
            alt="Nixo, the NT Tech Innovation mascot"
            width={88}
            height={88}
            priority
            className="glow-ring rounded-full"
          />
          NT Tech Innovation
        </Link>
        <div className="rounded-xl bg-white p-6 shadow-2xl shadow-brand-900/40">
          <h1 className="text-xl font-semibold">Team login</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage leads and content.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <div className="mt-4 rounded-lg border border-dashed border-brand-300/30 bg-white/5 p-3 text-xs text-brand-100">
          <p className="font-medium text-white">Demo accounts</p>
          <p>Admin: admin@demo.com / Admin12345</p>
          <p>Staff: staff@demo.com / Staff12345</p>
        </div>
      </div>
    </div>
  );
}
