/**
 * Demo logins created by `npm run db:seed` and shown on the login page.
 * Single source of truth for both, so they can't drift apart.
 */
export const DEMO_ACCOUNTS = [
  { name: "Ayesha Rahman", email: "admin@demo.com", password: "Admin12345", role: "ADMIN" },
  { name: "Tanvir Hasan", email: "staff@demo.com", password: "Staff12345", role: "STAFF" },
] as const;
