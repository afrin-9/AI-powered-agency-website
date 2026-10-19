import Link from "next/link";
import { ArrowRight, Bot } from "lucide-react";
import { prisma } from "@/lib/db";
import { money } from "@/components/ui";
import { CATEGORY_ICON } from "@/components/public/categoryIcon";

export const dynamic = "force-dynamic";

const PROCESS = [
  { title: "Discovery", text: "We map your goals, users and scope in a free consultation." },
  { title: "Design", text: "Wireframes and clickable prototypes before any code is written." },
  { title: "Build", text: "Short sprints with weekly demos so you always see progress." },
  { title: "Launch", text: "Deployment, handover training and 30 days of free support." },
];

export default async function HomePage() {
  const [services, projects] = await Promise.all([
    prisma.service.findMany({ where: { active: true }, orderBy: { basePrice: "asc" }, take: 6 }),
    prisma.project.findMany({
      where: { published: true },
      include: { service: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <>
      <section className="bg-linear-to-br from-brand-900 via-brand-700 to-brand-500 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
            <Bot className="h-3.5 w-3.5" /> Now building AI-powered products
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            Software that grows your business — websites, apps and practical AI.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-brand-100">
            NT Tech Innovation designs and builds digital products for startups and SMEs in Bangladesh and beyond.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/quote"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-medium text-brand-700 hover:bg-brand-50"
            >
              Get an instant estimate <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/portfolio" className="rounded-lg border border-white/30 px-5 py-3 font-medium hover:bg-white/10">
              See our work
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">What we do</h2>
            <p className="mt-1 text-slate-600">End-to-end services from idea to launch.</p>
          </div>
          <Link href="/services" className="text-sm font-medium text-brand-700 hover:underline">
            All services →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const Icon = CATEGORY_ICON[s.category];
            return (
              <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <Icon className="h-8 w-8 text-brand-600" />
                <h3 className="mt-3 font-semibold">{s.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.summary}</p>
                <p className="mt-3 text-sm font-medium text-slate-900">From {money(s.basePrice)}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold">How we work</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, i) => (
              <div key={p.title}>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 font-semibold text-brand-700">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {projects.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold">Recent projects</h2>
            <Link href="/portfolio" className="text-sm font-medium text-brand-700 hover:underline">
              Full portfolio →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {projects.map((p) => (
              <article key={p.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-brand-600">{p.service?.name}</p>
                <h3 className="mt-2 font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{p.summary}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto my-16 max-w-6xl px-4">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-brand-600 p-8 text-white sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Have a project in mind?</h2>
            <p className="mt-1 text-brand-100">Get a price range in under a minute. No commitment.</p>
          </div>
          <Link href="/quote" className="rounded-lg bg-white px-5 py-3 font-medium text-brand-700 hover:bg-brand-50">
            Start your quote
          </Link>
        </div>
      </section>
    </>
  );
}
