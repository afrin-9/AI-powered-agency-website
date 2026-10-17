import { describe, expect, it } from "vitest";
import { chatRequestSchema, leadSchema } from "./validations";

describe("chatRequestSchema", () => {
  it("accepts a conversation ending with a user message", () => {
    const result = chatRequestSchema.safeParse({
      messages: [
        { role: "user", content: "Hi" },
        { role: "assistant", content: "Hello!" },
        { role: "user", content: "What do you build?" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a conversation ending with an assistant message", () => {
    const result = chatRequestSchema.safeParse({
      messages: [
        { role: "user", content: "Hi" },
        { role: "assistant", content: "Hello!" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty messages", () => {
    expect(chatRequestSchema.safeParse({ messages: [] }).success).toBe(false);
    expect(chatRequestSchema.safeParse({ messages: [{ role: "user", content: "   " }] }).success).toBe(false);
  });
});

describe("leadSchema", () => {
  it("accepts a valid lead", () => {
    const result = leadSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      message: "We need an AI-powered booking flow.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = leadSchema.safeParse({ name: "Ada", email: "nope", message: "Long enough message" });
    expect(result.success).toBe(false);
  });
});
