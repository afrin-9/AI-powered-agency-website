"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Category, LeadStatus, Urgency } from "@prisma/client";
import { api, FetchError } from "@/lib/fetcher";
import { LEAD_STATUS_LABEL, nextStatuses } from "@/lib/leadWorkflow";
import { CATEGORY_LABEL, STATUS_COLOR, URGENCY_COLOR, scoreColor } from "@/lib/labels";
import { Badge, Button, Card, EmptyState, ErrorState, Input, Select, Spinner, cn, money } from "@/components/ui";

interface LeadRow {
  id: string;
  name: string;
  email: string;
  company: string | null;
  status: LeadStatus;
  aiScore: number | null;
  aiCategory: Category | null;
  aiUrgency: Urgency | null;
  aiSummary: string | null;
  estimatedMin: number | null;
  estimatedMax: number | null;
  createdAt: string;
  service: { id: string; name: string } | null;
  assignedTo: { id: string; name: string } | null;
}

interface LeadPage {
  items: LeadRow[];
  total: number;
  pageSize: number;
}

const STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "PROPOSAL_SENT", "WON", "LOST"];

export function LeadsView() {
  const router = useRouter();
  const params = useSearchParams();
  const rawStatus = params.get("status");
  const status = STATUSES.includes(rawStatus as LeadStatus) ? (rawStatus as LeadStatus) : "";
  const sort = params.get("sort") === "newest" ? "newest" : "score";
  const search = params.get("q") ?? "";

  const [view, setView] = useState<"table" | "board">("table");
  const [q, setQ] = useState(search);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<LeadPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setPage(1);
    router.replace(`/admin/leads?${next.toString()}`);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // The board shows every stage at once, so it fetches one large page without a status filter.
      const qs = new URLSearchParams({ sort, page: String(page), pageSize: view === "board" ? "100" : "15" });
      if (status && view === "table") qs.set("status", status);
      if (search) qs.set("q", search);
      setData(await api<LeadPage>(`/api/admin/leads?${qs}`));
    } catch (err) {
      setError(err instanceof FetchError ? err.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [sort, page, status, view, search]);

  useEffect(() => {
    load();
  }, [load]);

  async function move(lead: LeadRow, to: LeadStatus) {
    try {
      const res = await api<{ converted: { projectId: string } | null }>(`/api/admin/leads/${lead.id}/status`, {
        method: "PATCH",
        json: { status: to },
      });
      toast.success(
        res.converted ? `${lead.name} won! Client and project created.` : `Moved to ${LEAD_STATUS_LABEL[to]}`,
      );
      load();
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Could not update status");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-slate-500">AI-triaged inquiries from the website</p>
        </div>
        <div className="flex rounded-lg border border-slate-300 bg-white p-0.5">
          <button
            onClick={() => setView("table")}
            aria-pressed={view === "table"}
            className={cn("flex items-center gap-1 rounded-md px-3 py-1.5 text-sm", view === "table" && "bg-slate-100 font-medium")}
          >
            <List className="h-4 w-4" /> Table
          </button>
          <button
            onClick={() => setView("board")}
            aria-pressed={view === "board"}
            className={cn("flex items-center gap-1 rounded-md px-3 py-1.5 text-sm", view === "board" && "bg-slate-100 font-medium")}
          >
            <LayoutGrid className="h-4 w-4" /> Board
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            setParam("q", q.trim());
          }}
        >
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, company or message..."
            className="pl-9"
            maxLength={100}
            aria-label="Search leads"
          />
        </form>
        {view === "table" && (
          <Select
            value={status}
            onChange={(e) => setParam("status", e.target.value)}
            className="sm:w-44"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {LEAD_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        )}
        <Select
          value={sort}
          onChange={(e) => setParam("sort", e.target.value === "score" ? "" : e.target.value)}
          className="sm:w-44"
          aria-label="Sort"
        >
          <option value="score">Highest AI score</option>
          <option value="newest">Newest first</option>
        </Select>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading && !data ? (
        <Spinner label="Loading leads..." />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No leads found"
          description="Try a different filter, or submit a test inquiry from the Get a Quote page."
        />
      ) : view === "table" ? (
        <Card className={cn("overflow-hidden", loading && "opacity-60")}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3">AI score</th>
                  <th className="px-4 py-3">AI category / urgency</th>
                  <th className="px-4 py-3">Estimate</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((l) => (
                  <tr
                    key={l.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => router.push(`/admin/leads/${l.id}`)}
                  >
                    <td className="max-w-xs px-4 py-3">
                      <Link
                        href={`/admin/leads/${l.id}`}
                        className="font-medium text-slate-900 hover:text-brand-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {l.name}
                      </Link>
                      <p className="truncate text-xs text-slate-500">{l.company ?? l.email}</p>
                      {l.aiSummary && <p className="mt-1 line-clamp-1 text-xs text-slate-600">{l.aiSummary}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={scoreColor(l.aiScore)}>{l.aiScore ?? "—"}</Badge>
                    </td>
                    <td className="space-x-1 px-4 py-3">
                      {l.aiCategory && <Badge color="indigo">{CATEGORY_LABEL[l.aiCategory]}</Badge>}
                      {l.aiUrgency && <Badge color={URGENCY_COLOR[l.aiUrgency]}>{l.aiUrgency.toLowerCase()}</Badge>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {l.estimatedMax ? `${money(l.estimatedMin)}–${money(l.estimatedMax)}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={STATUS_COLOR[l.status]}>{LEAD_STATUS_LABEL[l.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {l.assignedTo?.name ?? <span className="text-slate-400">Unassigned</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
            <span>
              {data.total} lead{data.total === 1 ? "" : "s"}
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page * data.pageSize >= data.total}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className={cn("grid gap-4 overflow-x-auto pb-2 md:grid-cols-3 xl:grid-cols-5", loading && "opacity-60")}>
          {STATUSES.map((s) => {
            const items = data.items.filter((l) => l.status === s);
            return (
              <div key={s} className="min-w-60 rounded-xl bg-slate-100 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <Badge color={STATUS_COLOR[s]}>{LEAD_STATUS_LABEL[s]}</Badge>
                  <span className="text-xs text-slate-500">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((l) => (
                    <div key={l.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/admin/leads/${l.id}`} className="text-sm font-medium hover:text-brand-700">
                          {l.name}
                        </Link>
                        <Badge color={scoreColor(l.aiScore)}>{l.aiScore ?? "—"}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{l.service?.name ?? "No service"}</p>
                      {l.aiUrgency === "HIGH" && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                          <Sparkles className="h-3 w-3" /> High urgency
                        </p>
                      )}
                      {nextStatuses(l.status).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {nextStatuses(l.status).map((to) => (
                            <button
                              key={to}
                              onClick={() => move(l, to)}
                              className={cn(
                                "rounded border px-2 py-0.5 text-xs",
                                to === "LOST"
                                  ? "border-red-200 text-red-600 hover:bg-red-50"
                                  : "border-brand-200 text-brand-700 hover:bg-brand-50",
                              )}
                            >
                              → {LEAD_STATUS_LABEL[to]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {items.length === 0 && <p className="py-4 text-center text-xs text-slate-400">Empty</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
