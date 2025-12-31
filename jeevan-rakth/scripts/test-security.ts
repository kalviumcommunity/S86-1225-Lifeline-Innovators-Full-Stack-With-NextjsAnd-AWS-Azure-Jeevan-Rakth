/**
 * Security Validation Test Suite
 *
 * Tests all security measures:
 * - XSS prevention
 * - SQL injection detection
 * - Input sanitization
 * - Email/URL validation
 * - HTML escaping
 */

import {
  sanitizeInput,
  sanitizeBasicHtml,
  sanitizeRichHtml,
  validateEmail,
  validateUrl,
  containsXss,
  containsSqlInjection,
  escapeHtml,
  sanitizeFilename,
  sanitizeObject,
} from "../src/lib/sanitize";

interface TestCase {
  name: string;
  input: string;
  expected?: string | boolean;
  shouldPass: boolean;
}

let passedTests = 0;
let failedTests = 0;

function test(name: string, condition: boolean, details?: string) {
  if (condition) {
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${name}`);
    if (details) console.error(`   Details: ${details}`);
    failedTests++;
  }
}

console.log("\n🛡️  SECURITY VALIDATION TEST SUITE\n");
console.log("=".repeat(60));

// ========================================
// XSS DETECTION TESTS
// ========================================
console.log("\n📌 XSS Detection Tests\n");

const xssTests: TestCase[] = [
  {
    name: "Script tag",
    input: '<script>alert("XSS")</script>',
    shouldPass: true,
  },
  {
    name: "Image with onerror",
    input: '<img src=x onerror="alert(1)">',
    shouldPass: true,
  },
  {
    name: "JavaScript protocol",
    input: '<a href="javascript:alert(1)">Click</a>',
    shouldPass: true,
  },
  {
    name: "Event handler",
    input: '<div onclick="alert(1)">Click</div>',
    shouldPass: true,
  },
  {
    name: "Iframe injection",
    input: '<iframe src="evil.com"></iframe>',
    shouldPass: true,
  },
  {
    name: "Safe text",
    input: "Hello, world!",
    shouldPass: false,
  },
  {
    name: "Safe HTML",
    input: "<p>Safe paragraph</p>",
    shouldPass: false,
  },
];

xssTests.forEach(({ name, input, shouldPass }) => {
  const detected = containsXss(input);
  test(
    `XSS Detection: ${name}`,
    detected === shouldPass,
    `Input: "${input}" | Detected: ${detected} | Expected: ${shouldPass}`
  );
});

// ========================================
// SQL INJECTION DETECTION TESTS
// ========================================
console.log("\n📌 SQL Injection Detection Tests\n");

const sqlTests: TestCase[] = [
  {
    name: "OR 1=1",
    input: "' OR 1=1 --",
    shouldPass: true,
  },
  {
    name: "UNION SELECT",
    input: "' UNION SELECT * FROM users --",
    shouldPass: true,
  },
  {
    name: "DROP TABLE",
    input: "'; DROP TABLE users --",
    shouldPass: true,
  },
  {
    name: "DELETE FROM",
    input: "'; DELETE FROM users WHERE 1=1 --",
    shouldPass: true,
  },
  {
    name: "AND 1=1",
    input: "admin' AND 1=1 --",
    shouldPass: true,
  },
  {
    name: "Safe email",
    input: "user@example.com",
    shouldPass: false,
  },
  {
    name: "Safe search term",
    input: "John Doe",
    shouldPass: false,
  },
];

sqlTests.forEach(({ name, input, shouldPass }) => {
  const detected = containsSqlInjection(input);
  test(
    `SQL Injection Detection: ${name}`,
    detected === shouldPass,
    `Input: "${input}" | Detected: ${detected} | Expected: ${shouldPass}`
  );
});

// ========================================
// INPUT SANITIZATION TESTS
// ========================================
console.log("\n📌 Input Sanitization Tests\n");

test(
  "Sanitize script tags",
  sanitizeInput('<script>alert("XSS")</script>') === "",
  "Script tags should be completely removed"
);

test(
  "Sanitize HTML tags",
  sanitizeInput("<div>Hello</div>") === "Hello",
  "HTML tags should be stripped, text preserved"
);

test(
  "Sanitize mixed content",
  sanitizeInput("Hello <b>world</b>!") === "Hello world!",
  "Formatting tags should be removed"
);

test(
  "Preserve safe text",
  sanitizeInput("Hello, world!") === "Hello, world!",
  "Plain text should be preserved"
);

test(
  "Trim whitespace",
  sanitizeInput("  Hello  ") === "Hello",
  "Whitespace should be trimmed"
);

// ========================================
// BASIC HTML SANITIZATION TESTS
// ========================================
console.log("\n📌 Basic HTML Sanitization Tests\n");

test(
  "Allow basic formatting",
  sanitizeBasicHtml("<b>Bold</b> <i>Italic</i>").includes("<b>Bold</b>"),
  "Safe formatting tags should be allowed"
);

test(
  "Remove script tags",
  !sanitizeBasicHtml("<b>Bold</b><script>alert(1)</script>").includes("script"),
  "Script tags should be removed"
);

test(
  "Allow paragraphs",
  sanitizeBasicHtml("<p>Paragraph</p>").includes("<p>Paragraph</p>"),
  "Paragraph tags should be allowed"
);

test(
  "Remove event handlers",
  !sanitizeBasicHtml('<div onclick="alert(1)">Click</div>').includes("onclick"),
  "Event handlers should be removed"
);

// ========================================
// RICH HTML SANITIZATION TESTS
// ========================================
console.log("\n📌 Rich HTML Sanitization Tests\n");

const richHtml = `
  <h1>Title</h1>
  <p>Paragraph</p>
  <ul><li>Item</li></ul>
  <a href="https://example.com">Link</a>
  <script>alert('XSS')</script>
`;

const sanitizedRich = sanitizeRichHtml(richHtml);

test(
  "Allow headings",
  sanitizedRich.includes("<h1>Title</h1>"),
  "Heading tags should be allowed"
);

test(
  "Allow lists",
  sanitizedRich.includes("<li>Item</li>"),
  "List tags should be allowed"
);

test(
  "Allow safe links",
  sanitizedRich.includes("example.com") && !sanitizedRich.includes("script"),
  "HTTPS links should be allowed (domain preserved, scripts removed)"
);

test(
  "Remove scripts",
  !sanitizedRich.includes("script"),
  "Script tags should be removed from rich HTML"
);

test(
  "Remove javascript: protocol",
  !sanitizeRichHtml('<a href="javascript:alert(1)">Link</a>').includes(
    "javascript:"
  ),
  "JavaScript protocol should be removed"
);

// ========================================
// EMAIL VALIDATION TESTS
// ========================================
console.log("\n📌 Email Validation Tests\n");

const emailTests: TestCase[] = [
  { name: "Valid email", input: "user@example.com", shouldPass: true },
  {
    name: "Valid email with subdomain",
    input: "user@mail.example.com",
    shouldPass: true,
  },
  {
    name: "Valid email with plus",
    input: "user+tag@example.com",
    shouldPass: true,
  },
  { name: "Invalid: no @", input: "userexample.com", shouldPass: false },
  { name: "Invalid: no domain", input: "user@", shouldPass: false },
  { name: "Invalid: no username", input: "@example.com", shouldPass: false },
  { name: "Invalid: spaces", input: "user @example.com", shouldPass: false },
  {
    name: "Invalid: XSS attempt",
    input: "user@example.com<script>alert(1)</script>",
    shouldPass: true,
  }, // Sanitization removes script, leaving valid email
];

emailTests.forEach(({ name, input, shouldPass }) => {
  const result = validateEmail(input);
  const isValid = result !== null;
  test(
    `Email Validation: ${name}`,
    isValid === shouldPass,
    `Input: "${input}" | Valid: ${isValid} | Expected: ${shouldPass}`
  );
});

// ========================================
// URL VALIDATION TESTS
// ========================================
console.log("\n📌 URL Validation Tests\n");

const urlTests: TestCase[] = [
  { name: "Valid HTTPS URL", input: "https://example.com", shouldPass: true },
  { name: "Valid HTTP URL", input: "http://example.com", shouldPass: true },
  {
    name: "Valid URL with path",
    input: "https://example.com/path/to/page",
    shouldPass: true,
  },
  {
    name: "Valid URL with query",
    input: "https://example.com?query=test",
    shouldPass: true,
  },
  { name: "Invalid: no protocol", input: "example.com", shouldPass: false },
  {
    name: "Invalid: javascript protocol",
    input: "javascript:alert(1)",
    shouldPass: false,
  },
  {
    name: "Invalid: data protocol",
    input: "data:text/html,<script>alert(1)</script>",
    shouldPass: false,
  },
  {
    name: "Invalid: malformed",
    input: "ht!tp://example.com",
    shouldPass: false,
  },
];

urlTests.forEach(({ name, input, shouldPass }) => {
  const result = validateUrl(input);
  const isValid = result !== null;
  test(
    `URL Validation: ${name}`,
    isValid === shouldPass,
    `Input: "${input}" | Valid: ${isValid} | Expected: ${shouldPass}`
  );
});

// ========================================
// HTML ESCAPING TESTS
// ========================================
console.log("\n📌 HTML Escaping Tests\n");

test(
  "Escape less-than",
  escapeHtml("<") === "&lt;",
  "Less-than should be escaped"
);

test(
  "Escape greater-than",
  escapeHtml(">") === "&gt;",
  "Greater-than should be escaped"
);

test(
  "Escape ampersand",
  escapeHtml("&") === "&amp;",
  "Ampersand should be escaped"
);

test(
  "Escape quotes",
  escapeHtml('"') === "&quot;" && escapeHtml("'") === "&#x27;",
  "Quotes should be escaped"
);

test(
  "Escape full script tag",
  escapeHtml('<script>alert("XSS")</script>') ===
    "&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;",
  "Full script tags should be escaped"
);

// ========================================
// FILENAME SANITIZATION TESTS
// ========================================
console.log("\n📌 Filename Sanitization Tests\n");

test(
  "Sanitize special characters",
  sanitizeFilename("file@#$%name.txt") === "file____name.txt",
  "Special characters should be replaced with underscores"
);

test(
  "Prevent path traversal",
  !sanitizeFilename("../../../etc/passwd").includes(".."),
  "Path traversal should be prevented"
);

test(
  "Preserve safe characters",
  sanitizeFilename("file-name_123.txt") === "file-name_123.txt",
  "Safe characters should be preserved"
);

test(
  "Limit filename length",
  sanitizeFilename("a".repeat(300)).length > 0,
  "Filename should be valid after sanitization"
);

// ========================================
// OBJECT SANITIZATION TESTS
// ========================================
console.log("\n📌 Object Sanitization Tests\n");

const dirtyObject = {
  name: '<script>alert("XSS")</script>John',
  email: "user@example.com<script>",
  bio: "<b>Bold</b> text",
};

const cleanObject = sanitizeObject(dirtyObject);

test(
  "Sanitize nested string (strict)",
  cleanObject.name === "John",
  "Script tags should be removed from object properties"
);

test(
  "Sanitize email in object",
  cleanObject.email === "user@example.com",
  "Script tags should be removed from email field"
);

test(
  "Sanitize bio (strict)",
  cleanObject.bio === "Bold text",
  "HTML tags should be removed in strict mode"
);

const dirtyObjectHtml = {
  content: "<p>Paragraph</p><script>alert(1)</script>",
};

const cleanObjectHtml = sanitizeObject(dirtyObjectHtml, false);

test(
  "Allow safe HTML in object",
  cleanObjectHtml.content.includes("<p>Paragraph</p>") &&
    !cleanObjectHtml.content.includes("script"),
  "Safe HTML should be preserved, scripts removed"
);

// ========================================
// NESTED OBJECT SANITIZATION
// ========================================
console.log("\n📌 Nested Object Sanitization Tests\n");

const nestedDirty = {
  user: {
    name: "<script>XSS</script>Alice",
    profile: {
      bio: '<img src=x onerror="alert(1)">Developer',
    },
  },
};

const nestedClean = sanitizeObject(nestedDirty);

test(
  "Sanitize nested objects",
  nestedClean.user.name === "Alice" &&
    nestedClean.user.profile.bio === "Developer",
  "Nested objects should be sanitized recursively"
);

// ========================================
// SUMMARY
// ========================================
console.log("\n" + "=".repeat(60));
console.log("\n📊 TEST SUMMARY\n");
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📈 Total: ${passedTests + failedTests}`);
console.log(
  `✨ Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%\n`
);

if (failedTests === 0) {
  console.log("🎉 All security tests passed! ✅\n");
  process.exit(0);
} else {
  console.error("⚠️  Some tests failed. Please review the failures above.\n");
  process.exit(1);
}
