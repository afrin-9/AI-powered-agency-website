import Link from "next/link";
import { ArrowRight, CircleDollarSign, Inbox, Target, Trophy } from "lucide-react";
import type { LeadStatus } from "@prisma/client";
import { getPipelineStats } from "@/lib/leads";
import { LEAD_STATUS_LABEL } from "@/lib/leadWorkflow";
import { STATUS_COLOR, scoreColor } from "@/lib/labels";
import { aiEnabled } from "@/lib/ai/client";
import { getSession } from "@/lib/auth";
import { Badge, Card, PageHeader, Reveal, money } from "@/components/ui";
import { NixoAvatar } from "@/components/public/Nixo";

const STAGES: LeadStatus[] = ["NEW", "CONTACTED", "PROPOSAL_SENT", "WON", "LOST"];

const STAGE_BAR: Record<LeadStatus, string> = {
  NEW: "from-blue-500 to-blue-400",
  CONTACTED: "from-amber-500 to-amber-400",
  PROPOSAL_SENT: "from-violet-500 to-violet-400",
  WON: "from-emerald-500 to-emerald-400",
  LOST: "from-red-500/80 to-red-400/80",
};

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function DashboardPage() {
  const [stats, session] = await Promise.all([getPipelineStats(), getSession()]);
  const maxService = Math.max(1, ...stats.byService.map((s) => s.count));
  const ai = aiEnabled();
  const open = (stats.counts.NEW ?? 0) + (stats.counts.CONTACTED ?? 0) + (stats.counts.PROPOSAL_SENT ?? 0);

  const kpis = [
    { label: "Total leads", value: stats.total.toString(), hint: `${open} open in the pipeline`, icon: Inbox },
    { label: "Open pipeline", value: money(stats.openPipelineValue), hint: "Upper estimate of open leads", icon: Target },
    { label: "Won value", value: money(stats.wonValue), hint: `${stats.counts.WON ?? 0} won leads`, icon: Trophy },
    { label: "Win rate", value: `${stats.conversionRate}%`, hint: "Won ÷ (won + lost)", icon: CircleDollarSign },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        title={`${greeting()}, ${session?.name.split(" ")[0] ?? "there"}`}
        description="Here's how the sales pipeline looks today."
        actions={
          <Link
            href="/admin/leads"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition-all hover:bg-brand-500 active:scale-[0.97]"
          >
            Open leads <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={i * 70}>
            <Card className="h-full p-5 transition-colors duration-300 hover:border-white/15">
              <div className="flex items-start justify-between">
                <p className="text-sm text-slate-400">{k.label}</p>
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-brand-400/20 bg-brand-500/10">
                  <k.icon className="h-4 w-4 text-brand-300" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{k.value}</p>
              <p className="mt-1 text-xs text-slate-500">{k.hint}</p>
            </Card>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <Card className="h-full p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-white">Pipeline by stage</h2>
              <span className="text-xs text-slate-500">{stats.total} leads</span>
            </div>
            <div className="mt-6 space-y-4">
              {STAGES.map((s) => {
                const count = stats.counts[s] ?? 0;
                const pct = stats.total ? (count / stats.total) * 100 : 0;
                return (
                  <Link key={s} href={`/admin/leads?status=${s}`} className="group block">
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="text-slate-300 transition-colors group-hover:text-white">{LEAD_STATUS_LABEL[s]}</span>
                      <span className="font-medium tabular-nums text-white">{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full origin-left animate-[grow_0.9s_var(--ease-out-soft)_both] rounded-full bg-linear-to-r ${STAGE_BAR[s]}`}
                        style={{ width: `${Math.max(pct, count ? 3 : 0)}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={80}>
          <Card className="relative isolate h-full overflow-hidden p-6">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,rgb(124_58_237/0.3),transparent_70%)]"
            />
            <div className="flex items-center gap-3">
              <NixoAvatar size={44} className="glow-ring" />
              <div>
                <h2 className="font-medium text-white">Nixo triage</h2>
                <Badge color={ai ? "green" : "amber"}>{ai ? "Claude connected" : "Keyword fallback"}</Badge>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-slate-400">
              {ai
                ? "New inquiries are classified, scored and summarised by Claude, with a draft reply ready for review."
                : "No API key is set, so inquiries are triaged by the built-in keyword classifier. Add ANTHROPIC_API_KEY to switch to Claude."}
            </p>
            <Link
              href="/admin/leads?sort=score"
              className="group mt-6 inline-flex items-center gap-1 text-sm text-brand-300 hover:text-brand-200"
            >
              See highest-scoring leads
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Card>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal>
          <Card className="h-full p-6">
            <h2 className="font-medium text-white">Leads by service</h2>
            <div className="mt-6 space-y-4">
              {stats.byService.length === 0 && <p className="text-sm text-slate-500">No leads yet.</p>}
              {stats.byService.map((s) => (
                <div key={s.name}>
                  <div className="mb-1.5 flex justify-between gap-2 text-sm">
                    <span className="truncate text-slate-300">{s.name}</span>
                    <span className="font-medium tabular-nums text-white">{s.count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full origin-left animate-[grow_0.9s_var(--ease-out-soft)_both] rounded-full bg-linear-to-r from-brand-600 to-brand-400"
                      style={{ width: `${(s.count / maxService) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={80} className="lg:col-span-2">
          <Card className="h-full overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6">
              <h2 className="font-medium text-white">Latest inquiries</h2>
              <Link href="/admin/leads?sort=newest" className="text-sm text-brand-300 hover:text-brand-200">
                View all
              </Link>
            </div>
            {stats.recent.length === 0 ? (
              <p className="px-6 py-8 text-sm text-slate-500">No inquiries yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-white/5">
                {stats.recent.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/admin/leads/${l.id}`}
                      className="flex items-center justify-between gap-3 px-6 py-3.5 transition-colors hover:bg-white/3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/6 text-xs font-medium text-slate-300">
                          {l.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {l.name}
                            {l.company && <span className="font-normal text-slate-500"> · {l.company}</span>}
                          </p>
                          <p className="text-xs text-slate-500">{l.createdAt.toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge color={scoreColor(l.aiScore)}>{l.aiScore ?? "—"}</Badge>
                        <Badge color={STATUS_COLOR[l.status]}>{LEAD_STATUS_LABEL[l.status]}</Badge>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
