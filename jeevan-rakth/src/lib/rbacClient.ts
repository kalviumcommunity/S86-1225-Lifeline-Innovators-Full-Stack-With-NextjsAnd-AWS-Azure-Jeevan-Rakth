/**
 * Client-side RBAC Utilities
 *
 * These utilities help with role-based access control on the client side.
 * Note: Client-side checks are for UI purposes only - always enforce on the server!
 */

import {
  type Role,
  type Permission,
  type ResourcePermissions,
} from "@/config/roles";
import {
  hasPermission as serverHasPermission,
  hasResourcePermission as serverHasResourcePermission,
  isAdmin as serverIsAdmin,
  canModify as serverCanModify,
} from "@/config/roles";

export type { Role, Permission, ResourcePermissions };

/**
 * Check if a role has a specific permission (client-side)
 */
export function hasPermission(
  role: Role | undefined | null,
  permission: Permission
): boolean {
  if (!role) return false;
  return serverHasPermission(role, permission);
}

/**
 * Check if a role has permission for a specific resource (client-side)
 */
export function hasResourcePermission(
  role: Role | undefined | null,
  resource: keyof ResourcePermissions,
  permission: Permission
): boolean {
  if (!role) return false;
  return serverHasResourcePermission(role, resource, permission);
}

/**
 * Check if a role is admin (client-side)
 */
export function isAdmin(role: Role | undefined | null): boolean {
  if (!role) return false;
  return serverIsAdmin(role);
}

/**
 * Check if a role can modify content (client-side)
 */
export function canModify(role: Role | undefined | null): boolean {
  if (!role) return false;
  return serverCanModify(role);
}

/**
 * Check if user has one of the allowed roles (client-side)
 */
export function hasRole(
  userRole: Role | undefined | null,
  allowedRoles: Role[]
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}
