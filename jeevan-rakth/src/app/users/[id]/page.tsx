"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  bloodType: string;
  phone: string;
  address: string;
  lastDonation?: string;
  totalDonations: number;
}

interface Props {
  params: { id: string };
}

export default function UserProfilePage({ params }: Props) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        // Mock user data - in a real app, you'd fetch from your API
        const mockUsers: Record<string, UserProfile> = {
          "1": {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            role: "donor",
            bloodType: "A+",
            phone: "+1 (555) 123-4567",
            address: "123 Main St, City, State 12345",
            lastDonation: "2024-12-01",
            totalDonations: 5,
          },
          "2": {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            role: "donor",
            bloodType: "O-",
            phone: "+1 (555) 234-5678",
            address: "456 Oak Ave, Town, State 54321",
            lastDonation: "2024-11-15",
            totalDonations: 8,
          },
          "3": {
            id: "3",
            name: "Admin User",
            email: "admin@example.com",
            role: "admin",
            bloodType: "B+",
            phone: "+1 (555) 345-6789",
            address: "789 Pine Rd, Village, State 67890",
            totalDonations: 0,
          },
          "4": {
            id: "4",
            name: "Bob Johnson",
            email: "bob@example.com",
            role: "donor",
            bloodType: "AB+",
            phone: "+1 (555) 456-7890",
            address: "321 Elm St, City, State 11111",
            lastDonation: "2024-12-10",
            totalDonations: 12,
          },
          "5": {
            id: "5",
            name: "Alice Williams",
            email: "alice@example.com",
            role: "donor",
            bloodType: "O+",
            phone: "+1 (555) 567-8901",
            address: "654 Maple Dr, Town, State 22222",
            lastDonation: "2024-12-05",
            totalDonations: 3,
          },
        };

        const userData = mockUsers[params.id];

        if (!userData) {
          setError("User not found");
          setLoading(false);
          return;
        }

        setUser(userData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load user profile");
        setLoading(false);
        console.error("Error fetching user:", err);
      }
    }

    fetchUserProfile();
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-red-600 mb-4">
            {error || "User not found"}
          </p>
          <Link href="/users" className="text-blue-600 hover:underline">
            ← Back to Users
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-red-600">
            Home
          </Link>
          {" / "}
          <Link href="/users" className="hover:text-red-600">
            Users
          </Link>
          {" / "}
          <span className="text-gray-900 font-medium">{user.name}</span>
        </nav>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-red-500 to-red-600 h-32"></div>
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-16 mb-4">
              <div className="h-32 w-32 rounded-full border-4 border-white bg-red-100 flex items-center justify-center">
                <span className="text-4xl font-bold text-red-600">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="ml-6 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.name}
                </h1>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* Role Badge */}
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  user.role === "admin"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {user.role.toUpperCase()}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                Blood Type: {user.bloodType}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-gray-900 font-medium">{user.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="text-gray-900 font-medium">{user.address}</p>
              </div>
            </div>
          </div>

          {/* Donation Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Donation Statistics
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Total Donations</p>
                <p className="text-3xl font-bold text-red-600">
                  {user.totalDonations}
                </p>
              </div>
              {user.lastDonation && (
                <div>
                  <p className="text-sm text-gray-600">Last Donation</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(user.lastDonation).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Blood Type</p>
                <p className="text-2xl font-bold text-red-600">
                  {user.bloodType}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors">
              Schedule Donation
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
              Send Message
            </button>
            <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors">
              View History
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            🔗 Dynamic Route
          </h3>
          <p className="text-green-800">
            This is a dynamic route page accessed via{" "}
            <code className="bg-green-100 px-2 py-1 rounded">
              /users/{params.id}
            </code>
            . The user ID ({params.id}) is extracted from the URL and used to
            fetch the corresponding user data. Try navigating to different user
            IDs like /users/1, /users/2, etc.
          </p>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <Link
            href="/users"
            className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            ← Back to Users
          </Link>
        </div>
      </div>
    </main>
  );
}
