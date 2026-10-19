import Link from "next/link";
import type { LeadStatus } from "@prisma/client";
import { getPipelineStats } from "@/lib/leads";
import { LEAD_STATUS_LABEL } from "@/lib/leadWorkflow";
import { STATUS_COLOR, scoreColor } from "@/lib/labels";
import { aiEnabled } from "@/lib/ai/client";
import { Badge, Card, money } from "@/components/ui";

const STAGES: LeadStatus[] = ["NEW", "CONTACTED", "PROPOSAL_SENT", "WON", "LOST"];

export default async function DashboardPage() {
  const stats = await getPipelineStats();
  const maxService = Math.max(1, ...stats.byService.map((s) => s.count));
  const ai = aiEnabled();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-slate-400">Sales pipeline overview</p>
        </div>
        <Badge color={ai ? "green" : "amber"}>
          AI triage: {ai ? "Claude connected" : "keyword fallback (no API key)"}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total leads" value={stats.total.toString()} />
        <Stat label="Open pipeline value" value={money(stats.openPipelineValue)} hint="Upper estimate of open leads" />
        <Stat label="Won value" value={money(stats.wonValue)} />
        <Stat label="Win rate" value={`${stats.conversionRate}%`} hint="Won ÷ (won + lost)" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold">Pipeline by stage</h2>
          <div className="mt-4 space-y-3">
            {STAGES.map((s) => {
              const count = stats.counts[s] ?? 0;
              const pct = stats.total ? (count / stats.total) * 100 : 0;
              return (
                <Link key={s} href={`/admin/leads?status=${s}`} className="block rounded hover:bg-night-800/60">
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{LEAD_STATUS_LABEL[s]}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-night-800">
                    <div className="h-2 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold">Leads by service</h2>
          <div className="mt-4 space-y-3">
            {stats.byService.length === 0 && <p className="text-sm text-slate-400">No leads yet.</p>}
            {stats.byService.map((s) => (
              <div key={s.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{s.name}</span>
                  <span className="font-medium">{s.count}</span>
                </div>
                <div className="h-2 rounded-full bg-night-800">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${(s.count / maxService) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Latest inquiries</h2>
          <Link href="/admin/leads" className="text-sm text-brand-300 hover:underline">
            View all
          </Link>
        </div>
        {stats.recent.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No inquiries yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-white/5">
            {stats.recent.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/admin/leads/${l.id}`}
                  className="flex items-center justify-between gap-3 py-3 hover:bg-night-800/60"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {l.name}
                      {l.company ? ` · ${l.company}` : ""}
                    </p>
                    <p className="text-xs text-slate-400">{l.createdAt.toLocaleDateString()}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge color={scoreColor(l.aiScore)}>Score {l.aiScore ?? "—"}</Badge>
                    <Badge color={STATUS_COLOR[l.status]}>{LEAD_STATUS_LABEL[l.status]}</Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </Card>
  );
}
