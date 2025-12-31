/**
 * RBAC UI Components
 *
 * Reusable components for implementing role-based access control in the UI.
 * These components conditionally render children based on user permissions.
 *
 * Security Note: These are UI helpers only - always enforce permissions on the server!
 */

"use client";

import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  hasPermission,
  hasResourcePermission,
  isAdmin,
  canModify,
  hasRole,
  type Role,
  type Permission,
  type ResourcePermissions,
} from "@/lib/rbacClient";

interface CanProps {
  /** The permission required to render children */
  permission: Permission;
  /** Optional resource type for granular permission check */
  resource?: keyof ResourcePermissions;
  /** Content to render if user has permission */
  children: ReactNode;
  /** Optional fallback content if user lacks permission */
  fallback?: ReactNode;
}

/**
 * Can Component
 *
 * Conditionally renders children based on user's permission.
 *
 * @example
 * <Can permission="delete">
 *   <button>Delete</button>
 * </Can>
 *
 * @example
 * <Can permission="update" resource="tasks">
 *   <button>Edit Task</button>
 * </Can>
 */
export function Can({
  permission,
  resource,
  children,
  fallback = null,
}: CanProps) {
  const { user } = useAuth();
  const userRole = user?.role as Role | undefined;

  const hasAccess = resource
    ? hasResourcePermission(userRole, resource, permission)
    : hasPermission(userRole, permission);

  return <>{hasAccess ? children : fallback}</>;
}

interface CannotProps {
  /** The permission that should NOT be present */
  permission: Permission;
  /** Optional resource type for granular permission check */
  resource?: keyof ResourcePermissions;
  /** Content to render if user lacks permission */
  children: ReactNode;
}

/**
 * Cannot Component
 *
 * Inverse of Can - renders children only if user LACKS the permission.
 * Useful for showing "upgrade" messages or disabled states.
 *
 * @example
 * <Cannot permission="delete">
 *   <p>You don't have permission to delete items</p>
 * </Cannot>
 */
export function Cannot({ permission, resource, children }: CannotProps) {
  const { user } = useAuth();
  const userRole = user?.role as Role | undefined;

  const hasAccess = resource
    ? hasResourcePermission(userRole, resource, permission)
    : hasPermission(userRole, permission);

  return <>{!hasAccess ? children : null}</>;
}

interface RoleGuardProps {
  /** Roles allowed to view the content */
  allowedRoles: Role[];
  /** Content to render if user has one of the allowed roles */
  children: ReactNode;
  /** Optional fallback content if user lacks role */
  fallback?: ReactNode;
}

/**
 * RoleGuard Component
 *
 * Conditionally renders children based on user's role.
 *
 * @example
 * <RoleGuard allowedRoles={['admin', 'editor']}>
 *   <AdminPanel />
 * </RoleGuard>
 */
export function RoleGuard({
  allowedRoles,
  children,
  fallback = null,
}: RoleGuardProps) {
  const { user } = useAuth();
  const userRole = user?.role as Role | undefined;

  const hasAccess = hasRole(userRole, allowedRoles);

  return <>{hasAccess ? children : fallback}</>;
}

interface AdminOnlyProps {
  /** Content to render if user is admin */
  children: ReactNode;
  /** Optional fallback content if user is not admin */
  fallback?: ReactNode;
}

/**
 * AdminOnly Component
 *
 * Shorthand for RoleGuard with only admin role.
 *
 * @example
 * <AdminOnly>
 *   <button>Delete All Users</button>
 * </AdminOnly>
 */
export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { user } = useAuth();
  const userRole = user?.role as Role | undefined;

  return <>{isAdmin(userRole) ? children : fallback}</>;
}

interface ModifyGuardProps {
  /** Content to render if user can modify (admin or editor) */
  children: ReactNode;
  /** Optional fallback content if user cannot modify */
  fallback?: ReactNode;
}

/**
 * ModifyGuard Component
 *
 * Renders children only if user can modify content (admin or editor).
 *
 * @example
 * <ModifyGuard>
 *   <button>Edit</button>
 * </ModifyGuard>
 */
export function ModifyGuard({ children, fallback = null }: ModifyGuardProps) {
  const { user } = useAuth();
  const userRole = user?.role as Role | undefined;

  return <>{canModify(userRole) ? children : fallback}</>;
}

interface RoleBasedButtonsProps {
  /** User's current role */
  userRole?: Role | null;
  /** Handler for view action */
  onView?: () => void;
  /** Handler for edit action */
  onEdit?: () => void;
  /** Handler for delete action */
  onDelete?: () => void;
  /** Optional resource type for granular permissions */
  resource?: keyof ResourcePermissions;
  /** Optional className for styling */
  className?: string;
}

/**
 * RoleBasedButtons Component
 *
 * Pre-built button set that adapts to user's role and permissions.
 *
 * @example
 * <RoleBasedButtons
 *   userRole={user?.role}
 *   resource="tasks"
 *   onView={() => viewTask(id)}
 *   onEdit={() => editTask(id)}
 *   onDelete={() => deleteTask(id)}
 * />
 */
export function RoleBasedButtons({
  userRole,
  onView,
  onEdit,
  onDelete,
  resource,
  className = "",
}: RoleBasedButtonsProps) {
  const role = userRole as Role | undefined;

  const canRead = resource
    ? hasResourcePermission(role, resource, "read")
    : hasPermission(role, "read");

  const canUpdate = resource
    ? hasResourcePermission(role, resource, "update")
    : hasPermission(role, "update");

  const canDelete = resource
    ? hasResourcePermission(role, resource, "delete")
    : hasPermission(role, "delete");

  return (
    <div className={`flex gap-2 ${className}`}>
      {canRead && onView && (
        <button
          onClick={onView}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          View
        </button>
      )}
      {canUpdate && onEdit && (
        <button
          onClick={onEdit}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Edit
        </button>
      )}
      {canDelete && onDelete && (
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Delete
        </button>
      )}
    </div>
  );
}
