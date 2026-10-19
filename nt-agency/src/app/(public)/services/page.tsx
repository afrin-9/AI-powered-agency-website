import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { prisma } from "@/lib/db";
import { EmptyState, Reveal, money } from "@/components/ui";
import { CATEGORY_ICON } from "@/components/public/categoryIcon";
import { PageIntro } from "@/components/public/Section";

export const dynamic = "force-dynamic";
export const metadata = { title: "Services" };

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ where: { active: true }, orderBy: { basePrice: "asc" } });

  return (
    <>
      <PageIntro
        eyebrow="Services"
        title="Transparent pricing for every project."
        description="Each service has a starting price, and every extra key feature adds a fixed cost. You can estimate your project before we even talk."
      />

      <div className="mx-auto max-w-6xl px-4 pb-8">
        {services.length === 0 ? (
          <EmptyState title="No services listed right now" description="Please check back soon." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((s, i) => {
              const Icon = CATEGORY_ICON[s.category];
              return (
                <Reveal key={s.id} delay={(i % 2) * 100} className="surface glow-card flex flex-col rounded-2xl p-7">
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-xl border border-brand-400/20 bg-brand-500/10">
                      <Icon className="h-6 w-6 text-brand-300" />
                    </span>
                    <div>
                      <h2 className="text-lg font-medium text-white">{s.name}</h2>
                      <p className="text-sm text-slate-500">{s.summary}</p>
                    </div>
                  </div>
                  <p className="mt-5 flex-1 text-sm leading-relaxed text-slate-400">{s.description}</p>

                  <dl className="mt-6 grid grid-cols-3 divide-x divide-white/5 rounded-xl border border-white/5 bg-black/20 text-center">
                    <div className="px-2 py-3">
                      <dt className="text-[11px] uppercase tracking-wide text-slate-500">From</dt>
                      <dd className="mt-1 font-semibold text-white">{money(s.basePrice)}</dd>
                    </div>
                    <div className="px-2 py-3">
                      <dt className="text-[11px] uppercase tracking-wide text-slate-500">Per feature</dt>
                      <dd className="mt-1 font-semibold text-white">{money(s.pricePerFeature)}</dd>
                    </div>
                    <div className="px-2 py-3">
                      <dt className="text-[11px] uppercase tracking-wide text-slate-500">Timeline</dt>
                      <dd className="mt-1 inline-flex items-center gap-1 font-semibold text-white">
                        <Clock className="h-3.5 w-3.5 text-slate-400" /> ~{s.typicalWeeks} wks
                      </dd>
                    </div>
                  </dl>

                  <Link
                    href={`/quote?service=${s.id}`}
                    className="group mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white transition-all hover:border-brand-400/40 hover:bg-brand-500/15 active:scale-[0.98]"
                  >
                    Estimate this service
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
