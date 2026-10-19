"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  Copy,
  MessageSquareText,
  Plus,
  RefreshCw,
  Trash2,
  UserRound,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";
import type { ActivityType, AiSource, Category, LeadStatus, Role, Timeline, Urgency } from "@prisma/client";
import { api, FetchError } from "@/lib/fetcher";
import { LEAD_STATUS_LABEL, nextStatuses } from "@/lib/leadWorkflow";
import { CATEGORY_LABEL, STATUS_COLOR, TIMELINE_LABEL, URGENCY_COLOR } from "@/lib/labels";
import { Badge, Button, Card, ErrorState, Modal, Select, Spinner, Textarea, cn, money } from "@/components/ui";
import { NixoAvatar } from "@/components/public/Nixo";

interface Activity {
  id: string;
  type: ActivityType;
  fromStatus: LeadStatus | null;
  toStatus: LeadStatus | null;
  note: string | null;
  createdAt: string;
  user: { name: string } | null;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  features: number;
  timeline: Timeline;
  budget: number | null;
  status: LeadStatus;
  estimatedMin: number | null;
  estimatedMax: number | null;
  aiCategory: Category | null;
  aiUrgency: Urgency | null;
  aiScore: number | null;
  aiSummary: string | null;
  aiDraftReply: string | null;
  aiSource: AiSource | null;
  createdAt: string;
  service: { name: string } | null;
  assignedTo: { id: string; name: string } | null;
  project: { id: string; title: string } | null;
  activities: Activity[];
}

const ACTIVITY_ICON: Record<ActivityType, typeof Bot> = {
  CREATED: Plus,
  STATUS_CHANGE: Workflow,
  NOTE: MessageSquareText,
  ASSIGN: UserRound,
  AI_TRIAGE: Bot,
};

const ACTIVITY_LABEL: Record<ActivityType, string> = {
  CREATED: "Lead created",
  STATUS_CHANGE: "Status changed",
  NOTE: "Note",
  ASSIGN: "Assignment",
  AI_TRIAGE: "AI triage",
};

export function LeadDetail({ id }: { id: string }) {
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [role, setRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState<LeadStatus | null>(null);
  const [statusNote, setStatusNote] = useState("");
  // Flips after the first paint so progress bars and the score ring animate in.
  const [mounted, setMounted] = useState(false);

  const loaded = lead !== null;
  useEffect(() => {
    if (!loaded) return;
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, [loaded]);

  const load = useCallback(async () => {
    setError(null);
    try {
      setLead(await api<Lead>(`/api/admin/leads/${id}`));
    } catch (err) {
      setError(err instanceof FetchError ? err.message : "Failed to load lead");
    }
  }, [id]);

  useEffect(() => {
    load();
    api<{ items: Array<{ id: string; name: string }> }>("/api/admin/users")
      .then((r) => setUsers(r.items))
      .catch(() => {});
    api<{ user: { role: Role } }>("/api/auth/me")
      .then((r) => setRole(r.user.role))
      .catch(() => {});
  }, [load]);

  /** Runs an action with a busy flag, toasts the result and reloads the lead. */
  async function run(key: string, fn: () => Promise<unknown>, success: string) {
    setBusy(key);
    try {
      await fn();
      toast.success(success);
      if (key !== "delete") await load();
      return true;
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Action failed");
      return false;
    } finally {
      setBusy(null);
    }
  }

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!lead) return <Spinner label="Loading lead..." />;

  const transitions = nextStatuses(lead.status);

  async function confirmStatus() {
    if (!pending || !lead) return;
    const ok = await run(
      "status",
      () =>
        api(`/api/admin/leads/${lead.id}/status`, {
          method: "PATCH",
          json: { status: pending, note: statusNote.trim() || undefined },
        }),
      pending === "WON" ? "Lead won — client and project created" : `Moved to ${LEAD_STATUS_LABEL[pending]}`,
    );
    if (ok) {
      setPending(null);
      setStatusNote("");
    }
  }

  const STEPS: LeadStatus[] = ["NEW", "CONTACTED", "PROPOSAL_SENT", "WON"];
  // For a lost lead, show how far it got before it was lost.
  const lostFrom = lead.activities.find((a) => a.toStatus === "LOST")?.fromStatus ?? "NEW";
  const reached = STEPS.indexOf(lead.status === "LOST" ? lostFrom : lead.status);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link href="/admin/leads" className="inline-flex items-center gap-1 transition-colors hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Leads
        </Link>
        <span>/</span>
        <span className="truncate text-slate-300">{lead.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-linear-to-br from-brand-400/30 to-brand-700/30 text-lg font-semibold text-brand-100 ring-1 ring-brand-400/30">
            {lead.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-white">{lead.name}</h1>
            <p className="truncate text-sm text-slate-400">
              {lead.company ? `${lead.company} · ` : ""}
              <a href={`mailto:${lead.email}`} className="transition-colors hover:text-white">
                {lead.email}
              </a>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {transitions.map((to) => (
            <Button key={to} variant={to === "LOST" ? "secondary" : "primary"} onClick={() => setPending(to)}>
              {to === "WON" ? "Mark as won" : to === "LOST" ? "Mark as lost" : `Move to ${LEAD_STATUS_LABEL[to]}`}
            </Button>
          ))}
          {role === "ADMIN" && (
            <Button
              variant="ghost"
              aria-label="Delete lead"
              title="Delete lead"
              loading={busy === "delete"}
              className="hover:bg-red-500/10 hover:text-red-300"
              onClick={async () => {
                if (!confirm("Delete this lead permanently?")) return;
                const ok = await run(
                  "delete",
                  () => api(`/api/admin/leads/${lead.id}`, { method: "DELETE" }),
                  "Lead deleted",
                );
                if (ok) router.replace("/admin/leads");
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Stage progress */}
      <div className="grid grid-cols-4 gap-1.5">
        {STEPS.map((step, i) => {
          const done = i <= reached;
          const lost = lead.status === "LOST";
          return (
            <div key={step}>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
                <div
                  className={cn(
                    "h-full origin-left rounded-full transition-transform duration-700 ease-out",
                    lost ? "bg-red-400/70" : step === "WON" ? "bg-emerald-400" : "bg-brand-400",
                  )}
                  style={{ transform: `scaleX(${done && mounted ? 1 : 0})`, transitionDelay: `${i * 120}ms` }}
                />
              </div>
              <p className={cn("mt-2 text-xs", done ? "text-slate-200" : "text-slate-600")}>
                {LEAD_STATUS_LABEL[step]}
                {lost && i === reached && <span className="text-red-300"> · lost here</span>}
              </p>
            </div>
          );
        })}
      </div>

      {lead.project && (
        <div className="flex animate-pop-in flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/7 px-4 py-3 text-sm text-emerald-200">
          <span>This lead was won and converted into a project.</span>
          <Link
            href={`/admin/projects/${lead.project.id}`}
            className="inline-flex items-center gap-1 font-medium text-emerald-300 hover:text-emerald-200"
          >
            {lead.project.title} <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          {/* AI triage */}
          <Card className="relative isolate overflow-hidden p-6">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_0%_0%,rgb(124_58_237/0.18),transparent_70%)]"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <NixoAvatar size={36} className="glow-ring" />
                <div>
                  <h2 className="font-medium text-white">Nixo&apos;s triage</h2>
                  <p className="text-xs text-slate-500">
                    {lead.aiSource === "LLM" ? "Generated by Claude" : lead.aiSource ? "Keyword fallback" : "Not run yet"}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                loading={busy === "retriage"}
                onClick={() =>
                  run("retriage", () => api(`/api/admin/leads/${lead.id}/retriage`, { method: "POST" }), "AI triage updated")
                }
              >
                <RefreshCw className="h-3.5 w-3.5" /> Re-run
              </Button>
            </div>

            {lead.aiScore == null ? (
              <p className="mt-4 text-sm text-slate-400">Not triaged yet.</p>
            ) : (
              <>
                <div className="mt-6 grid gap-4 sm:grid-cols-[auto_1fr]">
                  <ScoreRing score={lead.aiScore} shown={mounted} />
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {lead.aiCategory && <Badge color="indigo">{CATEGORY_LABEL[lead.aiCategory]}</Badge>}
                      {lead.aiUrgency && (
                        <Badge color={URGENCY_COLOR[lead.aiUrgency]}>{lead.aiUrgency.toLowerCase()} urgency</Badge>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-200">{lead.aiSummary}</p>
                  </div>
                </div>
                {lead.aiDraftReply && (
                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Suggested reply</p>
                      <button
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-brand-300 transition-colors hover:bg-brand-500/10"
                        onClick={() =>
                          navigator.clipboard
                            .writeText(lead.aiDraftReply ?? "")
                            .then(() => toast.success("Copied to clipboard"))
                            .catch(() => toast.error("Could not copy"))
                        }
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap rounded-xl border border-white/5 bg-black/20 p-4 font-sans text-sm leading-relaxed text-slate-300">
                      {lead.aiDraftReply}
                    </pre>
                  </div>
                )}
                <p className="mt-4 text-xs text-slate-500">
                  AI suggestions — review before acting. A person always decides the status.
                </p>
              </>
            )}
          </Card>

          {/* Inquiry */}
          <Card className="p-6">
            <h2 className="font-medium text-white">Inquiry</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{lead.message}</p>
          </Card>

          {/* Activity */}
          <Card className="p-6">
            <h2 className="font-medium text-white">Activity</h2>
            <form
              className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!note.trim()) return;
                const ok = await run(
                  "note",
                  () => api(`/api/admin/leads/${lead.id}/notes`, { method: "POST", json: { note } }),
                  "Note added",
                );
                if (ok) setNote("");
              }}
            >
              <Textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note, e.g. a call summary..."
                maxLength={2000}
                className="flex-1"
                aria-label="Note"
              />
              <Button type="submit" variant="secondary" loading={busy === "note"} disabled={!note.trim()}>
                Add note
              </Button>
            </form>
            <ol className="relative mt-6 space-y-5 before:absolute before:bottom-2 before:left-2.75 before:top-2 before:w-px before:bg-white/10">
              {lead.activities.map((a, i) => {
                const Icon = ACTIVITY_ICON[a.type];
                return (
                  <li
                    key={a.id}
                    className="relative flex animate-slide-up gap-3"
                    style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                  >
                    <span className="relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/10 bg-night-900">
                      <Icon className="h-3 w-3 text-brand-300" />
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-sm text-slate-200">
                        {a.type === "STATUS_CHANGE" && a.fromStatus && a.toStatus ? (
                          <>
                            Moved from <b className="font-medium text-white">{LEAD_STATUS_LABEL[a.fromStatus]}</b> to{" "}
                            <b className="font-medium text-white">{LEAD_STATUS_LABEL[a.toStatus]}</b>
                          </>
                        ) : (
                          ACTIVITY_LABEL[a.type]
                        )}
                      </p>
                      {a.note && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-400">{a.note}</p>}
                      <p className="mt-1 text-xs text-slate-500">
                        {a.user?.name ?? "System"} · {new Date(a.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>

        {/* Details sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card className="p-5">
            <h2 className="text-xs font-medium uppercase tracking-wider text-slate-500">Details</h2>
            <dl className="mt-4 space-y-3.5 text-sm">
              <Row label="Status">
                <Badge color={STATUS_COLOR[lead.status]}>{LEAD_STATUS_LABEL[lead.status]}</Badge>
              </Row>
              <Row label="Owner">
                <Select
                  className="h-8 w-40 py-0 text-xs"
                  aria-label="Owner"
                  value={lead.assignedTo?.id ?? ""}
                  disabled={busy === "assign"}
                  onChange={(e) =>
                    run(
                      "assign",
                      () =>
                        api(`/api/admin/leads/${lead.id}/assign`, {
                          method: "PATCH",
                          json: { userId: e.target.value || null },
                        }),
                      "Owner updated",
                    )
                  }
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </Select>
              </Row>
              <Row label="Service">{lead.service?.name ?? "Not selected"}</Row>
              <Row label="Features">{lead.features}</Row>
              <Row label="Timeline">{TIMELINE_LABEL[lead.timeline]}</Row>
              <Row label="Budget">{money(lead.budget)}</Row>
              <Row label="Estimate">
                {lead.estimatedMax ? `${money(lead.estimatedMin)} – ${money(lead.estimatedMax)}` : "—"}
              </Row>
              <Row label="Phone">{lead.phone ?? "—"}</Row>
              <Row label="Received">{new Date(lead.createdAt).toLocaleDateString()}</Row>
            </dl>
          </Card>
        </aside>
      </div>

      <Modal
        open={pending !== null}
        title={pending ? `Move to "${LEAD_STATUS_LABEL[pending]}"` : ""}
        onClose={() => setPending(null)}
      >
        {pending === "WON" && (
          <p className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-500/7 p-3 text-sm text-emerald-200">
            This will create a client record and a new project with default milestones.
          </p>
        )}
        <Textarea
          rows={3}
          value={statusNote}
          onChange={(e) => setStatusNote(e.target.value)}
          placeholder="Optional note, e.g. reason for losing or proposal details"
          maxLength={1000}
          aria-label="Status note"
        />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setPending(null)}>
            Cancel
          </Button>
          <Button loading={busy === "status"} onClick={confirmStatus}>
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right text-slate-200">{children}</dd>
    </div>
  );
}

/** Circular 0–100 score gauge that animates its arc in. */
function ScoreRing({ score, shown }: { score: number; shown: boolean }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const color = score >= 70 ? "#34d399" : score >= 45 ? "#fbbf24" : "#f87171";
  return (
    <div className="relative grid h-20 w-20 place-items-center">
      <svg viewBox="0 0 72 72" className="absolute inset-0 -rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={shown ? c * (1 - score / 100) : c}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="text-center">
        <p className="text-xl font-semibold leading-none text-white">{score}</p>
        <p className="mt-0.5 text-[10px] text-slate-500">score</p>
      </div>
    </div>
  );
}
