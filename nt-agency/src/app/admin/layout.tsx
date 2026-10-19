import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  // Read the user fresh so a deleted account or changed role applies immediately.
  const user = await prisma.user.findUnique({ where: { id: session.sub }, select: { name: true, role: true } });
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen lg:flex">
      <AdminNav user={user} />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
