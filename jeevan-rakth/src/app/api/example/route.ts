/**
 * Example API Route with CORS Support
 *
 * This is an example showing how to use the CORS middleware wrapper
 * in your API routes. This route demonstrates both GET and POST methods
 * with proper CORS handling.
 *
 * Location: src/app/api/example/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { withCors } from "@/lib/corsMiddleware";

/**
 * GET handler with CORS support
 *
 * Example request:
 *   fetch('http://localhost:3000/api/example')
 */
export const GET = withCors(async (req: NextRequest) => {
  // Your API logic here
  const data = {
    message: "Hello from CORS-enabled API!",
    timestamp: new Date().toISOString(),
    origin: req.headers.get("origin") || "No origin header",
  };

  return NextResponse.json({
    success: true,
    data,
  });
});

/**
 * POST handler with CORS support
 *
 * Example request:
 *   fetch('http://localhost:3000/api/example', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ name: 'John' })
 *   })
 */
export const POST = withCors(async (req: NextRequest) => {
  try {
    const body = await req.json();

    // Your API logic here
    const response = {
      message: "Data received successfully",
      received: body,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON body",
      },
      { status: 400 }
    );
  }
});

/**
 * Alternative: Manual CORS header application
 *
 * Use this approach when you need more control over the response
 */
export async function PUT(req: NextRequest) {
  // Your logic
  const response = NextResponse.json({
    success: true,
    message: "Updated successfully",
  });

  // Manually add CORS headers (not recommended - use withCors instead)
  const origin = req.headers.get("origin");
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  return response;
}

/**
 * Notes:
 *
 * 1. The withCors wrapper automatically handles:
 *    - OPTIONS preflight requests
 *    - CORS header application
 *    - Origin validation
 *    - Error responses with CORS headers
 *
 * 2. No need to manually handle OPTIONS - withCors does it for you
 *
 * 3. CORS configuration is in src/lib/securityHeaders.ts:
 *    - Add your production domain to allowedOrigins
 *    - Configure allowed methods, headers, credentials
 *
 * 4. In development, CORS is more permissive
 *    In production, only allowedOrigins can access the API
 *
 * 5. If you don't use withCors, middleware.ts still applies CORS
 *    to routes matching the middleware config
 */
