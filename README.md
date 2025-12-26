# Jeevan Rakth

Lifeline Innovators' full-stack initiative that connects urgent blood requirements with available donors in real time. The app streamlines discovery, verification, and communication so hospitals and community responders can coordinate faster during critical scenarios.

## Folder Structure

```
jeevan-rakth/
├── public/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   └── lib/
├── eslint.config.mjs
├── next.config.ts
├── package.json
└── tsconfig.json
```

- `public/` static assets used across the UI, including the app screenshot.
- `src/app/` Next.js App Router entry point with global styles, layout shell, and root page.
- `src/components/` shared UI primitives and composite widgets (currently staged for upcoming sprint work).
- `src/lib/` utilities for API access, data adapters, and configuration helpers.
- Config files at the project root ensure linting, TypeScript, and Next.js runtime settings stay consistent for everyone on the team.

## Setup Instructions

1. Install dependencies: `cd jeevan-rakth && npm install` (pulls both AWS and Azure SDKs for file uploads).
2. Copy `.env.example` and populate storage keys: see [jeevan-rakth/.env.example](jeevan-rakth/.env.example) for `FILE_STORAGE_PROVIDER`, AWS, and Azure settings.
3. Apply migrations locally: `npx prisma migrate dev` (adds the file metadata table alongside existing schemas).
4. Start the development server: `npm run dev`.
5. Open the app at `http://localhost:3000`.
6. Run the linter before committing: `npm run lint`.
7. Review extended migration + seeding docs: see [jeevan-rakth/README.md](jeevan-rakth/README.md).
8. Inspect performance notes and query logs in [jeevan-rakth/docs/perf-logs](jeevan-rakth/docs/perf-logs).
9. Review API reference & sample payloads in the section below when integrating clients.

## Database & Prisma Workflow

- Apply schema changes while developing locally:

	```bash
	cd jeevan-rakth
	npx prisma migrate dev
	```

- Reset the database (drops & reapplies all migrations) when you need a clean slate:

	```bash
	npx prisma migrate reset
	```

- Clear all tables so you can reseed from scratch during local development:

	```bash
	npx prisma db seed
	```

- Inspect or tweak generated SQL under `prisma/migrations/**/migration.sql` before promoting to staging/production. The order workflow upgrade lives in [jeevan-rakth/prisma/migrations/20251216094500_add_order_workflows/migration.sql](jeevan-rakth/prisma/migrations/20251216094500_add_order_workflows/migration.sql) and the file metadata additions are tracked by the latest migration generated from the `File` model in [jeevan-rakth/prisma/schema.prisma](jeevan-rakth/prisma/schema.prisma).
- Validate results visually or via SQL after seeding:

	```bash
	npx prisma studio
	```

- Production notes: back up the database before deploying migrations, run `npx prisma migrate deploy` in CI/CD, and test on staging prior to touching live data. Enable `DEBUG=prisma:query npm run dev` temporarily when benchmarking queries and compare timings using [jeevan-rakth/docs/perf-logs](jeevan-rakth/docs/perf-logs).

For detailed output samples, rollback commands, and data-protection practices, refer to [jeevan-rakth/README.md](jeevan-rakth/README.md).

## Quick Start After Clone or Pull

If you just cloned or pulled this repository and want to run the app locally, follow these minimal steps from the repository root.

Windows / PowerShell friendly commands:

```powershell
cd jeevan-rakth
# Copy example env (edit values as needed)
copy .env.example .env

# Start Redis locally (optional: use Docker Desktop)
docker run -d --name redis-local -p 6379:6379 redis:8

# Install dependencies and prepare DB
npm install
npx prisma migrate dev

# Start the Next.js dev server
npm run dev
```

Notes:
- Set `REDIS_URL` in `.env` if using a remote/managed Redis instance.
- If you prefer containers, run `docker compose up --build` from the repository root to start Postgres, Redis, and the app together.

## Order Workflow Overview

- Transactional API in [jeevan-rakth/src/app/api/orders/route.ts](jeevan-rakth/src/app/api/orders/route.ts) wraps order creation, inventory decrement, and payment capture inside a single Prisma `$transaction`.
- Rollback testing is supported by sending `simulateFailure: true` in the POST payload, which raises an intentional error so the transaction verifies atomicity.
- Commerce-specific models and indexes live in [jeevan-rakth/prisma/schema.prisma](jeevan-rakth/prisma/schema.prisma) with the migration scripted under [jeevan-rakth/prisma/migrations/20251216094500_add_order_workflows/migration.sql](jeevan-rakth/prisma/migrations/20251216094500_add_order_workflows/migration.sql).
- Performance evidence comparing sequential scan vs indexed queries is stored at [jeevan-rakth/docs/perf-logs/orders-before-indexes.log](jeevan-rakth/docs/perf-logs/orders-before-indexes.log) and [jeevan-rakth/docs/perf-logs/orders-after-indexes.log](jeevan-rakth/docs/perf-logs/orders-after-indexes.log).
- The GET endpoint paginates results, caps page size at 50, and selects only the fields required for dashboards to avoid over-fetching.

## Secure File Uploads

- Pre-signed URL generation lives in [jeevan-rakth/src/app/api/upload/route.ts](jeevan-rakth/src/app/api/upload/route.ts) backed by the provider-agnostic helper at [jeevan-rakth/src/lib/storage/presign.ts](jeevan-rakth/src/lib/storage/presign.ts).
- Metadata persistence is handled by [jeevan-rakth/src/app/api/files/route.ts](jeevan-rakth/src/app/api/files/route.ts) and the `File` model in [jeevan-rakth/prisma/schema.prisma](jeevan-rakth/prisma/schema.prisma).
- Configure `FILE_STORAGE_PROVIDER`, TTL, size limits, and cloud credentials using [jeevan-rakth/.env.example](jeevan-rakth/.env.example). AWS keys are required for S3; Azure keys are required for Blob Storage.
- Typical flow: client POSTs filename/type/size to `/api/upload`, receives a signed URL, uploads directly to S3/Azure, then POSTs `/api/files` with the final URL and metadata.
- Server-side validation enforces MIME prefixes (images or PDFs), byte caps (`FILE_UPLOAD_MAX_BYTES`), and short-lived URLs (`FILE_UPLOAD_URL_TTL_SECONDS`). Azure responses include required headers so front-ends can set `x-ms-blob-type: BlockBlob` during the upload PUT.
- Recommended verification: 1) call `/api/upload`, 2) PUT a sample file to the returned URL via `curl` or Postman, 3) persist metadata with `/api/files`, 4) confirm the object exists in the chosen bucket/container and the record appears in Prisma Studio.

## API Route & Response Reference

	- `GET`: Paginated order listing with `skip`, `take`, `status`, and `userId` filters.
	- `POST`: Transactional create that decrements inventory and logs payments.
	- `GET`: Lists users with `page` and `limit` pagination.
	- `POST`: Creates a user enforcing unique email constraints.
	- `GET`: Fetches a single user with owned teams, projects, tasks, and orders.
	- `PUT`: Updates profile attributes while handling unique email conflicts.
	- `DELETE`: Removes a user and related membership records.

## Authentication

Authentication endpoints are implemented inside the `jeevan-rakth` app. See `jeevan-rakth/AUTH.md` for full details and examples.

- `POST /api/auth/signup` — Creates a user with a bcrypt-hashed password, returns a JWT and sets an `httpOnly` `token` cookie.
- `POST /api/auth/login` — Verifies credentials, returns a JWT and sets an `httpOnly` `token` cookie.
- `POST /api/auth/logout` — Clears the auth cookie.

Notes: inputs are validated with Zod (`src/lib/schemas`), passwords are stored hashed, and JWTs expire by default (development `JWT_SECRET` is in `jeevan-rakth/.env`).

## Authorization

- Middleware lives at [jeevan-rakth/src/app/middleware.ts](jeevan-rakth/src/app/middleware.ts) and validates JWTs for `/api/admin` and `/api/users`.
- Tokens now carry `id`, `email`, and `role`; admin-only routes require `role === "admin"` while other protected routes accept any authenticated user.
- Downstream handlers can read `x-user-email` and `x-user-role` headers injected by the middleware for auditing or fine-grained checks.

## HTTP Semantics

- **Status codes**: `200` for successful reads, `201` for resource creation, `204` for deletions with no body.
- **Client errors**: `400` for validation or missing fields, `404` for not found, `409` for unique constraint violations, `418` for intentional rollback scenarios.
- **Server errors**: `500` indicates unexpected failures; logs capture stack traces for triage.
- **Pagination**: `/api/orders` uses `skip`/`take` with a 50-row cap; `/api/users` uses `page`/`limit` defaulting to 1/10.
- **Filtering**: `/api/orders` consumes `status` strings and numeric `userId` for targeted dashboards.

## Unified Response Handler

- Location: [jeevan-rakth/src/lib/responseHandler.ts](jeevan-rakth/src/lib/responseHandler.ts)
- Success envelope:

	```json
	{
		"success": true,
		"message": "Orders retrieved successfully",
		"data": { "orders": [/* ... */] },
		"meta": { "skip": 0, "take": 10, "total": 120 },
		"timestamp": "2025-12-16T10:00:00.000Z"
	}
	```

- Error envelope:

	```json
	{
		"success": false,
		"message": "Insufficient product inventory.",
		"error": { "code": "INSUFFICIENT_STOCK" },
		"timestamp": "2025-12-16T10:00:00.000Z"
	}
	```

- Usage examples:

	```ts
	return successResponse("Users fetched successfully", { users }, {
		meta: { page, limit, totalUsers },
	});

	return errorResponse("Email already exists", {
		status: 409,
		code: ERROR_CODES.EMAIL_CONFLICT,
	});
	```

- Defined error codes: `VALIDATION_ERROR`, `PRODUCT_NOT_FOUND`, `INSUFFICIENT_STOCK`, `ROLLBACK_TEST`, `ORDERS_FETCH_FAILED`, `ORDER_TRANSACTION_FAILED`, `USERS_FETCH_FAILED`, `USER_NOT_FOUND`, `EMAIL_CONFLICT`, `UNKNOWN_ERROR`.
- Developer experience gains:
	- Timestamps plus error codes speed up debugging and log correlation.
	- Frontends share a single parsing path because every endpoint speaks the same schema.
	- Monitoring stacks (Sentry, Datadog, Postman monitors) can alert on `error.code`.
	- New teammates learn the “API voice” once and apply it across new handlers.

## Centralized Error Handling

The project uses a centralized error handling pattern so all API routes produce consistent, secure responses and structured logs.

- **Logger:** [jeevan-rakth/src/lib/logger.ts](jeevan-rakth/src/lib/logger.ts) — structured JSON logger used across server code.
- **Error handler:** [jeevan-rakth/src/lib/errorHandler.ts](jeevan-rakth/src/lib/errorHandler.ts) — classifies errors, logs details, and returns user-safe responses.

Behavior by environment:

- **Development:** Responses include detailed error messages and stack traces to help debugging.
- **Production:** Responses return a generic message; logs contain full details but responses redact stack traces.

Quick usage example:

```ts
// src/app/api/users/route.ts (simplified)
import { handleError } from 'jeevan-rakth/src/lib/errorHandler';

export async function GET(req: Request) {
	try {
		// ... handler logic
	} catch (err) {
		return handleError(err, 'GET /api/users', { status: 500, code: 'USERS_FETCH_FAILED' });
	}
}
```

Why this helps:

- **Consistency:** every route returns the same envelope so frontends and tests can rely on a single parsing strategy.
- **Security:** stack traces and internal messages are hidden from users in production.
- **Observability:** logs are emitted as structured JSON (timestamp, level, message, meta) and can be sent to CloudWatch/Datadog.

Extending the pattern:

- Create custom error classes (e.g., `ValidationError`, `AuthError`) and map them to specific HTTP status codes inside `errorHandler`.
- Enrich logs with request IDs and `x-user-id` from middleware to correlate traces across services.


## Sample API Calls

Create an order and capture payment in one request:

```bash
curl -X POST http://localhost:3000/api/orders \
	-H "Content-Type: application/json" \
	-d '{
				"userId": 1,
				"productId": 2,
				"quantity": 1,
				"paymentProvider": "INTERNAL_LEDGER",
				"paymentReference": "QA-ORDER-001"
			}'
```

Sample response:

```json
{
	"success": true,
	"message": "Order placed successfully",
	"data": {
		"order": {
			"id": 42,
			"status": "PLACED",
			"total": "79.49",
			"createdAt": "2025-12-16T12:41:09.125Z"
		},
		"payment": {
			"id": 42,
			"status": "CAPTURED"
		}
	},
	"timestamp": "2025-12-16T12:41:09.125Z"
}
```

Simulate a rollback to confirm atomicity:

```bash
curl -X POST http://localhost:3000/api/orders \
	-H "Content-Type: application/json" \
	-d '{
				"userId": 1,
				"productId": 2,
				"quantity": 1,
				"simulateFailure": true
			}'
```

Page through shipped orders:

```bash
curl "http://localhost:3000/api/orders?skip=0&take=5&status=SHIPPED"
```

List users on page two:

```bash
curl "http://localhost:3000/api/users?page=2&limit=5"
```

Handle duplicate emails gracefully:

```bash
curl -X POST http://localhost:3000/api/users \
	-H "Content-Type: application/json" \
	-d '{ "name": "Alice", "email": "alice@example.com" }'
```

Conflict response:

```json
{
	"success": false,
	"message": "Email already exists",
	"error": { "code": "EMAIL_CONFLICT" },
	"timestamp": "2025-12-16T12:41:09.125Z"
}
```

Success envelope template:

```json
{
	"success": true,
	"message": "User created successfully",
	"data": { "id": 12, "name": "Charlie" },
	"timestamp": "2025-12-16T10:00:00Z"
}
```

Error envelope template:

```json
{
	"success": false,
	"message": "Missing required field: name",
	"error": { "code": "VALIDATION_ERROR" },
	"timestamp": "2025-12-16T10:00:00Z"
}
```

## Error Semantics & Observability

- Structured error payloads (`{ error: "..." }`) make client handling predictable.
- Known Prisma error codes (`P2002`, `P2025`) map to meaningful HTTP responses.
- Transaction rollbacks triggered via `simulateFailure` surface `418` status to differentiate expected QA behaviour from real incidents.
- `console.error` logging inside route handlers feeds platform logs, aiding alerting and root-cause analysis.

## Naming Reflection

Consistent resource naming (`/api/orders`, `/api/users/:id`) and camelCase payload keys reduce integration bugs, since clients can reuse models across endpoints. Shared pagination semantics—either offset-based (`skip`/`take`) or page-based (`page`/`limit`)—let SDKs encapsulate listing logic. Aligning status labels (e.g., `PLACED`, `CAPTURED`) between APIs and database rows avoids translation layers, simplifying future service decomposition.

## API Test Evidence

![Postman orders run](https://dummyimage.com/1280x720/0f172a/ffffff.png&text=Postman+Orders+201)

![Postman users listing](https://dummyimage.com/1280x720/0f172a/ffffff.png&text=Postman+Users+200)
- `DATABASE_URL` is server-only; reference it with `process.env.DATABASE_URL` inside server components, route handlers, or backend utilities.
- `NEXT_PUBLIC_API_BASE_URL` is safe for the browser; import it in client components with `process.env.NEXT_PUBLIC_API_BASE_URL` for fetch calls.
- Only variables prefixed with `NEXT_PUBLIC_` reach client bundles. Avoid using server secrets inside client components or hooks.
- After editing env files, restart `npm run dev` so Next.js picks up the new values.

## Containerization

### Dockerfile

- Located at `jeevan-rakth/Dockerfile` using the `node:20-alpine` base image to keep the runtime lightweight.
- Installs dependencies via `npm install`, copies the full project, and runs `npm run build` to produce the optimized Next.js bundle prior to container startup.
- Exposes port `3000` and launches the production server with `npm run start`.

### Docker Compose

- The root-level `docker-compose.yml` orchestrates the web app, PostgreSQL, and Redis:
	- `app`: Builds from the Next.js Dockerfile, publishes port `3000`, and injects shared env variables (`DATABASE_URL`, `REDIS_URL`).
	- `db`: Uses `postgres:15-alpine`, persists data to the named volume `db_data`, and mirrors port `5432` for local access.
	- `redis`: Uses `redis:7-alpine` and maps port `6379` to the host.
- All services join the `localnet` bridge network so they can resolve each other by service name.
- `db_data` volume ensures Postgres retains its data across container restarts.

### Running the Stack

From the repository root:

```bash
docker compose up --build
```

Verify everything is healthy:

```bash
# list running containers
docker ps

# optional connectivity checks from the host
psql postgres://postgres:password@localhost:5432/mydb
redis-cli -u redis://localhost:6379 ping
```

Example `docker ps` output when all services are up:

```text
CONTAINER ID   IMAGE                  COMMAND                  STATUS          PORTS
abc123def456   s86-1225_app           "docker-entrypoint..."   Up 2 minutes    0.0.0.0:3000->3000/tcp
def456ghi789   postgres:15-alpine     "docker-entrypoint..."   Up 2 minutes    0.0.0.0:5432->5432/tcp
ghi789jkl012   redis:7-alpine         "docker-entrypoint..."   Up 2 minutes    0.0.0.0:6379->6379/tcp
```

If you encounter port-binding conflicts, either stop the conflicting service or adjust the host side of the port mappings (e.g., change `3000:3000` to `3100:3000`). Slow builds typically improve after the initial image pull because subsequent runs reuse cached layers.

## Domain Data Model

### Core Entities

- **User** — registered coordinators, donors, or responders. Each has unique `email`, profile metadata, and lifecycle timestamps.
- **Team** — cross-functional groups that own projects. Every team has an owner (`owner_id`) and versioned timestamps.
- **TeamMember** — join table linking users to teams with role metadata and uniqueness on `(team_id, user_id)`.
- **Project** — initiatives tracked per team; optionally linked to an owner user and keyed by a unique `code` for lookup.
- **Task** — actionable work items belonging to a project with status/priority enums, optional assignee, and composite uniqueness on `(project_id, title)` to prevent duplicates.
- **Comment** — discussion tied to tasks, capturing author linkage and cascading deletes.
- **Product** — catalog entries aligned to donor kits and supplies with unique `sku`, pricing, and live inventory counts.
- **Order** — transactional records linking users to products with quantity, monetary totals, and indexed status/timestamps for dashboards.
- **Payment** — captures settlement details per order, ensuring one-to-one linkage for audits and reconciliation.

### Prisma Schema Excerpt

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
}
```

Full definitions live in [jeevan-rakth/prisma/schema.prisma](jeevan-rakth/prisma/schema.prisma).

### Keys, Constraints, and Indexes

- Primary keys on every table ensure entity identity via `@id` or `SERIAL` columns.
- Unique constraints on `User.email`, `Project.code`, and `(Task.projectId, Task.title)` guarantee canonical identifiers for API lookups.
- Foreign keys cascade deletes for dependent records (e.g., tasks drop when a project goes away) while `Project.ownerId` and `Task.assigneeId` use `ON DELETE SET NULL` to preserve history if a user departs.
- Composite indexes on high-frequency query paths (`Task.projectId` + `status`, `Project.teamId` + `status`) keep dashboards responsive.
- Commerce indexes span `Order.userId`, `Order.status`, `Order.userId` + `createdAt`, and `Product.name`, reducing sequential scans for order histories and search suggestions.
- Join table `TeamMember` enforces uniqueness across `(team_id, user_id)` to stop duplicate memberships and indexes `user_id` for reverse lookups.

### Normalization Notes

- **1NF**: Each table uses atomic columns (no arrays or repeating groups) and every record includes a primary key.
- **2NF**: Non-key attributes depend on the full primary key; the only composite key (`TeamMember.team_id`, `TeamMember.user_id`) holds role metadata that depends on both.
- **3NF**: Non-key attributes depend solely on the key (e.g., project status is independent of team attributes), avoiding transitive dependencies.

### Migrations and Seeding

Run these commands from `jeevan-rakth` after installing Prisma (`npm install prisma @prisma/client`):

```bash
npx prisma migrate dev
npx prisma db seed
npx prisma studio
```

Example migration output:

```text
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "mydb" at "localhost:5432"

Applying migration `20251212000000_init_schema`
The following migration(s) have been applied:

	20251212000000_init_schema

Seeded 2 tasks for project JR-HOSP-ALERT.
```

Open the interactive dashboard with `npx prisma studio` to confirm the database is empty or to review any data you add manually after running the seed wipe.

### Query Patterns and Scalability

- Dashboards hit `Task` by project and status; indexes keep those queries sub-millisecond as volume scales.
- Project detail pages expand related tasks and comments through Prisma relations, which map to `JOIN`s over indexed FKs.
- Teams and membership queries rely on the `TeamMember` bridge, allowing future analytics (e.g., per-user workload) without denormalized columns.
- Cascade rules and nullable FKs keep historical data intact when owners leave, supporting auditing at scale.

As data grows, horizontal partitioning can occur at the project level (sharding by `Project.code`), while the current schema already supports read replicas because relations avoid circular optionality.

## Reflection

We adopted the Next.js App Router layout to keep routing, layouts, and data-fetching logic co-located. Shared UI and utility logic live in `components` and `lib`, letting parallel squads extend the design system or connect to additional services without touching core pages. Centralized configuration files keep build tooling aligned, which de-risks onboarding. As future sprints introduce donor dashboards, hospital triage views, and integrations with Azure/AWS services, this separation lets each slice scale independently while preserving consistent UX and deployment workflows.

## Branching Strategy

- `main` is production-ready and branch protected (PR reviews required, status checks must pass, no direct pushes).
- Feature development: `feature/<feature-name>` such as `feature/donor-matching`.
- Bug fixes: `fix/<bug-name>` such as `fix/navbar-alignment`.
- Tooling or dependency chores: `chore/<task-name>` such as `chore/update-eslint`.
- Documentation updates: `docs/<update-name>` such as `docs/update-readme`.
- Always branch from the latest `main`, keep branches focused on a single concern, and rebase or merge `main` before opening a PR to resolve drift early.


```
## Summary
Briefly explain the purpose of this PR.

## Changes Made
- Key update or fix one
- Key update or fix two
- Key update or fix three

## Screenshots / Evidence
Add screenshots, console output, or links if relevant.

## Checklist
- [ ] Code builds successfully
- [ ] Lint and tests pass
- [ ] Reviewed by at least one teammate
- [ ] Linked to corresponding issue
```

## Review Checklist

Reviewers walk through this list before hitting approve:

- Code follows our naming conventions and folder structure guidelines.
- Functionality is verified locally with no console warnings or runtime errors.
- ESLint, Prettier, and other status checks pass in CI.
- Comments and docs are meaningful, concise, and up to date.
- Secrets, API keys, or PII are not exposed in code, commits, or screenshots.
- Linked issue reflects the scope, and acceptance criteria are met.

## Workflow Reflection

This workflow keeps velocity high without sacrificing quality. Consistent branch naming signals intent at a glance and lets automations (boards, CI, deployments) target patterns reliably. The shared PR template standardises author context so reviewers spend less time deciphering change scope. The checklist anchors quality gates around linting, testing, and security, keeping `main` deployable. Branch protection rules enforce review discipline and force teams to reconcile latest changes before merge, preventing regressions and encouraging continuous collaboration.


## **Tooling Setup & Changes**

- **Summary**: Added strict TypeScript, ESLint + Prettier, and Husky + lint-staged pre-commit hooks to enforce formatting and linting before commits.
- **Why**: Catch type and style issues early, keep a consistent code style, and prevent broken commits.

- **Files changed or added**:
	- `jeevan-rakth/tsconfig.json` — enabled strict TypeScript options (`strict`, `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`, `forceConsistentCasingInFileNames`, `skipLibCheck`).
	- `jeevan-rakth/package.json` — added `prepare` script for Husky and `lint-staged` config; devDependencies updated.
	- `jeevan-rakth/package-lock.json` — updated by npm installs.
	- `jeevan-rakth/.eslintrc.json` — new ESLint configuration (extends Next.js + Prettier rules).
	- `jeevan-rakth/.prettierrc` — new Prettier configuration.
	- `jeevan-rakth/.husky/` — Husky hooks directory with `pre-commit` hook calling `npx lint-staged`.
	- `jeevan-rakth/src/app/globals.css`, `jeevan-rakth/src/app/layout.tsx`, `jeevan-rakth/src/app/page.tsx` — formatted by Prettier.

## **Reproduce / Install Steps**

Run these commands from the `jeevan-rakth` folder (Windows `cmd.exe`):

```
cd F:\jeevanrakth\S86-1225-Lifeline-Innovators-Full-Stack-With-NextjsAnd-AWS-Azure-Jeevan-Rakth\jeevan-rakth
npm install --save-dev prettier eslint-plugin-prettier eslint-config-prettier husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

Add or update these files with the following contents (examples shown earlier in this repository):

- `tsconfig.json`: ensure strict compiler options are enabled (see project `tsconfig.json`).
- `.eslintrc.json`: extends `next/core-web-vitals` and `plugin:prettier/recommended` with custom rules.
- `.prettierrc`: formatting rules (`singleQuote: false`, `semi: true`, `tabWidth: 2`, `trailingComma: "es5"`).
- `package.json`: include `"prepare": "husky install"` and a `lint-staged` block:

```
"lint-staged": {
	"*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"]
}
```

## **Verification / Common Commands**

Run these to verify everything is healthy:

```
npx prettier --check src/
npm run lint
npx tsc --noEmit
npm run build
git status
```

If everything is green, commit the changes (Husky will run the pre-commit hook automatically):

```
git add .
git commit -m "chore: add ESLint/Prettier/Husky and enable strict TypeScript"
```

If lint-staged fixes issues automatically, they will be re-added to the commit. If non-fixable errors exist, fix and re-run the commit.

## Next.js App Router & Routing System

The application uses Next.js 14 App Router with file-based routing, providing a clear separation between public and protected routes through middleware-based authentication.

### Route Structure

The app follows a file-based routing pattern where each folder inside `src/app/` represents a route:

```
src/app/
├── page.tsx                → / (Home - Public)
├── login/
│   └── page.tsx           → /login (Public)
├── dashboard/
│   └── page.tsx           → /dashboard (Protected)
├── users/
│   ├── page.tsx           → /users (Protected)
│   └── [id]/
│       └── page.tsx       → /users/:id (Protected, Dynamic)
├── layout.tsx             → Global layout with navigation
└── not-found.tsx          → Custom 404 page
```

### Public Routes

**Public routes** are accessible to all users without authentication:

- **`/` (Home)** - [jeevan-rakth/src/app/page.tsx](jeevan-rakth/src/app/page.tsx)
  - Landing page with application overview
  - Features section highlighting key capabilities
  - Statistics and impact metrics
  - Route information and technical details
  - Call-to-action for user registration

- **`/login`** - [jeevan-rakth/src/app/login/page.tsx](jeevan-rakth/src/app/login/page.tsx)
  - User authentication form
  - Integrates with `/api/auth/login` endpoint
  - Sets JWT token in httpOnly cookies upon successful login
  - Redirects to dashboard after authentication
  - Client-side form validation and error handling

### Protected Routes

**Protected routes** require valid JWT authentication and automatically redirect to `/login` if the user is not authenticated:

- **`/dashboard`** - [jeevan-rakth/src/app/dashboard/page.tsx](jeevan-rakth/src/app/dashboard/page.tsx)
  - Main dashboard with statistics cards
  - Displays total donors, blood requests, and successful matches
  - Quick action buttons for common tasks
  - Logout functionality
  - Protected by middleware JWT validation

- **`/users`** - [jeevan-rakth/src/app/users/page.tsx](jeevan-rakth/src/app/users/page.tsx)
  - User management interface
  - Displays list of all registered users in a table format
  - Shows user details: name, email, blood type, role
  - Links to individual user profile pages
  - Mock data demonstration (can be connected to API)

- **`/users/[id]`** - [jeevan-rakth/src/app/users/[id]/page.tsx](jeevan-rakth/src/app/users/[id]/page.tsx)
  - Dynamic route for individual user profiles
  - URL parameter extraction: `/users/1`, `/users/2`, etc.
  - Displays detailed user information including:
    - Contact details (phone, email, address)
    - Donation statistics (total donations, last donation date)
    - Blood type information
  - Breadcrumb navigation
  - Action buttons (schedule donation, send message, view history)
  - 404 handling for non-existent user IDs

### Dynamic Routing

Dynamic routes use brackets `[id]` in the folder name to capture URL parameters:

```tsx
// File: src/app/users/[id]/page.tsx
interface Props {
  params: { id: string };
}

export default function UserProfilePage({ params }: Props) {
  const { id } = params; // Extracted from URL
  // Fetch user data using id
  // Render user profile
}
```

**Benefits of dynamic routing:**
- **Scalability**: Single component handles infinite user profiles
- **SEO**: Each user profile has a unique URL
- **Type-safe**: TypeScript ensures proper parameter handling
- **Clean URLs**: `/users/123` instead of `/users?id=123`

### Middleware Authentication

Authentication is enforced at the middleware layer - [jeevan-rakth/src/middleware.ts](jeevan-rakth/src/middleware.ts):

```typescript
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes (no auth required)
  if (pathname.startsWith("/login") || pathname === "/") {
    return NextResponse.next();
  }

  // Protected frontend routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/users")) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      jwt.verify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // API route protection (continues existing logic)
  // ...
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/users/:path*"],
};
```

**How middleware works:**
1. Intercepts requests before they reach route handlers
2. Checks if route requires authentication
3. Validates JWT token from cookies
4. Redirects to `/login` if authentication fails
5. Allows request to proceed if token is valid

**Advantages:**
- Centralized authentication logic
- Prevents unauthorized access at the edge
- Automatic redirection to login
- No need to add auth checks in every page component
- Works for both frontend pages and API routes

### Navigation & Layout

Global navigation is implemented in [jeevan-rakth/src/app/layout.tsx](jeevan-rakth/src/app/layout.tsx):

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-white shadow-md">
          <Link href="/">Home</Link>
          <Link href="/login">Login</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/users">Users</Link>
          <Link href="/users/1">User Profile</Link>
        </nav>
        {children}
        <footer>© 2024 Jeevan Rakth</footer>
      </body>
    </html>
  );
}
```

**Layout features:**
- Persistent navigation across all pages
- Active route highlighting capability
- Responsive design with Tailwind CSS
- Footer with links and copyright
- Brand identity with logo and colors

**Breadcrumbs** are implemented in dynamic routes for better navigation:

```tsx
// In /users/[id]/page.tsx
<nav className="breadcrumbs">
  <Link href="/">Home</Link> / 
  <Link href="/users">Users</Link> / 
  <span>{user.name}</span>
</nav>
```

### Error Handling

**Custom 404 Page** - [jeevan-rakth/src/app/not-found.tsx](jeevan-rakth/src/app/not-found.tsx):

- Displays user-friendly error message
- Provides navigation links to return home or dashboard
- Helpful suggestions and support contact information
- Consistent branding and styling
- Automatic fallback for non-existent routes

**Error handling in dynamic routes:**
- Check if resource exists (e.g., user ID)
- Display appropriate error message if not found
- Provide link to return to listing page
- Log errors for debugging

### Routing Best Practices

1. **File Organization**
   - Use folder-based routing for clear structure
   - Group related routes in folders
   - Keep `page.tsx` for route components
   - Use `layout.tsx` for shared layouts

2. **Authentication Flow**
   - Implement middleware for route protection
   - Store JWT in httpOnly cookies for security
   - Automatic redirect to login for unauthorized access
   - Clear token on logout

3. **Dynamic Routes**
   - Use `[param]` syntax for dynamic segments
   - Validate parameters before fetching data
   - Handle edge cases (invalid IDs, missing data)
   - Implement loading states

4. **Navigation**
   - Use Next.js `<Link>` for client-side navigation
   - Implement breadcrumbs for nested routes
   - Highlight active routes
   - Provide clear navigation hierarchy

5. **Error States**
   - Create custom 404 pages
   - Handle loading states
   - Display user-friendly error messages
   - Provide recovery options

### Route Security

**Protected Routes:**
- JWT token required in cookies
- Middleware validates token before page load
- Automatic redirect to `/login` if unauthenticated
- Token expiration handling

**API Routes:**
- Bearer token in Authorization header
- Role-based access control (admin vs user)
- Token validation in middleware
- Proper error responses (401, 403)

### User Experience Benefits

1. **Clear Navigation**: Users understand where they are and how to move around
2. **Breadcrumbs**: Especially helpful in nested routes like `/users/[id]`
3. **Consistent Layout**: Navigation and footer persist across pages
4. **Fast Navigation**: Client-side routing for instant page transitions
5. **Error Recovery**: 404 page helps users get back on track
6. **Security**: Protected routes automatically redirect to login

### Testing Routes

To test the routing system:

1. **Public Access:**
   ```
   Visit http://localhost:3000/ - Should work without login
   Visit http://localhost:3000/login - Should show login form
   ```

2. **Protected Access (Not Logged In):**
   ```
   Visit http://localhost:3000/dashboard - Should redirect to /login
   Visit http://localhost:3000/users - Should redirect to /login
   Visit http://localhost:3000/users/1 - Should redirect to /login
   ```

3. **Protected Access (Logged In):**
   ```
   Login via /login page
   Visit http://localhost:3000/dashboard - Should show dashboard
   Visit http://localhost:3000/users - Should show user list
   Visit http://localhost:3000/users/1 - Should show user profile
   Visit http://localhost:3000/users/999 - Should show "user not found"
   ```

4. **Dynamic Routes:**
   ```
   Visit http://localhost:3000/users/1 - User 1 profile
   Visit http://localhost:3000/users/2 - User 2 profile
   Visit http://localhost:3000/users/5 - User 5 profile
   ```

5. **404 Testing:**
   ```
   Visit http://localhost:3000/nonexistent - Should show custom 404 page
   ```

### Screenshots & Visual Documentation

The routing system provides:

- **Home Page:** Welcome screen with route information
- **Login Page:** Clean authentication form
- **Dashboard:** Protected stats dashboard
- **Users List:** Table view of all users
- **User Profile:** Detailed view with breadcrumbs
- **404 Page:** Friendly error page

### Reflection: Routing Architecture

**Why this approach works:**

1. **Scalability**: Dynamic routes support unlimited users without creating new files
2. **Security**: Middleware ensures consistent authentication across all protected routes
3. **SEO**: Server-side rendering with unique URLs for each page
4. **Developer Experience**: File-based routing is intuitive and easy to maintain
5. **User Experience**: Fast navigation, clear structure, and helpful error messages
6. **Maintainability**: Centralized auth logic and consistent patterns

**Future improvements:**
- Role-based route protection (admin vs donor routes)
- Nested layouts for different sections
- Advanced error boundaries
- Analytics tracking for route transitions
- Server-side data fetching with React Server Components

---

## Component Architecture: Reusable UI Elements

A well-structured component architecture ensures **reusability**, **maintainability**, **scalability**, and **accessibility** across the entire application. This section documents our modular component design approach.

### Why Component Architecture Matters

| Benefit | Description |
|---------|-------------|
| **Reusability** | Common UI pieces (e.g., buttons, navbars) can be used across pages |
| **Maintainability** | Updating one component updates the entire UI consistently |
| **Scalability** | Clear structure allows easier onboarding and expansion |
| **Accessibility** | Shared components standardize ARIA roles and keyboard interactions |

### Component Folder Structure

```
jeevan-rakth/
├── components/
│   ├── layout/
│   │   ├── Header.tsx           → Top navigation bar
│   │   ├── Sidebar.tsx          → Side navigation menu
│   │   └── LayoutWrapper.tsx    → Combines Header + Sidebar
│   ├── ui/
│   │   ├── Button.tsx           → Reusable button component
│   │   ├── Card.tsx             → Card container component
│   │   └── InputField.tsx       → Form input with validation
│   └── index.ts                 → Barrel exports for clean imports
├── src/
│   └── app/
│       └── layout.tsx           → Uses LayoutWrapper
```

### Component Hierarchy Diagram

```
RootLayout (app/layout.tsx)
  └── LayoutWrapper
       ├── Header
       │    └── Navigation Links (Home, Dashboard, Users)
       └── Sidebar
            └── Navigation Links (Overview, Users, Upload)
       └── Main Content (children)
```

### Layout Components

#### 1. Header Component

**File:** [components/layout/Header.tsx](jeevan-rakth/components/layout/Header.tsx)

**Purpose:** Top navigation bar with application branding and main navigation links.

```tsx
"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow-md">
      <h1 className="font-semibold text-lg">Jeevan Rakth</h1>
      <nav className="flex gap-4" role="navigation" aria-label="Main navigation">
        <Link href="/">Home</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/users">Users</Link>
      </nav>
    </header>
  );
}
```

**Key Features:**
- Consistent blue branding (`bg-blue-600`)
- ARIA roles for accessibility (`role="navigation"`)
- Focus states for keyboard navigation
- Responsive design with flexbox

#### 2. Sidebar Component

**File:** [components/layout/Sidebar.tsx](jeevan-rakth/components/layout/Sidebar.tsx)

**Purpose:** Side navigation menu with contextual links and active state highlighting.

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/users", label: "Users" },
    { href: "/upload", label: "Upload Files" },
  ];

  return (
    <aside className="w-64 h-screen bg-gray-100 border-r p-4">
      <h2 className="text-lg font-bold mb-4">Navigation</h2>
      <ul className="space-y-2">
        {links.map(link => {
          const isActive = pathname === link.href;
          return (
            <li key={link.href}>
              <Link 
                href={link.href} 
                className={isActive ? "bg-blue-600 text-white" : "text-gray-700"}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
```

**Key Features:**
- Dynamic link data for scalability
- Active state highlighting using `usePathname()`
- ARIA `aria-current` for screen readers
- Hover states for better UX

#### 3. LayoutWrapper Component

**File:** [components/layout/LayoutWrapper.tsx](jeevan-rakth/components/layout/LayoutWrapper.tsx)

**Purpose:** Main layout foundation combining Header and Sidebar.

```tsx
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-white p-6 overflow-auto" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
```

**Key Features:**
- Full-height layout (`h-screen`)
- Flexbox-based responsive design
- Overflow handling for content scrolling
- Semantic HTML with `role="main"`

### UI Components

#### 1. Button Component

**File:** [components/ui/Button.tsx](jeevan-rakth/components/ui/Button.tsx)

**Props Contract:**

```typescript
interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  ariaLabel?: string;
}
```

**Example Usage:**

```tsx
import { Button } from "@/components";

<Button label="Submit" variant="primary" type="submit" />
<Button label="Cancel" variant="secondary" onClick={handleCancel} />
<Button label="Delete" variant="danger" disabled={isProcessing} />
```

**Accessibility Features:**
- Focus rings (`focus:ring-2`)
- Disabled states with cursor indication
- Custom ARIA labels
- Keyboard-friendly

#### 2. Card Component

**File:** [components/ui/Card.tsx](jeevan-rakth/components/ui/Card.tsx)

**Props Contract:**

```typescript
interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}
```

**Example Usage:**

```tsx
import { Card, Button } from "@/components";

<Card 
  title="User Profile" 
  footer={<Button label="Edit Profile" variant="primary" />}
>
  <p>User information goes here...</p>
</Card>
```

#### 3. InputField Component

**File:** [components/ui/InputField.tsx](jeevan-rakth/components/ui/InputField.tsx)

**Props Contract:**

```typescript
interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  id?: string;
  name?: string;
}
```

**Example Usage:**

```tsx
import { InputField } from "@/components";

<InputField 
  label="Email Address" 
  type="email"
  placeholder="you@example.com"
  required
  error={errors.email}
/>
```

**Accessibility Features:**
- Proper `label` and `htmlFor` associations
- Error messages with `aria-describedby`
- `aria-invalid` for validation states
- Required field indicators with ARIA labels

### Barrel Exports for Clean Imports

**File:** [components/index.ts](jeevan-rakth/components/index.ts)

```typescript
// Layout Components
export { default as Header } from "./layout/Header";
export { default as Sidebar } from "./layout/Sidebar";
export { default as LayoutWrapper } from "./layout/LayoutWrapper";

// UI Components
export { default as Button } from "./ui/Button";
export { default as Card } from "./ui/Card";
export { default as InputField } from "./ui/InputField";
```

**Usage:**

```tsx
// Instead of multiple imports:
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";

// Use single import:
import { Header, Button, Card } from "@/components";
```

### Integration with Root Layout

**File:** [src/app/layout.tsx](jeevan-rakth/src/app/layout.tsx)

```tsx
import { LayoutWrapper } from "@/components";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
```

**Result:** All pages (`/`, `/dashboard`, `/users`) automatically include Header and Sidebar.

### Accessibility Considerations

Our component architecture prioritizes accessibility:

1. **Semantic HTML:** Proper use of `<header>`, `<nav>`, `<main>`, `<aside>` elements
2. **ARIA Roles:** `role="navigation"`, `role="main"` for screen readers
3. **Keyboard Navigation:** Focus states on all interactive elements
4. **Color Contrast:** WCAG AA compliant color combinations
5. **Form Accessibility:** Proper labels, error associations, required field indicators
6. **Active States:** `aria-current="page"` for navigation highlighting

### Visual Consistency

All components follow a consistent design system:

- **Primary Color:** Blue (`bg-blue-600`, `text-blue-600`)
- **Spacing:** Tailwind spacing scale (4, 6, 8 units)
- **Border Radius:** `rounded` for buttons, `rounded-lg` for cards
- **Shadows:** `shadow-sm`, `shadow-md` for depth
- **Typography:** Inter font family, consistent size hierarchy

### Props Contracts & Type Safety

Each component uses TypeScript interfaces to ensure:

- **Type Safety:** Catch errors at compile time
- **IntelliSense:** Auto-completion in IDEs
- **Documentation:** Self-documenting prop requirements
- **Refactoring:** Safe renaming and updates

### Benefits of Modular Architecture

1. **DRY Principle:** Write once, use everywhere
2. **Consistent UX:** Same look and feel across all pages
3. **Easy Updates:** Change button style in one file, updates everywhere
4. **Team Collaboration:** Clear component boundaries
5. **Testing:** Components can be tested in isolation
6. **Performance:** Reusable components optimize bundle size
7. **Developer Productivity:** Faster feature development

### Future Component Enhancements

- **Form Component:** Complete form wrapper with validation
- **Modal Component:** Accessible dialog overlays
- **Table Component:** Data grid with sorting and pagination
- **Alert Component:** Success, error, warning notifications
- **Loading States:** Skeleton screens and spinners
- **Storybook Integration:** Visual component documentation
- **Theme System:** Dark mode support
- **Animation Library:** Smooth transitions and micro-interactions

### Testing Component Architecture

To validate the component architecture:

1. **Visual Testing:**
   ```bash
   npm run dev
   # Visit pages and verify consistent header/sidebar
   ```

2. **Accessibility Testing:**
   ```bash
   # Use browser dev tools to check ARIA attributes
   # Test keyboard navigation (Tab, Enter, Space)
   ```

3. **Type Checking:**
   ```bash
   npm run type-check
   # Verify no TypeScript errors in components
   ```

### Reflection: Component Design Benefits

**What we achieved:**

1. **Reusable Architecture:** Components used across multiple pages without duplication
2. **Consistent Design:** Header and Sidebar provide uniform navigation experience
3. **Maintainability:** Single source of truth for UI elements
4. **Accessibility:** ARIA roles, keyboard navigation, semantic HTML throughout
5. **Type Safety:** TypeScript interfaces prevent prop errors
6. **Developer Experience:** Barrel exports simplify imports
7. **Scalability:** Easy to add new components following established patterns

**Impact on development:**

- Faster feature implementation using pre-built components
- Reduced bug surface area through component reuse
- Improved code quality with TypeScript validation
- Better collaboration with clear component contracts
- Enhanced user experience through consistent design

This component architecture positions Jeevan Rakth for rapid, maintainable growth while ensuring accessibility and visual consistency across the entire application.
