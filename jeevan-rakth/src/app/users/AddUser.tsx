"use client";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  bloodType?: string;
}

export default function AddUser() {
  const { data: users } = useSWR<User[]>("/api/users", fetcher);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const addUser = async () => {
    if (!name || !email) {
      setMessage("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      // Optimistic update - add user to UI immediately
      const optimisticUser: User = {
        id: `temp-${Date.now()}`,
        name,
        email,
        role: "user",
        bloodType: undefined,
      };

      // Update cache optimistically (false = don't revalidate immediately)
      if (users) {
        mutate("/api/users", [...users, optimisticUser], false);
      }

      // Actual API call
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        throw new Error("Failed to add user");
      }

      // Revalidate to get real data from server
      await mutate("/api/users");

      setMessage("✅ User added successfully!");
      setName("");
      setEmail("");
      setTimeout(() => {
        setMessage("");
        setShowForm(false);
      }, 2000);
    } catch (error) {
      console.error("Error adding user:", error);
      setMessage("❌ Failed to add user. Please try again.");
      // Revalidate to restore original state
      mutate("/api/users");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          {showForm ? "Cancel" : "+ Add User"}
        </button>
      </div>

      {showForm && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter user name"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user email"
              disabled={isSubmitting}
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded ${
                message.includes("✅")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <button
            onClick={addUser}
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors font-medium"
          >
            {isSubmitting ? "Adding..." : "Add User"}
          </button>

          <div className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded p-3">
            <strong>Optimistic UI Demo:</strong> When you click &quot;Add
            User&quot;, the UI updates immediately before the API responds,
            providing instant feedback!
          </div>
        </div>
      )}
    </div>
  );
}
