/**
 * RBAC (Role-Based Access Control) Configuration
 *
 * This file defines the roles and their associated permissions for the application.
 * It follows a hierarchical permission model where admin has all permissions,
 * editor has read/update permissions, and viewer has read-only access.
 *
 * Permission Types:
 * - create: Create new resources
 * - read: View/read existing resources
 * - update: Modify existing resources
 * - delete: Remove resources
 */

export type Permission = "create" | "read" | "update" | "delete";
export type Role = "admin" | "editor" | "viewer" | "user";

/**
 * Role-based Permission Mapping
 *
 * Each role is assigned a set of permissions that define what actions
 * users with that role can perform.
 */
export const roles: Record<Role, Permission[]> = {
  admin: ["create", "read", "update", "delete"],
  editor: ["read", "update"],
  viewer: ["read"],
  user: ["read"], // Default role for authenticated users
};

/**
 * Resource-specific permissions (optional granular control)
 *
 * You can define resource-specific permissions for more fine-grained control.
 * For example, an editor might be able to update tasks but not projects.
 */
export interface ResourcePermissions {
  users: Permission[];
  projects: Permission[];
  tasks: Permission[];
  teams: Permission[];
  files: Permission[];
  orders: Permission[];
}

/**
 * Role-based Resource Permissions
 *
 * Define what each role can do on specific resources.
 * This provides granular control beyond the general permissions.
 */
export const resourcePermissions: Record<Role, ResourcePermissions> = {
  admin: {
    users: ["create", "read", "update", "delete"],
    projects: ["create", "read", "update", "delete"],
    tasks: ["create", "read", "update", "delete"],
    teams: ["create", "read", "update", "delete"],
    files: ["create", "read", "update", "delete"],
    orders: ["create", "read", "update", "delete"],
  },
  editor: {
    users: ["read"],
    projects: ["read", "update"],
    tasks: ["create", "read", "update"],
    teams: ["read"],
    files: ["create", "read", "update"],
    orders: ["read", "update"],
  },
  viewer: {
    users: ["read"],
    projects: ["read"],
    tasks: ["read"],
    teams: ["read"],
    files: ["read"],
    orders: ["read"],
  },
  user: {
    users: ["read"], // Can only read own profile
    projects: ["read"],
    tasks: ["read", "update"], // Can update own tasks
    teams: ["read"],
    files: ["read"],
    orders: ["create", "read"], // Can create and view own orders
  },
};

/**
 * Check if a role has a specific permission
 *
 * @param role - The user's role
 * @param permission - The permission to check
 * @returns boolean indicating if the role has the permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return roles[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has permission for a specific resource
 *
 * @param role - The user's role
 * @param resource - The resource type
 * @param permission - The permission to check
 * @returns boolean indicating if the role has the permission for the resource
 */
export function hasResourcePermission(
  role: Role,
  resource: keyof ResourcePermissions,
  permission: Permission
): boolean {
  return resourcePermissions[role]?.[resource]?.includes(permission) ?? false;
}

/**
 * Get all permissions for a role
 *
 * @param role - The user's role
 * @returns array of permissions for the role
 */
export function getRolePermissions(role: Role): Permission[] {
  return roles[role] ?? [];
}

/**
 * Check if a role can access admin-only features
 *
 * @param role - The user's role
 * @returns boolean indicating if the role is admin
 */
export function isAdmin(role: Role): boolean {
  return role === "admin";
}

/**
 * Check if a role can modify content (editor or admin)
 *
 * @param role - The user's role
 * @returns boolean indicating if the role can modify content
 */
export function canModify(role: Role): boolean {
  return role === "admin" || role === "editor";
}

/**
 * Validate if a role exists in the system
 *
 * @param role - The role to validate
 * @returns boolean indicating if the role is valid
 */
export function isValidRole(role: string): role is Role {
  return ["admin", "editor", "viewer", "user"].includes(role);
}
