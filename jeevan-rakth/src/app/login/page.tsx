"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { ButtonLoader } from "@/components";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        // Successfully logged in
        toast.success("Login successful!", {
          description: "Redirecting to dashboard...",
        });
        setTimeout(() => {
          router.replace("/dashboard");
        }, 500);
      } else {
        toast.error("Login failed", {
          description: "Invalid email or password. Please try again.",
        });
        setLoading(false);
      }
    } catch (err) {
      toast.error("Network error", {
        description:
          "Unable to connect. Please check your connection and try again.",
      });
      console.error("Login error:", err);
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-red-600 mb-6">
          🩸 Jeevan Rakth Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <ButtonLoader
            type="submit"
            isLoading={loading}
            loadingText="Logging in..."
            variant="primary"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3"
          >
            Login
          </ButtonLoader>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-red-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </main>
  );
}
