/**
 * Security Demo API Route
 *
 * This endpoint demonstrates input sanitization and validation
 * to prevent XSS and SQL injection attacks.
 */

import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/responseHandler";
import {
  sanitizeInput,
  sanitizeBasicHtml,
  validateEmail,
  validateUrl,
  validateInput,
  containsXss,
  containsSqlInjection,
  escapeHtml,
} from "@/lib/sanitize";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/security-demo
 *
 * Test input sanitization and validation
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, testType } = body;

    if (!input || typeof input !== "string") {
      return errorResponse("Input is required", { status: 400 });
    }

    // Run comprehensive validation
    const validation = validateInput(input);

    const response: Record<string, unknown> = {
      originalInput: input,
      testType: testType || "general",
      validation: {
        isValid: validation.isValid,
        hasXss: validation.hasXss,
        hasSqlInjection: validation.hasSqlInjection,
      },
      sanitized: {
        strict: sanitizeInput(input),
        basicHtml: sanitizeBasicHtml(input),
        escaped: escapeHtml(input),
      },
      attacks: {
        xssDetected: containsXss(input),
        sqlInjectionDetected: containsSqlInjection(input),
      },
    };

    // Email validation test
    if (testType === "email") {
      const validatedEmail = validateEmail(input);
      response.emailValidation = {
        isValid: validatedEmail !== null,
        sanitized: validatedEmail,
      };
    }

    // URL validation test
    if (testType === "url") {
      const validatedUrl = validateUrl(input);
      response.urlValidation = {
        isValid: validatedUrl !== null,
        sanitized: validatedUrl,
      };
    }

    // SQL injection test (safe - using Prisma parameterized queries)
    if (testType === "sql") {
      try {
        // This is SAFE because Prisma uses parameterized queries
        const userCount = await prisma.user.count({
          where: {
            email: {
              contains: sanitizeInput(input),
            },
          },
        });

        response.sqlTest = {
          message: "Prisma parameterized query executed safely",
          inputWasSanitized: true,
          resultCount: userCount,
          explanation:
            "Prisma automatically prevents SQL injection by using parameterized queries",
        };
      } catch (error) {
        response.sqlTest = {
          message: "Query failed (this is expected for malicious input)",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    return successResponse("Input validated and sanitized", response);
  } catch (error) {
    console.error("[Security Demo] Error:", error);
    return errorResponse("Security test failed", { status: 500 });
  }
}

/**
 * GET /api/security-demo
 *
 * Get common attack examples for testing
 */
export async function GET() {
  const attackExamples = {
    xss: [
      '<script>alert("XSS Attack!")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      "<iframe src=\"javascript:alert('XSS')\"></iframe>",
      '<svg onload=alert("XSS")>',
      '<body onload=alert("XSS")>',
    ],
    sqlInjection: [
      "' OR '1'='1",
      "' OR 1=1 --",
      "admin'--",
      "' UNION SELECT NULL--",
      "1'; DROP TABLE users--",
      "' OR 'x'='x",
    ],
    pathTraversal: [
      "../../../etc/passwd",
      "..\\..\\..\\windows\\system32",
      "file:///etc/passwd",
    ],
    safe: [
      "Hello, world!",
      "This is a <b>safe</b> comment",
      "Contact me at user@example.com",
      "Visit https://example.com",
    ],
  };

  return successResponse("Attack examples retrieved", {
    examples: attackExamples,
    totalExamples: Object.values(attackExamples).flat().length,
    categories: Object.keys(attackExamples),
  });
}
