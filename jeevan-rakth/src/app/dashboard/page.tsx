"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  // Initialize stats with default values
  // In a real app, you'd fetch this from your API
  const [stats] = useState({
    totalDonors: 245,
    totalRequests: 89,
    successfulMatches: 67,
  });

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome to Jeevan Rakth Blood Donation Management
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Donors</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.totalDonors}
                </p>
              </div>
              <div className="text-4xl">🩸</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Blood Requests</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.totalRequests}
                </p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Successful Matches</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.successfulMatches}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors">
              <p className="font-semibold text-gray-900">Register Donor</p>
              <p className="text-sm text-gray-600 mt-1">Add new blood donor</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <p className="font-semibold text-gray-900">New Request</p>
              <p className="text-sm text-gray-600 mt-1">Create blood request</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
              <p className="font-semibold text-gray-900">View Users</p>
              <p className="text-sm text-gray-600 mt-1">Manage all users</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
              <p className="font-semibold text-gray-900">Reports</p>
              <p className="text-sm text-gray-600 mt-1">View analytics</p>
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            🔒 Protected Route
          </h3>
          <p className="text-red-800">
            This is a protected dashboard page. Only authenticated users with a
            valid JWT token can access this page. If you try to access this URL
            without logging in, you&apos;ll be automatically redirected to the
            login page.
          </p>
        </div>
      </div>
    </main>
  );
}
