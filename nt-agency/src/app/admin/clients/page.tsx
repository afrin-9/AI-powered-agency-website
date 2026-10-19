import { getSession } from "@/lib/auth";
import { ClientsManager } from "./ClientsManager";

export const metadata = { title: "Clients" };

export default async function ClientsPage() {
  const session = await getSession();
  return <ClientsManager isAdmin={session?.role === "ADMIN"} />;
}
