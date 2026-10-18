import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

/** An error with an HTTP status whose message is safe to show to the client. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function json<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** Converts known errors into consistent JSON responses: { error, details? }. */
export function errorResponse(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.message, details: err.details }, { status: err.status });
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: "Please check the highlighted fields", details: err.flatten().fieldErrors },
      { status: 400 },
    );
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "A record with that value already exists" }, { status: 409 });
    }
    if (err.code === "P2025") {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
    if (err.code === "P2003") {
      return NextResponse.json({ error: "Related record does not exist" }, { status: 400 });
    }
  }
  if (err instanceof SyntaxError) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  console.error(err);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}

/** Wraps a route handler so thrown errors become JSON responses. */
export function handle<C>(fn: (req: Request, ctx: C) => Promise<Response>) {
  return async (req: Request, ctx: C) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      return errorResponse(err);
    }
  };
}

export function clientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local"
  );
}

/** Next.js 15 route context with async params. */
export type IdContext = { params: Promise<{ id: string }> };
