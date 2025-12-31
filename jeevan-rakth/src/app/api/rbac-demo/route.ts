/**
 * RBAC Demo API Route
 *
 * This route demonstrates all RBAC features including:
 * - Role-based access control
 * - Permission checks
 * - Resource-specific permissions
 * - Audit logging
 */

import { NextRequest } from "next/server";
import {
  requirePermission,
  requireAdmin,
  checkPermission,
  getUserRole,
  RBACLogger,
} from "@/lib/rbac";
import { successResponse, errorResponse } from "@/lib/responseHandler";
import { hasPermission, hasResourcePermission } from "@/config/roles";

/**
 * GET /api/rbac-demo
 *
 * Returns user's role and permissions
 * Accessible by all authenticated users
 */
export const GET = requirePermission("read")(async (req: NextRequest) => {
  try {
    const role = getUserRole(req);

    if (!role) {
      return errorResponse("Unable to determine user role", { status: 401 });
    }

    // Get all permissions for this role
    const permissions = {
      general: {
        create: hasPermission(role, "create"),
        read: hasPermission(role, "read"),
        update: hasPermission(role, "update"),
        delete: hasPermission(role, "delete"),
      },
      users: {
        create: hasResourcePermission(role, "users", "create"),
        read: hasResourcePermission(role, "users", "read"),
        update: hasResourcePermission(role, "users", "update"),
        delete: hasResourcePermission(role, "users", "delete"),
      },
      projects: {
        create: hasResourcePermission(role, "projects", "create"),
        read: hasResourcePermission(role, "projects", "read"),
        update: hasResourcePermission(role, "projects", "update"),
        delete: hasResourcePermission(role, "projects", "delete"),
      },
      tasks: {
        create: hasResourcePermission(role, "tasks", "create"),
        read: hasResourcePermission(role, "tasks", "read"),
        update: hasResourcePermission(role, "tasks", "update"),
        delete: hasResourcePermission(role, "tasks", "delete"),
      },
    };

    return successResponse("RBAC information retrieved", {
      role,
      permissions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[RBAC Demo] Error:", error);
    return errorResponse("Failed to retrieve RBAC information", {
      status: 500,
    });
  }
});

/**
 * POST /api/rbac-demo
 *
 * Create operation - requires 'create' permission
 * Only accessible by admin and editor roles
 */
export const POST = requirePermission("create")(async (req: NextRequest) => {
  try {
    const role = getUserRole(req);
    const body = await req.json();

    RBACLogger.log("ALLOWED", {
      role: role || "unknown",
      permission: "create",
      resource: "rbac-demo",
      endpoint: "/api/rbac-demo (POST)",
    });

    return successResponse(
      "Resource created successfully",
      {
        message: `User with role '${role}' created a resource`,
        data: body,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[RBAC Demo] Error:", error);
    return errorResponse("Failed to create resource", { status: 500 });
  }
});

/**
 * PUT /api/rbac-demo
 *
 * Update operation - requires 'update' permission
 * Accessible by admin and editor roles
 */
export const PUT = requirePermission("update")(async (req: NextRequest) => {
  try {
    const role = getUserRole(req);
    const body = await req.json();

    RBACLogger.log("ALLOWED", {
      role: role || "unknown",
      permission: "update",
      resource: "rbac-demo",
      endpoint: "/api/rbac-demo (PUT)",
    });

    return successResponse("Resource updated successfully", {
      message: `User with role '${role}' updated a resource`,
      data: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[RBAC Demo] Error:", error);
    return errorResponse("Failed to update resource", { status: 500 });
  }
});

/**
 * DELETE /api/rbac-demo
 *
 * Delete operation - requires admin role only
 * Demonstrates role-based restriction (not just permission-based)
 */
export const DELETE = requireAdmin(async (req: NextRequest) => {
  try {
    const role = getUserRole(req);

    RBACLogger.log("ALLOWED", {
      role: role || "unknown",
      permission: "delete",
      resource: "rbac-demo",
      endpoint: "/api/rbac-demo (DELETE)",
    });

    return successResponse("Resource deleted successfully", {
      message: `Admin user deleted a resource`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[RBAC Demo] Error:", error);
    return errorResponse("Failed to delete resource", { status: 500 });
  }
});

/**
 * PATCH /api/rbac-demo
 *
 * Conditional permission check demonstration
 * Shows how to check permissions within the handler
 */
export async function PATCH(req: NextRequest) {
  try {
    const canUpdate = await checkPermission(req, "update");
    const canDelete = await checkPermission(req, "delete");
    const role = getUserRole(req);

    return successResponse("Conditional permission check result", {
      role,
      permissions: {
        canUpdate,
        canDelete,
      },
      message: `User with role '${role}' can ${canUpdate ? "" : "NOT "}update and can ${canDelete ? "" : "NOT "}delete`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[RBAC Demo] Error:", error);
    return errorResponse("Permission check failed", { status: 500 });
  }
}
