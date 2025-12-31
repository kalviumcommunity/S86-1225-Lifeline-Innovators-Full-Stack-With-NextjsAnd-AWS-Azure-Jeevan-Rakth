/**
 * CORS Middleware Wrapper for API Routes
 *
 * Provides easy-to-use CORS handling for Next.js API routes
 * Ensures proper CORS headers are applied to all API responses
 */

import { NextRequest, NextResponse } from "next/server";
import {
  handleCorsPreflightRequest,
  applyCorsHeaders,
} from "./securityHeaders";

type ApiHandler = (req: NextRequest) => Promise<Response> | Response;

/**
 * Wraps an API route handler with CORS support
 *
 * @param handler - The API route handler function
 * @returns Wrapped handler with CORS support
 *
 * @example
 * ```typescript
 * import { withCors } from '@/lib/corsMiddleware';
 *
 * export const GET = withCors(async (req: NextRequest) => {
 *   return NextResponse.json({ message: 'Hello World' });
 * });
 *
 * export const POST = withCors(async (req: NextRequest) => {
 *   const body = await req.json();
 *   return NextResponse.json({ received: body });
 * });
 * ```
 */
export function withCors(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest) => {
    const origin = req.headers.get("origin");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return handleCorsPreflightRequest(origin || undefined);
    }

    try {
      // Execute the handler
      const response = await handler(req);

      // Apply CORS headers to the response
      return applyCorsHeaders(response, origin || undefined);
    } catch (error) {
      // Handle errors and still apply CORS headers
      console.error("API route error:", error);
      const errorResponse = NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
        { status: 500 }
      );
      return applyCorsHeaders(errorResponse, origin || undefined);
    }
  };
}

/**
 * Manual CORS response helper
 * Use this when you need more control over the response
 *
 * @param response - The response object
 * @param req - The request object
 * @returns Response with CORS headers applied
 *
 * @example
 * ```typescript
 * export async function GET(req: NextRequest) {
 *   const response = NextResponse.json({ data: 'example' });
 *   return addCorsHeaders(response, req);
 * }
 * ```
 */
export function addCorsHeaders(response: Response, req: NextRequest): Response {
  const origin = req.headers.get("origin");
  return applyCorsHeaders(response, origin || undefined);
}

/**
 * CORS Configuration Tips:
 *
 * 1. Development vs Production:
 *    - Development: More permissive, allows localhost
 *    - Production: Strict origin validation
 *
 * 2. Allowed Origins:
 *    - Update corsConfig.allowedOrigins in securityHeaders.ts
 *    - Never use '*' in production
 *    - Add your frontend domain(s)
 *
 * 3. Credentials:
 *    - Set to true for cookie-based authentication
 *    - Requires specific origin (cannot use '*')
 *
 * 4. Preflight Caching:
 *    - maxAge: 86400 (24 hours)
 *    - Reduces OPTIONS requests
 *
 * 5. Common Issues:
 *    - Missing OPTIONS handler → Use withCors wrapper
 *    - Wrong origin → Check allowedOrigins array
 *    - Credentials with wildcard → Use specific origins
 */
