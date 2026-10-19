import { prisma } from "@/lib/db";
import { EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  const projects = await prisma.project.findMany({
    where: { published: true },
    include: { service: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-3xl font-bold">Portfolio</h1>
      <p className="mt-2 text-slate-300">A selection of projects we have delivered (sample case studies for this concept).</p>

      {projects.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No published projects yet" description="Check back soon." />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {projects.map((p) => (
            <article key={p.id} className="rounded-xl border border-white/10 bg-night-900 p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-brand-400">{p.service?.name ?? "Custom"}</p>
              <h2 className="mt-2 text-lg font-semibold">{p.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{p.summary}</p>
              {p.techStack.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.techStack.map((t) => (
                    <span key={t} className="rounded-full bg-night-800 px-2.5 py-0.5 text-xs text-slate-200">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
