import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ProjectsManager } from "./ProjectsManager";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const [session, services, clients] = await Promise.all([
    getSession(),
    prisma.service.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.client.findMany({ select: { id: true, name: true, company: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <ProjectsManager
      isAdmin={session?.role === "ADMIN"}
      services={services.map((s) => ({ value: s.id, label: s.name }))}
      clients={clients.map((c) => ({ value: c.id, label: c.company ? `${c.company} (${c.name})` : c.name }))}
    />
  );
}
