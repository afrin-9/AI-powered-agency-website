"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, FetchError } from "@/lib/fetcher";
import { Button, Card, EmptyState, ErrorState, Field, Input, Modal, Select, Spinner, Textarea } from "@/components/ui";

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "textarea" | "number" | "select" | "checkbox" | "tags";
  options?: Array<{ value: string; label: string }>;
  /** Empty value is sent as null (for optional relations and numbers). */
  nullable?: boolean;
  required?: boolean;
  hint?: string;
  /** Only shown when creating (e.g. password). */
  createOnly?: boolean;
  /** Hidden when editing an existing record (e.g. email, which can't change). */
  hideOnEdit?: boolean;
  defaultValue?: string | number | boolean;
};

export type Column<T> = { header: string; cell: (item: T) => ReactNode; className?: string };

type Item = { id: string };
type FormState = Record<string, string | boolean>;

/** Converts a record into string/boolean form state. */
function toForm(fields: FieldDef[], item?: Item): FormState {
  const values = (item ?? {}) as Record<string, unknown>;
  const state: FormState = {};
  for (const f of fields) {
    const raw = values[f.name] ?? f.defaultValue;
    if (f.type === "checkbox") state[f.name] = Boolean(raw ?? false);
    else if (f.type === "tags") state[f.name] = Array.isArray(raw) ? raw.join(", ") : "";
    else state[f.name] = raw == null ? "" : String(raw);
  }
  return state;
}

/** Converts form state back into the JSON shape the API expects. */
function toPayload(fields: FieldDef[], form: FormState, editing: boolean) {
  const payload: Record<string, unknown> = {};
  for (const f of fields) {
    if (editing && (f.createOnly || f.hideOnEdit)) continue;
    const v = form[f.name];
    if (f.type === "checkbox") payload[f.name] = Boolean(v);
    else if (f.type === "tags") {
      payload[f.name] = String(v)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (v === "") payload[f.name] = f.nullable ? null : undefined;
    else if (f.type === "number") payload[f.name] = Number(v);
    else payload[f.name] = v;
  }
  return payload;
}

/** Generic list + create/edit/delete screen driven by field and column definitions. */
export function ResourceManager<T extends Item>({
  title,
  description,
  endpoint,
  fields,
  columns,
  newLabel = "New",
  emptyText = "Nothing here yet",
  canCreate = true,
  canEdit = true,
  canDelete = true,
  onRowClick,
}: {
  title: string;
  description?: string;
  endpoint: string;
  fields: FieldDef[];
  columns: Column<T>[];
  newLabel?: string;
  emptyText?: string;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onRowClick?: (item: T) => void;
}) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<FormState>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await api<{ items: T[] }>(endpoint);
      setItems(res.items);
    } catch (err) {
      setError(err instanceof FetchError ? err.message : "Failed to load");
    }
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  const isHidden = (f: FieldDef) => Boolean(editing && (f.createOnly || f.hideOnEdit));
  const visibleFields = fields.filter((f) => !isHidden(f));

  function openForm(item?: T) {
    setEditing(item ?? null);
    setForm(toForm(fields, item));
    setErrors({});
    setOpen(true);
  }

  function setValue(name: string, value: string | boolean) {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const missing = visibleFields.filter(
      (f) => f.required && f.type !== "checkbox" && !String(form[f.name] ?? "").trim(),
    );
    if (missing.length) {
      setErrors(Object.fromEntries(missing.map((f) => [f.name, `${f.label} is required`])));
      return;
    }
    setSaving(true);
    try {
      const payload = toPayload(fields, form, Boolean(editing));
      if (editing) await api(`${endpoint}/${editing.id}`, { method: "PATCH", json: payload });
      else await api(endpoint, { method: "POST", json: payload });
      toast.success(editing ? "Saved" : "Created");
      setOpen(false);
      load();
    } catch (err) {
      if (err instanceof FetchError && err.fieldErrors) {
        setErrors(Object.fromEntries(Object.entries(err.fieldErrors).map(([k, v]) => [k, v[0]])));
      }
      toast.error(err instanceof FetchError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: T) {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    try {
      await api(`${endpoint}/${item.id}`, { method: "DELETE" });
      toast.success("Deleted");
      load();
    } catch (err) {
      toast.error(err instanceof FetchError ? err.message : "Delete failed");
    }
  }

  const showActions = canEdit || canDelete;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-sm text-slate-400">{description}</p>}
        </div>
        {canCreate && (
          <Button onClick={() => openForm()}>
            <Plus className="h-4 w-4" /> {newLabel}
          </Button>
        )}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !items ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          title={emptyText}
          action={canCreate ? <Button onClick={() => openForm()}>{newLabel}</Button> : undefined}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-night-800/50 text-xs uppercase text-slate-400">
                <tr>
                  {columns.map((c) => (
                    <th key={c.header} className="px-4 py-3">
                      {c.header}
                    </th>
                  ))}
                  {showActions && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={onRowClick ? "cursor-pointer hover:bg-night-800/60" : undefined}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                  >
                    {columns.map((c) => (
                      <td key={c.header} className={c.className ?? "px-4 py-3"}>
                        {c.cell(item)}
                      </td>
                    ))}
                    {showActions && (
                      <td className="whitespace-nowrap px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {canEdit && (
                          <button
                            className="rounded p-1.5 text-slate-400 hover:bg-night-800"
                            onClick={() => openForm(item)}
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            className="rounded p-1.5 text-red-400 hover:bg-red-500/10"
                            onClick={() => remove(item)}
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={open} title={editing ? "Edit" : newLabel} onClose={() => setOpen(false)}>
        <form onSubmit={save} className="space-y-4" noValidate>
          {visibleFields.map((f) => {
            const value = form[f.name];
            const invalid = Boolean(errors[f.name]);
            return (
              <Field
                key={f.name}
                label={`${f.label}${f.required ? " *" : ""}`}
                htmlFor={f.name}
                error={errors[f.name]}
                hint={f.hint}
              >
                {f.type === "textarea" ? (
                  <Textarea
                    id={f.name}
                    rows={4}
                    value={String(value ?? "")}
                    invalid={invalid}
                    onChange={(e) => setValue(f.name, e.target.value)}
                  />
                ) : f.type === "select" ? (
                  <Select
                    id={f.name}
                    value={String(value ?? "")}
                    invalid={invalid}
                    onChange={(e) => setValue(f.name, e.target.value)}
                  >
                    {f.nullable && <option value="">— None —</option>}
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                ) : f.type === "checkbox" ? (
                  <input
                    id={f.name}
                    type="checkbox"
                    className="h-4 w-4 accent-brand-600"
                    checked={Boolean(value)}
                    onChange={(e) => setValue(f.name, e.target.checked)}
                  />
                ) : (
                  <Input
                    id={f.name}
                    type={f.type === "tags" ? "text" : f.type}
                    inputMode={f.type === "number" ? "numeric" : undefined}
                    autoComplete={f.type === "password" ? "new-password" : undefined}
                    value={String(value ?? "")}
                    invalid={invalid}
                    onChange={(e) => setValue(f.name, e.target.value)}
                  />
                )}
              </Field>
            );
          })}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editing ? "Save changes" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
