import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
      data: {
        name: "Admin",
        email: "admin@demo.com",
        role: "ADMIN",
        passwordHash: await bcrypt.hash("Admin12345", 12),
      },
    }),
    prisma.user.create({
      data: {
        name: "Staff",
        email: "staff@demo.com",
        role: "STAFF",
        passwordHash: await bcrypt.hash("Staff12345", 12),
      },
    }),
  ]);

  const serviceData = [
    {
      name: "Business Websites",
      slug: "business-websites",
      category: "WEB" as const,
      basePrice: 800,
      pricePerFeature: 150,
      typicalWeeks: 4,
      summary: "Fast, SEO-friendly websites that turn visitors into customers.",
      description:
        "Responsive company websites and landing pages built with Next.js, including CMS, contact forms, analytics and on-page SEO. Ideal for startups and SMEs that need a professional online presence.",
    },
    {
      name: "Custom Web Applications",
      slug: "web-applications",
      category: "WEB" as const,
      basePrice: 3000,
      pricePerFeature: 400,
      typicalWeeks: 10,
      summary:
        "Dashboards, portals and SaaS products tailored to your workflow.",
      description:
        "Full-stack web applications with authentication, role-based access, databases, APIs and admin dashboards. We cover ERP modules, booking systems, CRMs and SaaS MVPs.",
    },
    {
      name: "Mobile App Development",
      slug: "mobile-apps",
      category: "MOBILE" as const,
      basePrice: 4000,
      pricePerFeature: 500,
      typicalWeeks: 12,
      summary:
        "Cross-platform Android and iOS apps with Flutter and React Native.",
      description:
        "Native-quality mobile apps for Android and iOS from a single codebase, including push notifications, payments (bKash, cards), offline support and Play Store / App Store publishing.",
    },
    {
      name: "AI & Machine Learning Solutions",
      slug: "ai-solutions",
      category: "AI_ML" as const,
      basePrice: 3500,
      pricePerFeature: 600,
      typicalWeeks: 8,
      summary:
        "Chatbots, smart automation and predictive analytics for your business.",
      description:
        "Practical AI features: customer-support chatbots trained on your content, document classification, demand forecasting, recommendation engines and LLM integrations with your existing systems.",
    },
    {
      name: "E-commerce Stores",
      slug: "ecommerce",
      category: "ECOMMERCE" as const,
      basePrice: 1800,
      pricePerFeature: 250,
      typicalWeeks: 6,
      summary: "Online stores with payments, inventory and order management.",
      description:
        "Custom or Shopify/WooCommerce stores with product catalogues, carts, bKash/SSLCommerz/Stripe payments, inventory tracking, delivery integration and sales dashboards.",
    },
    {
      name: "UI/UX Design",
      slug: "ui-ux-design",
      category: "UI_UX" as const,
      basePrice: 600,
      pricePerFeature: 120,
      typicalWeeks: 3,
      summary: "Research-driven interfaces and clickable Figma prototypes.",
      description:
        "User research, wireframes, design systems and high-fidelity Figma prototypes for web and mobile products, plus usability reviews of existing apps.",
    },
  ];
  
  const services = await Promise.all(
    serviceData.map((data) => prisma.service.create({ data })),
  );
  const bySlug = Object.fromEntries(services.map((s) => [s.slug, s]));

  await prisma.teamMember.createMany({
    data: [
      {
        name: "Ayesha Rahman",
        role: "Founder & CEO",
        bio: "Leads strategy and client partnerships; 8 years building software for SMEs in Bangladesh.",
        position: 0,
      },
      {
        name: "Tanvir Hasan",
        role: "Head of Engineering",
        bio: "Full-stack engineer specialising in Next.js, Node.js and cloud architecture.",
        position: 1,
      },
      {
        name: "Nusrat Jahan",
        role: "Lead UI/UX Designer",
        bio: "Designs accessible, conversion-focused interfaces and design systems in Figma.",
        position: 2,
      },
      {
        name: "Rakib Islam",
        role: "AI Engineer",
        bio: "Builds chatbots, forecasting models and LLM integrations with Python and TypeScript.",
        position: 3,
      },
    ],
  });

  const portfolio = [
    {
      title: "Pharmacy Chain Inventory Portal",
      slug: "pharmacy-inventory-portal",
      service: "web-applications",
      techStack: ["Next.js", "PostgreSQL", "Prisma"],
      summary:
        "A multi-branch inventory and expiry tracking portal that cut stock-outs by 30% for a 12-branch pharmacy chain in Dhaka.",
    },
    {
      title: "Ride-Share Driver App",
      slug: "ride-share-driver-app",
      service: "mobile-apps",
      techStack: ["Flutter", "Firebase", "Google Maps"],
      summary:
        "A cross-platform driver app with live trip tracking, earnings dashboard and bKash payouts, serving 2,000+ drivers.",
    },
    {
      title: "Garments Order Forecasting",
      slug: "garments-order-forecasting",
      service: "ai-solutions",
      techStack: ["Python", "scikit-learn", "FastAPI"],
      summary:
        "A demand-forecasting model for a garments exporter that predicts monthly order volumes to plan fabric purchasing.",
    },
    {
      title: "Handicrafts Online Store",
      slug: "handicrafts-online-store",
      service: "ecommerce",
      techStack: ["Shopify", "Liquid", "SSLCommerz"],
      summary:
        "An e-commerce store for a rural handicrafts collective with international shipping and SSLCommerz payments.",
    },
    {
      title: "EdTech Learning Dashboard Redesign",
      slug: "edtech-dashboard-redesign",
      service: "ui-ux-design",
      techStack: ["Figma", "Design System"],
      summary:
        "A research-led redesign of a student dashboard that improved weekly active usage by 22%.",
    },
  ];
  for (const p of portfolio) {
    await prisma.project.create({
      data: {
        title: p.title,
        slug: p.slug,
        summary: p.summary,
        techStack: p.techStack,
        published: true,
        status: "COMPLETED",
        serviceId: bySlug[p.service].id,
        milestones: {
          create: ["Discovery", "Design", "Build", "Launch"].map(
            (title, i) => ({ title, position: i, done: true }),
          ),
        },
      },
    });
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
