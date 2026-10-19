import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { prisma } from "@/lib/db";
import { money } from "@/components/ui";
import { CATEGORY_ICON } from "@/components/public/categoryIcon";
import { AskNixoButton, NixoAvatar } from "@/components/public/Nixo";

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
      <section className="relative overflow-hidden bg-night-950 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_65%,rgb(124_58_237/0.45),transparent_55%),radial-gradient(ellipse_at_10%_0%,rgb(76_29_149/0.35),transparent_45%)]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-6 px-4 pb-8 pt-14 sm:pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:pb-14">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-200">
              <Sparkles className="h-3.5 w-3.5" /> Now building AI-powered products
            </p>
            <h1 className="glow-text max-w-2xl bg-linear-to-b from-white to-brand-300 bg-clip-text text-4xl font-bold leading-tight text-transparent sm:text-5xl">
              Software that grows your business — websites, apps and practical AI.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-brand-100/80">
              NT Tech Innovation designs and builds digital products for startups and SMEs in Bangladesh and beyond.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-3 font-medium shadow-lg shadow-brand-600/40 hover:bg-brand-500"
              >
                Get an instant estimate <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/portfolio"
                className="rounded-lg border border-brand-300/30 px-5 py-3 font-medium text-brand-100 hover:bg-white/5"
              >
                See our work
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <Image
              src="/nixo/nixo-body.webp"
              alt="Nixo, the NT Tech Innovation mascot, waving hello"
              width={600}
              height={660}
              priority
              className="nixo-fade nixo-float h-auto w-full"
            />
            <AskNixoButton className="glow-ring absolute left-0 top-6 flex items-center gap-2 rounded-2xl rounded-bl-sm bg-night-900/90 px-4 py-2 text-left text-sm text-brand-100 backdrop-blur hover:bg-night-800 sm:-left-10">
              <MessageCircle className="h-4 w-4 text-brand-300" />
              <span>
                Hi, I&apos;m <b className="text-white">Nixo</b>! Ask me anything.
              </span>
            </AskNixoButton>
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
              <div
                key={s.id}
                className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md hover:shadow-brand-200/50"
              >
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-50">
                  <Icon className="h-6 w-6 text-brand-600" />
                </span>
                <h3 className="mt-3 font-semibold">{s.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.summary}</p>
                <p className="mt-3 text-sm font-medium text-slate-900">From {money(s.basePrice)}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-brand-100 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold">How we work</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, i) => (
              <div key={p.title}>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-brand-400 to-brand-700 font-semibold text-white">
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
              <article key={p.id} className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-brand-600">{p.service?.name}</p>
                <h3 className="mt-2 font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{p.summary}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto my-16 max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-2xl bg-night-900 p-8 text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_50%,rgb(124_58_237/0.5),transparent_60%)]"
          />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <NixoAvatar size={64} className="glow-ring" />
              <div>
                <h2 className="glow-text text-2xl font-bold">Have a project in mind?</h2>
                <p className="mt-1 text-brand-200">Get a price range in under a minute, or ask Nixo first.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <AskNixoButton className="rounded-lg border border-brand-300/40 px-5 py-3 font-medium text-brand-100 hover:bg-white/5">
                Ask Nixo
              </AskNixoButton>
              <Link href="/quote" className="rounded-lg bg-white px-5 py-3 font-medium text-brand-700 hover:bg-brand-50">
                Start your quote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
