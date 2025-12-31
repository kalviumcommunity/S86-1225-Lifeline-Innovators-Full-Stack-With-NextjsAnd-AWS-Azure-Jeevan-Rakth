/**
 * RBAC Demo Page
 *
 * This page demonstrates the RBAC (Role-Based Access Control) system.
 * It shows how different roles have different permissions and UI elements.
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Can,
  Cannot,
  AdminOnly,
  ModifyGuard,
  RoleBasedButtons,
} from "@/components/rbac/RBACComponents";
import { type Role } from "@/lib/rbacClient";

interface RBACInfo {
  role: Role;
  permissions: {
    general: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
    users: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
    projects: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
    tasks: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
  };
}

export default function RBACDemoPage() {
  const { user, isLoading } = useAuth();
  const [rbacInfo, setRbacInfo] = useState<RBACInfo | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<string>("");

  useEffect(() => {
    if (!user) return;

    const fetchRBACInfo = async () => {
      try {
        const response = await fetch("/api/rbac-demo", {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setRbacInfo(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch RBAC info:", error);
      }
    };

    fetchRBACInfo();
  }, [user]);

  const testPermission = async (method: string, permissionName: string) => {
    const endpoint = "/api/rbac-demo";
    setLogs([]);
    setTestResult("");

    try {
      const options: RequestInit = {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (method === "POST" || method === "PUT") {
        options.body = JSON.stringify({
          test: "data",
          timestamp: new Date().toISOString(),
        });
      }

      const response = await fetch(endpoint, options);
      const data = await response.json();

      const logMessage = `${method} ${endpoint} - ${response.status} ${response.statusText}`;
      setLogs((prev) => [...prev, logMessage]);

      if (response.ok) {
        setTestResult(`✅ SUCCESS: ${permissionName} permission ALLOWED`);
        setLogs((prev) => [
          ...prev,
          `✅ ${data.message || "Operation successful"}`,
        ]);
      } else {
        setTestResult(`❌ DENIED: ${permissionName} permission NOT ALLOWED`);
        setLogs((prev) => [...prev, `❌ ${data.message || "Access denied"}`]);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setTestResult(`❌ ERROR: ${errorMsg}`);
      setLogs((prev) => [...prev, `❌ Error: ${errorMsg}`]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Please log in to view this page
          </h1>
          <a href="/login" className="text-blue-500 hover:underline">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">
          🔐 RBAC (Role-Based Access Control) Demo
        </h1>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Current User</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name:</p>
              <p className="font-semibold">{user.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Email:</p>
              <p className="font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Role:</p>
              <p className="font-semibold text-blue-600 text-xl">
                {user.role || "user"}
              </p>
            </div>
          </div>
        </div>

        {/* Permissions Overview */}
        {rbacInfo && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Permissions</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* General Permissions */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  General Permissions
                </h3>
                <ul className="space-y-1">
                  <li>
                    Create: {rbacInfo.permissions.general.create ? "✅" : "❌"}
                  </li>
                  <li>
                    Read: {rbacInfo.permissions.general.read ? "✅" : "❌"}
                  </li>
                  <li>
                    Update: {rbacInfo.permissions.general.update ? "✅" : "❌"}
                  </li>
                  <li>
                    Delete: {rbacInfo.permissions.general.delete ? "✅" : "❌"}
                  </li>
                </ul>
              </div>

              {/* Users Permissions */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Users Resource
                </h3>
                <ul className="space-y-1">
                  <li>
                    Create: {rbacInfo.permissions.users.create ? "✅" : "❌"}
                  </li>
                  <li>Read: {rbacInfo.permissions.users.read ? "✅" : "❌"}</li>
                  <li>
                    Update: {rbacInfo.permissions.users.update ? "✅" : "❌"}
                  </li>
                  <li>
                    Delete: {rbacInfo.permissions.users.delete ? "✅" : "❌"}
                  </li>
                </ul>
              </div>

              {/* Projects Permissions */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Projects Resource
                </h3>
                <ul className="space-y-1">
                  <li>
                    Create: {rbacInfo.permissions.projects.create ? "✅" : "❌"}
                  </li>
                  <li>
                    Read: {rbacInfo.permissions.projects.read ? "✅" : "❌"}
                  </li>
                  <li>
                    Update: {rbacInfo.permissions.projects.update ? "✅" : "❌"}
                  </li>
                  <li>
                    Delete: {rbacInfo.permissions.projects.delete ? "✅" : "❌"}
                  </li>
                </ul>
              </div>

              {/* Tasks Permissions */}
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Tasks Resource
                </h3>
                <ul className="space-y-1">
                  <li>
                    Create: {rbacInfo.permissions.tasks.create ? "✅" : "❌"}
                  </li>
                  <li>Read: {rbacInfo.permissions.tasks.read ? "✅" : "❌"}</li>
                  <li>
                    Update: {rbacInfo.permissions.tasks.update ? "✅" : "❌"}
                  </li>
                  <li>
                    Delete: {rbacInfo.permissions.tasks.delete ? "✅" : "❌"}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* UI Component Demonstrations */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            UI Access Control Examples
          </h2>

          <div className="space-y-6">
            {/* Read Permission */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold mb-2">
                All Authenticated Users (Read Permission)
              </h3>
              <Can permission="read">
                <div className="bg-blue-50 p-3 rounded">
                  ✅ You can see this - all authenticated users have read
                  permission
                </div>
              </Can>
            </div>

            {/* Create Permission */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold mb-2">
                Create Permission (Admin & Editor)
              </h3>
              <Can permission="create">
                <div className="bg-green-50 p-3 rounded">
                  ✅ You have create permission - you&apos;re an admin or
                  editor!
                </div>
              </Can>
              <Cannot permission="create">
                <div className="bg-gray-100 p-3 rounded text-gray-600">
                  ❌ You don&apos;t have create permission - viewers and basic
                  users can&apos;t create
                </div>
              </Cannot>
            </div>

            {/* Update Permission */}
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-semibold mb-2">
                Update Permission (Admin & Editor)
              </h3>
              <Can permission="update">
                <div className="bg-yellow-50 p-3 rounded">
                  ✅ You have update permission - you can modify content!
                </div>
              </Can>
              <Cannot permission="update">
                <div className="bg-gray-100 p-3 rounded text-gray-600">
                  ❌ You don&apos;t have update permission - read-only access
                </div>
              </Cannot>
            </div>

            {/* Delete Permission */}
            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-semibold mb-2">
                Delete Permission (Admin Only)
              </h3>
              <Can permission="delete">
                <div className="bg-red-50 p-3 rounded">
                  ✅ You have delete permission - you&apos;re an admin!
                </div>
              </Can>
              <Cannot permission="delete">
                <div className="bg-gray-100 p-3 rounded text-gray-600">
                  ❌ You don&apos;t have delete permission - only admins can
                  delete
                </div>
              </Cannot>
            </div>

            {/* Admin Only Section */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold mb-2">Admin-Only Content</h3>
              <AdminOnly
                fallback={
                  <div className="bg-gray-100 p-3 rounded text-gray-600">
                    ❌ This section is only visible to administrators
                  </div>
                }
              >
                <div className="bg-purple-50 p-3 rounded">
                  ✅ Welcome, Admin! You have full system access.
                </div>
              </AdminOnly>
            </div>

            {/* Modify Guard */}
            <div className="border-l-4 border-indigo-500 pl-4">
              <h3 className="font-semibold mb-2">
                Content Editors (Admin & Editor)
              </h3>
              <ModifyGuard
                fallback={
                  <div className="bg-gray-100 p-3 rounded text-gray-600">
                    ❌ You can only view content, not modify it
                  </div>
                }
              >
                <div className="bg-indigo-50 p-3 rounded">
                  ✅ You can create and modify content!
                </div>
              </ModifyGuard>
            </div>
          </div>
        </div>

        {/* Role-Based Buttons Demo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Role-Based Action Buttons
          </h2>
          <p className="text-gray-600 mb-4">
            These buttons appear based on your permissions:
          </p>
          <RoleBasedButtons
            userRole={user.role as Role}
            resource="tasks"
            onView={() => alert("View action - available to all")}
            onEdit={() => alert("Edit action - available to admin & editor")}
            onDelete={() => alert("Delete action - available to admin only")}
          />
        </div>

        {/* Permission Testing */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Test API Permissions</h2>
          <p className="text-gray-600 mb-4">
            Click the buttons below to test different permission levels. The
            server will allow or deny based on your role.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => testPermission("GET", "READ")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Read (GET)
            </button>
            <button
              onClick={() => testPermission("POST", "CREATE")}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Test Create (POST)
            </button>
            <button
              onClick={() => testPermission("PUT", "UPDATE")}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Test Update (PUT)
            </button>
            <button
              onClick={() => testPermission("DELETE", "DELETE")}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Test Delete (DELETE)
            </button>
          </div>

          {/* Test Results */}
          {testResult && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Test Result:</h3>
              <div
                className={`p-3 rounded ${testResult.includes("✅") ? "bg-green-50" : "bg-red-50"}`}
              >
                {testResult}
              </div>
            </div>
          )}

          {/* Logs */}
          {logs.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Audit Logs:</h3>
              <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-64 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Documentation Link */}
        <div className="mt-8 text-center text-gray-600">
          <p>
            See the{" "}
            <a href="/README.md" className="text-blue-500 hover:underline">
              README documentation
            </a>{" "}
            for implementation details and security best practices.
          </p>
        </div>
      </div>
    </div>
  );
}
