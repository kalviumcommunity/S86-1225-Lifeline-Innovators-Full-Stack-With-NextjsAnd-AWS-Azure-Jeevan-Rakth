import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-gray-100">
      <div className="text-center px-4">
        {/* Error Icon */}
        <div className="mb-8">
          <span className="text-9xl">🔍</span>
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>

        {/* Error Message */}
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">
          Page Not Found
        </h2>

        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Oops! The page you&apos;re looking for doesn&apos;t exist. It might
          have been moved or deleted.
        </p>

        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            ← Go Home
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Need Help?
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            If you think this is an error, please contact our support team.
          </p>
          <div className="flex flex-col space-y-2 text-sm">
            <Link href="/login" className="text-red-600 hover:underline">
              → Login to your account
            </Link>
            <Link href="/users" className="text-red-600 hover:underline">
              → Browse users
            </Link>
            <a
              href="mailto:support@jeevanrakth.com"
              className="text-red-600 hover:underline"
            >
              → Contact support
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
