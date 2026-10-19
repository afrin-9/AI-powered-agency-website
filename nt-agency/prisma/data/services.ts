import type { Category } from "@prisma/client";

// Demo services and pricing (whole USD). Sample content for this concept site.
export const SERVICES: Array<{
  name: string;
  slug: string;
  category: Category;
  basePrice: number;
  pricePerFeature: number;
  typicalWeeks: number;
  summary: string;
  description: string;
}> = [
  {
    name: "Business Websites",
    slug: "business-websites",
    category: "WEB",
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
    category: "WEB",
    basePrice: 3000,
    pricePerFeature: 400,
    typicalWeeks: 10,
    summary: "Dashboards, portals and SaaS products tailored to your workflow.",
    description:
      "Full-stack web applications with authentication, role-based access, databases, APIs and admin dashboards. We cover ERP modules, booking systems, CRMs and SaaS MVPs.",
  },
  {
    name: "Mobile App Development",
    slug: "mobile-apps",
    category: "MOBILE",
    basePrice: 4000,
    pricePerFeature: 500,
    typicalWeeks: 12,
    summary: "Cross-platform Android and iOS apps with Flutter and React Native.",
    description:
      "Native-quality mobile apps for Android and iOS from a single codebase, including push notifications, payments (bKash, cards), offline support and Play Store / App Store publishing.",
  },
  {
    name: "AI & Machine Learning Solutions",
    slug: "ai-solutions",
    category: "AI_ML",
    basePrice: 3500,
    pricePerFeature: 600,
    typicalWeeks: 8,
    summary: "Chatbots, smart automation and predictive analytics for your business.",
    description:
      "Practical AI features: customer-support chatbots trained on your content, document classification, demand forecasting, recommendation engines and LLM integrations with your existing systems.",
  },
  {
    name: "E-commerce Stores",
    slug: "ecommerce",
    category: "ECOMMERCE",
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
    category: "UI_UX",
    basePrice: 600,
    pricePerFeature: 120,
    typicalWeeks: 3,
    summary: "Research-driven interfaces and clickable Figma prototypes.",
    description:
      "User research, wireframes, design systems and high-fidelity Figma prototypes for web and mobile products, plus usability reviews of existing apps.",
  },
];
