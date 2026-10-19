import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Team login" };

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">NT</span>
          NT Tech Innovation
        </Link>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold">Team login</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage leads and content.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-3 text-xs text-slate-600">
          <p className="font-medium">Demo accounts</p>
          <p>Admin: admin@demo.com / Admin12345</p>
          <p>Staff: staff@demo.com / Staff12345</p>
        </div>
      </div>
    </div>
  );
}
