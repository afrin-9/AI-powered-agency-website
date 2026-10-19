"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ProjectStatus } from "@prisma/client";
import { api, FetchError } from "@/lib/fetcher";
import { PROJECT_STATUS_COLOR, PROJECT_STATUS_LABEL } from "@/lib/labels";
import { Badge, Button, Card, ErrorState, Input, Spinner, money } from "@/components/ui";

interface Milestone {
  id: string;
  title: string;
  done: boolean;
  dueDate: string | null;
}

interface Project {
  id: string;
  title: string;
  summary: string;
  status: ProjectStatus;
  budget: number | null;
  published: boolean;
  techStack: string[];
  service: { name: string } | null;
  client: { id: string; name: string; company: string | null; email: string } | null;
  lead: { id: string; name: string } | null;
  milestones: Milestone[];
}

export function ProjectDetail({ id }: { id: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setProject(await api<Project>(`/api/admin/projects/${id}`));
    } catch (err) {
      setError(err instanceof FetchError ? err.message : "Failed to load project");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(m: Milestone) {
    // Optimistic: flip the checkbox now, then reload from the server if the request fails.
    setProject((p) => p && { ...p, milestones: p.milestones.map((x) => (x.id === m.id ? { ...x, done: !x.done } : x)) });
    try {
      const res = await api<{ projectStatus: ProjectStatus }>(`/api/admin/milestones/${m.id}`, {
        method: "PATCH",
        json: { done: !m.done },
      });
      setProject((p) => p && { ...p, status: res.projectStatus });
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Update failed");
      load();
    }
  }

  async function addMilestone(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 2) {
      toast.error("Milestone title must be at least 2 characters");
      return;
    }
    setAdding(true);
    try {
      await api(`/api/admin/projects/${id}/milestones`, {
        method: "POST",
        json: { title, dueDate: dueDate || null },
      });
      setTitle("");
      setDueDate("");
      toast.success("Milestone added");
      load();
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Could not add milestone");
    } finally {
      setAdding(false);
    }
  }

  async function removeMilestone(milestoneId: string) {
    if (!confirm("Delete this milestone?")) return;
    try {
      await api(`/api/admin/milestones/${milestoneId}`, { method: "DELETE" });
      load();
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Delete failed");
    }
  }

  async function togglePublished() {
    if (!project) return;
    try {
      await api(`/api/admin/projects/${id}`, { method: "PATCH", json: { published: !project.published } });
      toast.success(project.published ? "Removed from portfolio" : "Published to portfolio");
      load();
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Update failed");
    }
  }

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!project) return <Spinner label="Loading project..." />;

  const done = project.milestones.filter((m) => m.done).length;
  const pct = project.milestones.length ? Math.round((done / project.milestones.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <Link href="/admin/projects" className="inline-flex items-center gap-1 text-sm text-slate-300 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <p className="text-sm text-slate-400">
            {project.service?.name ?? "No service"} · Budget {money(project.budget)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={PROJECT_STATUS_COLOR[project.status]}>{PROJECT_STATUS_LABEL[project.status]}</Badge>
          <Button variant="secondary" size="sm" onClick={togglePublished}>
            {project.published ? "Unpublish" : "Publish to portfolio"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Milestones</h2>
            <span className="text-sm text-slate-400">{pct}% complete</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-night-800">
            <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>

          <ul className="mt-4 divide-y divide-white/5">
            {project.milestones.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-emerald-600"
                    checked={m.done}
                    onChange={() => toggle(m)}
                  />
                  <span className={m.done ? "text-slate-500 line-through" : ""}>{m.title}</span>
                </label>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {m.dueDate && <span>Due {new Date(m.dueDate).toLocaleDateString()}</span>}
                  <button
                    onClick={() => removeMilestone(m.id)}
                    className="rounded p-1 text-red-400 hover:bg-red-500/10"
                    aria-label="Delete milestone"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
            {project.milestones.length === 0 && <li className="py-4 text-sm text-slate-400">No milestones yet.</li>}
          </ul>

          <form onSubmit={addMilestone} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New milestone"
              maxLength={120}
              aria-label="Milestone title"
            />
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="sm:w-44"
              aria-label="Due date"
            />
            <Button type="submit" loading={adding}>
              Add
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-semibold">Client</h2>
            {project.client ? (
              <div className="mt-2 text-sm">
                <p className="font-medium">{project.client.company ?? project.client.name}</p>
                <p className="text-slate-400">
                  {project.client.name} · {project.client.email}
                </p>
                {project.lead && (
                  <Link
                    href={`/admin/leads/${project.lead.id}`}
                    className="mt-2 inline-block text-brand-300 hover:underline"
                  >
                    View original lead →
                  </Link>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-400">Portfolio / internal project</p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold">Summary</h2>
            <p className="mt-2 text-sm text-slate-300">{project.summary}</p>
            {project.techStack.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {project.techStack.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
