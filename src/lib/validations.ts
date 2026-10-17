import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(8000),
});

export const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1)
    .max(50)
    .refine((msgs) => msgs[0]?.role === "user", "Conversation must start with a user message")
    .refine((msgs) => msgs.at(-1)?.role === "user", "Last message must be from the user"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const leadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.email("Enter a valid email"),
  company: z.string().trim().max(100).optional(),
  message: z.string().trim().min(10, "Tell us a bit more (10+ characters)").max(5000),
});

export type LeadInput = z.infer<typeof leadSchema>;
