import { getSession } from "@/lib/auth";
import { ServicesManager } from "./ServicesManager";

export const metadata = { title: "Services" };

export default async function ServicesPage() {
  const session = await getSession();
  return <ServicesManager isAdmin={session?.role === "ADMIN"} />;
}
