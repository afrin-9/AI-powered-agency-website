import type { LeadStatus, Timeline } from "@prisma/client";

export interface DemoLead {
  name: string;
  email: string;
  company?: string;
  /** Service slug from services.ts. */
  service?: string;
  features: number;
  timeline: Timeline;
  budget?: number;
  message: string;
  /** Status moves applied after creation, so leads end up at every pipeline stage. */
  path: LeadStatus[];
  /** Assign the lead to the demo staff user. */
  assign?: boolean;
  /** How long ago the inquiry arrived. */
  daysAgo: number;
}

export const LEADS: DemoLead[] = [
  {
    name: "Karim Ahmed",
    email: "karim@freshmart.bd",
    company: "FreshMart Grocery",
    service: "ecommerce",
    features: 6,
    timeline: "RUSH",
    budget: 5000,
    daysAgo: 1,
    path: [],
    message:
      "We run 4 grocery shops in Chittagong and need an online store with bKash payment, home delivery slots and inventory sync. We want to launch before Eid so this is urgent.",
  },
  {
    name: "Sarah Johnson",
    email: "sarah@medilink.io",
    company: "MediLink Health",
    service: "ai-solutions",
    features: 4,
    timeline: "NORMAL",
    budget: 12000,
    daysAgo: 2,
    path: [],
    message:
      "We'd like an AI chatbot that answers patient questions about appointments and clinic hours, trained on our FAQ documents, and hands off to a human when needed. Planning to start next month.",
  },
  {
    name: "Imran Hossain",
    email: "imran.h@gmail.com",
    features: 1,
    timeline: "FLEXIBLE",
    daysAgo: 3,
    path: [],
    message: "Just exploring ideas for a personal portfolio website for my photography, no rush at all, maybe later this year.",
  },
  {
    name: "Fatema Akter",
    email: "fatema@quickcourier.com",
    company: "QuickCourier",
    service: "mobile-apps",
    features: 7,
    timeline: "NORMAL",
    budget: 9000,
    daysAgo: 6,
    path: ["CONTACTED"],
    assign: true,
    message:
      "Need an Android and iOS app for our courier business: customers book pickups, track parcels live, and pay with bKash. Riders need a separate app view.",
  },
  {
    name: "David Lee",
    email: "david@brightlearn.com",
    company: "BrightLearn",
    service: "ui-ux-design",
    features: 3,
    timeline: "NORMAL",
    budget: 2000,
    daysAgo: 9,
    path: ["CONTACTED", "PROPOSAL_SENT"],
    assign: true,
    message: "Our learning app has poor retention. We need a UX audit and a redesigned onboarding flow and dashboard in Figma.",
  },
  {
    name: "Nasir Uddin",
    email: "nasir@textilepro.bd",
    company: "TextilePro Ltd",
    service: "web-applications",
    features: 8,
    timeline: "NORMAL",
    budget: 15000,
    daysAgo: 20,
    path: ["CONTACTED", "PROPOSAL_SENT", "WON"],
    assign: true,
    message:
      "We need a web-based production tracking dashboard for our garments factory: orders, cutting, sewing, finishing stages, with role-based access for supervisors and management reports.",
  },
  {
    name: "Priya Das",
    email: "priya@cafebloom.com",
    company: "Cafe Bloom",
    service: "business-websites",
    features: 3,
    timeline: "RUSH",
    budget: 900,
    daysAgo: 14,
    path: ["CONTACTED", "LOST"],
    message:
      "Need a simple website for our cafe with menu, location and online table reservation ASAP for our opening next week.",
  },
  {
    name: "Omar Faruk",
    email: "omar@agrismart.org",
    company: "AgriSmart",
    service: "ai-solutions",
    features: 5,
    timeline: "FLEXIBLE",
    budget: 8000,
    daysAgo: 4,
    path: [],
    message:
      "We collect crop price data from local markets and want a machine learning model that predicts prices for the next few weeks, with a simple dashboard for farmers.",
  },
];
