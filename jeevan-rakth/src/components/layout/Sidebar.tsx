"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/users", label: "Users" },
    { href: "/upload", label: "Upload Files" },
  ];

  return (
    <aside
      className="w-64 h-screen bg-gray-100 border-r p-4"
      role="navigation"
      aria-label="Sidebar navigation"
    >
      <h2 className="text-lg font-bold mb-4 text-gray-800">Navigation</h2>
      <ul className="space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block px-3 py-2 rounded transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
