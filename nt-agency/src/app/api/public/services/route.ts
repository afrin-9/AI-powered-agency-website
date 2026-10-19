import { handle, json } from "@/lib/api";
import { prisma } from "@/lib/db";

export const GET = handle(async () => {
  const services = await prisma.service.findMany({ where: { active: true }, orderBy: { basePrice: "asc" } });
  return json({ items: services });
});
