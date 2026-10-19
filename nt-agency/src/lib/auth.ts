import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "./db";
import { ApiError } from "./api";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession, type SessionPayload } from "./session";

// Cost 10 is the OWASP minimum for bcrypt and keeps sign-in fast with the pure-JS bcryptjs
// (~120 ms per check versus ~470 ms at cost 12).
export const BCRYPT_COST = 10;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// Compared against when the email does not exist, so response time doesn't reveal valid emails.
let dummyHash: string | undefined;

export async function authenticate(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    dummyHash ??= await hashPassword("dummy-password-for-timing");
    await verifyPassword(password, dummyHash);
    return null;
  }
  if (!(await verifyPassword(password, user.passwordHash))) return null;
  // Hashes made with an older cost are upgraded in the background on a successful sign-in.
  if (bcrypt.getRounds(user.passwordHash) !== BCRYPT_COST) {
    void hashPassword(password)
      .then((passwordHash) => prisma.user.update({ where: { id: user.id }, data: { passwordHash } }))
      .catch(() => {});
  }
  return user;
}

export async function setSessionCookie(session: SessionPayload) {
  const token = await signSession(session);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession() {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/**
 * The signed-in user, read fresh from the database. Null when there is no session or the
 * cookie points at an account that no longer exists (deleted, or the database was re-seeded).
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.sub }, select: { id: true, name: true, role: true } });
}

/**
 * Ensures the request has a valid session (and optionally one of the given roles).
 * Re-reads the user's role from the database so role changes and deletions apply immediately.
 */
export async function requireRole(...roles: Role[]): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new ApiError(401, "Please log in");
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, role: true, name: true, email: true },
  });
  if (!user) throw new ApiError(401, "Session is no longer valid");
  if (roles.length > 0 && !roles.includes(user.role)) {
    throw new ApiError(403, "You do not have permission to do that");
  }
  return { sub: user.id, role: user.role, name: user.name, email: user.email };
}
