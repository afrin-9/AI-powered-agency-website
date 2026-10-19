"use client";

import { ResourceManager } from "@/components/admin/ResourceManager";

type Member = { id: string; name: string; role: string; bio: string; position: number };

export function TeamManager({ isAdmin }: { isAdmin: boolean }) {
  return (
    <ResourceManager<Member>
      title="Team page"
      description="Team members shown on the public About page"
      endpoint="/api/admin/team"
      newLabel="New member"
      canDelete={isAdmin}
      fields={[
        { name: "name", label: "Name", type: "text", required: true },
        { name: "role", label: "Job title", type: "text", required: true },
        { name: "bio", label: "Bio", type: "textarea", required: true },
        { name: "position", label: "Display order", type: "number", defaultValue: 0 },
      ]}
      columns={[
        { header: "#", cell: (m) => m.position },
        { header: "Name", cell: (m) => <span className="font-medium">{m.name}</span> },
        { header: "Title", cell: (m) => m.role },
        {
          header: "Bio",
          cell: (m) => <span className="line-clamp-1 text-slate-600">{m.bio}</span>,
          className: "max-w-md px-4 py-3",
        },
      ]}
    />
  );
}
