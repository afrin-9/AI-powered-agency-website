import { getSession } from "@/lib/auth";
import { TeamManager } from "./TeamManager";

export const metadata = { title: "Team page" };

export default async function TeamPage() {
  const session = await getSession();
  return <TeamManager isAdmin={session?.role === "ADMIN"} />;
}
