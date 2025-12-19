# Jeevan Rakth – Developer Setup

Use this guide when you pull the project for the first time. It covers the tools you need, the commands to run, and common troubleshooting hints so you can get the app running quickly.

## Requirements

- Node.js 20.x (check with `node --version`)
- npm 10.x (bundled with Node 20)
- PostgreSQL 15 (local instance or remote connection string)
- Git

> macOS/Linux users can install PostgreSQL with Homebrew/Apt; Windows users can use the official installer or Docker.

## 1. Clone the Repository

```bash
git clone <repo-url>
cd S86-1225-Lifeline-Innovators-Full-Stack-With-NextjsAnd-AWS-Azure-Jeevan-Rakth/jeevan-rakth
```

## Quick Start After Clone or Pull

After cloning or pulling the repo, run these steps from the `jeevan-rakth` directory to get a local dev environment running quickly.

Windows / PowerShell friendly commands:

```powershell
# Copy example env and edit values as needed
copy .env.example .env

# Start Redis locally (optional; or use managed Redis)
docker run -d --name redis-local -p 6379:6379 redis:8

# Install deps and run migrations
npm install
npx prisma migrate dev

# Start the dev server
npm run dev
```

Notes:
- Set `REDIS_URL` in `.env` if you use a remote Redis instance.
- To run everything in containers, from the repository root run `docker compose up --build`.

## 2. Configure Environment Variables

1. Copy the provided template:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set:
   - `DATABASE_URL` – PostgreSQL connection string (format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`)
   - `JWT_SECRET` – random string for signing tokens (change the default before deploying)
   - Any other keys documented in `.env.example`

> Ensure the database referenced in `DATABASE_URL` already exists. You can create it with `createdb jeevan_rakth` or via your SQL client.

## 3. Install Dependencies

```bash
npm install
```

This pulls the Next.js runtime, Prisma Client, Tailwind/PostCSS tooling, and TypeScript types.

## 4. Prepare the Database

Run the latest migrations to sync the schema:

```bash
npx prisma migrate dev
```

Optional: clear all tables to start from a blank state (no demo data is inserted):

```bash
npx prisma db seed
```

You can inspect the schema or data with Prisma Studio:

```bash
npx prisma studio
```

## 5. Start the Development Server

```bash
npm run dev
```

Visit http://localhost:3000 once the server reports “Ready”. Hot reloading is enabled by default.

## 6. Create Initial Users

- Use `POST /api/auth/signup` to register a new account.
- To promote a user to admin, update the `role` field manually via Prisma Studio or SQL (`UPDATE "User" SET role = 'admin' WHERE email = '...'`).
- Subsequent logins issue JWTs containing `id`, `email`, and `role` claims. The middleware blocks `/api/admin` unless the role is `admin`.

## 7. Useful Scripts

- `npm run lint` – run ESLint across the project
- `npm run build` – build the production bundle
- `npm run start` – serve the built app (run `npm run build` first)
- `npx prisma migrate dev --name <migration_name>` – create a named migration after editing `prisma/schema.prisma`
- `npx prisma migrate reset` – drop and recreate the database from migrations

## 8. Project Structure Highlights

- `src/app` – Next.js App Router routes, including REST endpoints under `src/app/api`
- `src/lib` – shared utilities (Prisma client, response helpers, Zod schemas)
- `prisma/schema.prisma` – data models and relations
- `src/app/middleware.ts` – JWT validation and role-based access for protected routes

## 9. Common Issues

- **Cannot connect to database** – verify `DATABASE_URL`, ensure PostgreSQL is running, and the database exists.
- **Prisma migrate errors** – delete `node_modules/.prisma`, rerun `npm install`, then `npx prisma migrate dev`.
- **JWT authentication failing** – confirm `JWT_SECRET` in `.env` matches the one used when tokens were issued; restart `npm run dev` after changing env vars.
- **Port 3000 already in use** – stop the conflicting process or run `PORT=3100 npm run dev` (PowerShell: `$env:PORT=3100; npm run dev`).

## 10. Next Steps

- Add more routes or UI pages under `src/app`
- Extend the Prisma schema, then run `npx prisma migrate dev`
- Update the root README for deployment or infrastructure changes as needed

You are ready to build! If you run into setup snags, start by checking `.env` values, database connectivity, and the commands listed above.

## Centralized Error Handling

This project uses a centralized error handling pattern so all API routes produce consistent, safe responses and structured logs.

- **Logger:** [src/lib/logger.ts](src/lib/logger.ts) — simple structured JSON logger used across the app.
- **Error handler:** [src/lib/errorHandler.ts](src/lib/errorHandler.ts) — classifies, logs, and returns appropriate API responses.

Behavior by environment:

- **Development:** Returns detailed messages and stack traces in the JSON response.
- **Production:** Returns a generic, user-safe message and logs full details (stack is redacted in responses).

Example logger (see file):

```ts
// src/lib/logger.ts
export const logger = {
   info: (message: string, meta?: any) => {
      console.log(JSON.stringify({ level: 'info', message, meta, timestamp: new Date().toISOString() }));
   },
   error: (message: string, meta?: any) => {
      console.error(JSON.stringify({ level: 'error', message, meta, timestamp: new Date().toISOString() }));
   },
};
```

Example centralized handler (see file):

```ts
// src/lib/errorHandler.ts
import { logger } from './logger';
import { errorResponse, ERROR_CODES } from './responseHandler';

export function handleError(error: any, context: string, options?: { status?: number; code?: string }) {
   const isProd = process.env.NODE_ENV === 'production';

   logger.error(`Error in ${context}`, {
      message: error?.message,
      stack: isProd ? 'REDACTED' : error?.stack,
      context,
   });

   const userMessage = isProd ? 'Something went wrong. Please try again later.' : (error?.message ?? 'Unknown error');

   return errorResponse(userMessage, { status: options?.status ?? 500, code: options?.code });
}
```

Using the handler in routes (example):

```ts
// src/app/api/users/route.ts
import { handleError } from '@/lib/errorHandler';

try {
   // route logic
} catch (err) {
   return handleError(err, 'GET /api/users', { status: 500, code: 'USERS_FETCH_FAILED' });
}
```

Observability notes:

- Logs are emitted as structured JSON which can be shipped to CloudWatch/Datadog/Splunk.
- In production the API responses avoid leaking stack traces or internal messages.

Extensibility:

- Add custom error classes (e.g., `ValidationError`, `AuthError`) and map them in `handleError` to custom HTTP status codes and error codes.
- Enrich logger metadata (request id, user id) in middleware and pass to `handleError` for improved traceability.

## Redis Caching (API Performance)

This project includes a simple Redis cache-aside integration for API routes to improve latency on frequently requested data.

- **Client:** `ioredis` (file: [src/lib/redis.ts](src/lib/redis.ts#L1)) — reads `REDIS_URL` and exports `DEFAULT_CACHE_TTL`.
- **Pattern:** Cache-Aside (check cache → DB on miss → cache result).

Example: `GET /api/users` now uses a per-page cache key `users:list:page:${page}:limit:${limit}` and caches the JSON result for `DEFAULT_CACHE_TTL` seconds (default 60s). On a cache hit the route returns the cached payload immediately.

Example snippet (simplified):

```ts
import redis, { DEFAULT_CACHE_TTL } from '@/lib/redis';

const cacheKey = `users:list:page:${page}:limit:${limit}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
// else query DB, then:
await redis.set(cacheKey, JSON.stringify({ data, meta }), 'EX', DEFAULT_CACHE_TTL);
```

Invalidation strategy:
- On user create/update/delete the server runs a best-effort invalidation: it deletes keys matching `users:list*` and the specific `users:${id}` cache key so subsequent requests fetch fresh data.
- Deleting by pattern uses `redis.keys('users:list*')` and `redis.del(...)`. Note: `KEYS` can be heavy on large instances; use Redis `SCAN` or maintain explicit index keys in production.

TTL policy:
- `DEFAULT_CACHE_TTL` is read from `REDIS_TTL_SECONDS` env var or falls back to 60 seconds. Choose a TTL based on how frequently data changes and acceptable staleness.

Reflection & guidance:
- Cache reduces latency significantly for repeated reads — ideal for lists, computed results, sessions, and rate-limited data.
- Be careful with highly dynamic data; short TTLs or on-write invalidation are recommended to reduce stale reads.
- In production consider:
   - Using `SCAN` instead of `KEYS` for pattern deletion.
   - Using Redis managed services (e.g., Redis Cloud, AWS ElastiCache) with proper auth and TLS.
   - Adding metrics (cache hit/miss counters) to observe effectiveness.

Pro Tip: "Cache is like a short-term memory — it makes things fast, but only if you remember to forget at the right time." 


