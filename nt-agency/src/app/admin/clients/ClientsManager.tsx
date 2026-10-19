"use client";

import Link from "next/link";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Badge } from "@/components/ui";

type Client = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
  _count: { projects: number };
  leads: Array<{ id: string }>;
};

export function ClientsManager({ isAdmin }: { isAdmin: boolean }) {
  return (
    <ResourceManager<Client>
      title="Clients"
      description="Created automatically when a lead is won, or added manually"
      endpoint="/api/admin/clients"
      newLabel="New client"
      canDelete={isAdmin}
      fields={[
        { name: "name", label: "Contact name", type: "text", required: true },
        { name: "company", label: "Company", type: "text", nullable: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone", type: "text", nullable: true },
      ]}
      columns={[
        { header: "Client", cell: (c) => <span className="font-medium">{c.name}</span> },
        { header: "Company", cell: (c) => c.company ?? "—" },
        { header: "Email", cell: (c) => c.email },
        { header: "Projects", cell: (c) => c._count.projects },
        {
          header: "Source",
          cell: (c) =>
            c.leads[0] ? (
              <Link href={`/admin/leads/${c.leads[0].id}`} className="hover:underline">
                <Badge color="green">Won lead</Badge>
              </Link>
            ) : (
              <Badge>Manual</Badge>
            ),
        },
      ]}
    />
  );
}
