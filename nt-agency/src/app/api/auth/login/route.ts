import { authenticate, setSessionCookie } from "@/lib/auth";
import { ApiError, clientIp, handle, json } from "@/lib/api";
import { rateLimit } from "@/lib/rateLimit";
import { loginSchema, parseBody } from "@/lib/validation";

export const POST = handle(async (req) => {
  rateLimit(`login:${clientIp(req)}`, 10, 15 * 60 * 1000);
  const { email, password } = await parseBody(req, loginSchema);
  const user = await authenticate(email, password);
  // Same message for unknown email and wrong password so emails can't be probed.
  if (!user) throw new ApiError(401, "Invalid email or password");
  await setSessionCookie({ sub: user.id, name: user.name, email: user.email, role: user.role });
  return json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});
