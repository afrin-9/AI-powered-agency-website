import { describe, expect, it } from "vitest";
import { leadCreateSchema, userCreateSchema } from "@/lib/validation";

const valid = {
  name: "Karim Ahmed",
  email: "Karim@Example.com ",
  message: "We need an online store with bKash payments and delivery tracking.",
};

describe("leadCreateSchema", () => {
  it("accepts a valid inquiry, lowercases the email and applies defaults", () => {
    const parsed = leadCreateSchema.parse(valid);
    expect(parsed.email).toBe("karim@example.com");
    expect(parsed.features).toBe(1);
    expect(parsed.timeline).toBe("NORMAL");
  });

  it("returns field errors for a bad email, short message and bad phone", () => {
    const result = leadCreateSchema.safeParse({ ...valid, email: "nope", message: "too short", phone: "abc" });
    expect(result.success).toBe(false);
    const fields = result.success ? {} : result.error.flatten().fieldErrors;
    expect(fields).toHaveProperty("email");
    expect(fields).toHaveProperty("message");
    expect(fields).toHaveProperty("phone");
  });

  it("rejects out-of-range features and unknown timelines", () => {
    expect(leadCreateSchema.safeParse({ ...valid, features: 0 }).success).toBe(false);
    expect(leadCreateSchema.safeParse({ ...valid, features: 999 }).success).toBe(false);
    expect(leadCreateSchema.safeParse({ ...valid, timeline: "YESTERDAY" }).success).toBe(false);
  });

  it("fails when the honeypot field is filled", () => {
    expect(leadCreateSchema.safeParse({ ...valid, website: "http://spam.example" }).success).toBe(false);
  });
});

describe("userCreateSchema", () => {
  const base = { name: "Test User", email: "t@example.com" };

  it("rejects weak passwords", () => {
    expect(userCreateSchema.safeParse({ ...base, password: "short1" }).success).toBe(false);
    expect(userCreateSchema.safeParse({ ...base, password: "nonumbers" }).success).toBe(false);
    expect(userCreateSchema.safeParse({ ...base, password: "12345678" }).success).toBe(false);
  });

  it("accepts a password with letters and numbers", () => {
    expect(userCreateSchema.safeParse({ ...base, password: "goodpass123" }).success).toBe(true);
  });
});
