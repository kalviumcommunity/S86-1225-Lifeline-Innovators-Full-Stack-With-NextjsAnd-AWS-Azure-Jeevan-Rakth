/**
 * Test Utilities for Loading and Error States
 *
 * This file contains helper functions to simulate loading delays and errors
 * for testing the loading.tsx and error.tsx components.
 *
 * Usage:
 * 1. Import these functions in your API routes or page components
 * 2. Uncomment the desired simulation function
 * 3. Test your loading skeletons and error boundaries
 */

/**
 * Simulates a network delay
 * Usage: await simulateDelay(2000); // 2 second delay
 */
export async function simulateDelay(ms: number = 2000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simulates a random error
 * Usage: simulateError('Failed to fetch data');
 */
export function simulateError(
  message: string = "Simulated error for testing"
): never {
  throw new Error(message);
}

/**
 * Simulates intermittent errors (50% chance of error)
 * Usage: simulateIntermittentError();
 */
export function simulateIntermittentError(): void {
  if (Math.random() > 0.5) {
    throw new Error("Random simulated error - try refreshing");
  }
}

/**
 * Example: Add to /api/users/route.ts GET handler
 *
 * export async function GET(req: Request) {
 *   // Uncomment to test loading state
 *   // await simulateDelay(3000);
 *
 *   // Uncomment to test error state
 *   // simulateError('Database connection failed');
 *
 *   // Your actual code here...
 * }
 */

/**
 * Example: Add to a Server Component page
 *
 * export default async function UsersPage() {
 *   // Test loading skeleton
 *   // await simulateDelay(2000);
 *
 *   const response = await fetch('/api/users');
 *
 *   // Test error boundary
 *   // if (!response.ok) throw new Error('Failed to load users');
 *
 *   const data = await response.json();
 *   return <div>...</div>;
 * }
 */
