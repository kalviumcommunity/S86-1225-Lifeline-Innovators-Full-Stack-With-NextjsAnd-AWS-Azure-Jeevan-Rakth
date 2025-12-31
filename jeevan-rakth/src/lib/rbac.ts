/**
 * RBAC Middleware and Utilities
 *
 * This module provides middleware functions and utilities for enforcing
 * role-based access control in API routes and application logic.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, DecodedToken } from "@/lib/jwt";
import {
  hasPermission,
  hasResourcePermission,
  type Permission,
  type Role,
  type ResourcePermissions,
} from "@/config/roles";
import { errorResponse } from "@/lib/responseHandler";

/**
 * RBAC Audit Logger
 *
 * Logs all permission checks and access decisions for security auditing.
 */
export class RBACLogger {
  /**
   * Log an access decision
   *
   * @param decision - The access decision (ALLOWED or DENIED)
   * @param context - Additional context about the access attempt
   */
  static log(
    decision: "ALLOWED" | "DENIED",
    context: {
      role: string;
      resource?: string;
      permission?: string;
      userId?: string;
      endpoint?: string;
      timestamp?: Date;
    }
  ): void {
    // Log entry structure for future logging service integration
    // const logEntry = {
    //   timestamp: (context.timestamp || new Date()).toISOString(),
    //   decision,
    //   ...context,
    // };

    // Log to console (in production, send to logging service)
    const emoji = decision === "ALLOWED" ? "✅" : "❌";
    console.log(
      `${emoji} [RBAC] ${context.role} ${decision} to access ${context.resource || context.endpoint} ` +
        `with permission: ${context.permission || "N/A"} | User: ${context.userId || "N/A"}`
    );

    // In production, you would send this to a logging service
    // Example: await sendToLoggingService(logEntry);
  }

  /**
   * Log a permission check
   */
  static logPermissionCheck(
    role: string,
    permission: Permission,
    resource: string | undefined,
    allowed: boolean,
    userId?: string
  ): void {
    this.log(allowed ? "ALLOWED" : "DENIED", {
      role,
      permission,
      resource,
      userId,
    });
  }

  /**
   * Log an endpoint access attempt
   */
  static logEndpointAccess(
    role: string,
    endpoint: string,
    allowed: boolean,
    userId?: string
  ): void {
    this.log(allowed ? "ALLOWED" : "DENIED", {
      role,
      endpoint,
      userId,
    });
  }
}

/**
 * Extract user from request
 *
 * Extracts and verifies the user's JWT token from the request.
 * Supports both Authorization header and cookie-based authentication.
 *
 * @param req - The Next.js request object
 * @returns Decoded token with user information
 * @throws Error if token is missing or invalid
 */
export function extractUserFromRequest(
  req: NextRequest | Request
): DecodedToken {
  // Try to get token from Authorization header
  let token: string | undefined;

  if ("headers" in req && typeof req.headers.get === "function") {
    const authHeader = req.headers.get("authorization");
    token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : undefined;
  }

  // Fallback to cookie if available (NextRequest)
  if (!token && "cookies" in req && typeof req.cookies.get === "function") {
    token = (req as NextRequest).cookies.get("accessToken")?.value;
  }

  if (!token) {
    throw new Error("Access token missing");
  }

  return verifyAccessToken(token);
}

/**
 * Require Permission Middleware
 *
 * Higher-order function that creates middleware to check if the user
 * has the required permission.
 *
 * @param permission - The required permission
 * @param resource - Optional resource type for granular control
 * @returns Middleware function
 *
 * @example
 * export const GET = requirePermission('read')(async (req) => {
 *   // Handler logic
 * });
 */
export function requirePermission(
  permission: Permission,
  resource?: keyof ResourcePermissions
) {
  return function (
    handler: (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>
  ) {
    return async function (
      req: NextRequest,
      ...args: unknown[]
    ): Promise<NextResponse> {
      try {
        const user = extractUserFromRequest(req);
        const userRole = user.role as Role;

        let hasAccess = false;

        if (resource) {
          hasAccess = hasResourcePermission(userRole, resource, permission);
        } else {
          hasAccess = hasPermission(userRole, permission);
        }

        // Log the permission check
        RBACLogger.logPermissionCheck(
          userRole,
          permission,
          resource,
          hasAccess,
          user.id
        );

        if (!hasAccess) {
          return errorResponse("Access denied: insufficient permissions", {
            status: 403,
          });
        }

        return await handler(req, ...args);
      } catch (error) {
        console.error("[RBAC] Permission check error:", error);
        return errorResponse(
          error instanceof Error ? error.message : "Authentication failed",
          { status: 401 }
        );
      }
    };
  };
}

/**
 * Require Role Middleware
 *
 * Higher-order function that creates middleware to check if the user
 * has one of the required roles.
 *
 * @param allowedRoles - Array of roles that are allowed
 * @returns Middleware function
 *
 * @example
 * export const DELETE = requireRole(['admin'])(async (req) => {
 *   // Only admins can access this
 * });
 */
export function requireRole(allowedRoles: Role[]) {
  return function (
    handler: (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>
  ) {
    return async function (
      req: NextRequest,
      ...args: unknown[]
    ): Promise<NextResponse> {
      try {
        const user = extractUserFromRequest(req);
        const userRole = user.role as Role;

        const hasAccess = allowedRoles.includes(userRole);

        // Log the role check
        RBACLogger.log(hasAccess ? "ALLOWED" : "DENIED", {
          role: userRole,
          endpoint: req.url,
          userId: user.id,
        });

        if (!hasAccess) {
          return errorResponse(
            `Access denied: role '${userRole}' not authorized`,
            {
              status: 403,
            }
          );
        }

        return await handler(req, ...args);
      } catch (error) {
        console.error("[RBAC] Role check error:", error);
        return errorResponse(
          error instanceof Error ? error.message : "Authentication failed",
          { status: 401 }
        );
      }
    };
  };
}

/**
 * Require Admin Middleware
 *
 * Shorthand middleware that requires admin role.
 *
 * @example
 * export const DELETE = requireAdmin(async (req) => {
 *   // Only admins can access this
 * });
 */
export const requireAdmin = requireRole(["admin"]);

/**
 * Require Modify Permission Middleware
 *
 * Shorthand middleware that requires admin or editor role.
 *
 * @example
 * export const PUT = requireModify(async (req) => {
 *   // Admins and editors can access this
 * });
 */
export const requireModify = requireRole(["admin", "editor"]);

/**
 * Check Permission Utility
 *
 * Utility function to check if a user has a specific permission.
 * Can be used inside route handlers for conditional logic.
 *
 * @param req - The request object
 * @param permission - The permission to check
 * @param resource - Optional resource type
 * @returns boolean indicating if user has permission
 *
 * @example
 * const canDelete = await checkPermission(req, 'delete', 'users');
 * if (canDelete) {
 *   // Perform delete operation
 * }
 */
export async function checkPermission(
  req: NextRequest | Request,
  permission: Permission,
  resource?: keyof ResourcePermissions
): Promise<boolean> {
  try {
    const user = extractUserFromRequest(req);
    const userRole = user.role as Role;

    let hasAccess = false;

    if (resource) {
      hasAccess = hasResourcePermission(userRole, resource, permission);
    } else {
      hasAccess = hasPermission(userRole, permission);
    }

    // Log the permission check
    RBACLogger.logPermissionCheck(
      userRole,
      permission,
      resource,
      hasAccess,
      user.id
    );

    return hasAccess;
  } catch (error) {
    console.error("[RBAC] Permission check error:", error);
    return false;
  }
}

/**
 * Get User Role from Request
 *
 * Extracts the user's role from the request.
 *
 * @param req - The request object
 * @returns The user's role or null if not authenticated
 */
export function getUserRole(req: NextRequest | Request): Role | null {
  try {
    const user = extractUserFromRequest(req);
    return user.role as Role;
  } catch {
    return null;
  }
}

/**
 * Get User ID from Request
 *
 * Extracts the user's ID from the request.
 *
 * @param req - The request object
 * @returns The user's ID or null if not authenticated
 */
export function getUserId(req: NextRequest | Request): string | null {
  try {
    const user = extractUserFromRequest(req);
    return user.id;
  } catch {
    return null;
  }
}
