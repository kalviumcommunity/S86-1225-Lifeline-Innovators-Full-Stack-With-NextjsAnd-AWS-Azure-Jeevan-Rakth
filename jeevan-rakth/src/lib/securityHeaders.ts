/**
 * Security Headers Configuration
 *
 * This file centralizes all security headers for the application including:
 * - HSTS (HTTP Strict Transport Security)
 * - CSP (Content Security Policy)
 * - CORS (Cross-Origin Resource Sharing)
 * - Additional security headers
 */

/**
 * Content Security Policy Configuration
 * Prevents XSS attacks by defining allowed sources for content
 */
export const getContentSecurityPolicy = () => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://apis.google.com",
    "frame-src 'self' https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
};

/**
 * Security Headers for Next.js Configuration
 * Applied globally to all routes
 */
export const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: getContentSecurityPolicy(),
  },
];

/**
 * CORS Configuration
 * Define allowed origins for API access
 */
export const corsConfig = {
  // In production, replace with your actual frontend domain(s)
  allowedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    // Add your production domain here
    // 'https://your-production-domain.com'
  ],
  allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Apply CORS headers to a Response
 * @param response - The NextResponse object
 * @param origin - The request origin
 * @returns Response with CORS headers
 */
export function applyCorsHeaders(
  response: Response,
  origin?: string
): Response {
  const headers = new Headers(response.headers);

  // Check if origin is allowed
  const isAllowedOrigin = origin && corsConfig.allowedOrigins.includes(origin);

  if (isAllowedOrigin) {
    headers.set("Access-Control-Allow-Origin", origin);
  } else if (process.env.NODE_ENV === "development") {
    // In development, be more permissive
    headers.set("Access-Control-Allow-Origin", origin || "*");
  }

  headers.set(
    "Access-Control-Allow-Methods",
    corsConfig.allowedMethods.join(", ")
  );
  headers.set(
    "Access-Control-Allow-Headers",
    corsConfig.allowedHeaders.join(", ")
  );
  headers.set(
    "Access-Control-Allow-Credentials",
    corsConfig.credentials.toString()
  );
  headers.set("Access-Control-Max-Age", corsConfig.maxAge.toString());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Handle CORS preflight requests
 * @param origin - The request origin
 * @returns Response for OPTIONS request
 */
export function handleCorsPreflightRequest(origin?: string): Response {
  const headers = new Headers();

  const isAllowedOrigin = origin && corsConfig.allowedOrigins.includes(origin);

  if (isAllowedOrigin) {
    headers.set("Access-Control-Allow-Origin", origin);
  } else if (process.env.NODE_ENV === "development") {
    headers.set("Access-Control-Allow-Origin", origin || "*");
  }

  headers.set(
    "Access-Control-Allow-Methods",
    corsConfig.allowedMethods.join(", ")
  );
  headers.set(
    "Access-Control-Allow-Headers",
    corsConfig.allowedHeaders.join(", ")
  );
  headers.set(
    "Access-Control-Allow-Credentials",
    corsConfig.credentials.toString()
  );
  headers.set("Access-Control-Max-Age", corsConfig.maxAge.toString());

  return new Response(null, {
    status: 204,
    headers,
  });
}

/**
 * Security Headers Explanation
 *
 * 1. Strict-Transport-Security (HSTS):
 *    - Forces browsers to use HTTPS for 2 years (63072000 seconds)
 *    - Applies to all subdomains
 *    - Eligible for browser HSTS preload list
 *    - Prevents: Man-in-the-middle attacks, protocol downgrade attacks
 *
 * 2. Content-Security-Policy (CSP):
 *    - Restricts sources for scripts, styles, images, and other resources
 *    - Prevents: Cross-Site Scripting (XSS), data injection attacks
 *    - Use 'unsafe-inline' cautiously (only for development or when necessary)
 *
 * 3. X-Frame-Options:
 *    - Prevents the site from being embedded in iframes
 *    - Prevents: Clickjacking attacks
 *
 * 4. X-Content-Type-Options:
 *    - Prevents browsers from MIME-sniffing
 *    - Prevents: MIME confusion attacks
 *
 * 5. X-XSS-Protection:
 *    - Legacy XSS filter (modern browsers use CSP instead)
 *    - Provides backward compatibility
 *
 * 6. Referrer-Policy:
 *    - Controls how much referrer information is shared
 *    - Protects: User privacy
 *
 * 7. Permissions-Policy:
 *    - Disables browser features that aren't needed
 *    - Reduces attack surface
 *
 * 8. Access-Control-Allow-Origin (CORS):
 *    - Restricts which domains can access your API
 *    - Prevents: Unauthorized cross-origin requests
 *    - Never use '*' in production
 */
