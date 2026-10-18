import { z } from "zod";

const trimmed = (min: number, max: number) =>
  z.string().trim().min(min).max(max);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : undefined));

export const categoryEnum = z.enum([
  "WEB",
  "MOBILE",
  "AI_ML",
  "ECOMMERCE",
  "UI_UX",
  "OTHER",
]);
export const timelineEnum = z.enum(["RUSH", "NORMAL", "FLEXIBLE"]);
export const leadStatusEnum = z.enum([
  "NEW",
  "CONTACTED",
  "PROPOSAL_SENT",
  "WON",
  "LOST",
]);
export const projectStatusEnum = z.enum([
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
]);
export const roleEnum = z.enum(["ADMIN", "STAFF"]);

const slug = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers and dashes",
  );

// Public ----------------------------------

export const leadCreateSchema = z.object({
  name: trimmed(2, 80),
  email: z.string().trim().toLowerCase().email().max(120),
  phone: optionalText(30).refine(
    (v) => !v || /^[+\d\s()-]{6,30}$/.test(v),
    "Invalid phone number",
  ),
  company: optionalText(120),
  serviceId: z
    .string()
    .cuid()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  features: z.coerce.number().int().min(1).max(50).default(1),
  timeline: timelineEnum.default("NORMAL"),
  budget: z.coerce.number().int().min(0).max(10_000_000).optional().nullable(),
  message: trimmed(20, 3000),
  // real users never see this field; bots tend to fill it.
  website: z.string().max(0, "Spam detected").optional(),
});
export type LeadCreateInput = z.infer<typeof leadCreateSchema>;

export const quoteEstimateSchema = z.object({
  serviceId: z.string().cuid(),
  features: z.coerce.number().int().min(1).max(50),
  timeline: timelineEnum,
});

export const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(1000),
      }),
    )
    .min(1)
    .max(12),
});

// Auth -----------------------------------------------

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

// Admin ----------------------------------------------

export const leadStatusUpdateSchema = z.object({
  status: leadStatusEnum,
  note: optionalText(1000),
});

export const leadNoteSchema = z.object({ note: trimmed(1, 2000) });

export const leadAssignSchema = z.object({
  userId: z.string().cuid().nullable(),
});

export const leadListQuerySchema = z.object({
  status: leadStatusEnum.optional(),
  q: z.string().trim().max(100).optional(),
  sort: z.enum(["score", "newest"]).default("score"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const serviceSchema = z.object({
  name: trimmed(2, 80),
  slug,
  category: categoryEnum,
  summary: trimmed(10, 200),
  description: trimmed(20, 4000),
  basePrice: z.coerce.number().int().min(0).max(1_000_000),
  pricePerFeature: z.coerce.number().int().min(0).max(100_000),
  typicalWeeks: z.coerce.number().int().min(1).max(104),
  active: z.boolean().default(true),
});

export const projectSchema = z.object({
  title: trimmed(2, 120),
  slug,
  summary: trimmed(10, 2000),
  techStack: z.array(trimmed(1, 40)).max(15).default([]),
  status: projectStatusEnum.default("PLANNED"),
  budget: z.coerce.number().int().min(0).max(10_000_000).nullable().optional(),
  published: z.boolean().default(false),
  serviceId: z.string().cuid().nullable().optional(),
  clientId: z.string().cuid().nullable().optional(),
});

export const milestoneSchema = z.object({
  title: trimmed(2, 120),
  dueDate: z.coerce.date().nullable().optional(),
  done: z.boolean().default(false),
});

export const milestoneUpdateSchema = z.object({
  title: trimmed(2, 120).optional(),
  dueDate: z.coerce.date().nullable().optional(),
  done: z.boolean().optional(),
});

export const clientSchema = z.object({
  name: trimmed(2, 80),
  company: optionalText(120),
  email: z.string().trim().toLowerCase().email().max(120),
  phone: optionalText(30),
});

export const teamMemberSchema = z.object({
  name: trimmed(2, 80),
  role: trimmed(2, 80),
  bio: trimmed(10, 600),
  position: z.coerce.number().int().min(0).max(1000).default(0),
});

export const userCreateSchema = z.object({
  name: trimmed(2, 80),
  email: z.string().trim().toLowerCase().email().max(120),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .max(200)
    .regex(/[A-Za-z]/, "Must contain a letter")
    .regex(/\d/, "Must contain a number"),
  role: roleEnum.default("STAFF"),
});

export const userUpdateSchema = z.object({
  name: trimmed(2, 80).optional(),
  role: roleEnum.optional(),
});

/** Reads and validates a JSON body. Throws ZodError (-> 400) or SyntaxError (-> 400). */
export async function parseBody<T extends z.ZodTypeAny>(
  req: Request,
  schema: T,
): Promise<z.infer<T>> {
  const body = await req.json();
  return schema.parse(body);
}
