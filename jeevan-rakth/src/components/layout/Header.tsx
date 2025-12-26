"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, toggleSidebar } = useUI();

  return (
    <header className="w-full bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="hover:bg-blue-700 px-3 py-1 rounded transition-colors"
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <h1 className="font-semibold text-lg">Jeevan Rakth</h1>
      </div>

      <nav
        className="flex gap-4 items-center"
        role="navigation"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="hover:underline focus:outline-none focus:ring-2 focus:ring-white rounded px-2 py-1"
        >
          Home
        </Link>
        <Link
          href="/dashboard"
          className="hover:underline focus:outline-none focus:ring-2 focus:ring-white rounded px-2 py-1"
        >
          Dashboard
        </Link>
        <Link
          href="/demo"
          className="hover:underline focus:outline-none focus:ring-2 focus:ring-white rounded px-2 py-1"
        >
          Demo
        </Link>

        <button
          onClick={toggleTheme}
          className="hover:bg-blue-700 px-3 py-1 rounded transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "🌞" : "🌙"}
        </button>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-2">
            <span className="text-sm">👤 {user.name}</span>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm transition-colors"
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
