import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { Reveal, money } from "@/components/ui";
import { CATEGORY_ICON } from "@/constants/icons";
import { AskNixoButton, NixoAvatar } from "@/components/public/Nixo";
import { Eyebrow, SectionHeading } from "@/components/public/Section";
import { HERO_FACTS, PROCESS_STEPS, WHY_US } from "@/data/home";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [services, projects] = await Promise.all([
    prisma.service.findMany({ where: { active: true }, orderBy: { basePrice: "asc" } }),
    prisma.project.findMany({
      where: { published: true },
      include: { service: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);
  const minPrice = services[0]?.basePrice;

  const facts = [
    { value: String(services.length), label: "Core services" },
    { value: minPrice ? money(minPrice) : "—", label: "Projects from" },
    { value: HERO_FACTS.replyTime, label: "Reply time" },
    { value: HERO_FACTS.freeSupport, label: "Free support" },
  ];

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative">
        <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 -top-24" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -top-24 bg-[radial-gradient(ellipse_50%_45%_at_72%_45%,rgb(124_58_237/0.35),transparent_70%),radial-gradient(ellipse_40%_35%_at_15%_10%,rgb(76_29_149/0.3),transparent_70%)]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pb-12 pt-12 sm:pt-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="animate-slide-up">
            <AskNixoButton className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 py-1 pl-1 pr-3 text-xs text-slate-300 transition-colors hover:border-brand-400/40 hover:bg-brand-500/10">
              <NixoAvatar size={22} />
              Meet Nixo, our AI assistant
              <ArrowRight className="h-3 w-3 text-brand-300 transition-transform group-hover:translate-x-0.5" />
            </AskNixoButton>
            <h1 className="text-gradient mt-6 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Software that grows your business.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
              NT Tech Innovation designs and builds websites, mobile apps and practical AI for startups and SMEs in
              Bangladesh and beyond.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/quote"
                className="group inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 font-medium text-white shadow-[0_0_0_1px_rgb(167_139_250/0.4)_inset,0_10px_30px_-8px_rgb(124_58_237/0.8)] transition-all hover:bg-brand-500 active:scale-[0.97]"
              >
                Get an instant estimate
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex h-11 items-center rounded-xl border border-white/10 bg-white/4 px-5 font-medium text-slate-200 transition-all hover:border-white/20 hover:bg-white/8 active:scale-[0.97]"
              >
                See our work
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-88 animate-[slide-up_0.8s_var(--ease-out-soft)_0.15s_both]">
            <Image
              src="/nixo/nixo-body.webp"
              alt="Nixo, the NT Tech Innovation mascot, waving hello"
              width={600}
              height={660}
              priority
              className="nixo-fade nixo-float h-auto w-full"
            />
          </div>
        </div>

        {/* Key facts */}
        <div className="relative mx-auto max-w-6xl px-4 pb-6">
          <dl className="grid grid-cols-2 divide-white/5 rounded-2xl border border-white/8 bg-white/2 backdrop-blur-sm sm:grid-cols-4 sm:divide-x">
            {facts.map((f, i) => (
              <Reveal key={f.label} delay={i * 80} className="px-6 py-5">
                <dt className="text-xs text-slate-500">{f.label}</dt>
                <dd className="mt-1 text-2xl font-semibold tracking-tight text-white">{f.value}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Services ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <SectionHeading
          eyebrow="01 — Services"
          title="Everything you need, from idea to launch."
          description="Clear starting prices for every service. Pick one to see your estimate."
          action={
            <Link
              href="/services"
              className="group inline-flex items-center gap-1 text-sm text-brand-300 transition-colors hover:text-brand-200"
            >
              All services <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = CATEGORY_ICON[s.category];
            return (
              <Reveal key={s.id} delay={(i % 3) * 90}>
                <Link
                  href={`/quote?service=${s.id}`}
                  className="surface glow-card group flex h-full flex-col rounded-2xl p-6"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-brand-400/20 bg-brand-500/10">
                    <Icon className="h-5 w-5 text-brand-300" />
                  </span>
                  <h3 className="mt-5 text-lg font-medium text-white">{s.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{s.summary}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-sm">
                    <span className="text-slate-400">
                      From <span className="font-medium text-white">{money(s.basePrice)}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-brand-300 opacity-70 transition-all group-hover:opacity-100">
                      Estimate <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------- Process ---------- */}
      <section className="relative py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgb(46_16_101/0.45),transparent_100%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4">
          <SectionHeading eyebrow="02 — Process" title="A simple process, with no surprises." />
          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((p, i) => (
              <Reveal key={p.title} delay={i * 100} className="bg-night-950/90 p-6 sm:p-8">
                <p className="font-mono text-xs text-brand-300/80">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-10 text-lg font-medium text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Why us ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <SectionHeading eyebrow="03 — Why NT Tech" title="Built for small teams with big plans." />
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_US.map((w, i) => (
            <Reveal key={w.title} delay={(i % 3) * 90} className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/4">
                <w.icon className="h-4.5 w-4.5 text-brand-300" />
              </span>
              <div>
                <h3 className="font-medium text-white">{w.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{w.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Recent work ---------- */}
      {projects.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-24">
          <SectionHeading
            eyebrow="04 — Work"
            title="Recent projects."
            action={
              <Link
                href="/portfolio"
                className="group inline-flex items-center gap-1 text-sm text-brand-300 transition-colors hover:text-brand-200"
              >
                Full portfolio <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            {projects.map((p, i) => (
              <Reveal key={p.id} delay={i * 100} as="article" className="surface glow-card flex flex-col rounded-2xl p-6">
                <Eyebrow className="text-[10px]">{p.service?.name ?? "Custom"}</Eyebrow>
                <h3 className="mt-3 text-lg font-medium text-white">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{p.summary}</p>
                {p.techStack.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {p.techStack.slice(0, 4).map((t) => (
                      <span key={t} className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-slate-400">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Call to action ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal className="relative overflow-hidden rounded-3xl border border-white/8 px-6 py-20 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_100%,rgb(124_58_237/0.4),transparent_70%)]"
          />
          <div aria-hidden className="bg-grid pointer-events-none absolute inset-0" />
          <div className="relative flex flex-col items-center">
            <NixoAvatar size={72} className="glow-ring" />
            <Eyebrow className="mt-6">Ready to build?</Eyebrow>
            <h2 className="text-gradient mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Let&apos;s build what&apos;s next.
            </h2>
            <p className="mt-4 max-w-md text-slate-400">
              Get a price range in under a minute, or ask Nixo anything first.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/quote"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 font-medium text-night-950 transition-all hover:bg-brand-100 active:scale-[0.97]"
              >
                Start your quote <ArrowRight className="h-4 w-4" />
              </Link>
              <AskNixoButton className="inline-flex h-11 items-center rounded-xl border border-white/15 px-5 font-medium text-slate-200 transition-all hover:bg-white/6 active:scale-[0.97]">
                Ask Nixo
              </AskNixoButton>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
