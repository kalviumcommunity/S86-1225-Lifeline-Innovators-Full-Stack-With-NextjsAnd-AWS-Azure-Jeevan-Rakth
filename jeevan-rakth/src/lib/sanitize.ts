/**
 * Input Sanitization and Validation Utilities
 *
 * This module provides comprehensive input sanitization and validation
 * to prevent XSS (Cross-Site Scripting) and injection attacks.
 *
 * OWASP Security Principle: Never trust user input!
 */

import sanitizeHtml from "sanitize-html";
import validator from "validator";

/**
 * Sanitization Options
 */

// Strict: Remove all HTML tags and attributes
const STRICT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: "discard",
};

// Basic: Allow safe formatting tags only (bold, italic, lists, etc.)
const BASIC_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["b", "i", "em", "strong", "u", "p", "br", "ul", "ol", "li"],
  allowedAttributes: {},
  disallowedTagsMode: "discard",
};

// Rich: Allow more HTML but still safe (for rich text editors)
const RICH_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "br",
    "hr",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "s",
    "a",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
  ],
  allowedAttributes: {
    a: ["href", "title", "target"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  disallowedTagsMode: "discard",
  transformTags: {
    // Force all links to open in new tab and add noopener noreferrer
    a: (_tagName, attribs) => ({
      tagName: "a",
      attribs: {
        ...attribs,
        target: "_blank",
        rel: "noopener noreferrer",
      },
    }),
  },
};

/**
 * Sanitize Input - Remove all HTML tags (most secure)
 *
 * Use this for:
 * - User names
 * - Emails
 * - Search queries
 * - Any input that should be plain text
 *
 * @param input - User input string
 * @returns Sanitized string with all HTML removed
 *
 * @example
 * sanitizeInput('<script>alert("XSS")</script>Hello')
 * // Returns: 'Hello'
 */
export function sanitizeInput(input: string | undefined | null): string {
  if (!input || typeof input !== "string") return "";

  // Remove all HTML tags and trim whitespace
  const sanitized = sanitizeHtml(input, STRICT_OPTIONS);
  return sanitized.trim();
}

/**
 * Sanitize HTML - Allow basic formatting
 *
 * Use this for:
 * - Comments
 * - Descriptions
 * - Bio text
 *
 * @param input - User input with basic HTML
 * @returns Sanitized HTML with only safe tags
 *
 * @example
 * sanitizeBasicHtml('<strong>Bold</strong> <script>alert("XSS")</script>')
 * // Returns: '<strong>Bold</strong> '
 */
export function sanitizeBasicHtml(input: string | undefined | null): string {
  if (!input || typeof input !== "string") return "";

  return sanitizeHtml(input, BASIC_HTML_OPTIONS);
}

/**
 * Sanitize Rich HTML - Allow rich formatting
 *
 * Use this for:
 * - Blog posts
 * - Articles
 * - Rich text content
 *
 * @param input - User input with rich HTML
 * @returns Sanitized HTML with safe formatting
 */
export function sanitizeRichHtml(input: string | undefined | null): string {
  if (!input || typeof input !== "string") return "";

  return sanitizeHtml(input, RICH_HTML_OPTIONS);
}

/**
 * Validate and Sanitize Email
 *
 * @param email - Email address to validate
 * @returns Sanitized email or null if invalid
 */
export function validateEmail(email: string | undefined | null): string | null {
  if (!email || typeof email !== "string") return null;

  const sanitized = sanitizeInput(email);

  if (!validator.isEmail(sanitized)) {
    return null;
  }

  return validator.normalizeEmail(sanitized) || sanitized;
}

/**
 * Validate and Sanitize URL
 *
 * @param url - URL to validate
 * @returns Sanitized URL or null if invalid
 */
export function validateUrl(url: string | undefined | null): string | null {
  if (!url || typeof url !== "string") return null;

  const sanitized = sanitizeInput(url);

  if (
    !validator.isURL(sanitized, {
      protocols: ["http", "https"],
      require_protocol: true,
    })
  ) {
    return null;
  }

  return sanitized;
}

/**
 * Sanitize JSON - Recursively sanitize object values
 *
 * @param obj - Object to sanitize
 * @returns Object with all string values sanitized
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  strict: boolean = true
): T {
  const result: Record<string, unknown> | unknown[] = Array.isArray(obj)
    ? []
    : {};

  for (const key in obj) {
    const value = obj[key];

    if (typeof value === "string") {
      result[key] = strict ? sanitizeInput(value) : sanitizeBasicHtml(value);
    } else if (value && typeof value === "object") {
      result[key] = sanitizeObject(value, strict);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

/**
 * Validate String Length
 *
 * @param input - String to validate
 * @param min - Minimum length
 * @param max - Maximum length
 * @returns true if valid, false otherwise
 */
export function validateLength(
  input: string | undefined | null,
  min: number = 0,
  max: number = Infinity
): boolean {
  if (!input || typeof input !== "string") return false;

  const length = input.trim().length;
  return length >= min && length <= max;
}

/**
 * Sanitize Filename
 *
 * Remove path traversal attempts and dangerous characters
 *
 * @param filename - Filename to sanitize
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string | undefined | null): string {
  if (!filename || typeof filename !== "string") return "file";

  // Remove path traversal attempts
  let safe = filename.replace(/\.\./g, "");

  // Remove special characters except dots, dashes, and underscores
  safe = safe.replace(/[^a-zA-Z0-9._-]/g, "_");

  // Ensure it doesn't start with a dot (hidden files)
  if (safe.startsWith(".")) {
    safe = safe.substring(1);
  }

  return safe || "file";
}

/**
 * Check for SQL Injection Patterns
 *
 * This is a basic check - always use parameterized queries!
 *
 * @param input - String to check
 * @returns true if suspicious patterns detected
 */
export function containsSqlInjection(
  input: string | undefined | null
): boolean {
  if (!input || typeof input !== "string") return false;

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\#|\/\*|\*\/)/,
    /('\s*(OR|AND)\s*'?\d)/i,
    /('\s*=\s*')/,
    /(UNION.*SELECT)/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Check for XSS Patterns
 *
 * @param input - String to check
 * @returns true if XSS patterns detected
 */
export function containsXss(input: string | undefined | null): boolean {
  if (!input || typeof input !== "string") return false;

  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onerror=, onclick=, etc.
    /<iframe/gi,
    /eval\(/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Comprehensive Input Validation
 *
 * Validates input against common attack patterns
 *
 * @param input - String to validate
 * @returns Object with validation results
 */
export function validateInput(input: string | undefined | null): {
  isValid: boolean;
  hasXss: boolean;
  hasSqlInjection: boolean;
  sanitized: string;
} {
  const hasXss = containsXss(input);
  const hasSqlInjection = containsSqlInjection(input);
  const sanitized = sanitizeInput(input);

  return {
    isValid: !hasXss && !hasSqlInjection,
    hasXss,
    hasSqlInjection,
    sanitized,
  };
}

/**
 * Escape HTML for Safe Display
 *
 * Use this when you need to display user input as plain text
 *
 * @param input - String to escape
 * @returns HTML-escaped string
 */
export function escapeHtml(input: string | undefined | null): string {
  if (!input || typeof input !== "string") return "";

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
