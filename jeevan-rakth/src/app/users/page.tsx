"use client";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import AddUser from "./AddUser";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  bloodType?: string;
}

export default function UsersPage() {
  const {
    data: users,
    error,
    isLoading,
  } = useSWR<User[]>("/api/users", fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 10000, // Auto-refresh every 10 seconds
  });

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Failed to load users</p>
          <p className="text-sm mt-2">{error.message}</p>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            View and manage all registered users in the system
          </p>
        </div>

        {/* Add User Component */}
        <AddUser />

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blood Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-semibold">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      {user.bloodType || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/users/${user.id}`}
                      className="text-red-600 hover:text-red-900"
                    >
                      View Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🔒 Protected Route with SWR
          </h3>
          <p className="text-blue-800">
            This users listing page uses SWR for data fetching with automatic
            caching and revalidation. Data auto-refreshes every 10 seconds and
            when you refocus the tab.
          </p>
        </div>
      </div>
    </main>
  );
}
