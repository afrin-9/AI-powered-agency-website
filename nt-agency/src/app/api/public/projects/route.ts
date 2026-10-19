import { handle, json } from "@/lib/api";
import { prisma } from "@/lib/db";

export const GET = handle(async () => {
  const projects = await prisma.project.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      techStack: true,
      service: { select: { name: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return json({ items: projects });
});
