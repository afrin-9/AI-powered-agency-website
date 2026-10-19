"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ActivityType, AiSource, Category, LeadStatus, Role, Timeline, Urgency } from "@prisma/client";
import { api, FetchError } from "@/lib/fetcher";
import { LEAD_STATUS_LABEL, nextStatuses } from "@/lib/leadWorkflow";
import { CATEGORY_LABEL, STATUS_COLOR, TIMELINE_LABEL, URGENCY_COLOR, scoreColor } from "@/lib/labels";
import { Badge, Button, Card, ErrorState, Modal, Select, Spinner, Textarea, money } from "@/components/ui";
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

  return (
    <div className="space-y-6">
      <Link href="/admin/leads" className="inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to leads
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{lead.name}</h1>
          <p className="text-sm text-slate-400">
            {lead.company ? `${lead.company} · ` : ""}
            <a href={`mailto:${lead.email}`} className="hover:underline">
              {lead.email}
            </a>
            {lead.phone ? ` · ${lead.phone}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={STATUS_COLOR[lead.status]}>{LEAD_STATUS_LABEL[lead.status]}</Badge>
          {role === "ADMIN" && (
            <Button
              variant="ghost"
              size="sm"
              aria-label="Delete lead"
              loading={busy === "delete"}
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
              <Trash2 className="h-4 w-4 text-red-400" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <h2 className="font-semibold">Inquiry</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{lead.message}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-white/5 pt-4 text-sm sm:grid-cols-3">
              <Info label="Service" value={lead.service?.name ?? "Not selected"} />
              <Info label="Features" value={String(lead.features)} />
              <Info label="Timeline" value={TIMELINE_LABEL[lead.timeline]} />
              <Info label="Stated budget" value={money(lead.budget)} />
              <Info
                label="Estimate"
                value={lead.estimatedMax ? `${money(lead.estimatedMin)} – ${money(lead.estimatedMax)}` : "—"}
              />
              <Info label="Received" value={new Date(lead.createdAt).toLocaleString()} />
            </dl>
          </Card>

          <Card className="border-brand-400/25 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-semibold">
                <NixoAvatar size={28} /> AI triage
              </h2>
              <div className="flex items-center gap-2">
                {lead.aiSource && (
                  <Badge color={lead.aiSource === "LLM" ? "indigo" : "amber"}>
                    {lead.aiSource === "LLM" ? "Claude" : "Keyword fallback"}
                  </Badge>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  loading={busy === "retriage"}
                  onClick={() =>
                    run(
                      "retriage",
                      () => api(`/api/admin/leads/${lead.id}/retriage`, { method: "POST" }),
                      "AI triage updated",
                    )
                  }
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Re-run AI
                </Button>
              </div>
            </div>

            {lead.aiScore == null ? (
              <p className="mt-3 text-sm text-slate-400">Not triaged yet.</p>
            ) : (
              <>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge color={scoreColor(lead.aiScore)}>Lead score {lead.aiScore}/100</Badge>
                  {lead.aiCategory && <Badge color="indigo">{CATEGORY_LABEL[lead.aiCategory]}</Badge>}
                  {lead.aiUrgency && (
                    <Badge color={URGENCY_COLOR[lead.aiUrgency]}>{lead.aiUrgency.toLowerCase()} urgency</Badge>
                  )}
                </div>
                <p className="mt-3 text-sm">
                  <span className="font-medium">Summary:</span> {lead.aiSummary}
                </p>
                {lead.aiDraftReply && (
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-medium">Suggested reply</p>
                      <button
                        className="flex items-center gap-1 text-xs text-brand-300 hover:underline"
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
                    <pre className="whitespace-pre-wrap rounded-lg bg-night-800/50 p-3 font-sans text-sm text-slate-200">
                      {lead.aiDraftReply}
                    </pre>
                  </div>
                )}
                <p className="mt-3 text-xs text-slate-500">
                  AI suggestions — review before acting. A person always decides the status.
                </p>
              </>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold">Activity</h2>
            <form
              className="mt-3 flex flex-col gap-2 sm:flex-row"
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
                placeholder="Add a note (e.g. call summary)..."
                maxLength={2000}
                className="flex-1"
                aria-label="Note"
              />
              <Button type="submit" variant="secondary" loading={busy === "note"} disabled={!note.trim()}>
                Add note
              </Button>
            </form>
            <ol className="mt-5 space-y-4 border-l border-white/10 pl-4">
              {lead.activities.map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500" />
                  <p className="text-sm">
                    {a.type === "STATUS_CHANGE" && a.fromStatus && a.toStatus ? (
                      <>
                        Moved from <b>{LEAD_STATUS_LABEL[a.fromStatus]}</b> to <b>{LEAD_STATUS_LABEL[a.toStatus]}</b>
                      </>
                    ) : (
                      ACTIVITY_LABEL[a.type]
                    )}
                  </p>
                  {a.note && <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-300">{a.note}</p>}
                  <p className="text-xs text-slate-500">
                    {a.user?.name ?? "System"} · {new Date(a.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold">Pipeline</h2>
            {transitions.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">
                This lead is closed ({LEAD_STATUS_LABEL[lead.status].toLowerCase()}).
              </p>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {transitions.map((to) => (
                  <Button key={to} variant={to === "LOST" ? "secondary" : "primary"} onClick={() => setPending(to)}>
                    {to === "WON" ? "Mark as won" : to === "LOST" ? "Mark as lost" : `Move to ${LEAD_STATUS_LABEL[to]}`}
                  </Button>
                ))}
              </div>
            )}
            {lead.project && (
              <div className="mt-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">
                Converted to project{" "}
                <Link href={`/admin/projects/${lead.project.id}`} className="font-medium underline">
                  {lead.project.title}
                </Link>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold">Owner</h2>
            <Select
              className="mt-3"
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
          </Card>
        </div>
      </div>

      <Modal
        open={pending !== null}
        title={pending ? `Move to "${LEAD_STATUS_LABEL[pending]}"` : ""}
        onClose={() => setPending(null)}
      >
        {pending === "WON" && (
          <p className="mb-3 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">
            This will create a client record and a new project with default milestones.
          </p>
        )}
        <Textarea
          rows={3}
          value={statusNote}
          onChange={(e) => setStatusNote(e.target.value)}
          placeholder="Optional note (e.g. reason for losing, proposal details)"
          maxLength={1000}
          aria-label="Status note"
        />
        <div className="mt-4 flex justify-end gap-2">
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-100">{value}</dd>
    </div>
  );
}
