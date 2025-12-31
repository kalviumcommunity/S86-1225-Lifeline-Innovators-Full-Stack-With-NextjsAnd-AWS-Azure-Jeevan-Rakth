# 🔐 RBAC Quick Reference

## Roles & Permissions Table

| Role | Create | Read | Update | Delete | Use Case |
|------|--------|------|--------|--------|----------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | Full system access |
| **Editor** | ❌ | ✅ | ✅ | ❌ | Content management |
| **Viewer** | ❌ | ✅ | ❌ | ❌ | Read-only access |
| **User** | ❌ | ✅ | ❌ | ❌ | Basic user access |

## Server-Side Protection

```typescript
// Require specific permission
export const GET = requirePermission('read', 'users')(async (req) => {
  // Handler logic
});

// Require specific role
export const POST = requireRole(['admin', 'editor'])(async (req) => {
  // Handler logic
});

// Admin only
export const DELETE = requireAdmin(async (req) => {
  // Handler logic
});

// Conditional check inside handler
const canUpdate = await checkPermission(req, 'update', 'users');
```

## Client-Side Components

```tsx
// Permission-based rendering
<Can permission="delete">
  <DeleteButton />
</Can>

// Inverse check
<Cannot permission="create">
  <UpgradeMessage />
</Cannot>

// Role-based rendering
<RoleGuard allowedRoles={['admin', 'editor']}>
  <Editor />
</RoleGuard>

// Admin only
<AdminOnly>
  <AdminPanel />
</AdminOnly>

// Modify access (admin & editor)
<ModifyGuard>
  <EditButton />
</ModifyGuard>

// Adaptive buttons
<RoleBasedButtons
  userRole={user?.role}
  resource="tasks"
  onView={handleView}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## Utility Functions

```typescript
// Check permission
if (hasPermission(userRole, 'delete')) {
  // Show delete UI
}

// Check resource permission
if (hasResourcePermission(userRole, 'tasks', 'update')) {
  // Show edit task UI
}

// Check if admin
if (isAdmin(userRole)) {
  // Show admin features
}

// Check if can modify
if (canModify(userRole)) {
  // Show edit features
}
```

## Change User Role (SQL)

```sql
-- Make user an admin
UPDATE "User" SET role = 'admin' WHERE email = 'user@example.com';

-- Make user an editor
UPDATE "User" SET role = 'editor' WHERE email = 'user@example.com';

-- Make user a viewer
UPDATE "User" SET role = 'viewer' WHERE email = 'user@example.com';
```

## Testing

```bash
# Run automated tests
npx tsx scripts/test-rbac.ts

# Test API endpoints with curl
TOKEN="your_access_token"

# GET (all roles)
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/rbac-demo

# POST (admin, editor)
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}' \
  http://localhost:3000/api/rbac-demo

# DELETE (admin only)
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/rbac-demo
```

## Demo & Documentation

- **Interactive Demo**: Visit `/rbac-demo` after logging in
- **Full Guide**: See `RBAC_GUIDE.md`
- **Implementation Summary**: See `RBAC_IMPLEMENTATION_SUMMARY.md`

## Expected API Responses

| Role | GET | POST | PUT | DELETE |
|------|-----|------|-----|--------|
| Admin | ✅ 200 | ✅ 201 | ✅ 200 | ✅ 200 |
| Editor | ✅ 200 | ❌ 403 | ✅ 200 | ❌ 403 |
| Viewer | ✅ 200 | ❌ 403 | ❌ 403 | ❌ 403 |
| User | ✅ 200 | ❌ 403 | ❌ 403 | ❌ 403 |

## Audit Logs

All access decisions are automatically logged:

```
✅ [RBAC] admin ALLOWED to access users with permission: delete | User: 123
❌ [RBAC] viewer DENIED to access users with permission: delete | User: 456
```

## Quick Troubleshooting

**Permission Denied?**
- Check user role in database
- Verify JWT token contains role
- Check server console for audit logs

**UI not updating?**
- User role is in JWT payload
- Client components use `useAuth()` hook
- Server-side protection is separate

**Need to add new role?**
1. Update `Role` type in `src/config/roles.ts`
2. Add to `roles` and `resourcePermissions`
3. Run tests: `npx tsx scripts/test-rbac.ts`
