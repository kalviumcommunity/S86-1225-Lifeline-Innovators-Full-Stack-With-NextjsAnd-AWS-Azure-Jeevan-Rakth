import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jeevan Rakth - Blood Donation Management",
  description: "Save lives by connecting blood donors with those in need",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Navigation Bar */}
        <nav className="bg-white shadow-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              {/* Logo/Brand */}
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl">🩸</span>
                <span className="text-xl font-bold text-red-600">
                  Jeevan Rakth
                </span>
              </Link>

              {/* Navigation Links */}
              <div className="flex space-x-6">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/users"
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                >
                  Users
                </Link>
                <Link
                  href="/users/1"
                  className="text-gray-700 hover:text-red-600 font-medium transition-colors"
                >
                  User Profile
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        {children}

        {/* Footer */}
        <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-sm">
                © 2024 Jeevan Rakth. All rights reserved.
              </p>
              <div className="flex space-x-4 text-sm text-gray-600">
                <a href="#" className="hover:text-red-600">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-red-600">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-red-600">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
