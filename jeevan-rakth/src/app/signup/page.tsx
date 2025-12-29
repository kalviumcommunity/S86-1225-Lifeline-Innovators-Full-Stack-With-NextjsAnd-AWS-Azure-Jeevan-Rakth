"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

// 1. Define validation schema
const signupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// 2. Derive TypeScript types
type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const router = useRouter();
  const { signup } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      const success = await signup(data.name, data.email, data.password);

      if (success) {
        // Successfully signed up, redirect to dashboard
        router.push("/dashboard");
      } else {
        setError("root", {
          message: "Signup failed. Email may already exist.",
        });
      }
    } catch (err) {
      setError("root", {
        message: "Network error. Please try again.",
      });
      console.error("Signup error:", err);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-red-600 mb-6">
          🩸 Jeevan Rakth Sign Up
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              {...register("name")}
              aria-invalid={errors.name ? "true" : "false"}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.name.message}
              </p>
            )}
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
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.email.message}
              </p>
            )}
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
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {errors.root && (
            <div
              className="p-3 text-sm text-red-700 bg-red-100 rounded-md"
              role="alert"
            >
              {errors.root.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold px-6 py-3 rounded-md transition-colors disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-red-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </main>
  );
}
