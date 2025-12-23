import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-500 to-red-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Welcome to Jeevan Rakth 🩸
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Connecting blood donors with those in need. Save lives by donating
            blood or finding donors in your area.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800 transition-colors border-2 border-white"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Jeevan Rakth?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🩸</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Easy Registration
              </h3>
              <p className="text-gray-600">
                Quick and simple registration process for donors and recipients.
                Get started in minutes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Find Donors Fast
              </h3>
              <p className="text-gray-600">
                Search for blood donors by blood type, location, and
                availability. Connect instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure & Private
              </h3>
              <p className="text-gray-600">
                Your data is protected with JWT authentication and secure
                encryption. Privacy guaranteed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-red-600 mb-2">245+</p>
              <p className="text-gray-600">Registered Donors</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">89+</p>
              <p className="text-gray-600">Blood Requests</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-600 mb-2">67+</p>
              <p className="text-gray-600">Successful Matches</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600 mb-2">24/7</p>
              <p className="text-gray-600">Availability</p>
            </div>
          </div>
        </div>
      </section>

      {/* Routing Information Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Application Routes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Public Routes */}
            <div className="bg-green-50 border-2 border-green-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
                🌐 Public Routes
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <Link
                    href="/"
                    className="text-green-600 hover:underline font-medium"
                  >
                    / (Home)
                  </Link>{" "}
                  - Welcome page with app information
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-green-600 hover:underline font-medium"
                  >
                    /login
                  </Link>{" "}
                  - User authentication page
                </li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                These routes are accessible without authentication.
              </p>
            </div>

            {/* Protected Routes */}
            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-red-900 mb-4 flex items-center">
                🔒 Protected Routes
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <Link
                    href="/dashboard"
                    className="text-red-600 hover:underline font-medium"
                  >
                    /dashboard
                  </Link>{" "}
                  - User dashboard with stats
                </li>
                <li>
                  <Link
                    href="/users"
                    className="text-red-600 hover:underline font-medium"
                  >
                    /users
                  </Link>{" "}
                  - User management page
                </li>
                <li>
                  <Link
                    href="/users/1"
                    className="text-red-600 hover:underline font-medium"
                  >
                    /users/[id]
                  </Link>{" "}
                  - Dynamic user profile pages
                </li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                These routes require JWT authentication via cookies.
              </p>
            </div>
          </div>

          {/* Technical Info */}
          <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              🚀 Built with Next.js App Router
            </h3>
            <p className="text-blue-800">
              This application uses Next.js 14 App Router with file-based
              routing, server components, and middleware-based authentication.
              Protected routes automatically redirect to login if no valid JWT
              token is found in cookies.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-500 to-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Save Lives?</h2>
          <p className="text-xl mb-8">
            Join our community of donors and make a difference today.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-white text-red-600 font-bold rounded-lg hover:bg-gray-100 transition-colors text-lg"
          >
            Sign Up Now →
          </Link>
        </div>
      </section>
    </main>
  );
}
