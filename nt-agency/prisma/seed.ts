/* Seeds demo data: users, services, portfolio, team and leads at every pipeline stage.
   The records themselves live in prisma/data; this file only writes them. */
import { PrismaClient, type LeadStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { calculateQuote } from "../src/lib/quote";
import { fallbackTriage } from "../src/lib/ai/fallbackClassifier";
import { DEFAULT_MILESTONES, convertLead } from "../src/lib/leads";
import { DEMO_ACCOUNTS } from "../src/data/demoAccounts";
import { SERVICES } from "./data/services";
import { TEAM } from "./data/team";
import { PORTFOLIO } from "./data/portfolio";
import { LEADS } from "./data/leads";

const prisma = new PrismaClient();
const DAY_MS = 24 * 60 * 60 * 1000;

async function main() {
  await prisma.leadActivity.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.service.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.user.deleteMany();

  const [admin, staff] = await Promise.all(
    DEMO_ACCOUNTS.map(async ({ password, ...user }) =>
      prisma.user.create({ data: { ...user, passwordHash: await bcrypt.hash(password, 12) } }),
    ),
  );

  const services = await Promise.all(SERVICES.map((data) => prisma.service.create({ data })));
  const bySlug = Object.fromEntries(services.map((s) => [s.slug, s]));

  await prisma.teamMember.createMany({ data: TEAM.map((m, position) => ({ ...m, position })) });

  for (const { service, ...p } of PORTFOLIO) {
    await prisma.project.create({
      data: {
        ...p,
        published: true,
        status: "COMPLETED",
        serviceId: bySlug[service].id,
        milestones: { create: DEFAULT_MILESTONES.map((title, position) => ({ title, position, done: true })) },
      },
    });
  }

  for (const l of LEADS) {
    const service = l.service ? bySlug[l.service] : undefined;
    const quote = service
      ? calculateQuote({
          basePrice: service.basePrice,
          pricePerFeature: service.pricePerFeature,
          features: l.features,
          timeline: l.timeline,
        })
      : null;
    const triage = fallbackTriage({
      name: l.name,
      company: l.company,
      message: l.message,
      serviceName: service?.name,
      budget: l.budget,
      timeline: l.timeline,
      features: l.features,
    });
    const createdAt = new Date(Date.now() - l.daysAgo * DAY_MS);
    const lead = await prisma.lead.create({
      data: {
        name: l.name,
        email: l.email,
        company: l.company,
        message: l.message,
        features: l.features,
        timeline: l.timeline,
        budget: l.budget,
        serviceId: service?.id,
        estimatedMin: quote?.min,
        estimatedMax: quote?.max,
        createdAt,
        assignedToId: l.assign ? staff.id : undefined,
        aiCategory: triage.category,
        aiUrgency: triage.urgency,
        aiScore: triage.score,
        aiSummary: triage.summary,
        aiDraftReply: triage.draftReply,
        aiSource: triage.source,
        aiTriagedAt: createdAt,
        activities: {
          create: [
            { type: "CREATED", toStatus: "NEW", note: "Inquiry submitted via website", createdAt },
            {
              type: "AI_TRIAGE",
              note: `AI (keyword fallback): ${triage.category}, ${triage.urgency} urgency, score ${triage.score}`,
              createdAt,
            },
          ],
        },
      },
    });

    let from: LeadStatus = "NEW";
    for (const to of l.path) {
      await prisma.lead.update({ where: { id: lead.id }, data: { status: to } });
      await prisma.leadActivity.create({
        data: { type: "STATUS_CHANGE", leadId: lead.id, userId: admin.id, fromStatus: from, toStatus: to },
      });
      if (to === "WON") await prisma.$transaction((tx) => convertLead(tx, lead.id));
      from = to;
    }
  }

  console.log("Seed complete.");
  for (const a of DEMO_ACCOUNTS) console.log(`  ${a.role === "ADMIN" ? "Admin" : "Staff"}: ${a.email} / ${a.password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
