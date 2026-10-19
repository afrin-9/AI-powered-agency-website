import { prisma } from "@/lib/db";
import { EmptyState, Reveal } from "@/components/ui";
import { CATEGORY_ICON } from "@/components/public/categoryIcon";
import { Eyebrow, PageIntro } from "@/components/public/Section";

export const dynamic = "force-dynamic";
export const metadata = { title: "Our work" };

export default async function PortfolioPage() {
  const projects = await prisma.project.findMany({
    where: { published: true },
    include: { service: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageIntro
        eyebrow="Work"
        title="Projects we've shipped."
        description="A selection of delivered projects. These are sample case studies for this concept site."
      />

      <div className="mx-auto max-w-6xl px-4 pb-8">
        {projects.length === 0 ? (
          <EmptyState title="No published projects yet" description="Check back soon." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((p, i) => {
              const Icon = p.service ? CATEGORY_ICON[p.service.category] : null;
              return (
                <Reveal key={p.id} as="article" delay={(i % 2) * 100} className="surface glow-card rounded-2xl p-7">
                  <div className="flex items-center justify-between gap-3">
                    <Eyebrow className="text-[10px]">{p.service?.name ?? "Custom"}</Eyebrow>
                    {Icon && <Icon className="h-4 w-4 text-slate-500" />}
                  </div>
                  <h2 className="mt-4 text-xl font-medium tracking-tight text-white">{p.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{p.summary}</p>
                  {p.techStack.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-1.5 border-t border-white/5 pt-5">
                      {p.techStack.map((t) => (
                        <span key={t} className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-slate-400">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
