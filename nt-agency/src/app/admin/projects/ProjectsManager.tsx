"use client";

import { useRouter } from "next/navigation";
import type { ProjectStatus } from "@prisma/client";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Badge, money } from "@/components/ui";
import { PROJECT_STATUS_COLOR, PROJECT_STATUS_LABEL } from "@/lib/labels";

type Project = {
  id: string;
  title: string;
  slug: string;
  status: ProjectStatus;
  budget: number | null;
  published: boolean;
  service: { id: string; name: string } | null;
  client: { id: string; name: string; company: string | null } | null;
  milestones: Array<{ done: boolean }>;
};

type Option = { value: string; label: string };

function Progress({ milestones }: { milestones: Array<{ done: boolean }> }) {
  const done = milestones.filter((m) => m.done).length;
  const pct = milestones.length ? Math.round((done / milestones.length) * 100) : 0;
  return (
    <div className="w-28">
      <div className="h-1.5 rounded-full bg-night-800">
        <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-400">
        {done}/{milestones.length} milestones
      </p>
    </div>
  );
}

export function ProjectsManager({
  isAdmin,
  services,
  clients,
}: {
  isAdmin: boolean;
  services: Option[];
  clients: Option[];
}) {
  const router = useRouter();

  return (
    <ResourceManager<Project>
      title="Projects"
      description="Client projects and portfolio case studies. Click a row to manage milestones."
      endpoint="/api/admin/projects"
      newLabel="New project"
      canDelete={isAdmin}
      onRowClick={(p) => router.push(`/admin/projects/${p.id}`)}
      fields={[
        { name: "title", label: "Title", type: "text", required: true },
        { name: "slug", label: "Slug", type: "text", required: true, hint: "Lowercase and dashes" },
        { name: "summary", label: "Summary", type: "textarea", required: true },
        { name: "techStack", label: "Tech stack", type: "tags", hint: "Comma separated, e.g. Next.js, PostgreSQL" },
        { name: "serviceId", label: "Service", type: "select", nullable: true, options: services },
        { name: "clientId", label: "Client", type: "select", nullable: true, options: clients },
        { name: "budget", label: "Budget (USD)", type: "number", nullable: true },
        {
          name: "status",
          label: "Status",
          type: "select",
          defaultValue: "PLANNED",
          options: Object.entries(PROJECT_STATUS_LABEL).map(([value, label]) => ({ value, label })),
        },
        { name: "published", label: "Show in public portfolio", type: "checkbox" },
      ]}
      columns={[
        {
          header: "Project",
          cell: (p) => (
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-slate-400">
                {p.client ? (p.client.company ?? p.client.name) : "Internal / portfolio"}
              </p>
            </div>
          ),
        },
        { header: "Service", cell: (p) => p.service?.name ?? "—" },
        {
          header: "Status",
          cell: (p) => <Badge color={PROJECT_STATUS_COLOR[p.status]}>{PROJECT_STATUS_LABEL[p.status]}</Badge>,
        },
        { header: "Progress", cell: (p) => <Progress milestones={p.milestones} /> },
        { header: "Budget", cell: (p) => money(p.budget) },
        {
          header: "Portfolio",
          cell: (p) => (p.published ? <Badge color="green">Published</Badge> : <Badge>Private</Badge>),
        },
      ]}
    />
  );
}
