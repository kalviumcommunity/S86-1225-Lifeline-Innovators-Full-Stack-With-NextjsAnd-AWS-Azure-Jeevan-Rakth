"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-10 w-20 items-center rounded-full bg-gray-300 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
      aria-label="Toggle theme"
      role="switch"
      aria-checked={theme === "dark"}
    >
      <span
        className={`inline-block h-8 w-8 transform rounded-full bg-white dark:bg-gray-900 shadow-lg transition-transform duration-300 ease-in-out ${
          theme === "dark" ? "translate-x-10" : "translate-x-1"
        }`}
      >
        <span className="flex h-full w-full items-center justify-center text-sm">
          {theme === "dark" ? "🌙" : "☀️"}
        </span>
      </span>
    </button>
  );
}
