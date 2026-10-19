"use client";

import type { Role } from "@prisma/client";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { Badge } from "@/components/ui";

type User = { id: string; name: string; email: string; role: Role; createdAt: string };

export function UsersManager() {
  return (
    <ResourceManager<User>
      title="Users"
      description="Team accounts that can sign in to the admin dashboard"
      endpoint="/api/admin/users"
      newLabel="New user"
      fields={[
        { name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true, hideOnEdit: true },
        {
          name: "password",
          label: "Password",
          type: "password",
          required: true,
          createOnly: true,
          hint: "At least 8 characters, with a letter and a number",
        },
        {
          name: "role",
          label: "Role",
          type: "select",
          defaultValue: "STAFF",
          options: [
            { value: "STAFF", label: "Staff — manage leads and content" },
            { value: "ADMIN", label: "Admin — full access, including users and deletes" },
          ],
        },
      ]}
      columns={[
        { header: "Name", cell: (u) => <span className="font-medium">{u.name}</span> },
        { header: "Email", cell: (u) => u.email },
        { header: "Role", cell: (u) => <Badge color={u.role === "ADMIN" ? "violet" : "slate"}>{u.role}</Badge> },
        { header: "Created", cell: (u) => new Date(u.createdAt).toLocaleDateString() },
      ]}
    />
  );
}
