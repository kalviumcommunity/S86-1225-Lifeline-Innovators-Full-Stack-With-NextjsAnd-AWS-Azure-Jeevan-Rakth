# Prisma Database Migrations, Transactions & Performance

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

3. Apply the tracked migrations and generate the Prisma Client:

	```bash
	npx prisma migrate dev
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

3. Review the generated SQL in `prisma/migrations/<timestamp>_init_schema/migration.sql` to understand the exact DDL against your database. The order workflow upgrade lives in [prisma/migrations/20251216094500_add_order_workflows/migration.sql](prisma/migrations/20251216094500_add_order_workflows/migration.sql).

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

## API Route Reference

- `/api/orders`
	- `GET`: Returns paginated orders with optional `skip`, `take`, `status`, and `userId` filters.
	- `POST`: Creates an order, decrements inventory, and records a payment inside a transaction.
- `/api/users`
	- `GET`: Lists users with `page` and `limit` pagination.
	- `POST`: Creates a user enforcing unique email constraints.
- `/api/users/:id`
	- `GET`: Fetches a single user with related teams, projects, tasks, and orders.
	- `PUT`: Updates core profile fields with conflict detection.
	- `DELETE`: Removes a user and cascaded relations.

## HTTP Semantics

- **Success codes**: `200` for reads, `201` for creates, `204` for deletions without body.
- **Client errors**: `400` on validation failures, `404` when records are missing, `409` on unique constraint conflicts, `418` when rollback simulations are triggered.
- **Server errors**: `500` for unexpected exceptions. All handlers log failures via `console.error` to support observability.
- **Pagination parameters**: `GET /api/orders` accepts `skip` (offset) and `take` (page size capped at 50); `GET /api/users` uses `page` and `limit` with defaults of `1` and `10` respectively.
- **Filtering**: `GET /api/orders` supports `status` (string status) and `userId` (numeric) filters that combine with pagination.

## Unified Response Handler

- Utility: [src/lib/responseHandler.ts](src/lib/responseHandler.ts)
- Success envelope:

	```json
	{
		"success": true,
		"message": "<brief description>",
		"data": { /* payload */ },
		"meta": { /* optional pagination */ },
		"timestamp": "2025-12-16T10:00:00.000Z"
	}
	```

- Error envelope:

	```json
	{
		"success": false,
		"message": "<human readable detail>",
		"error": { "code": "<ERROR_CODE>", "details": { /* optional */ } },
		"timestamp": "2025-12-16T10:00:00.000Z"
	}
	```

- Usage examples:

	```ts
	return successResponse("Orders retrieved successfully", orders, {
		meta: { skip, take, total },
	});

	return errorResponse("Email already exists", {
		status: 409,
		code: ERROR_CODES.EMAIL_CONFLICT,
	});
	```

- Error codes: `VALIDATION_ERROR`, `PRODUCT_NOT_FOUND`, `INSUFFICIENT_STOCK`, `ROLLBACK_TEST`, `ORDERS_FETCH_FAILED`, `ORDER_TRANSACTION_FAILED`, `USERS_FETCH_FAILED`, `USER_NOT_FOUND`, `EMAIL_CONFLICT`, `UNKNOWN_ERROR`.
- DX & observability gains:
	- Every payload carries an ISO timestamp for log correlation.
	- Frontends depend on a single `{ success, message, data }` schema across routes.
	- Monitoring tools (Sentry, Datadog, Postman monitors) filter on `error.code` for alerting.
	- New contributors learn the "API voice" once and reuse patterns in future routes.

## Input Validation with Zod

This project now validates all incoming POST/PUT request bodies using Zod schemas located in `src/lib/schemas`.

- Schemas: `userSchema`, `projectSchema`, `orderSchema`.
- Handlers return `VALIDATION_ERROR` with structured `details` containing `{ field, message }` on failure.

Example (create user):

```bash
curl -X POST http://localhost:3000/api/users \
	-H "Content-Type: application/json" \
	-d '{"name":"A","email":"bademail"}'
```

Response:

```json
{
	"success": false,
	"message": "Validation Error",
	"error": {
		"code": "VALIDATION_ERROR",
		"details": [
			{ "field": "name", "message": "Name must be at least 2 characters long" },
			{ "field": "email", "message": "Invalid email address" }
		]
	},
	"timestamp": "..."
}
```

Schemas are reusable between client and server for consistent validation.

## Sample Requests

Create an order with transactional rollback testing:

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

Paginate orders while filtering for shipped statuses:

```bash
curl "http://localhost:3000/api/orders?skip=0&take=5&status=SHIPPED"
```

List users using page-based pagination:

```bash
curl "http://localhost:3000/api/users?page=2&limit=5"
```

Handle uniqueness conflicts gracefully:

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

## Error Semantics

- Validation failures now emit `VALIDATION_ERROR` codes with `success: false`, helping clients branch on a single field.
- Prisma error codes (`P2002`, `P2025`) translate to domain codes (`EMAIL_CONFLICT`, `USER_NOT_FOUND`) so clients never see raw database metadata.
- Transaction rollbacks triggered by `simulateFailure` return HTTP `418` with `ROLLBACK_TEST`, separating QA checks from production incidents.
- Any unhandled exception becomes `UNKNOWN_ERROR`, guaranteeing consistent payload shapes for observability.

## Naming Reflection

Consistent resource naming (`/api/orders`, `/api/users/:id`), payload casing (`userId`, `paymentProvider`), and the shared response voice (`success/message/data/error.code`) keep SDKs slim and prevent integration drift. When every route speaks the same format, partner teams spot regressions faster and share reusable adapters instead of duplicating parsing logic.

## API Test Evidence

![Postman orders run](https://dummyimage.com/1280x720/0f172a/ffffff.png&text=Postman+Orders+201)

![Postman users listing](https://dummyimage.com/1280x720/0f172a/ffffff.png&text=Postman+Users+200)

