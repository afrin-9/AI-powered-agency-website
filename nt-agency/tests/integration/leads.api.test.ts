import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Route handlers read the session cookie through next/headers; back it with an in-memory jar.
const jar = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)! } : undefined),
    set: (name: string, value: string) => jar.set(name, value),
    delete: (name: string) => jar.delete(name),
  }),
}));

import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { resetRateLimits } from "@/lib/rateLimit";
import { SESSION_COOKIE, signSession } from "@/lib/session";
import { POST as createLead } from "@/app/api/leads/route";
import { PATCH as changeStatus } from "@/app/api/admin/leads/[id]/status/route";
import { DELETE as deleteLead } from "@/app/api/admin/leads/[id]/route";
import { POST as login } from "@/app/api/auth/login/route";

type TestUser = { id: string; name: string; email: string; role: Role };

let serviceId: string;
let admin: TestUser;
let staff: TestUser;

function jsonRequest(url: string, method: string, body?: unknown) {
  return new Request(`http://localhost${url}`, {
    method,
    headers: { "Content-Type": "application/json", "x-forwarded-for": "10.0.0.1" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function loginAs(user: TestUser) {
  jar.set(SESSION_COOKIE, await signSession({ sub: user.id, name: user.name, email: user.email, role: user.role }));
}

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

const validLead = {
  name: "Karim Ahmed",
  email: "karim@freshmart.test",
  company: "FreshMart",
  features: 4,
  timeline: "RUSH",
  budget: 5000,
  message: "We need an online store with cart, checkout and bKash payments. This is urgent for Eid.",
};

async function newLeadId() {
  const res = await createLead(jsonRequest("/api/leads", "POST", { ...validLead, serviceId }), {});
  resetRateLimits();
  return (await res.json()).id as string;
}

function setStatus(id: string, status: string) {
  return changeStatus(jsonRequest(`/api/admin/leads/${id}/status`, "PATCH", { status }), ctx(id));
}

beforeAll(async () => {
  await prisma.leadActivity.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.service.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.user.deleteMany();

  const service = await prisma.service.create({
    data: {
      name: "E-commerce Stores",
      slug: "ecommerce",
      category: "ECOMMERCE",
      summary: "Online stores",
      description: "Online stores with payments",
      basePrice: 1800,
      pricePerFeature: 250,
      typicalWeeks: 6,
    },
  });
  serviceId = service.id;

  const passwordHash = await bcrypt.hash("Password123", 4);
  const select = { id: true, name: true, email: true, role: true } as const;
  admin = await prisma.user.create({
    data: { name: "Admin", email: "admin@test.dev", role: "ADMIN", passwordHash },
    select,
  });
  staff = await prisma.user.create({
    data: { name: "Staff", email: "staff@test.dev", role: "STAFF", passwordHash },
    select,
  });
});

beforeEach(() => {
  jar.clear();
  resetRateLimits();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/leads", () => {
  it("saves the lead with an estimate, AI triage and activity records", async () => {
    const res = await createLead(jsonRequest("/api/leads", "POST", { ...validLead, serviceId }), {});
    expect(res.status).toBe(201);
    const body = await res.json();
    // (1800 + 3 * 250) * 1.25 = 3187.5 -> 3200, shown as a ±15% range rounded to $50.
    expect(body.estimate).toEqual({ min: 2700, max: 3650 });

    const lead = await prisma.lead.findUniqueOrThrow({ where: { id: body.id }, include: { activities: true } });
    expect(lead.status).toBe("NEW");
    expect(lead.estimatedMin).toBe(2700);
    expect(lead.aiSource).toBe("FALLBACK");
    expect(lead.aiCategory).toBe("ECOMMERCE");
    expect(lead.aiUrgency).toBe("HIGH");
    expect(lead.aiScore).toEqual(expect.any(Number));
    expect(lead.activities.map((a) => a.type).sort()).toEqual(["AI_TRIAGE", "CREATED"]);
  });

  it("returns 400 with field details for an invalid body", async () => {
    const res = await createLead(jsonRequest("/api/leads", "POST", { name: "K", email: "bad", message: "short" }), {});
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(Object.keys(body.details)).toEqual(expect.arrayContaining(["name", "email", "message"]));
  });

  it("returns 400 when the honeypot is filled", async () => {
    const res = await createLead(jsonRequest("/api/leads", "POST", { ...validLead, website: "spam" }), {});
    expect(res.status).toBe(400);
  });

  it("rate-limits the 6th submission from one IP", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      statuses.push((await createLead(jsonRequest("/api/leads", "POST", validLead), {})).status);
    }
    expect(statuses.slice(0, 5)).toEqual([201, 201, 201, 201, 201]);
    expect(statuses[5]).toBe(429);
  });
});

describe("PATCH /api/admin/leads/:id/status", () => {
  it("returns 401 without a session cookie", async () => {
    const id = await newLeadId();
    expect((await setStatus(id, "CONTACTED")).status).toBe(401);
  });

  it("returns 409 for NEW -> WON and leaves the lead unchanged", async () => {
    const id = await newLeadId();
    await loginAs(staff);
    expect((await setStatus(id, "WON")).status).toBe(409);
    expect((await prisma.lead.findUniqueOrThrow({ where: { id } })).status).toBe("NEW");
  });

  it("converts a won lead into a client and a project with 4 milestones", async () => {
    const id = await newLeadId();
    await loginAs(staff);
    let last: Response | undefined;
    for (const status of ["CONTACTED", "PROPOSAL_SENT", "WON"]) {
      last = await setStatus(id, status);
      expect(last.status).toBe(200);
    }
    const body = await last!.json();
    expect(body.converted).toEqual({ clientId: expect.any(String), projectId: expect.any(String) });

    const lead = await prisma.lead.findUniqueOrThrow({
      where: { id },
      include: { client: true, project: { include: { milestones: true } }, activities: true },
    });
    expect(lead.status).toBe("WON");
    expect(lead.client?.email).toBe(validLead.email);
    expect(lead.project?.clientId).toBe(lead.client?.id);
    expect(lead.project?.milestones).toHaveLength(4);
    expect(lead.activities.filter((a) => a.type === "STATUS_CHANGE")).toHaveLength(3);
  });

  it("returns 409 for any move after WON", async () => {
    const id = await newLeadId();
    await loginAs(staff);
    for (const status of ["CONTACTED", "PROPOSAL_SENT", "WON"]) await setStatus(id, status);
    expect((await setStatus(id, "LOST")).status).toBe(409);
    expect((await setStatus(id, "CONTACTED")).status).toBe(409);
  });
});

describe("Authorization", () => {
  it("returns 403 when staff delete a lead and 200 for an admin", async () => {
    const id = await newLeadId();

    await loginAs(staff);
    expect((await deleteLead(jsonRequest(`/api/admin/leads/${id}`, "DELETE"), ctx(id))).status).toBe(403);

    await loginAs(admin);
    expect((await deleteLead(jsonRequest(`/api/admin/leads/${id}`, "DELETE"), ctx(id))).status).toBe(200);
    expect(await prisma.lead.findUnique({ where: { id } })).toBeNull();
  });

  it("returns 401 for a tampered token", async () => {
    const id = await newLeadId();
    const token = await signSession({ sub: admin.id, name: admin.name, email: admin.email, role: "ADMIN" });
    jar.set(SESSION_COOKIE, `${token.slice(0, -4)}abcd`);
    expect((await deleteLead(jsonRequest(`/api/admin/leads/${id}`, "DELETE"), ctx(id))).status).toBe(401);
  });
});

describe("POST /api/auth/login", () => {
  it("sets the session cookie for correct credentials", async () => {
    const res = await login(
      jsonRequest("/api/auth/login", "POST", { email: "ADMIN@test.dev", password: "Password123" }),
      {},
    );
    expect(res.status).toBe(200);
    expect(jar.get(SESSION_COOKIE)).toBeTruthy();
  });

  it("returns the same 401 message for a wrong password and an unknown email", async () => {
    const wrong = await login(jsonRequest("/api/auth/login", "POST", { email: "admin@test.dev", password: "nope" }), {});
    const unknown = await login(
      jsonRequest("/api/auth/login", "POST", { email: "ghost@test.dev", password: "nope" }),
      {},
    );
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect((await wrong.json()).error).toBe((await unknown.json()).error);
    expect(jar.has(SESSION_COOKIE)).toBe(false);
  });
});
