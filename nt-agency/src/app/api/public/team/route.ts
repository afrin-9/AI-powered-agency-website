import { handle, json } from "@/lib/api";
import { prisma } from "@/lib/db";

export const GET = handle(async () => {
  const team = await prisma.teamMember.findMany({ orderBy: { position: "asc" } });
  return json({ items: team });
});
