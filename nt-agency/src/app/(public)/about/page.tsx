import { prisma } from "@/lib/db";
import { FAQ } from "@/lib/faq";
import { Reveal } from "@/components/ui";
import { PageIntro, SectionHeading } from "@/components/public/Section";
import { FaqList } from "@/components/public/FaqList";

export const dynamic = "force-dynamic";
export const metadata = { title: "About & FAQ" };

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}

export default async function AboutPage() {
  const team = await prisma.teamMember.findMany({ orderBy: { position: "asc" } });

  return (
    <>
      <PageIntro
        eyebrow="About"
        title="A small team that ships."
        description="NT Tech Innovation helps businesses go digital, from their first website to AI-powered products. We pair solid engineering with clear communication and fair, transparent pricing."
      />

      {team.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <SectionHeading eyebrow="Team" title="The people behind the work." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m, i) => (
              <Reveal key={m.id} delay={i * 90} className="surface glow-card rounded-2xl p-6">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-linear-to-br from-brand-400/30 to-brand-700/30 font-semibold text-brand-100 ring-1 ring-brand-400/30">
                  {initials(m.name)}
                </div>
                <p className="mt-5 font-medium text-white">{m.name}</p>
                <p className="text-sm text-brand-300">{m.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{m.bio}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-16">
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions." center />
        <FaqList items={FAQ} />
      </section>
    </>
  );
}
