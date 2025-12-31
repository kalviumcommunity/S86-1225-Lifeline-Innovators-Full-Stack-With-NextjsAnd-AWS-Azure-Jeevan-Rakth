/**
 * Client-Side Sanitization Utilities
 *
 * These utilities provide safe HTML rendering in React components
 * using DOMPurify for client-side XSS prevention.
 *
 * Note: Always sanitize on the server too! Client-side is just an extra layer.
 */

"use client";

import DOMPurify from "dompurify";
import React from "react";

/**
 * Sanitize HTML for safe rendering in React
 *
 * Use this with dangerouslySetInnerHTML
 *
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML safe for rendering
 *
 * @example
 * <div dangerouslySetInnerHTML={{ __html: sanitizeHtmlForRender(userContent) }} />
 */
export function sanitizeHtmlForRender(html: string | undefined | null): string {
  if (!html || typeof html !== "string") return "";

  // Configure DOMPurify for safe HTML
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "b",
      "i",
      "em",
      "strong",
      "u",
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "a",
      "blockquote",
      "code",
      "pre",
    ],
    ALLOWED_ATTR: ["href", "title", "target", "rel"],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize Rich HTML for safe rendering
 *
 * Allows more HTML tags for rich text content
 */
export function sanitizeRichHtmlForRender(
  html: string | undefined | null
): string {
  if (!html || typeof html !== "string") return "";

  return DOMPurify.sanitize(html, {
    ADD_ATTR: ["target"],
  });
}

/**
 * Strip all HTML tags and return plain text
 *
 * @param html - HTML string
 * @returns Plain text without any HTML
 */
export function stripHtml(html: string | undefined | null): string {
  if (!html || typeof html !== "string") return "";

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * React Component Helper: Safe HTML Renderer
 *
 * Wrapper component for safely rendering HTML
 *
 * @example
 * <SafeHtml html={userContent} />
 */
interface SafeHtmlProps {
  html: string;
  className?: string;
  rich?: boolean;
}

export function SafeHtml({
  html,
  className = "",
  rich = false,
}: SafeHtmlProps): React.ReactElement {
  const sanitized = rich
    ? sanitizeRichHtmlForRender(html)
    : sanitizeHtmlForRender(html);

  return React.createElement("div", {
    className,
    dangerouslySetInnerHTML: { __html: sanitized },
  });
}
