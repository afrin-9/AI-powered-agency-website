# NT Agency — AI-powered agency website and lead pipeline

A full-stack concept website for a software agency (NT Tech Innovation). Visitors browse services and past projects, get an instant price estimate, ask an AI assistant questions and send an inquiry. Staff log in to an admin area where every inquiry has already been sorted by AI, then move it through a sales pipeline until it becomes a client project.

> Concept project with sample content. It is not the agency's official website.

## Contents

1. [Problem and solution](#1-problem-and-solution)
2. [Main user flow (demo script)](#2-main-user-flow-demo-script)
3. [Tech stack](#3-tech-stack)
4. [Architecture](#4-architecture)
5. [Database design](#5-database-design)
6. [Business logic](#6-business-logic)
7. [AI feature](#7-ai-feature)
8. [Security](#8-security)
9. [Testing](#9-testing)
10. [Getting started](#10-getting-started)
11. [Environment variables](#11-environment-variables)
12. [Demo credentials](#12-demo-credentials)
13. [Deployment](#13-deployment)
14. [Key API endpoints](#14-key-api-endpoints)
15. [Known limitations and next steps](#15-known-limitations-and-next-steps)

## 1. Problem and solution

**Problem.** A small agency gets inquiries through a contact form or email. Someone has to read each one, work out what kind of project it is and how urgent it is, guess a price, reply, and remember to follow up. Good leads wait behind spam, and nobody can see the pipeline as a whole.

**Solution.**

- **Instant estimate.** The quote form shows a price range as the visitor fills it in, using the same formula the team uses.
- **AI triage.** Every inquiry is classified (category, urgency), scored 0–100 and summarised, and gets a draft reply. If no AI key is set, or the AI call fails, a built-in keyword classifier takes over so no inquiry is lost.
- **Sales pipeline.** Leads move through `NEW → CONTACTED → PROPOSAL_SENT → WON / LOST`, with every change, note and assignment kept in an activity log.
- **Automatic handover.** Marking a lead as won creates the client, a project and four default milestones in a single database transaction.
- **Website assistant.** A chatbot answers questions using only the site's own content (services, prices, FAQ, team) and declines anything else.

## 2. Main user flow (demo script)

1. Open the home page, then **Services**, and click **Estimate this service**.
2. On **Get a Quote**, change the number of features and the timeline and watch the estimate update. Submit the form.
3. Open the chat bubble and ask *"How is pricing calculated?"*, then something off-topic such as *"Who won the 2018 World Cup?"*.
4. Log in at `/login` as the admin (see [demo credentials](#12-demo-credentials)).
5. The **Dashboard** shows pipeline counts, pipeline value, win rate and the latest inquiries.
6. **Leads** lists inquiries sorted by AI score. Switch to **Board** view to see the stages.
7. Open the inquiry you submitted. It shows the AI summary, category, urgency, score and draft reply (with a copy button). Add a note and assign an owner.
8. Move it **Contacted → Proposal sent → Won**. A green box links to the new project.
9. Open the project, tick milestones and watch its status go from Planned to In progress to Completed. Publish it to the portfolio.
10. Log out and sign in as staff. The **Users** menu and delete buttons are gone.

## 3. Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Database | PostgreSQL 16 (Docker locally, Neon in production) |
| ORM | Prisma 6 |
| Validation | zod (shared by API and types) |
| Auth | Email + password, bcrypt hashes, signed JWT in an httpOnly cookie (`jose`) |
| AI | Anthropic Claude via `@anthropic-ai/sdk` (structured outputs), with a self-built keyword fallback |
| UI | Tailwind CSS v4, lucide-react icons, sonner toasts |
| Tests | Vitest (unit + API integration against a real test database) |

## 4. Architecture

```
Browser ──► Next.js
            ├─ (public) pages        server components read Prisma directly
            ├─ /admin pages          client components call the admin API
            ├─ middleware.ts         blocks /admin and /api/admin without a valid session
            └─ /api/* route handlers
                 └─ handle() → requireRole() → parseBody(zod) → service layer
                                                               ├─ lib/leads.ts   (pipeline, conversion, stats)
                                                               ├─ lib/quote.ts   (pricing formula)
                                                               ├─ lib/ai/*       (Claude + fallback)
                                                               └─ Prisma → PostgreSQL
```

- **Route handlers stay thin.** Each one checks the role, validates the body and calls a function in `src/lib`. `handle()` turns any thrown error into a consistent `{ error, details? }` JSON response (400 / 401 / 403 / 404 / 409 / 429 / 500).
- **Two layers of auth.** Middleware rejects requests with no valid session. Each handler then calls `requireRole()`, which re-reads the user from the database, so a deleted user or a changed role applies immediately.
- **Reusable admin screens.** `ResourceManager` is one generic table plus a create/edit form, configured by a list of fields and columns. Services, team, clients, projects and users all use it.

```
src/
├─ app/(public)/      Home, services, portfolio, about, quote
├─ app/admin/         Dashboard, leads (table/board/detail), projects, clients, services, team, users
├─ app/api/           Public, auth and admin route handlers
├─ components/        UI kit, public components, admin components
├─ lib/               Business logic, auth, validation, AI
└─ middleware.ts
prisma/               Schema, migrations, seed
tests/                Unit and integration tests
eval/                 AI evaluation dataset, runner and results
```

## 5. Database design

| Model | Purpose |
|---|---|
| `User` | Staff accounts (`ADMIN` or `STAFF`) |
| `Service` | What the agency sells, with `basePrice`, `pricePerFeature` and `typicalWeeks` |
| `Lead` | An inquiry: contact details, requested scope, estimate, AI triage fields, pipeline status |
| `LeadActivity` | Audit log for a lead: `CREATED`, `AI_TRIAGE`, `STATUS_CHANGE`, `NOTE`, `ASSIGN` |
| `Client` | A customer, created when a lead is won or added by hand |
| `Project` | Client project or portfolio case study (`published` shows it on the site) |
| `Milestone` | Ordered steps of a project |
| `TeamMember` | People shown on the About page |

**Relations.** Service 1–n Lead and Project · User 1–n Lead (owner) and LeadActivity · Lead 1–n LeadActivity · Lead n–1 Client · Lead 1–1 Project (`projectId` is unique) · Client 1–n Project · Project 1–n Milestone.

**Enums.** `Role`, `Category` (WEB, MOBILE, AI_ML, ECOMMERCE, UI_UX, OTHER), `Timeline` (RUSH, NORMAL, FLEXIBLE), `LeadStatus`, `ProjectStatus`, `Urgency`, `AiSource` (LLM, FALLBACK), `ActivityType`.

**Delete rules.**

- Deleting a lead deletes its activity log (`Cascade`).
- Deleting a project deletes its milestones (`Cascade`).
- Deleting a service, user, client or project keeps the leads and projects that point to it and clears the link (`SetNull`), so history is never lost.
- The API refuses to delete a client that still has projects (409).

Money is stored as whole US dollars (`Int`) to avoid floating-point errors.

## 6. Business logic

### Quote formula (`src/lib/quote.ts`)

```
estimate = (basePrice + (features − 1) × pricePerFeature) × timeline multiplier
range    = estimate ± 15%, rounded to the nearest $50
```

Timeline multipliers: RUSH ×1.25, NORMAL ×1, FLEXIBLE ×0.9. The first feature is included in the base price. The quote form calls `/api/quote/estimate`, so the browser never has its own copy of the formula.

Example: E-commerce ($1,800 base, $250 per feature), 4 features, RUSH → (1800 + 3 × 250) × 1.25 = 3,187.50 → shown as **$2,700 – $3,650**.

### Pipeline state machine (`src/lib/leadWorkflow.ts`)

```
NEW ──► CONTACTED ──► PROPOSAL_SENT ──► WON
 │          │               │
 └──────────┴───────────────┴─────────► LOST
```

`WON` and `LOST` are final. Any other move returns **409** with a readable message.

### Transaction (`changeLeadStatus` in `src/lib/leads.ts`)

A status change runs in one Prisma transaction that:

1. checks the transition is allowed;
2. updates the status with a conditional `updateMany` (`where: { id, status: current }`), so if two people move the same lead at once, the second gets a 409 instead of overwriting it;
3. writes a `STATUS_CHANGE` activity;
4. if the new status is `WON`, creates the Client, a Project and 4 default milestones and links them to the lead.

If any step fails, nothing is saved.

Ticking milestones also updates the project status in a transaction: none done → Planned, some → In progress, all → Completed.

## 7. AI feature

### Inquiry triage

| | |
|---|---|
| **Input** | Name, company, selected service, budget, timeline, number of features, message |
| **Output** | `category`, `urgency`, `score` (0–100), one-line `summary`, `draftReply` |
| **How** | Claude with structured outputs (a zod schema). The response is validated again before it is saved. |
| **When** | Right after the lead is saved, so a slow or failed AI call never loses an inquiry. Staff can click **Re-run AI** (rate limited). |
| **Fallback** | If there is no API key, or the call errors, is refused or returns an invalid shape, a weighted keyword classifier and rule-based score are used instead. The badge shows which one produced the result (`Claude` or `Keyword fallback`). |

### Website assistant

The assistant answers only from a knowledge base built from the database (active services and prices, published projects, team) and the FAQ. With no API key it falls back to keyword retrieval over the same content.

### Safety

- Customer text is wrapped in `<inquiry>` tags and the system prompt says to treat it as data. Instructions inside a message are ignored, and the eval set includes a prompt-injection case.
- AI output never changes a lead's status. A person always makes pipeline decisions; the AI only suggests.
- The chatbot is told not to invent prices, clients or dates, and to decline off-topic requests. Messages are limited in length and number, and the endpoint is rate limited.
- The UI labels AI content as suggestions to review.

### Evaluation (`npm run eval`)

There are 60 hand-labelled inquiries ([eval/inquiries.json](eval/inquiries.json)) covering every category, plus spam, a job application and a prompt-injection attempt. There are also 15 chatbot questions ([eval/chat-questions.json](eval/chat-questions.json)), 4 of which the bot should decline. The runner prints accuracy and a confusion matrix and writes [eval/results.md](eval/results.md).

Latest run (keyword fallback only; no API key was configured):

| Method | Category accuracy | Urgency accuracy |
|---|---|---|
| Keyword baseline | 55/60 (92%) | 54/60 (90%) |
| Chatbot (FAQ fallback) | 12/15 questions passed | |

Add an `ANTHROPIC_API_KEY` and run `npm run eval` again to add the Claude row and compare.

### Limitations

- The dataset is small, written by the developer and fairly clean. Real inquiries are messier, so expect lower accuracy in production.
- The keyword baseline misses meaning ("predict which customers will cancel" is AI/ML but has no AI keyword). This is the gap the LLM is meant to close.
- The lead score is a heuristic. It is not trained on real won/lost outcomes.

## 8. Security

- **Passwords** are hashed with bcrypt (cost 12). Login gives the same error and similar response time for a wrong password and an unknown email, so it doesn't reveal which emails exist.
- **Sessions** are HS256 JWTs in an `httpOnly`, `SameSite=Lax` cookie (`Secure` in production) that expire after 8 hours. `JWT_SECRET` must be at least 32 characters.
- **Access control**: middleware checks every `/admin` and `/api/admin` request, and each handler calls `requireRole()`. Deletes and user management are ADMIN only. Users can't delete themselves or remove their own admin role. `passwordHash` is never selected in API responses.
- **Input validation**: every body and query string goes through zod. Prisma uses parameterised queries.
- **Abuse protection**: rate limits on login (10 per 15 min), inquiries (5 per 10 min), chat (20 per 5 min), estimates and AI re-runs. The quote form also has a honeypot field to catch bots.
- **Redirects**: the login `?next=` value is only followed if it is a same-site path.
- **Headers**: `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` and HSTS. The `X-Powered-By` header is removed.
- Secrets live only in `.env`, which is git-ignored.

## 9. Testing

```bash
npm test
```

- **Unit:** validation rules (email normalisation, field errors, honeypot, password strength).
- **Integration:** calls the real route handlers against a separate `nt_agency_test` database, with `next/headers` cookies mocked. Covers:
  - lead creation with estimate, AI fields and activity records;
  - 400 field errors and the honeypot;
  - the 429 rate limit;
  - 401 with no session and with a tampered token;
  - 409 for invalid and post-WON transitions;
  - full conversion to client + project + 4 milestones;
  - 403 for staff deletes;
  - login success and the generic 401 message.

The test config builds the test database URL from `DATABASE_URL` and refuses to run against any database whose name doesn't contain `_test`. It also sets an empty `ANTHROPIC_API_KEY`, so results don't depend on the AI.

## 10. Getting started

**You need:** Node.js 20+ and Docker Desktop (running).

```bash
npm install                 # dependencies + Prisma client
cp .env.example .env        # then set JWT_SECRET (and optionally ANTHROPIC_API_KEY)
docker compose up -d        # PostgreSQL on localhost:5434
npx prisma migrate deploy   # create the tables
npm run db:seed             # demo data — wipes the database first
npm run dev                 # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / run it |
| `npm run typecheck` / `npm run lint` | TypeScript check / ESLint |
| `npm test` | Unit + integration tests |
| `npm run eval` | AI evaluation, writes `eval/results.md` |
| `npm run db:migrate` | Create a new migration after changing the schema |
| `npm run db:seed` | Reset demo data (never run against a real database) |
| `npx prisma studio` | Browse the database |

## 11. Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Signs session tokens, at least 32 characters. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ANTHROPIC_API_KEY` | No | Turns on Claude for triage and chat. Without it the app uses the local fallbacks. |
| `ANTHROPIC_MODEL` | No | Overrides the model (default `claude-opus-5-5`). Must be a valid Anthropic model ID. |

## 12. Demo credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@demo.com` | `Admin12345` |
| Staff | `staff@demo.com` | `Staff12345` |

## 13. Deployment

Vercel (app) and Neon (PostgreSQL), both on free tiers:

1. Create a Neon project and copy its connection string.
2. Import the GitHub repository into Vercel.
3. Set `DATABASE_URL`, a new random `JWT_SECRET` and, optionally, `ANTHROPIC_API_KEY`.
4. Set the build command to `prisma migrate deploy && npm run build`.
5. Deploy, then seed the Neon database once from your machine (PowerShell):

   ```powershell
   $env:DATABASE_URL="<neon-connection-string>"; npm run db:seed
   ```

## 14. Key API endpoints

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/leads` | Public | Submit an inquiry → `201 { id, estimate }` |
| POST | `/api/quote/estimate` | Public | Live price range |
| POST | `/api/chat` | Public | Website assistant |
| GET | `/api/public/services`, `/projects`, `/team` | Public | Site content |
| POST | `/api/auth/login`, `/api/auth/logout` | Public | Session cookie |
| GET | `/api/auth/me` | Signed in | Current user |
| GET | `/api/admin/leads` | Signed in | Filter, search, sort, paginate |
| GET / DELETE | `/api/admin/leads/:id` | Signed in / Admin | Lead with activity / delete |
| PATCH | `/api/admin/leads/:id/status` | Signed in | Pipeline move (409 if not allowed) |
| POST | `/api/admin/leads/:id/notes` | Signed in | Add a note |
| PATCH | `/api/admin/leads/:id/assign` | Signed in | Set the owner |
| POST | `/api/admin/leads/:id/retriage` | Signed in | Re-run AI triage |
| GET | `/api/admin/stats` | Signed in | Dashboard numbers |
| CRUD | `/api/admin/services`, `/team`, `/clients`, `/projects`, `/users` | Signed in (deletes and users: Admin) | Content management |
| POST | `/api/admin/projects/:id/milestones` | Signed in | Add a milestone |
| PATCH / DELETE | `/api/admin/milestones/:id` | Signed in | Tick or remove a milestone; updates project status |

## 15. Known limitations and next steps

- **Rate limiting is in memory.** That works for one server but not across serverless instances. Next step: Redis (e.g. Upstash).
- **No email sending.** The draft reply is copied by hand. Next step: send from the lead page and log it as an activity.
- **Sessions can't be revoked individually** before they expire (deleting a user or changing a role does apply at once). Next step: a session table or token version.
- **Clearing optional fields:** an emptied optional text field (e.g. a client's phone) is ignored instead of cleared.
- **The AI is untested on real data.** The lead score is a heuristic and the eval set is small. Next step: collect real won/lost outcomes and calibrate the score.
- latest deployement
- **Other ideas:** file uploads for briefs, a client portal for project progress, and end-to-end browser tests (Playwright).
