"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { Timeline } from "@prisma/client";
import { api, FetchError } from "@/lib/fetcher";
import { TIMELINE_LABEL } from "@/lib/labels";
import { Button, Card, Field, Input, Select, Textarea, money } from "@/components/ui";

interface ServiceOption {
  id: string;
  name: string;
  basePrice: number;
  pricePerFeature: number;
  typicalWeeks: number;
}

type Estimate = { min: number; max: number; typicalWeeks: number };
type Errors = Partial<Record<string, string>>;

const initial = { name: "", email: "", phone: "", company: "", budget: "", message: "", website: "" };

export function QuoteForm({ services, initialServiceId }: { services: ServiceOption[]; initialServiceId?: string }) {
  const [form, setForm] = useState(initial);
  const [serviceId, setServiceId] = useState(initialServiceId ?? services[0]?.id ?? "");
  const [features, setFeatures] = useState(3);
  const [timeline, setTimeline] = useState<Timeline>("NORMAL");
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ min: number; max: number } | "no-estimate" | null>(null);

  const selected = useMemo(() => services.find((s) => s.id === serviceId), [services, serviceId]);

  // Live estimate from the server, so the pricing formula lives in one place. Debounced.
  useEffect(() => {
    if (!serviceId) return;
    setEstimating(true);
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setEstimate(
          await api<Estimate>("/api/quote/estimate", {
            method: "POST",
            json: { serviceId, features, timeline },
            signal: ctrl.signal,
          }),
        );
      } catch {
        if (!ctrl.signal.aborted) setEstimate(null);
      } finally {
        if (!ctrl.signal.aborted) setEstimating(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [serviceId, features, timeline]);

  function set<K extends keyof typeof initial>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  // Mirrors the server rules for quick feedback; the server is still the source of truth.
  function validate(): Errors {
    const e: Errors = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Please enter a valid email";
    if (form.phone && !/^[+\d\s()-]{6,30}$/.test(form.phone)) e.phone = "Invalid phone number";
    if (form.budget && (!/^\d+$/.test(form.budget) || Number(form.budget) > 10_000_000)) {
      e.budget = "Enter a whole number in USD";
    }
    if (form.message.trim().length < 20) e.message = "Please describe your project in at least 20 characters";
    return e;
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const clientErrors = validate();
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api<{ id: string; estimate: { min: number; max: number } | null }>("/api/leads", {
        method: "POST",
        json: {
          ...form,
          serviceId: serviceId || undefined,
          features,
          timeline,
          budget: form.budget ? Number(form.budget) : undefined,
        },
      });
      setDone(res.estimate ?? "no-estimate");
      toast.success("Request sent! We'll be in touch soon.");
    } catch (err) {
      if (err instanceof FetchError && err.fieldErrors) {
        setErrors(Object.fromEntries(Object.entries(err.fieldErrors).map(([k, v]) => [k, v[0]])));
      }
      toast.error(err instanceof FetchError ? err.message : "Could not send your request");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <Card className="mt-10 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h2 className="mt-4 text-2xl font-semibold">Thank you, {form.name.split(" ")[0]}!</h2>
        <p className="mt-2 text-slate-600">
          Your request has been received. Our team will contact you within one business day.
        </p>
        {done !== "no-estimate" && (
          <p className="mt-4 text-lg">
            Estimated range:{" "}
            <strong>
              {money(done.min)} – {money(done.max)}
            </strong>
          </p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm">
            Back to home
          </Link>
          <Button
            variant="ghost"
            onClick={() => {
              setForm(initial);
              setDone(null);
            }}
          >
            Submit another request
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name *" htmlFor="name" error={errors.name}>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              invalid={!!errors.name}
              autoComplete="name"
            />
          </Field>
          <Field label="Email *" htmlFor="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              invalid={!!errors.email}
              autoComplete="email"
            />
          </Field>
          <Field label="Phone" htmlFor="phone" error={errors.phone}>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              invalid={!!errors.phone}
              autoComplete="tel"
            />
          </Field>
          <Field label="Company" htmlFor="company" error={errors.company}>
            <Input
              id="company"
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              autoComplete="organization"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Service" htmlFor="service" error={errors.serviceId}>
            <Select id="service" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
              <option value="">Not sure yet</option>
            </Select>
          </Field>
          <Field label="Timeline" htmlFor="timeline">
            <Select id="timeline" value={timeline} onChange={(e) => setTimeline(e.target.value as Timeline)}>
              {Object.entries(TIMELINE_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label={`Number of key features: ${features}`}
          htmlFor="features"
          hint="E.g. login, payments, admin dashboard, chat, search..."
        >
          <input
            id="features"
            type="range"
            min={1}
            max={20}
            value={features}
            onChange={(e) => setFeatures(Number(e.target.value))}
            className="w-full accent-brand-600"
          />
        </Field>

        <Field label="Budget (USD, optional)" htmlFor="budget" error={errors.budget}>
          <Input
            id="budget"
            inputMode="numeric"
            value={form.budget}
            onChange={(e) => set("budget", e.target.value)}
            invalid={!!errors.budget}
            placeholder="e.g. 5000"
          />
        </Field>

        <Field
          label="Tell us about your project *"
          htmlFor="message"
          error={errors.message}
          hint={`${form.message.length}/3000`}
        >
          <Textarea
            id="message"
            rows={6}
            maxLength={3000}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            invalid={!!errors.message}
            placeholder="What do you want to build, who is it for, and when do you need it?"
          />
        </Field>

        {/* Honeypot: hidden from people, bots tend to fill it in. */}
        <div className="hidden" aria-hidden>
          <label htmlFor="website">Website</label>
          <input
            id="website"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
          />
        </div>

        <Button type="submit" loading={submitting} className="w-full sm:w-auto">
          {submitting ? "Sending..." : "Send request"}
        </Button>
      </Card>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card className="p-6">
          <p className="text-sm font-medium text-slate-500">Instant estimate</p>
          {!serviceId ? (
            <p className="mt-3 text-sm text-slate-600">
              Pick a service to see an estimate. Not sure? Our team will advise.
            </p>
          ) : estimate ? (
            <div className={estimating ? "opacity-60 transition-opacity" : "transition-opacity"}>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {money(estimate.min)} <span className="text-lg font-normal text-slate-500">to</span>{" "}
                {money(estimate.max)}
              </p>
              <p className="mt-2 text-sm text-slate-600">Typical delivery: ~{estimate.typicalWeeks} weeks</p>
              {selected && (
                <ul className="mt-4 space-y-1 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <li>
                    Base ({selected.name}): {money(selected.basePrice)}
                  </li>
                  <li>
                    Extra features: {features - 1} × {money(selected.pricePerFeature)}
                  </li>
                  <li>Timeline: {TIMELINE_LABEL[timeline]}</li>
                  <li>Range: ±15%</li>
                </ul>
              )}
            </div>
          ) : estimating ? (
            <div className="mt-3 space-y-2">
              <div className="skeleton h-8 w-40" />
              <div className="skeleton h-4 w-28" />
            </div>
          ) : (
            <p className="mt-3 text-sm text-red-600">Couldn&apos;t load an estimate. You can still send your request.</p>
          )}
          <p className="mt-4 text-xs text-slate-400">
            Estimates are indicative; the final quote follows a free discovery call.
          </p>
        </Card>
      </aside>
    </form>
  );
}
