import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Read the user fresh so a deleted account or changed role applies immediately.
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");

  return (
    <div className="relative min-h-screen lg:flex">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_50%_100%_at_60%_0%,rgb(76_29_149/0.22),transparent_70%)]"
      />
      <AdminNav user={user} />
      <main className="relative min-w-0 flex-1">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
