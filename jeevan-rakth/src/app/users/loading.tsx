/**
 * Loading skeleton for Users page
 * Displays while user data is being fetched
 */
export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* Add User Button skeleton */}
        <div className="mb-6 animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="animate-pulse">
            {/* Table header */}
            <div className="bg-gray-50 px-6 py-3 grid grid-cols-5 gap-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>

            {/* Table rows */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="border-t border-gray-200 px-6 py-4 grid grid-cols-5 gap-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="flex items-center">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="flex items-center">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="flex items-center">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
