import Link from "next/link";
import { Clock } from "lucide-react";
import { prisma } from "@/lib/db";
import { EmptyState, money } from "@/components/ui";
import { CATEGORY_ICON } from "@/components/public/categoryIcon";

export const dynamic = "force-dynamic";
export const metadata = { title: "Services" };

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ where: { active: true }, orderBy: { basePrice: "asc" } });

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-3xl font-bold">Services</h1>
      <p className="mt-2 max-w-2xl text-slate-300">
        Transparent starting prices. Each extra key feature adds a fixed cost, so you can estimate your project before we
        even talk.
      </p>

      {services.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No services listed right now" description="Please check back soon." />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {services.map((s) => {
            const Icon = CATEGORY_ICON[s.category];
            return (
              <div key={s.id} className="flex flex-col rounded-xl border border-white/10 bg-night-900 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-500/10">
                    <Icon className="h-6 w-6 text-brand-400" />
                  </span>
                  <h2 className="text-lg font-semibold">{s.name}</h2>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-300">{s.description}</p>
                <dl className="mt-5 grid grid-cols-3 gap-3 rounded-lg bg-night-800/50 p-3 text-center text-sm">
                  <div>
                    <dt className="text-xs text-slate-400">From</dt>
                    <dd className="font-semibold">{money(s.basePrice)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">Per extra feature</dt>
                    <dd className="font-semibold">{money(s.pricePerFeature)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">Typical time</dt>
                    <dd className="inline-flex items-center gap-1 font-semibold">
                      <Clock className="h-3.5 w-3.5" /> {s.typicalWeeks} wks
                    </dd>
                  </div>
                </dl>
                <Link
                  href={`/quote?service=${s.id}`}
                  className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-brand-700"
                >
                  Estimate this service
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
