"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/fetcher";
import { Button } from "@/components/ui";

/** Shown on the login screen when a session already exists, instead of silently skipping the screen. */
export function SignedInNotice({ name }: { name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    // Re-render the server page without the session, so the sign-in form appears.
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-4 rounded-xl border border-white/10 bg-white/4 p-5">
      <p className="text-sm text-slate-300">
        You&apos;re signed in as <span className="font-medium text-white">{name}</span>.
      </p>
      <Link
        href="/admin"
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-600 text-sm font-medium text-white transition-all hover:bg-brand-500 active:scale-[0.97]"
      >
        Continue to dashboard <ArrowRight className="h-4 w-4" />
      </Link>
      <Button variant="secondary" loading={loading} onClick={signOut} className="h-11 w-full">
        Sign out to use another account
      </Button>
    </div>
  );
}
