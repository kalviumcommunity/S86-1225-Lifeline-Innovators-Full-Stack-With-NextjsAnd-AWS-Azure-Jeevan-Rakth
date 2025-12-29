"use client";
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";
import { useState } from "react";

export default function SWRDemoPage() {
  const { cache } = useSWRConfig();
  const [cacheKeys, setCacheKeys] = useState<string[]>([]);

  // Example SWR usage with revalidation strategies
  const { data, error, isLoading } = useSWR("/api/users", fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 10000, // Auto-refresh every 10 seconds
    onErrorRetry: (_error, _key, _config, revalidate, { retryCount }) => {
      if (retryCount >= 3) return; // Max 3 retries
      setTimeout(
        () =>
          (revalidate as (opts: { retryCount: number }) => void)({
            retryCount,
          }),
        2000
      ); // 2s delay
    },
  });

  const showCacheKeys = () => {
    const keys = Array.from(cache.keys());
    setCacheKeys(keys);
    console.log("📦 SWR Cache Keys:", keys);
  };

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        SWR Demo &amp; Cache Visualization
      </h1>

      {/* Cache Inspection */}
      <section className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Cache Inspector</h2>
        <button
          onClick={showCacheKeys}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4"
        >
          Show Cached Keys
        </button>
        {cacheKeys.length > 0 && (
          <div className="bg-gray-100 rounded p-4">
            <p className="font-semibold mb-2">Cached Keys:</p>
            <ul className="list-disc list-inside space-y-1">
              {cacheKeys.map((key: string, index: number) => (
                <li key={index} className="text-sm font-mono">
                  {key}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Data Fetching Status */}
      <section className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Data Fetching Status</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Loading:</span>
            <span className={isLoading ? "text-yellow-600" : "text-green-600"}>
              {isLoading ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Error:</span>
            <span className={error ? "text-red-600" : "text-green-600"}>
              {error ? error.message : "None"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Data Loaded:</span>
            <span className={data ? "text-green-600" : "text-gray-600"}>
              {data ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </section>

      {/* Revalidation Strategies */}
      <section className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Active Revalidation Strategies
        </h2>
        <div className="space-y-3">
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="font-semibold">Revalidate on Focus</p>
            <p className="text-sm text-gray-600">
              Data refetches when you switch back to this tab
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <p className="font-semibold">Auto-refresh (10s)</p>
            <p className="text-sm text-gray-600">
              Data automatically refreshes every 10 seconds
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <p className="font-semibold">Error Retry (Max 3)</p>
            <p className="text-sm text-gray-600">
              Automatically retries failed requests with 2s delay
            </p>
          </div>
        </div>
      </section>

      {/* How SWR Works */}
      <section className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">How SWR Works</h2>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold mb-2">1. Cache Hit</h3>
            <p className="text-sm">
              When you visit this page again, SWR returns cached data instantly
              (stale), then revalidates in the background (revalidate).
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-semibold mb-2">2. Background Revalidation</h3>
            <p className="text-sm">
              SWR fetches fresh data silently and updates the UI when ready — no
              loading spinners on re-renders!
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <h3 className="font-semibold mb-2">3. Automatic Deduplication</h3>
            <p className="text-sm">
              If multiple components request the same data, SWR deduplicates the
              requests into a single network call.
            </p>
          </div>
        </div>
      </section>

      {/* Live Console Output */}
      <section className="bg-gray-900 text-green-400 rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Console Output</h2>
        <p className="text-sm font-mono mb-2">Open DevTools Console to see:</p>
        <ul className="list-disc list-inside space-y-1 text-sm font-mono">
          <li>SWR request logs</li>
          <li>Cache operations</li>
          <li>Revalidation events</li>
          <li>Error retry attempts</li>
        </ul>
        <p className="text-xs text-gray-400 mt-4">
          💡 Tip: Click &quot;Show Cached Keys&quot; above to log all cached SWR
          keys to the console
        </p>
      </section>
    </main>
  );
}
