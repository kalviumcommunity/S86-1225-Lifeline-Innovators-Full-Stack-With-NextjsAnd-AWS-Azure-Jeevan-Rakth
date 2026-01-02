# Jeevan Rakth – Developer Setup

Use this guide when you pull the project for the first time. It covers the tools you need, the commands to run, and common troubleshooting hints so you can get the app running quickly.

## 🎯 Key Features

- **Object Storage** - Secure file uploads to AWS S3 and Azure Blob Storage with presigned URLs
- **User Feedback System** - Comprehensive toast notifications, modals, and loaders for excellent UX
- **Authentication** - Secure JWT-based auth with role-based access control
- **Database** - PostgreSQL with Prisma ORM
- **Caching** - Redis for performance optimization
- **Type Safety** - Full TypeScript with Zod validation
- **Accessibility** - WCAG 2.1 compliant UI components

## 📚 Documentation

### 🗄️ Database & Infrastructure
- **[Managed Database Quick Start](./MANAGED_DATABASE_QUICK_START.md)** - ⚡ **START HERE!** 5-minute setup guide for AWS RDS or Azure Database
- **[Managed Database Setup Guide](./MANAGED_DATABASE_SETUP.md)** - 📖 Complete guide for AWS RDS and Azure Database for PostgreSQL (provisioning, security, backups, cost optimization)
- **[Database Deployment Checklist](./DATABASE_DEPLOYMENT_CHECKLIST.md)** - ✅ Pre-deployment validation checklist for production
- **[Database Architecture Diagrams](./MANAGED_DATABASE_ARCHITECTURE.md)** - 📊 Visual architecture, security layers, and data flow diagrams
- **[Database Implementation Summary](./MANAGED_DATABASE_IMPLEMENTATION_SUMMARY.md)** - 📝 Complete implementation overview and technical details

### 🔐 Authentication & Security
- **[JWT Authentication System](./JWT_AUTHENTICATION.md)** - Complete JWT implementation with access/refresh tokens, security measures, and testing guide
- **[RBAC (Role-Based Access Control)](./RBAC_GUIDE.md)** - 🔐 Complete RBAC implementation with roles, permissions, and access control
- **[Security Guide](./SECURITY.md)** - 🛡️ OWASP security measures: XSS prevention, SQL injection protection, input sanitization
- **[Security Headers](./SECURITY_HEADERS.md)** - 🔒 **NEW!** Comprehensive HSTS, CSP, and CORS implementation guide
- **[JWT Setup Guide](./JWT_SETUP_GUIDE.md)** - Quick start installation and configuration
- **[JWT Security Visual Guide](./JWT_SECURITY_VISUAL_GUIDE.md)** - Visual diagrams of security flows and protections
- **[JWT Implementation Overview](./JWT_IMPLEMENTATION_OVERVIEW.md)** - High-level architecture and system design
- **[JWT Deployment Checklist](./JWT_DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification checklist
- **[Authentication Guide](./AUTH.md)** - JWT authentication and authorization details

### 📦 Object Storage & File Uploads
- **[Object Storage Quick Start](./OBJECT_STORAGE_QUICK_START.md)** - ⚡ **START HERE!** 5-minute setup for AWS S3 or Azure Blob Storage
- **[Object Storage Complete Guide](./OBJECT_STORAGE_GUIDE.md)** - 📖 Full implementation guide with AWS S3 and Azure Blob Storage setup, security, and cost optimization
- **[Object Storage Implementation Summary](./OBJECT_STORAGE_IMPLEMENTATION.md)** - 📝 Feature overview, API documentation, and usage examples
- **[Object Storage Architecture](./OBJECT_STORAGE_ARCHITECTURE.md)** - 🏗️ System diagrams, data flow, and security architecture
- **[Object Storage Testing Guide](./OBJECT_STORAGE_TESTING.md)** - 🧪 Complete test suite with 60+ test cases

### UI & UX
- **[User Feedback System Guide](./FEEDBACK_SYSTEM.md)** - Complete documentation for toasts, modals, and loaders
- **[Tailwind Responsive Design & Theme System](./TAILWIND_RESPONSIVE_THEME.md)** - Custom colors, breakpoints, and dark mode implementation
- **[Loading & Error States Guide](./LOADING_ERROR_STATES.md)** - Loading skeletons and error boundaries implementation

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
   - `DATABASE_URL` – PostgreSQL connection string
     - **Local Development**: `postgresql://USER:PASSWORD@localhost:5432/jeevanrakth`
     - **AWS RDS**: `postgresql://adminuser:password@endpoint.rds.amazonaws.com:5432/jeevanrakth?sslmode=require`
     - **Azure Database**: `postgresql://adminuser:password@server.postgres.database.azure.com:5432/jeevanrakth?sslmode=require`
   - `JWT_SECRET` – random string for signing tokens (change the default before deploying)
   - `JWT_REFRESH_SECRET` – random string for refresh tokens
   - Any other keys documented in `.env.example`

> **For Managed Databases:** See the complete [Managed Database Setup Guide](./MANAGED_DATABASE_SETUP.md) for AWS RDS or Azure Database for PostgreSQL provisioning, configuration, and migration steps.

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

### Development
- `npm run dev` – Start development server
- `npm run build` – Build production bundle
- `npm run start` – Serve the built app (run `npm run build` first)
- `npm run lint` – Run ESLint across the project

### Database Management
- `npx prisma migrate dev --name <migration_name>` – Create a named migration after editing `prisma/schema.prisma`
- `npx prisma migrate deploy` – Apply migrations in production
- `npx prisma migrate reset` – Drop and recreate the database from migrations
- `npx prisma studio` – Open Prisma Studio for database inspection
- `npx prisma generate` – Generate Prisma Client

### Database Validation & Testing
- `npm run test:connection` – Test database connectivity and configuration
- `npm run verify:backups` – Verify backup configuration (AWS RDS / Azure Database)
- `npm run validate:database` – Run comprehensive database validation suite
- `npm run test:security` – Run security validation tests

### Health Checks
- Visit `http://localhost:3000/api/health/database` – Database health check endpoint

## 8. Project Structure Highlights

- `src/app` – Next.js App Router routes, including REST endpoints under `src/app/api`
- `src/lib` – shared utilities (Prisma client, response helpers, Zod schemas)
- `prisma/schema.prisma` – data models and relations
- `src/app/middleware.ts` – JWT validation and role-based access for protected routes

## 9. Common Issues

### Database Connection Issues
- **Cannot connect to database** – verify `DATABASE_URL`, ensure PostgreSQL is running, and the database exists.
- **SSL/TLS errors with managed databases** – Ensure `sslmode=require` is in your connection string for AWS RDS or Azure Database
- **Connection timeout** – Check firewall rules / security groups allow your IP on port 5432
- **Connection pool exhausted** – Consider using connection pooling (RDS Proxy, PgBouncer, or Prisma Accelerate)

### Migration & Schema Issues
- **Prisma migrate errors** – delete `node_modules/.prisma`, rerun `npm install`, then `npx prisma migrate dev`.
- **Schema drift detected** – Run `npx prisma db push` to sync schema without creating a migration
- **Migration fails on managed database** – Verify database user has sufficient permissions

### Authentication Issues
- **JWT authentication failing** – confirm `JWT_SECRET` in `.env` matches the one used when tokens were issued; restart `npm run dev` after changing env vars.
- **Token expired errors** – Check token expiration settings in `src/lib/jwt.ts`

### General Issues
- **Port 3000 already in use** – stop the conflicting process or run `PORT=3100 npm run dev` (PowerShell: `$env:PORT=3100; npm run dev`).
- **Missing dependencies** – Run `npm install` to install all required packages
- **Build errors** – Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

### Managed Database Specific
- **High latency** – Consider moving database to same region as application
- **Backup failures** – Verify backup configuration with `npm run verify:backups`
- **Storage full** – Enable autoscaling or manually increase storage size
- **Performance issues** – Check slow query logs, add indexes, or upgrade instance size

**For detailed troubleshooting, see [Managed Database Setup Guide](./MANAGED_DATABASE_SETUP.md#troubleshooting)**

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

## Secure File Uploads with Pre-Signed URLs

This feature lets clients upload directly to AWS S3 or Azure Blob while the backend signs short-lived URLs and records metadata.

### Setup Checklist

- Install dependencies after pulling these changes: `npm install` (adds `@azure/storage-blob`).
- Set `.env` using the new keys in `.env.example`. Required values depend on `FILE_STORAGE_PROVIDER` (`aws` or `azure`).
- Run the new migration: `npx prisma migrate dev --name add_file_model`.

### Flow at a Glance

```
Client
   | POST /api/upload (filename, type, size)
   v
Next.js API -> Issues pre-signed URL (S3 PutObject or Azure SAS)
   | returns { uploadURL, storageKey, provider, requiredHeaders? }
   v
Client -> PUT file directly to cloud endpoint
   | on success sends POST /api/files with metadata
   v
Prisma -> stores name, URL, mimeType, size, storageKey, provider, uploaderId
```

### Sample Responses

`POST /api/upload`

```json
{
   "success": true,
   "message": "Upload URL generated",
   "data": {
      "uploadURL": "https://bucket.s3.ap-south-1.amazonaws.com/uploads/....",
      "objectKey": "uploads/1734857082-3b594fb7-bdf1-4c44-9d4d-c54f1fd9bbbf-receipt.pdf",
      "provider": "aws",
      "expiresAt": "2025-12-22T05:55:00.000Z"
   },
   "timestamp": "2025-12-22T05:54:00.000Z"
}
```

`POST /api/files`

```json
{
   "success": true,
   "message": "File metadata stored",
   "data": {
      "id": 1,
      "name": "receipt.pdf",
      "url": "https://bucket.s3.ap-south-1.amazonaws.com/uploads/...",
      "mimeType": "application/pdf",
      "sizeBytes": 1048576,
      "storageKey": "uploads/1734857082-...-receipt.pdf",
      "provider": "aws",
      "uploadedAt": "2025-12-22T05:54:05.123Z",
      "uploaderId": 2
   },
   "timestamp": "2025-12-22T05:54:05.456Z"
}
```

### Validation and Security

- MIME types limited to images and PDFs; clients must still enforce checks.
- Maximum size defaults to 5 MB (`FILE_UPLOAD_MAX_BYTES` overrides).
- Signed URLs expire quickly (`FILE_UPLOAD_URL_TTL_SECONDS`, default 120s).
- Azure responses include required headers so uploads set `x-ms-blob-type: BlockBlob`.

| Concern | Mitigation |
| --- | --- |
| Public vs private files | Keep buckets/containers private; serve via signed GETs or CDN with auth. |
| Key exposure | Backend alone owns keys; clients receive only scoped URLs. |
| Lifecycle | Configure S3 lifecycle rules or Blob retention policies to archive/delete stale uploads. |

### Usage Notes & Evidence

- Tested with `curl` to request `/api/upload`, followed by a direct PUT to the returned URL and a metadata POST. Cloud dashboard reflected the object within seconds (capture a screenshot in your environment for audits).
- Store additional metadata (checksum, business entity) by extending `fileCreateSchema` and `prisma.file`.

### Reflection

- **Access trade-offs:** Keeping blobs private avoids accidental leaks; expose public URLs only when end users require frictionless access and couple with short-lived signed GETs.
- **Lifecycle management:** Automatic archival/deletion of old uploads reduces storage costs and narrows the blast radius of compromised URLs.

---

## React Hook Form + Zod Integration

This project demonstrates production-grade form management using **React Hook Form** and **Zod** for type-safe, validated forms with minimal re-renders and excellent developer experience.

### Why React Hook Form + Zod?

| Tool | Purpose | Key Benefit |
|------|---------|-------------|
| React Hook Form | Manages form state and validation with minimal re-renders | Lightweight and performant |
| Zod | Provides declarative schema validation | Type-safe and reusable schemas |
| @hookform/resolvers | Connects Zod to React Hook Form seamlessly | Simplifies schema integration |

**Key Idea:** React Hook Form optimizes rendering and state management, while Zod enforces correctness through schemas.

### Installation

The following packages have been installed in this project:

```bash
npm install react-hook-form zod @hookform/resolvers
```

### Implementation Overview

#### 1. Reusable Form Input Component

**Location:** [src/components/ui/FormInput.tsx](src/components/ui/FormInput.tsx)

A reusable, accessible input component that integrates with React Hook Form:

```typescript
interface FormInputProps {
  label: string;
  type?: string;
  register: any;
  name: string;
  error?: string;
}
```

**Features:**
- Automatic error styling (red border on validation failure)
- ARIA attributes for accessibility (`aria-invalid`, `role="alert"`)
- Associated labels using `htmlFor` and `id`
- Conditional error message display

#### 2. Signup Form with Validation

**Location:** [src/app/signup/page.tsx](src/app/signup/page.tsx)

Enhanced the existing signup form with:
- **Zod Schema Validation:**
  - Name: minimum 3 characters
  - Email: valid email format
  - Password: minimum 6 characters
- **React Hook Form Integration:**
  - `register()` for controlled inputs
  - `handleSubmit()` for form submission
  - `formState.errors` for error handling
  - `isSubmitting` state for loading feedback

**Example Schema:**
```typescript
const signupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type SignupFormData = z.infer<typeof signupSchema>;
```

#### 3. Contact Form (Reusable Component Demo)

**Location:** [src/app/contact/page.tsx](src/app/contact/page.tsx)

Demonstrates full reusability with:
- Custom `FormInput` component usage
- Schema-based validation
- Textarea support with validation
- Form reset on successful submission
- Async submission handling

**Features:**
- 10+ character message requirement
- Email validation
- Success feedback with `alert()` and form reset
- Accessible error messages

### Accessibility & UX Best Practices

✅ **Implemented Features:**

1. **Associated Labels:** Every input has a `<label>` with matching `htmlFor` and `id` attributes
2. **ARIA Attributes:** 
   - `aria-invalid` set to "true" when field has errors
   - Error messages include `role="alert"` for screen reader announcements
3. **Visual Feedback:**
   - Red borders on invalid fields
   - Error messages displayed below inputs
   - Disabled button styling during submission
4. **Keyboard Navigation:** All form elements are keyboard accessible
5. **Clear Error Messages:** Specific, actionable validation messages

### Type Safety Benefits

- **Automatic TypeScript Types:** Using `z.infer<typeof schema>` derives types from Zod schemas
- **Compile-Time Safety:** TypeScript catches type mismatches before runtime
- **Single Source of Truth:** Schema defines both validation rules and types

### Code Organization

```
src/
├── app/
│   ├── signup/page.tsx          # Enhanced with React Hook Form + Zod
│   └── contact/page.tsx         # New: Demonstrates reusable components
└── components/
    └── ui/
        └── FormInput.tsx        # New: Reusable form input component
```

### Testing the Forms

1. **Visit Signup Form:** Navigate to `/signup`
   - Try submitting empty form → See validation errors
   - Enter name with <3 characters → See error
   - Enter invalid email → See error
   - Enter password with <6 characters → See error
   - Fill valid data → Successfully submits and redirects

2. **Visit Contact Form:** Navigate to `/contact`
   - Test all validation rules
   - Submit successfully to see form reset
   - Check console for submitted data

### Screenshots & Evidence

**Recommended captures for documentation:**
1. Form with validation errors displayed
2. Form in submitting state (disabled button)
3. Browser console showing submitted form data
4. Successful submission feedback

### Reflection on Approach

**Reusability:**
- `FormInput` component eliminates repetitive code
- Zod schemas can be shared across client and server
- Form patterns apply to any data collection need

**Maintainability:**
- Centralized validation logic in schemas
- Type safety prevents runtime errors
- Clear separation of concerns (UI vs validation logic)

**Performance:**
- React Hook Form minimizes re-renders
- Only fields being edited trigger updates
- Validation runs efficiently without full form re-renders

**Accessibility:**
- Screen reader friendly with proper ARIA labels
- Keyboard navigation works seamlessly
- Error states clearly communicated

### Future Enhancements

Consider adding:
- Custom error component with icons
- Field-level async validation (e.g., check if email exists)
- Multi-step form wizard
- File upload validation with Zod
- Integration with form analytics

---
"" 
