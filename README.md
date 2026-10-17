# AI-powered-agency-website

Next.js 15 (App Router) + TypeScript · PostgreSQL on Neon + Prisma 7 · Tailwind v4 + shadcn/ui · zod · Auth.js (NextAuth v5)

## Setup

1. Install: `npm install` (also runs `prisma generate`)
2. Copy env: `cp .env.example .env`, then fill in:
   - **Neon**: create a free project at https://console.neon.tech. Put the **pooled** connection string in `DATABASE_URL` and the **direct** one in `DIRECT_URL`.
   - **Auth**: `npx auth secret` → `AUTH_SECRET`. Create a GitHub OAuth app with callback `http://localhost:3000/api/auth/callback/github` → `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`.
   - **AI**: `ANTHROPIC_API_KEY` from https://console.anthropic.com.
3. Create tables: `npm run db:migrate -- --name init`
4. Run: `npm run dev`

## Scripts

| Script | What it does |
| --- | --- |
| `dev` / `build` / `start` | Next.js |
| `lint` / `typecheck` | ESLint / `tsc --noEmit` |
| `test` / `test:watch` | Vitest (jsdom + Testing Library) |
| `db:migrate` / `db:deploy` | Prisma migrations (dev / prod) |
| `db:generate` / `db:studio` | Regenerate client / open Prisma Studio |

## Layout

```
prisma/schema.prisma           Auth.js models + Lead
prisma.config.ts               Prisma CLI config (uses DIRECT_URL)
src/auth.ts                    Auth.js config (GitHub, Prisma adapter, DB sessions)
src/lib/db.ts                  PrismaClient over the Neon driver adapter
src/lib/ai.ts                  Anthropic client, model id, system prompt
src/lib/validations.ts         zod schemas (chat request, lead form)
src/lib/env.ts                 zod-validated server env
src/app/api/chat/route.ts      Streaming Claude chat endpoint (plain text)
src/app/api/auth/[...nextauth] Auth.js route handlers
src/components/ui/             shadcn/ui components (add more: npx shadcn@latest add <name>)
```

## Chat API

`POST /api/chat` with `{ "messages": [{ "role": "user", "content": "..." }] }` streams back plain text. It uses `claude-opus-5-5` with server-side refusal fallbacks enabled. The endpoint is public, so add rate limiting before deploying.
