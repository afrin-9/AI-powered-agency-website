import type { LeadStatus, Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "./db";
import { ApiError } from "./api";
import { calculateQuote } from "./quote";
import { canTransition, LEAD_STATUS_LABEL, OPEN_STATUSES } from "./leadWorkflow";
import { triageInquiry } from "./ai/triage";
import type { LeadCreateInput } from "./validation";
import type { z } from "zod";
import type { leadListQuerySchema } from "./validation";

type Tx = Prisma.TransactionClient | PrismaClient;

export const DEFAULT_MILESTONES = ["Discovery", "Design", "Build", "Launch"];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Public inquiry: compute the estimate, save the lead, then run AI triage. */
export async function createLead(input: LeadCreateInput) {
  const service = input.serviceId
    ? await prisma.service.findFirst({ where: { id: input.serviceId, active: true } })
    : null;
  if (input.serviceId && !service) throw new ApiError(400, "Selected service is not available");

  const quote = service
    ? calculateQuote({
        basePrice: service.basePrice,
        pricePerFeature: service.pricePerFeature,
        features: input.features,
        timeline: input.timeline,
      })
    : null;

  const lead = await prisma.lead.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      message: input.message,
      features: input.features,
      timeline: input.timeline,
      budget: input.budget ?? null,
      serviceId: service?.id,
      estimatedMin: quote?.min,
      estimatedMax: quote?.max,
      activities: { create: { type: "CREATED", toStatus: "NEW", note: "Inquiry submitted via website" } },
    },
  });

  // Triage after saving so a slow/failed AI call never loses the inquiry.
  await applyTriage(lead.id);

  return { id: lead.id, estimate: quote ? { min: quote.min, max: quote.max } : null };
}

/** Runs AI triage for a lead and stores the result (also used by "Re-run AI"). */
export async function applyTriage(leadId: string, userId?: string) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, include: { service: true } });
  if (!lead) throw new ApiError(404, "Lead not found");
  const result = await triageInquiry({
    name: lead.name,
    company: lead.company,
    message: lead.message,
    serviceName: lead.service?.name,
    budget: lead.budget,
    timeline: lead.timeline,
    features: lead.features,
  });
  return prisma.lead.update({
    where: { id: leadId },
    data: {
      aiCategory: result.category,
      aiUrgency: result.urgency,
      aiScore: result.score,
      aiSummary: result.summary,
      aiDraftReply: result.draftReply,
      aiSource: result.source,
      aiTriagedAt: new Date(),
      activities: {
        create: {
          type: "AI_TRIAGE",
          userId,
          note: `AI (${result.source === "LLM" ? "Claude" : "keyword fallback"}): ${result.category}, ${result.urgency} urgency, score ${result.score}`,
        },
      },
    },
  });
}

/** Creates a Client + Project (with default milestones) from a won lead, inside a transaction. */
export async function convertLead(tx: Tx, leadId: string) {
  const lead = await tx.lead.findUniqueOrThrow({ where: { id: leadId }, include: { service: true } });
  const client = await tx.client.create({
    data: { name: lead.name, company: lead.company, email: lead.email, phone: lead.phone },
  });
  const baseTitle = `${lead.company ?? lead.name} - ${lead.service?.name ?? "Custom project"}`;
  const project = await tx.project.create({
    data: {
      title: baseTitle,
      slug: `${slugify(baseTitle)}-${lead.id.slice(-6)}`,
      summary: lead.aiSummary ?? lead.message.slice(0, 500),
      status: "PLANNED",
      budget: lead.estimatedMax ?? lead.budget,
      published: false,
      serviceId: lead.serviceId,
      clientId: client.id,
      milestones: {
        create: DEFAULT_MILESTONES.map((title, i) => ({
          title,
          position: i,
          dueDate: new Date(Date.now() + (i + 1) * 14 * 24 * 60 * 60 * 1000),
        })),
      },
    },
  });
  await tx.lead.update({ where: { id: leadId }, data: { clientId: client.id, projectId: project.id } });
  return { client, project };
}

/** Moves a lead through the pipeline, enforcing the state machine. WON triggers conversion. */
export async function changeLeadStatus(leadId: string, to: LeadStatus, userId: string, note?: string) {
  return prisma.$transaction(async (tx) => {
    const lead = await tx.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new ApiError(404, "Lead not found");
    if (!canTransition(lead.status, to)) {
      throw new ApiError(
        409,
        `Cannot move a lead from "${LEAD_STATUS_LABEL[lead.status]}" to "${LEAD_STATUS_LABEL[to]}"`,
      );
    }
    // Conditional update guards against two users changing the same lead at once.
    const { count } = await tx.lead.updateMany({ where: { id: leadId, status: lead.status }, data: { status: to } });
    if (count === 0) throw new ApiError(409, "This lead was just updated by someone else. Refresh and try again.");

    await tx.leadActivity.create({
      data: { type: "STATUS_CHANGE", leadId, userId, fromStatus: lead.status, toStatus: to, note },
    });

    let converted = null;
    if (to === "WON") converted = await convertLead(tx, leadId);
    return { status: to, converted: converted ? { clientId: converted.client.id, projectId: converted.project.id } : null };
  });
}

export async function addLeadNote(leadId: string, userId: string, note: string) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { id: true } });
  if (!lead) throw new ApiError(404, "Lead not found");
  return prisma.leadActivity.create({ data: { type: "NOTE", leadId, userId, note } });
}

export async function assignLead(leadId: string, assigneeId: string | null, userId: string) {
  const assignee = assigneeId ? await prisma.user.findUnique({ where: { id: assigneeId } }) : null;
  if (assigneeId && !assignee) throw new ApiError(400, "User not found");
  return prisma.lead.update({
    where: { id: leadId },
    data: {
      assignedToId: assigneeId,
      activities: {
        create: { type: "ASSIGN", userId, note: assignee ? `Assigned to ${assignee.name}` : "Unassigned" },
      },
    },
  });
}

export async function listLeads(query: z.infer<typeof leadListQuerySchema>) {
  const where: Prisma.LeadWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: "insensitive" } },
            { email: { contains: query.q, mode: "insensitive" } },
            { company: { contains: query.q, mode: "insensitive" } },
            { message: { contains: query.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const orderBy: Prisma.LeadOrderByWithRelationInput[] =
    query.sort === "score"
      ? [{ aiScore: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }]
      : [{ createdAt: "desc" }];
  const [items, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: {
        service: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    }),
    prisma.lead.count({ where }),
  ]);
  return { items, total, page: query.page, pageSize: query.pageSize };
}

/** Dashboard numbers: pipeline counts, conversion rate, open pipeline value, per-service breakdown. */
export async function getPipelineStats() {
  const [byStatus, openValue, wonValue, byService, services, recent] = await Promise.all([
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.lead.aggregate({ where: { status: { in: OPEN_STATUSES } }, _sum: { estimatedMax: true } }),
    prisma.lead.aggregate({ where: { status: "WON" }, _sum: { estimatedMax: true } }),
    prisma.lead.groupBy({ by: ["serviceId"], _count: { _all: true } }),
    prisma.service.findMany({ select: { id: true, name: true } }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, company: true, status: true, aiScore: true, createdAt: true },
    }),
  ]);
  const counts = Object.fromEntries(byStatus.map((s) => [s.status, s._count._all])) as Partial<Record<LeadStatus, number>>;
  const won = counts.WON ?? 0;
  const lost = counts.LOST ?? 0;
  const total = byStatus.reduce((sum, s) => sum + s._count._all, 0);
  const serviceName = new Map(services.map((s) => [s.id, s.name]));
  return {
    total,
    counts,
    conversionRate: won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0,
    openPipelineValue: openValue._sum.estimatedMax ?? 0,
    wonValue: wonValue._sum.estimatedMax ?? 0,
    byService: byService
      .map((s) => ({ name: s.serviceId ? (serviceName.get(s.serviceId) ?? "Unknown") : "Not specified", count: s._count._all }))
      .sort((a, b) => b.count - a.count),
    recent,
  };
}
