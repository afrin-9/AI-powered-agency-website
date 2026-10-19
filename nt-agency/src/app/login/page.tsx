import { Suspense } from "react";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/public/Logo";
import { LOGIN_POINTS } from "@/data/auth";
import { DEMO_ACCOUNTS } from "@/data/demoAccounts";
import { LoginForm } from "./LoginForm";
import { SignedInNotice } from "./SignedInNotice";

export const dynamic = "force-dynamic";
export const metadata = { title: "Team login" };

export default async function LoginPage() {
  // The login screen always shows. A signed-in user gets a "continue / sign out" choice
  // instead of a redirect; the account is read from the database, so a stale cookie just
  // shows the sign-in form.
  const user = await getCurrentUser();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden border-r border-white/5 lg:block">
        <div aria-hidden className="bg-grid absolute inset-0" />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_60%,rgb(124_58_237/0.4),transparent_70%)]"
        />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Logo />
          <div className="mx-auto w-72 animate-[slide-up_0.8s_var(--ease-out-soft)_both]">
            <Image
              src="/nixo/nixo-body.webp"
              alt="Nixo, the NT Tech Innovation mascot"
              width={600}
              height={660}
              priority
              className="nixo-fade nixo-float h-auto w-full"
            />
          </div>
          <ul className="space-y-3">
            {LOGIN_POINTS.map((p, i) => (
              <li
                key={p.text}
                className="flex animate-slide-up items-center gap-3 text-sm text-slate-300"
                style={{ animationDelay: `${300 + i * 120}ms` }}
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5">
                  <p.icon className="h-4 w-4 text-brand-300" />
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center px-4 py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgb(76_29_149/0.3),transparent_70%)] lg:hidden"
        />
        <div className="relative w-full max-w-sm animate-page-in">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Welcome back</h1>
          <p className="mt-1.5 text-sm text-slate-400">Sign in to manage leads, projects and content.</p>
          {user ? (
            <SignedInNotice name={user.name} />
          ) : (
            <Suspense>
              <LoginForm />
            </Suspense>
          )}
          <div className="mt-8 rounded-xl border border-dashed border-white/10 bg-white/2 p-4 text-xs text-slate-400">
            <p className="mb-1.5 font-mono uppercase tracking-[0.18em] text-slate-500">Demo accounts</p>
            {DEMO_ACCOUNTS.map((a) => (
              <p key={a.email}>
                {a.role === "ADMIN" ? "Admin" : "Staff"} · <span className="text-slate-200">{a.email}</span> / {a.password}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
