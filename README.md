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

1. Install dependencies: `cd jeevan-rakth && npm install`
2. Start the development server: `npm run dev`
3. Open the app at `http://localhost:3000`
4. Run the linter before committing: `npm run lint`
5. Review extended migration + seeding docs: see [jeevan-rakth/README.md](jeevan-rakth/README.md)

## Database & Prisma Workflow

- Apply schema changes while developing locally:

	```bash
	cd jeevan-rakth
	npx prisma migrate dev --name init_schema
	```

- Reset the database (drops & reapplies all migrations) when you need a clean slate:

	```bash
	npx prisma migrate reset
	```

- Seed baseline data (idempotent `upsert` logic keeps records unique):

	```bash
	npx prisma db seed
	```

- Inspect or tweak generated SQL under `prisma/migrations/**/migration.sql` before promoting to staging/production.
- Validate results visually or via SQL after seeding:

	```bash
	npx prisma studio
	```

- Production notes: back up the database before deploying migrations, run `npx prisma migrate deploy` in CI/CD, and test on staging prior to touching live data.

For detailed output samples, rollback commands, and data-protection practices, refer to [jeevan-rakth/README.md](jeevan-rakth/README.md).

## Environment Variables

- Copy `.env.example` to `.env.local` and fill in real credentials; keep `.env.local` untracked so secrets stay off Git.
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
- Join table `TeamMember` enforces uniqueness across `(team_id, user_id)` to stop duplicate memberships and indexes `user_id` for reverse lookups.

### Normalization Notes

- **1NF**: Each table uses atomic columns (no arrays or repeating groups) and every record includes a primary key.
- **2NF**: Non-key attributes depend on the full primary key; the only composite key (`TeamMember.team_id`, `TeamMember.user_id`) holds role metadata that depends on both.
- **3NF**: Non-key attributes depend solely on the key (e.g., project status is independent of team attributes), avoiding transitive dependencies.

### Migrations and Seeding

Run these commands from `jeevan-rakth` after installing Prisma (`npm install prisma @prisma/client`):

```bash
npx prisma migrate dev --name init_schema
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

Open the interactive dashboard with `npx prisma studio` to inspect seeded users, teams, projects, tasks, and comments. The seed script at `prisma/seed.ts` inserts a small collaboration scenario (lead + responder, two tasks, sample comments) so UI work immediately has reference data.

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
