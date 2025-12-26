"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow-md">
      <h1 className="font-semibold text-lg">Jeevan Rakth</h1>
      <nav
        className="flex gap-4"
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
          href="/users"
          className="hover:underline focus:outline-none focus:ring-2 focus:ring-white rounded px-2 py-1"
        >
          Users
        </Link>
      </nav>
    </header>
  );
}
