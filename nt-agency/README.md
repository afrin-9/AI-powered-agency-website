# NT Agency — AI-powered agency website

A full-stack website for a software agency. Visitors can browse services and past projects, get an instant price estimate, chat with an AI assistant, and send an enquiry (a **lead**). Agency staff log in to an admin area to manage leads through a sales pipeline, and to maintain services, portfolio projects, clients and the team page.

> **Status:** foundation stage. The database, seed data and core business logic (validation, pricing, lead pipeline, API error handling) are done. Pages, API routes, login and the AI chat are not built yet. See [docs/ROADMAP.md](docs/ROADMAP.md).

## Contents

- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [How it works](#how-it-works)
- [Data model](#data-model)
- [Environment variables](#environment-variables)
- [Further docs](#further-docs)

## Tech stack

| Area | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) + React 19 + TypeScript | Pages and API routes in one project |
| Database | PostgreSQL 16, run locally with Docker | Free, standard, and works with any host later (Neon, Supabase, RDS) |
| ORM | Prisma 6 (`prisma-client-js`, classic engine) | Type-safe queries, migrations, seeding |
| Validation | zod 3 | One schema validates API input and gives TypeScript types |
| Auth (planned) | `jose` (JWT) + `bcryptjs` (password hashing) | Simple email/password login for staff only, no third-party auth service |
| UI | Tailwind CSS v4, `lucide-react` icons, `sonner` toasts | |
| Tests | Vitest | |
| Scripts | `tsx` | Runs the TypeScript seed file directly |

## Getting started

**You need:** Node.js 20+ and Docker Desktop (running).

```bash
# 1. Install dependencies (this also generates the Prisma client)
npm install

# 2. Create your local env file
cp .env.example .env

# 3. Start PostgreSQL in Docker (listens on localhost:5434)
docker compose up -d

# 4. Create the tables
npm run db:migrate

# 5. Fill the database with demo data
npm run db:seed

# 6. Start the dev server → http://localhost:3000
npm run dev
```

Demo logins created by the seed (for when login is built):

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@demo.com` | `Admin12345` |
| Staff | `staff@demo.com` | `Staff12345` |

> ⚠️ `npm run db:seed` **deletes all data** before inserting demo data. Never run it against a real database.

To browse the data visually, run `npm run db:studio`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` / `npm start` | Production build / run it |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check, no output files |
| `npm test` | Run Vitest once |
| `npm run db:migrate` | Apply migrations; after editing `schema.prisma`, run `npm run db:migrate -- --name <what-changed>` to create a new one |
| `npm run db:seed` | Reset and fill the database with demo data |
| `npm run db:studio` | Open Prisma Studio (database browser) |

## Project structure

```
nt-agency/
├─ docker-compose.yml        Local PostgreSQL 16 (port 5434 → 5432)
├─ prisma.config.ts          Prisma CLI config: schema path, migrations, seed command
├─ prisma/
│  ├─ schema.prisma          Database models and enums
│  ├─ migrations/            SQL migrations (commit these)
│  └─ seed.ts                Demo users, services, team, portfolio
├─ src/
│  ├─ app/                   Next.js pages and API routes (still the starter page)
│  └─ lib/
│     ├─ db.ts               Shared Prisma client
│     ├─ api.ts              Route helpers: errors → JSON, handle(), clientIp()
│     ├─ validation.ts       All zod schemas + parseBody()
│     ├─ quote.ts            Price estimate calculator
│     └─ leadWorkflow.ts     Lead pipeline rules (allowed status changes)
├─ docs/
│  ├─ FIXES.md               What was broken and how it was fixed
│  └─ ROADMAP.md             What to build next, step by step
└─ notes/                    Personal notes (gitignored)
```

## How it works

### Request flow (API routes)

Every API route follows the same pattern, using the helpers in `src/lib`:

1. The handler is wrapped in `handle()` from `api.ts`.
2. The body is read and checked with `parseBody(req, someSchema)` from `validation.ts`.
3. The handler does the work with `prisma` from `db.ts`.
4. It returns `json(data, status)`.

If anything throws, `handle()` converts it into a clean JSON error `{ error, details? }`:

| Thrown error | HTTP status | Message |
| --- | --- | --- |
| `ApiError(status, msg)` | the given status | your message |
| `ZodError` (invalid input) | 400 | "Please check the highlighted fields", with field errors in `details` |
| Bad JSON body | 400 | "Invalid JSON body" |
| Prisma `P2002` (unique value already exists) | 409 | "A record with that value already exists" |
| Prisma `P2025` (record not found) | 404 | "Record not found" |
| Prisma `P2003` (related record missing) | 400 | "Related record does not exist" |
| Anything else | 500 | "Something went wrong" (details are logged on the server only) |

```ts
// Example: src/app/api/leads/route.ts
import { handle, json } from "@/lib/api";
import { prisma } from "@/lib/db";
import { leadCreateSchema, parseBody } from "@/lib/validation";

export const POST = handle(async (req) => {
  const { website: _honeypot, ...data } = await parseBody(req, leadCreateSchema);
  const lead = await prisma.lead.create({ data });
  return json({ id: lead.id }, 201);
});
```

### Price estimate (`quote.ts`)

```
estimate = (basePrice + (features − 1) × pricePerFeature) × timeline multiplier
```

- The first feature is included in the base price.
- Timeline multipliers: `RUSH` ×1.25, `NORMAL` ×1, `FLEXIBLE` ×0.9.
- The client sees a range of ±15%, with every number rounded to the nearest 50 USD.
- `features` must be a whole number from 1 to 50, and prices can't be negative. Otherwise it throws a `RangeError`.

Example: *Business Websites* (base 800, 150 per feature) with 3 features on RUSH gives an estimate of **1,400**, shown as a range of **1,150 – 1,600**.

### Lead pipeline (`leadWorkflow.ts`)

```
NEW ──► CONTACTED ──► PROPOSAL_SENT ──► WON
 │          │               │
 └──────────┴───────────────┴──────────► LOST
```

`WON` and `LOST` are final. Use `canTransition(from, to)` before changing a lead's status, and record each change as a `LeadActivity` row so there is a history.

### Validation (`validation.ts`)

All input rules live in one file, grouped into **Public** (lead form, quote, chat), **Auth** (login) and **Admin** (lead updates, services, projects, milestones, clients, team, users). Some notable rules:

- Emails are trimmed and lowercased.
- Optional text fields convert `""` to `undefined`, so empty form inputs don't save empty strings.
- The lead form has a hidden **honeypot** field, `website`. Real users leave it empty; bots fill it in and get rejected.
- Slugs must be lowercase letters, numbers and dashes (`web-applications`).
- Passwords need at least 8 characters, including at least one letter and one number.

## Data model

Defined in [prisma/schema.prisma](prisma/schema.prisma).

| Model | Purpose | Key fields |
| --- | --- | --- |
| `User` | Staff who log in to the admin area | `email` (unique), `passwordHash`, `role` (ADMIN / STAFF) |
| `Service` | What the agency sells; used for pricing | `slug` (unique), `category`, `basePrice`, `pricePerFeature`, `typicalWeeks`, `active` |
| `Lead` | An enquiry from the contact/quote form | contact info, `serviceId?`, `features`, `timeline`, `budget?`, `message`, `status`, `score`, `assignedToId?` |
| `LeadActivity` | History of a lead: status changes and notes | `leadId`, `userId?`, `fromStatus?`, `toStatus?`, `note?` |
| `Client` | A customer company or person | `name`, `company?`, `email`, `phone?` |
| `Project` | Portfolio / delivery project | `slug` (unique), `techStack[]`, `status`, `published`, `serviceId?`, `clientId?` |
| `Milestone` | Steps of a project | `projectId`, `title`, `dueDate?`, `done`, `position` |
| `TeamMember` | People shown on the team page | `name`, `role`, `bio`, `position` (display order) |

Enums: `Role`, `Category` (WEB, MOBILE, AI_ML, ECOMMERCE, UI_UX, OTHER), `Timeline` (RUSH, NORMAL, FLEXIBLE), `LeadStatus`, `ProjectStatus` (PLANNED, IN_PROGRESS, COMPLETED).

What happens on delete:
- Deleting a **lead** deletes its activities.
- Deleting a **project** deletes its milestones.
- Deleting a **service, client or user** keeps the linked rows and sets the link to empty (`null`).

## Environment variables

Copy `.env.example` to `.env`. Never commit `.env`.

| Variable | Used for | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Prisma | The default points to the Docker database on port 5434 |
| `JWT_SECRET` | Signing login tokens (planned) | Use a long random string: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `AI_API_KEY` | AI chat (planned) | From your AI provider |
| `AI_MODEL` | AI chat (planned) | ⚠️ The current value `gemini-flash-1.1` isn't a valid model name. Replace it with a real model ID from your provider. |

## Further docs

- [docs/FIXES.md](docs/FIXES.md): problems found in the project and how each was fixed
- [docs/ROADMAP.md](docs/ROADMAP.md): what's left to build, in order, with how to do each step
