# Prisma Database Migrations & Seeding

## Prerequisites

- Configure a PostgreSQL database and export `DATABASE_URL` in your `.env` file.
- Install dependencies: `npm install`
- Ensure the Prisma CLI is available via the project dependency: `npx prisma --version`

## Run After Cloning

1. Clone the repository and navigate into the app folder:

	```bash
	git clone <repo-url>
	cd S86-1225-Lifeline-Innovators-Full-Stack-With-NextjsAnd-AWS-Azure-Jeevan-Rakth/jeevan-rakth
	```

2. Install dependencies and prepare environment variables:

	```bash
	npm install
	cp .env.example .env
	```

	Update `.env` with a valid `DATABASE_URL` (PostgreSQL) and any other required secrets before proceeding.

3. Apply the initial migration and generate the Prisma Client:

	```bash
	npx prisma migrate dev --name init_schema
	```

4. Seed baseline data so the UI has meaningful content:

	```bash
	npx prisma db seed
	```

5. Start the development server:

	```bash
	npm run dev
	```

6. Open `http://localhost:3000` in your browser and sign in with the seeded accounts (see [prisma/seed.ts](prisma/seed.ts)).

## Initial Migration Workflow

1. Inspect or update `prisma/schema.prisma` with your latest model changes.
2. Create and apply a migration locally:

	 ```bash
	 npx prisma migrate dev --name init_schema
	 ```

	 Sample output for reference:

	 ```text
	 Applying migration `20251212000000_init_schema`...
	 The following data model changes were made:
		 • Created tables: User, Team, Project, Task, Comment, TeamMember
		 • Created enums: TaskStatus, TaskPriority
	 Prisma Client was successfully generated in ./node_modules/.prisma/client
	 ```

3. Review the generated SQL in `prisma/migrations/<timestamp>_init_schema/migration.sql` to understand the exact DDL against your database.

## Evolving the Schema

- After modifying models, create the next migration with a descriptive name:

	```bash
	npx prisma migrate dev --name add_project_table
	```

- Use `npx prisma db pull` when you need to synchronise Prisma with an externally modified database.

## Rollback and Reset Strategies

- Local reset (drops the database and reapplies all migrations):

	```bash
	npx prisma migrate reset
	```

- To undo the most recent migration without dropping the entire schema, mark it as rolled back and reapply the previous state:

	```bash
	npx prisma migrate resolve --rolled-back "20251212000000_init_schema"
	npx prisma migrate dev
	```

- Production safeguards:
	- Always take automated database backups before deploying migrations.
	- Test migrations in a staging environment using `npx prisma migrate deploy` to minimise risk in production.

## Seed Data

- Prisma automatically runs `tsx prisma/seed.ts` because the following entry exists in `package.json`:

	```json
	{
		"prisma": {
			"seed": "tsx prisma/seed.ts"
		}
	}
	```

- The seed script uses `upsert` operations to keep inserts idempotent. Run it after migrations to populate baseline data:

	```bash
	npx prisma db seed
	```

- Expected terminal log excerpt:

	```text
	Environment variables loaded from .env
	Running seed command `tsx prisma/seed.ts`...
	Seeded 2 tasks for project JR-HOSP-ALERT.
	Intake task id: 1
	```

- Re-running the seed keeps existing rows intact thanks to the `upsert` pattern.

## Verifying the Seed

- Launch Prisma Studio to confirm the data visually:

	```bash
	npx prisma studio
	```

- Alternatively, connect with your preferred PostgreSQL client and query `User`, `Team`, `Project`, `Task`, and `Comment` tables to ensure the expected records exist once.
- Capture screenshots or copy command logs showing the migration and seed steps as evidence for project documentation.

## Protecting Production Data

- Maintain automated point-in-time recovery or scheduled backups before each deployment.
- Run new migrations in staging and validate business flows with seeded data prior to production rollout.
- Use feature flags or maintenance windows when migrations include breaking alterations, and communicate rollback plans to the operations team.

