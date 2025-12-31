# 🔐 RBAC (Role-Based Access Control) Implementation Guide

## Table of Contents
- [Overview](#overview)
- [Roles & Permissions](#roles--permissions)
- [Architecture](#architecture)
- [Implementation](#implementation)
- [API Usage](#api-usage)
- [UI Components](#ui-components)
- [Security & Best Practices](#security--best-practices)
- [Audit Logging](#audit-logging)
- [Testing](#testing)
- [Scalability](#scalability)

---

## Overview

This application implements a comprehensive Role-Based Access Control (RBAC) system that assigns permissions to users based on their role rather than individual identity. This approach simplifies security management and ensures consistent access control across the application.

### Why RBAC?

- **Simplified Management**: Assign permissions to roles, not individual users
- **Consistency**: Uniform access control across API and UI
- **Scalability**: Easy to add new roles and permissions
- **Auditability**: Track all access decisions for compliance
- **Security**: Enforce permissions on both client and server

---

## Roles & Permissions

### Role Hierarchy

| Role | Permissions | Use Case |
|------|------------|----------|
| **Admin** | Create, Read, Update, Delete | Full system access for administrators |
| **Editor** | Read, Update | Content creators and moderators |
| **Viewer** | Read | Read-only access for observers |
| **User** | Read | Default role for authenticated users |

### Permission Types

| Permission | Description | Example Actions |
|------------|-------------|----------------|
| `create` | Create new resources | Add user, create project, upload file |
| `read` | View existing resources | List users, view dashboard, read data |
| `update` | Modify existing resources | Edit profile, update task, change settings |
| `delete` | Remove resources | Delete user, remove project, purge data |

### Resource-Specific Permissions

Different resources can have granular permissions:

```typescript
// Admin can do everything on all resources
admin: {
  users: ['create', 'read', 'update', 'delete'],
  projects: ['create', 'read', 'update', 'delete'],
  tasks: ['create', 'read', 'update', 'delete'],
}

// Editor can read and update most resources
editor: {
  users: ['read'],
  projects: ['read', 'update'],
  tasks: ['create', 'read', 'update'],
}

// Viewer has read-only access
viewer: {
  users: ['read'],
  projects: ['read'],
  tasks: ['read'],
}
```

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        RBAC SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────┐  │
│  │   Database   │───▶│     JWT      │───▶│  Middleware │  │
│  │  (User Role) │    │   (Payload)  │    │  (Verify)   │  │
│  └──────────────┘    └──────────────┘    └─────────────┘  │
│                                                 │           │
│                                                 ▼           │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────┐  │
│  │ Role Config  │───▶│ RBAC Utils   │───▶│ API Routes  │  │
│  │  (Mapping)   │    │  (Helpers)   │    │ (Protected) │  │
│  └──────────────┘    └──────────────┘    └─────────────┘  │
│                                                 │           │
│                                                 ▼           │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────┐  │
│  │UI Components │◀───│ Client Utils │◀───│   Response  │  │
│  │ (Conditional)│    │  (Helpers)   │    │   (Data)    │  │
│  └──────────────┘    └──────────────┘    └─────────────┘  │
│                                                             │
│                      ┌─────────────┐                       │
│                      │   Logging   │                       │
│                      │  (Audit)    │                       │
│                      └─────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

```
src/
├── config/
│   └── roles.ts                    # Role and permission definitions
├── lib/
│   ├── rbac.ts                     # Server-side RBAC utilities
│   └── rbacClient.ts               # Client-side RBAC helpers
├── components/
│   └── rbac/
│       └── RBACComponents.tsx      # Reusable UI components
├── app/
│   ├── api/
│   │   ├── users/route.ts          # Protected API routes
│   │   └── rbac-demo/route.ts      # RBAC demo endpoint
│   └── rbac-demo/
│       └── page.tsx                # Interactive RBAC demo
└── middleware.ts                   # Global authentication middleware
```

---

## Implementation

### 1. Roles Configuration (`src/config/roles.ts`)

Define all roles and their permissions:

```typescript
export const roles: Record<Role, Permission[]> = {
  admin: ['create', 'read', 'update', 'delete'],
  editor: ['read', 'update'],
  viewer: ['read'],
  user: ['read'],
};

// Helper functions
export function hasPermission(role: Role, permission: Permission): boolean {
  return roles[role]?.includes(permission) ?? false;
}
```

### 2. RBAC Middleware (`src/lib/rbac.ts`)

Protect API routes with permission checks:

```typescript
import { requirePermission, requireRole, requireAdmin } from '@/lib/rbac';

// Require specific permission
export const GET = requirePermission('read', 'users')(async (req) => {
  // Handler logic - only executes if user has permission
});

// Require specific role
export const DELETE = requireRole(['admin'])(async (req) => {
  // Only admins can access
});

// Shorthand for admin-only
export const DELETE = requireAdmin(async (req) => {
  // Only admins can access
});
```

### 3. JWT Integration

User roles are stored in JWT tokens:

```typescript
const tokenPayload: TokenPayload = {
  id: user.id,
  email: user.email,
  role: user.role ?? 'user', // From database
};

const accessToken = generateAccessToken(tokenPayload);
```

### 4. UI Components

Conditionally render UI elements based on permissions:

```typescript
import { Can, AdminOnly, RoleGuard } from '@/components/rbac/RBACComponents';

// Show to users with specific permission
<Can permission="delete">
  <button>Delete</button>
</Can>

// Show only to admins
<AdminOnly>
  <AdminPanel />
</AdminOnly>

// Show to multiple roles
<RoleGuard allowedRoles={['admin', 'editor']}>
  <EditButton />
</RoleGuard>
```

---

## API Usage

### Protecting API Routes

#### Method 1: Using Permission Middleware

```typescript
import { requirePermission } from '@/lib/rbac';

// GET - Requires read permission
export const GET = requirePermission('read', 'users')(async (req) => {
  const users = await prisma.user.findMany();
  return successResponse('Users fetched', { users });
});

// POST - Requires create permission
export const POST = requirePermission('create', 'users')(async (req) => {
  const body = await req.json();
  const user = await prisma.user.create({ data: body });
  return successResponse('User created', user);
});

// PUT - Requires update permission
export const PUT = requirePermission('update', 'users')(async (req) => {
  const body = await req.json();
  const user = await prisma.user.update({ where: { id: body.id }, data: body });
  return successResponse('User updated', user);
});

// DELETE - Admin only
export const DELETE = requireAdmin(async (req) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  await prisma.user.delete({ where: { id: Number(id) } });
  return successResponse('User deleted');
});
```

#### Method 2: Using Role Middleware

```typescript
import { requireRole } from '@/lib/rbac';

// Allow multiple roles
export const POST = requireRole(['admin', 'editor'])(async (req) => {
  // Both admins and editors can access
});
```

#### Method 3: Conditional Checks Inside Handler

```typescript
import { checkPermission, getUserRole } from '@/lib/rbac';

export async function PATCH(req: NextRequest) {
  const canUpdate = await checkPermission(req, 'update', 'users');
  const canDelete = await checkPermission(req, 'delete', 'users');
  
  if (canUpdate) {
    // Allow update logic
  }
  
  if (canDelete) {
    // Allow delete logic
  }
  
  return successResponse('Operation completed', { canUpdate, canDelete });
}
```

---

## UI Components

### Available Components

#### 1. `<Can>` - Permission-Based Rendering

```typescript
<Can permission="update" resource="tasks">
  <button onClick={editTask}>Edit Task</button>
</Can>

<Can permission="delete" fallback={<p>No permission</p>}>
  <button onClick={deleteTask}>Delete Task</button>
</Can>
```

#### 2. `<Cannot>` - Inverse Permission Check

```typescript
<Cannot permission="delete">
  <p>You don't have permission to delete items. Contact admin to upgrade.</p>
</Cannot>
```

#### 3. `<RoleGuard>` - Role-Based Rendering

```typescript
<RoleGuard allowedRoles={['admin', 'editor']}>
  <ContentEditor />
</RoleGuard>
```

#### 4. `<AdminOnly>` - Admin-Only Content

```typescript
<AdminOnly fallback={<p>Admin access required</p>}>
  <AdminDashboard />
</AdminOnly>
```

#### 5. `<ModifyGuard>` - Edit Access (Admin & Editor)

```typescript
<ModifyGuard>
  <EditButton />
</ModifyGuard>
```

#### 6. `<RoleBasedButtons>` - Adaptive Action Buttons

```typescript
<RoleBasedButtons
  userRole={user?.role}
  resource="tasks"
  onView={() => viewTask(id)}
  onEdit={() => editTask(id)}
  onDelete={() => deleteTask(id)}
/>
// Buttons appear based on permissions
```

### Using Utility Functions

```typescript
import { hasPermission, isAdmin, canModify } from '@/lib/rbacClient';

const userRole = user?.role;

if (hasPermission(userRole, 'delete')) {
  // Show delete UI
}

if (isAdmin(userRole)) {
  // Show admin features
}

if (canModify(userRole)) {
  // Show edit features
}
```

---

## Security & Best Practices

### ✅ DO

1. **Always Enforce on Server**
   - Client-side checks are for UI only
   - Server must validate all permissions

2. **Use Middleware**
   - Protect routes with `requirePermission()` or `requireRole()`
   - Don't rely on manual checks

3. **Validate JWT**
   - Middleware automatically validates tokens
   - Check token expiry and signature

4. **Log Access Decisions**
   - Use `RBACLogger` for audit trails
   - Track who accessed what and when

5. **Use Resource-Specific Permissions**
   - Different resources can have different rules
   - More granular control when needed

### ❌ DON'T

1. **Don't Trust Client**
   - Never rely solely on UI hiding
   - Always validate on server

2. **Don't Hardcode Roles**
   - Use role configuration file
   - Easy to maintain and update

3. **Don't Skip Logging**
   - Every permission check should be logged
   - Essential for security audits

4. **Don't Over-Complicate**
   - Start with broad roles
   - Add granularity only when needed

---

## Audit Logging

### Automatic Logging

All RBAC operations are automatically logged:

```
✅ [RBAC] admin ALLOWED to access users with permission: delete | User: 123
❌ [RBAC] viewer DENIED to access users with permission: delete | User: 456
```

### Log Format

```typescript
{
  timestamp: '2025-12-30T10:30:00.000Z',
  decision: 'ALLOWED' | 'DENIED',
  role: 'admin',
  permission: 'delete',
  resource: 'users',
  userId: '123',
  endpoint: '/api/users'
}
```

### Manual Logging

```typescript
import { RBACLogger } from '@/lib/rbac';

RBACLogger.log('ALLOWED', {
  role: 'admin',
  resource: 'users',
  permission: 'delete',
  userId: user.id,
});
```

### Production Logging

In production, logs should be sent to a logging service:

```typescript
// Replace console.log with actual logging service
await sendToLoggingService({
  timestamp,
  decision,
  role,
  resource,
  permission,
  userId,
});
```

---

## Testing

### Interactive Demo

Visit `/rbac-demo` to test RBAC features:

1. **View Permissions** - See what your role can do
2. **Test API Endpoints** - Try different operations
3. **See Audit Logs** - Watch access decisions in real-time
4. **UI Components** - See conditional rendering

### Manual Testing

#### Test as Different Roles

```sql
-- Update user role in database
UPDATE "User" SET role = 'admin' WHERE email = 'test@example.com';
UPDATE "User" SET role = 'editor' WHERE email = 'test@example.com';
UPDATE "User" SET role = 'viewer' WHERE email = 'test@example.com';
```

#### Test API Endpoints

```bash
# Get access token from login
TOKEN="your_access_token_here"

# Test READ (all roles)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/rbac-demo

# Test CREATE (admin, editor)
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}' \
  http://localhost:3000/api/rbac-demo

# Test UPDATE (admin, editor)
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}' \
  http://localhost:3000/api/rbac-demo

# Test DELETE (admin only)
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/rbac-demo
```

### Expected Results

| Role | GET | POST | PUT | DELETE |
|------|-----|------|-----|--------|
| Admin | ✅ 200 | ✅ 201 | ✅ 200 | ✅ 200 |
| Editor | ✅ 200 | ❌ 403 | ✅ 200 | ❌ 403 |
| Viewer | ✅ 200 | ❌ 403 | ❌ 403 | ❌ 403 |
| User | ✅ 200 | ❌ 403 | ❌ 403 | ❌ 403 |

---

## Scalability

### Adding New Roles

1. **Update Role Type**
   ```typescript
   // src/config/roles.ts
   export type Role = 'admin' | 'editor' | 'viewer' | 'user' | 'moderator';
   ```

2. **Define Permissions**
   ```typescript
   export const roles: Record<Role, Permission[]> = {
     // ... existing roles
     moderator: ['read', 'update'], // New role
   };
   ```

3. **Update Resource Permissions**
   ```typescript
   export const resourcePermissions: Record<Role, ResourcePermissions> = {
     // ... existing roles
     moderator: {
       users: ['read', 'update'],
       projects: ['read'],
       tasks: ['create', 'read', 'update'],
     },
   };
   ```

### Adding New Permissions

1. **Update Permission Type**
   ```typescript
   export type Permission = 'create' | 'read' | 'update' | 'delete' | 'approve';
   ```

2. **Add to Roles**
   ```typescript
   admin: ['create', 'read', 'update', 'delete', 'approve'],
   ```

### Adding New Resources

1. **Update ResourcePermissions Interface**
   ```typescript
   export interface ResourcePermissions {
     users: Permission[];
     projects: Permission[];
     tasks: Permission[];
     files: Permission[];
     reports: Permission[]; // New resource
   }
   ```

2. **Define Permissions for Each Role**
   ```typescript
   admin: {
     // ... other resources
     reports: ['create', 'read', 'update', 'delete'],
   },
   ```

### Policy-Based Access Control (Future)

For more complex scenarios, consider policy-based access control:

```typescript
interface AccessPolicy {
  resource: string;
  action: string;
  condition: (user: User, resource: any) => boolean;
}

// Example: Users can only edit their own posts
const editOwnPostPolicy: AccessPolicy = {
  resource: 'posts',
  action: 'update',
  condition: (user, post) => post.authorId === user.id,
};
```

---

## Design Reflections

### Scalability Considerations

1. **Role Hierarchy** - Current flat structure is simple but could be extended to hierarchical roles (e.g., super-admin > admin > moderator)

2. **Permission Inheritance** - Could implement permission inheritance where roles automatically gain permissions from lower roles

3. **Dynamic Permissions** - Currently hardcoded, but could be stored in database for runtime updates

4. **Context-Aware Permissions** - Could add resource-owner checks (e.g., users can edit their own resources)

### Audit & Compliance

1. **Comprehensive Logging** - All access decisions are logged for security audits

2. **Tamper-Proof** - Permissions enforced on server, client cannot bypass

3. **Traceability** - Who did what, when, and with what permission

4. **Compliance Ready** - Structured logs can be exported for compliance reporting

### Adaptation for Complex Systems

1. **Attribute-Based Access Control (ABAC)** - Add user attributes, resource attributes, and environmental conditions

2. **Fine-Grained Permissions** - Split permissions into smaller units (e.g., `users.create`, `users.delete`)

3. **Temporal Access** - Add time-based permissions (e.g., admin only during business hours)

4. **Multi-Tenancy** - Add tenant/organization isolation

5. **Permission Groups** - Group related permissions into bundles

---

## Quick Reference

### Server-Side

```typescript
// Protect API routes
import { requirePermission, requireRole, requireAdmin } from '@/lib/rbac';

export const GET = requirePermission('read', 'users')(handler);
export const POST = requirePermission('create', 'users')(handler);
export const PUT = requirePermission('update', 'users')(handler);
export const DELETE = requireAdmin(handler);

// Conditional checks
const canUpdate = await checkPermission(req, 'update', 'users');
const role = getUserRole(req);
```

### Client-Side

```typescript
// UI Components
import { Can, AdminOnly, RoleGuard } from '@/components/rbac/RBACComponents';

<Can permission="delete"><button>Delete</button></Can>
<AdminOnly><AdminPanel /></AdminOnly>
<RoleGuard allowedRoles={['admin', 'editor']}><Editor /></RoleGuard>

// Utility functions
import { hasPermission, isAdmin } from '@/lib/rbacClient';

if (hasPermission(user?.role, 'delete')) { /* show delete */ }
if (isAdmin(user?.role)) { /* show admin features */ }
```

---

## Support

- **Demo**: Visit `/rbac-demo` for interactive examples
- **Documentation**: This README
- **Code Examples**: See `src/app/api/rbac-demo/route.ts`
- **UI Examples**: See `src/app/rbac-demo/page.tsx`

---

## License

This RBAC implementation is part of the Jeevan-Rakth project.

---

**Last Updated**: December 30, 2025
**Version**: 1.0.0
