"use client";
import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";

export default function Home() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useUI();

  return (
    <main
      className={`p-6 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}
    >
      <h1 className="text-3xl font-bold mb-6">Context & Hooks Demo</h1>

      <section className="mb-8 p-6 border rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Auth State</h2>
        {isAuthenticated && user ? (
          <>
            <p className="mb-2">
              ✅ Logged in as: <strong>{user.name}</strong>
            </p>
            <p className="mb-4">Email: {user.email}</p>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <p className="mb-4">❌ Not logged in</p>
            <button
              onClick={() => login("demo@example.com", "password123")}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
            >
              Demo Login
            </button>
          </>
        )}
      </section>

      <section className="mb-8 p-6 border rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">UI Controls</h2>
        <div className="space-y-4">
          <div>
            <p className="mb-2">
              Current Theme: <strong>{theme}</strong>
            </p>
            <button
              onClick={toggleTheme}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              Toggle Theme
            </button>
          </div>

          <div>
            <p className="mb-2">
              Sidebar: <strong>{sidebarOpen ? "Open" : "Closed"}</strong>
            </p>
            <button
              onClick={toggleSidebar}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded transition-colors"
            >
              {sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            </button>
          </div>
        </div>
      </section>

      <section className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <h2 className="text-2xl font-semibold mb-4">Console Log Output</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Check your browser console to see real-time state changes:
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-300">
          <li>User logged in/logged out messages</li>
          <li>Theme toggled messages</li>
          <li>Sidebar opened/closed messages</li>
        </ul>
      </section>
    </main>
  );
}
