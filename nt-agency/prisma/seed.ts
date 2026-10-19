/* Seeds demo data: users, services, portfolio, team and leads at every pipeline stage. */
import { PrismaClient, type LeadStatus, type Timeline } from "@prisma/client";
import bcrypt from "bcryptjs";
import { calculateQuote } from "../src/lib/quote";
import { fallbackTriage } from "../src/lib/ai/fallbackClassifier";
import { convertLead } from "../src/lib/leads";

const prisma = new PrismaClient();

async function main() {
  await prisma.leadActivity.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.service.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.user.deleteMany();

  const [admin, staff] = await Promise.all([
    prisma.user.create({
      data: { name: "Ayesha Rahman", email: "admin@demo.com", role: "ADMIN", passwordHash: await bcrypt.hash("Admin12345", 12) },
    }),
    prisma.user.create({
      data: { name: "Tanvir Hasan", email: "staff@demo.com", role: "STAFF", passwordHash: await bcrypt.hash("Staff12345", 12) },
    }),
  ]);

  const serviceData = [
    {
      name: "Business Websites", slug: "business-websites", category: "WEB" as const, basePrice: 800, pricePerFeature: 150, typicalWeeks: 4,
      summary: "Fast, SEO-friendly websites that turn visitors into customers.",
      description: "Responsive company websites and landing pages built with Next.js, including CMS, contact forms, analytics and on-page SEO. Ideal for startups and SMEs that need a professional online presence.",
    },
    {
      name: "Custom Web Applications", slug: "web-applications", category: "WEB" as const, basePrice: 3000, pricePerFeature: 400, typicalWeeks: 10,
      summary: "Dashboards, portals and SaaS products tailored to your workflow.",
      description: "Full-stack web applications with authentication, role-based access, databases, APIs and admin dashboards. We cover ERP modules, booking systems, CRMs and SaaS MVPs.",
    },
    {
      name: "Mobile App Development", slug: "mobile-apps", category: "MOBILE" as const, basePrice: 4000, pricePerFeature: 500, typicalWeeks: 12,
      summary: "Cross-platform Android and iOS apps with Flutter and React Native.",
      description: "Native-quality mobile apps for Android and iOS from a single codebase, including push notifications, payments (bKash, cards), offline support and Play Store / App Store publishing.",
    },
    {
      name: "AI & Machine Learning Solutions", slug: "ai-solutions", category: "AI_ML" as const, basePrice: 3500, pricePerFeature: 600, typicalWeeks: 8,
      summary: "Chatbots, smart automation and predictive analytics for your business.",
      description: "Practical AI features: customer-support chatbots trained on your content, document classification, demand forecasting, recommendation engines and LLM integrations with your existing systems.",
    },
    {
      name: "E-commerce Stores", slug: "ecommerce", category: "ECOMMERCE" as const, basePrice: 1800, pricePerFeature: 250, typicalWeeks: 6,
      summary: "Online stores with payments, inventory and order management.",
      description: "Custom or Shopify/WooCommerce stores with product catalogues, carts, bKash/SSLCommerz/Stripe payments, inventory tracking, delivery integration and sales dashboards.",
    },
    {
      name: "UI/UX Design", slug: "ui-ux-design", category: "UI_UX" as const, basePrice: 600, pricePerFeature: 120, typicalWeeks: 3,
      summary: "Research-driven interfaces and clickable Figma prototypes.",
      description: "User research, wireframes, design systems and high-fidelity Figma prototypes for web and mobile products, plus usability reviews of existing apps.",
    },
  ];
  const services = await Promise.all(serviceData.map((data) => prisma.service.create({ data })));
  const bySlug = Object.fromEntries(services.map((s) => [s.slug, s]));

  await prisma.teamMember.createMany({
    data: [
      { name: "Ayesha Rahman", role: "Founder & CEO", bio: "Leads strategy and client partnerships; 8 years building software for SMEs in Bangladesh.", position: 0 },
      { name: "Tanvir Hasan", role: "Head of Engineering", bio: "Full-stack engineer specialising in Next.js, Node.js and cloud architecture.", position: 1 },
      { name: "Nusrat Jahan", role: "Lead UI/UX Designer", bio: "Designs accessible, conversion-focused interfaces and design systems in Figma.", position: 2 },
      { name: "Rakib Islam", role: "AI Engineer", bio: "Builds chatbots, forecasting models and LLM integrations with Python and TypeScript.", position: 3 },
    ],
  });

  const portfolio = [
    { title: "Pharmacy Chain Inventory Portal", slug: "pharmacy-inventory-portal", service: "web-applications", techStack: ["Next.js", "PostgreSQL", "Prisma"], summary: "A multi-branch inventory and expiry tracking portal that cut stock-outs by 30% for a 12-branch pharmacy chain in Dhaka." },
    { title: "Ride-Share Driver App", slug: "ride-share-driver-app", service: "mobile-apps", techStack: ["Flutter", "Firebase", "Google Maps"], summary: "A cross-platform driver app with live trip tracking, earnings dashboard and bKash payouts, serving 2,000+ drivers." },
    { title: "Garments Order Forecasting", slug: "garments-order-forecasting", service: "ai-solutions", techStack: ["Python", "scikit-learn", "FastAPI"], summary: "A demand-forecasting model for a garments exporter that predicts monthly order volumes to plan fabric purchasing." },
    { title: "Handicrafts Online Store", slug: "handicrafts-online-store", service: "ecommerce", techStack: ["Shopify", "Liquid", "SSLCommerz"], summary: "An e-commerce store for a rural handicrafts collective with international shipping and SSLCommerz payments." },
    { title: "EdTech Learning Dashboard Redesign", slug: "edtech-dashboard-redesign", service: "ui-ux-design", techStack: ["Figma", "Design System"], summary: "A research-led redesign of a student dashboard that improved weekly active usage by 22%." },
  ];
  for (const p of portfolio) {
    await prisma.project.create({
      data: {
        title: p.title, slug: p.slug, summary: p.summary, techStack: p.techStack, published: true, status: "COMPLETED",
        serviceId: bySlug[p.service].id,
        milestones: { create: ["Discovery", "Design", "Build", "Launch"].map((title, i) => ({ title, position: i, done: true })) },
      },
    });
  }

  const leads: Array<{
    name: string; email: string; company?: string; service?: string; features: number; timeline: Timeline; budget?: number;
    message: string; path: LeadStatus[]; assign?: boolean; daysAgo: number;
  }> = [
    { name: "Karim Ahmed", email: "karim@freshmart.bd", company: "FreshMart Grocery", service: "ecommerce", features: 6, timeline: "RUSH", budget: 5000, daysAgo: 1, path: [],
      message: "We run 4 grocery shops in Chittagong and need an online store with bKash payment, home delivery slots and inventory sync. We want to launch before Eid so this is urgent." },
    { name: "Sarah Johnson", email: "sarah@medilink.io", company: "MediLink Health", service: "ai-solutions", features: 4, timeline: "NORMAL", budget: 12000, daysAgo: 2, path: [],
      message: "We'd like an AI chatbot that answers patient questions about appointments and clinic hours, trained on our FAQ documents, and hands off to a human when needed. Planning to start next month." },
    { name: "Imran Hossain", email: "imran.h@gmail.com", features: 1, timeline: "FLEXIBLE", daysAgo: 3, path: [],
      message: "Just exploring ideas for a personal portfolio website for my photography, no rush at all, maybe later this year." },
    { name: "Fatema Akter", email: "fatema@quickcourier.com", company: "QuickCourier", service: "mobile-apps", features: 7, timeline: "NORMAL", budget: 9000, daysAgo: 6, path: ["CONTACTED"], assign: true,
      message: "Need an Android and iOS app for our courier business: customers book pickups, track parcels live, and pay with bKash. Riders need a separate app view." },
    { name: "David Lee", email: "david@brightlearn.com", company: "BrightLearn", service: "ui-ux-design", features: 3, timeline: "NORMAL", budget: 2000, daysAgo: 9, path: ["CONTACTED", "PROPOSAL_SENT"], assign: true,
      message: "Our learning app has poor retention. We need a UX audit and a redesigned onboarding flow and dashboard in Figma." },
    { name: "Nasir Uddin", email: "nasir@textilepro.bd", company: "TextilePro Ltd", service: "web-applications", features: 8, timeline: "NORMAL", budget: 15000, daysAgo: 20, path: ["CONTACTED", "PROPOSAL_SENT", "WON"], assign: true,
      message: "We need a web-based production tracking dashboard for our garments factory: orders, cutting, sewing, finishing stages, with role-based access for supervisors and management reports." },
    { name: "Priya Das", email: "priya@cafebloom.com", company: "Cafe Bloom", service: "business-websites", features: 3, timeline: "RUSH", budget: 900, daysAgo: 14, path: ["CONTACTED", "LOST"],
      message: "Need a simple website for our cafe with menu, location and online table reservation ASAP for our opening next week." },
    { name: "Omar Faruk", email: "omar@agrismart.org", company: "AgriSmart", service: "ai-solutions", features: 5, timeline: "FLEXIBLE", budget: 8000, daysAgo: 4, path: [],
      message: "We collect crop price data from local markets and want a machine learning model that predicts prices for the next few weeks, with a simple dashboard for farmers." },
  ];

  for (const l of leads) {
    const service = l.service ? bySlug[l.service] : undefined;
    const quote = service
      ? calculateQuote({ basePrice: service.basePrice, pricePerFeature: service.pricePerFeature, features: l.features, timeline: l.timeline })
      : null;
    const triage = fallbackTriage({ name: l.name, company: l.company, message: l.message, serviceName: service?.name, budget: l.budget, timeline: l.timeline, features: l.features });
    const createdAt = new Date(Date.now() - l.daysAgo * 24 * 60 * 60 * 1000);
    const lead = await prisma.lead.create({
      data: {
        name: l.name, email: l.email, company: l.company, message: l.message, features: l.features, timeline: l.timeline, budget: l.budget,
        serviceId: service?.id, estimatedMin: quote?.min, estimatedMax: quote?.max, createdAt,
        assignedToId: l.assign ? staff.id : undefined,
        aiCategory: triage.category, aiUrgency: triage.urgency, aiScore: triage.score, aiSummary: triage.summary,
        aiDraftReply: triage.draftReply, aiSource: triage.source, aiTriagedAt: createdAt,
        activities: {
          create: [
            { type: "CREATED", toStatus: "NEW", note: "Inquiry submitted via website", createdAt },
            { type: "AI_TRIAGE", note: `AI (keyword fallback): ${triage.category}, ${triage.urgency} urgency, score ${triage.score}`, createdAt },
          ],
        },
      },
    });
    let from: LeadStatus = "NEW";
    for (const to of l.path) {
      await prisma.lead.update({ where: { id: lead.id }, data: { status: to } });
      await prisma.leadActivity.create({ data: { type: "STATUS_CHANGE", leadId: lead.id, userId: admin.id, fromStatus: from, toStatus: to } });
      if (to === "WON") await prisma.$transaction((tx) => convertLead(tx, lead.id));
      from = to;
    }
  }

  console.log("Seed complete.");
  console.log("  Admin: admin@demo.com / Admin12345");
  console.log("  Staff: staff@demo.com / Staff12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
