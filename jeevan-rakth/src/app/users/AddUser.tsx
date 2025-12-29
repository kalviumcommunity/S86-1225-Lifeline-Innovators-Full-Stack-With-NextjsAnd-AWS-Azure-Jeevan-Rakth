"use client";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import { useToast } from "@/hooks/useToast";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { ButtonLoader } from "@/components";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  bloodType?: string;
}

export default function AddUser() {
  const { data: users } = useSWR<User[]>("/api/users", fetcher);
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const addUser = async () => {
    if (!name || !email) {
      toast.warning("Missing information", {
        description: "Please fill in all required fields.",
      });
      return;
    }

    const confirmed = await confirm({
      title: "Add New User",
      message: `Are you sure you want to add ${name} (${email}) to the system?`,
      confirmText: "Add User",
      variant: "default",
    });

    if (!confirmed) {
      toast.info("Action cancelled");
      return;
    }

    setIsSubmitting(true);

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

      // Show optimistic feedback
      toast.loading("Adding user...", { duration: 1000 });

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

      toast.success("User added successfully!", {
        description: `${name} has been added to the system.`,
      });
      setName("");
      setEmail("");
      setTimeout(() => {
        setShowForm(false);
      }, 500);
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user", {
        description: "Please check your connection and try again.",
      });
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

          <ButtonLoader
            onClick={addUser}
            isLoading={isSubmitting}
            loadingText="Adding..."
            variant="primary"
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 font-medium"
          >
            Add User
          </ButtonLoader>

          <div className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded p-3">
            <strong>Optimistic UI Demo:</strong> When you click &quot;Add
            User&quot;, the UI updates immediately before the API responds,
            providing instant feedback!
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
}
