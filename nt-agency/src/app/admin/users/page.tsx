import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { UsersManager } from "./UsersManager";

export const metadata = { title: "Users" };

export default async function UsersPage() {
  const session = await getSession();
  // UI guard only; the API enforces ADMIN on every write.
  if (session?.role !== "ADMIN") redirect("/admin");
  return <UsersManager />;
}
