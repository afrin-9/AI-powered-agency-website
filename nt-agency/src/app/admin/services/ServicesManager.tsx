"use client";

import type { Category } from "@prisma/client";
import { ResourceManager, type FieldDef } from "@/components/admin/ResourceManager";
import { Badge, money } from "@/components/ui";
import { CATEGORY_LABEL } from "@/constants/labels";

type Service = {
  id: string;
  name: string;
  slug: string;
  category: Category;
  basePrice: number;
  pricePerFeature: number;
  typicalWeeks: number;
  active: boolean;
  _count: { leads: number; projects: number };
};

const fields: FieldDef[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true, hint: "Lowercase and dashes, e.g. mobile-apps" },
  {
    name: "category",
    label: "Category",
    type: "select",
    required: true,
    defaultValue: "WEB",
    options: Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label })),
  },
  { name: "summary", label: "Short summary", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea", required: true },
  { name: "basePrice", label: "Base price (USD)", type: "number", required: true },
  { name: "pricePerFeature", label: "Price per extra feature (USD)", type: "number", required: true },
  { name: "typicalWeeks", label: "Typical duration (weeks)", type: "number", required: true, defaultValue: 6 },
  { name: "active", label: "Active (shown on website)", type: "checkbox", defaultValue: true },
];

export function ServicesManager({ isAdmin }: { isAdmin: boolean }) {
  return (
    <ResourceManager<Service>
      title="Services"
      description="Services and pricing used on the website and in the quote calculator"
      endpoint="/api/admin/services"
      newLabel="New service"
      fields={fields}
      canDelete={isAdmin}
      columns={[
        { header: "Service", cell: (s) => <span className="font-medium">{s.name}</span> },
        { header: "Category", cell: (s) => <Badge color="indigo">{CATEGORY_LABEL[s.category]}</Badge> },
        { header: "Pricing", cell: (s) => `${money(s.basePrice)} + ${money(s.pricePerFeature)}/feature` },
        { header: "Leads", cell: (s) => s._count.leads },
        { header: "Projects", cell: (s) => s._count.projects },
        { header: "Status", cell: (s) => (s.active ? <Badge color="green">Active</Badge> : <Badge>Hidden</Badge>) },
      ]}
    />
  );
}
