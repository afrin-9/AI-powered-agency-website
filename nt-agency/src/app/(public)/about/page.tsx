import { prisma } from "@/lib/db";
import { FAQ } from "@/lib/faq";

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
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="text-3xl font-bold">About us</h1>
      <p className="mt-3 max-w-3xl text-slate-300">
        NT Tech Innovation is a software agency helping businesses go digital — from their first website to AI-powered
        products. We combine solid engineering with clear communication and fair, transparent pricing.
      </p>

      {team.length > 0 && (
        <>
          <h2 className="mt-12 text-xl font-semibold">Our team</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <div key={m.id} className="rounded-xl border border-white/10 bg-night-900 p-5 shadow-sm">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-500/20 font-semibold text-brand-300">
                  {initials(m.name)}
                </div>
                <p className="mt-3 font-semibold">{m.name}</p>
                <p className="text-sm text-brand-300">{m.role}</p>
                <p className="mt-2 text-sm text-slate-300">{m.bio}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="mt-14 text-xl font-semibold">Frequently asked questions</h2>
      <div className="mt-6 divide-y divide-white/10 rounded-xl border border-white/10 bg-night-900">
        {FAQ.map((f) => (
          <details key={f.q} className="group p-5">
            <summary className="cursor-pointer list-none font-medium marker:hidden">
              <span className="mr-2 text-brand-400 group-open:hidden">+</span>
              <span className="mr-2 hidden text-brand-400 group-open:inline">−</span>
              {f.q}
            </summary>
            <p className="mt-3 text-sm text-slate-300">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
