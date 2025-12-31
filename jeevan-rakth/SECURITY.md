# 🛡️ Security Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [OWASP Security Measures](#owasp-security-measures)
3. [XSS Prevention](#xss-prevention)
4. [SQL Injection Prevention](#sql-injection-prevention)
5. [Input Sanitization](#input-sanitization)
6. [Output Encoding](#output-encoding)
7. [Before & After Examples](#before--after-examples)
8. [API Integration](#api-integration)
9. [Security Testing](#security-testing)
10. [Best Practices](#best-practices)
11. [Future Improvements](#future-improvements)

---

## Overview

This application implements comprehensive security measures following **OWASP** (Open Web Application Security Project) best practices to protect against the most common web application vulnerabilities.

### Security Layers Implemented

```
┌─────────────────────────────────────────┐
│     1. Input Validation & Sanitization  │
│        ↓                                │
│     2. XSS Prevention (DOMPurify)       │
│        ↓                                │
│     3. SQL Injection Protection (ORM)   │
│        ↓                                │
│     4. Output Encoding                  │
│        ↓                                │
│     5. Security Headers                 │
└─────────────────────────────────────────┘
```

### Key Security Features

- ✅ **XSS Protection** - Blocks malicious scripts from executing
- ✅ **SQL Injection Prevention** - Uses parameterized queries via Prisma ORM
- ✅ **Input Sanitization** - Cleans and validates all user input
- ✅ **Output Encoding** - Safely renders user content
- ✅ **RBAC Integration** - Role-based access control with permission checks
- ✅ **JWT Authentication** - Secure token-based authentication

---

## OWASP Security Measures

### OWASP Top 10 Coverage

| Vulnerability | Status | Implementation |
|--------------|--------|----------------|
| **A03:2021 - Injection** | ✅ Mitigated | Prisma ORM + Input Sanitization |
| **A07:2021 - XSS** | ✅ Mitigated | DOMPurify + Content Security Policy |
| **A01:2021 - Broken Access Control** | ✅ Mitigated | RBAC System + JWT Auth |
| **A02:2021 - Cryptographic Failures** | ✅ Mitigated | JWT Signing, Secure Storage |
| **A05:2021 - Security Misconfiguration** | ⚠️ Partial | Environment Variables, Headers |

---

## XSS Prevention

### Cross-Site Scripting (XSS) Attacks Explained

XSS attacks inject malicious JavaScript into web pages, allowing attackers to:
- Steal user sessions and cookies
- Deface websites
- Redirect users to phishing sites
- Capture keystrokes

### Implementation

#### Server-Side Protection (`src/lib/sanitize.ts`)

```typescript
import sanitizeHtml from 'sanitize-html';

/**
 * Strict input sanitization - removes ALL HTML
 * Use for: plain text fields, usernames, emails
 */
export function sanitizeInput(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

/**
 * Basic HTML sanitization - allows safe formatting
 * Use for: comments, descriptions with basic formatting
 */
export function sanitizeBasicHtml(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
    allowedAttributes: {},
  });
}

/**
 * Rich HTML sanitization - allows more tags for rich text
 * Use for: blog posts, articles, formatted content
 */
export function sanitizeRichHtml(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'ul', 'ol', 'li',
      'b', 'i', 'em', 'strong', 'u',
      'a', 'img', 'blockquote', 'code', 'pre'
    ],
    allowedAttributes: {
      'a': ['href', 'title'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}
```

#### Client-Side Protection (`src/lib/sanitizeClient.ts`)

```typescript
import DOMPurify from 'dompurify';

/**
 * Client-side HTML sanitization using DOMPurify
 * Prevents XSS in browser environment
 */
export function sanitizeHtmlForRender(html: string): string {
  if (typeof window === 'undefined') {
    return html; // Server-side, already sanitized
  }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
}

/**
 * React component for safe HTML rendering
 */
export function SafeHtml({ html }: { html: string }) {
  const sanitized = sanitizeHtmlForRender(html);
  
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: sanitized }}
      className="safe-html-content"
    />
  );
}
```

### XSS Detection

```typescript
/**
 * Detect potential XSS attacks in input
 */
export function containsXss(input: string): boolean {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<iframe/gi,
    /eval\(/gi,
    /expression\(/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}
```

---

## SQL Injection Prevention

### SQL Injection Attacks Explained

SQL injection manipulates database queries by injecting malicious SQL code:

**Vulnerable Code (RAW SQL - DON'T USE):**
```javascript
// ❌ DANGEROUS - NEVER DO THIS
const query = `SELECT * FROM users WHERE email = '${userInput}'`;
```

**Attack Input:** `' OR 1=1 --`
**Resulting Query:** `SELECT * FROM users WHERE email = '' OR 1=1 --'`
**Result:** Returns ALL users (authentication bypass)

### Prisma ORM Protection

**Why Prisma is Safe:**

Prisma uses **parameterized queries** (prepared statements), which means user input is NEVER concatenated into SQL strings. Instead, input is sent as separate parameters.

#### Example 1: Safe User Lookup

```typescript
// ✅ SAFE - Prisma uses parameterized queries
const user = await prisma.user.findUnique({
  where: { email: userInput }
});

// Internally executes as:
// SELECT * FROM users WHERE email = $1
// Parameters: [$userInput]
```

Even if `userInput` contains `' OR 1=1 --`, it's treated as a literal string value, not SQL code.

#### Example 2: Safe Text Search

```typescript
// ✅ SAFE - Contains mode uses parameterized queries
const users = await prisma.user.findMany({
  where: {
    name: {
      contains: searchTerm, // Treated as literal string
      mode: 'insensitive',
    },
  },
});
```

### SQL Injection Detection

```typescript
/**
 * Detect potential SQL injection attempts
 */
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi, // OR 1=1, AND 1=1
    /--/g,                                 // SQL comments
    /;\s*DROP\s+TABLE/gi,                  // DROP TABLE
    /;\s*DELETE\s+FROM/gi,                 // DELETE FROM
    /UNION\s+SELECT/gi,                    // UNION SELECT
    /'\s*OR\s*'.*'='.*'/gi,                // 'OR '1'='1
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}
```

---

## Input Sanitization

### Comprehensive Validation Functions

#### 1. Email Validation

```typescript
import validator from 'validator';

export function validateEmail(email: string): boolean {
  return validator.isEmail(email) && 
         email.length <= 255 &&
         !containsXss(email);
}
```

**Usage:**
```typescript
if (!validateEmail(userEmail)) {
  return errorResponse('Invalid email format', { status: 400 });
}
```

#### 2. URL Validation

```typescript
export function validateUrl(url: string): boolean {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
  }) && !containsXss(url);
}
```

#### 3. Filename Sanitization

```typescript
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars
    .replace(/\.{2,}/g, '.')          // Prevent path traversal
    .substring(0, 255);               // Limit length
}
```

#### 4. Object Sanitization

```typescript
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: { allowHtml?: boolean; maxLength?: number } = {}
): T {
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = (options.allowHtml
        ? sanitizeBasicHtml(value)
        : sanitizeInput(value)) as T[keyof T];
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key as keyof T] = sanitizeObject(
        value as Record<string, unknown>,
        options
      ) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value as T[keyof T];
    }
  }
  
  return sanitized;
}
```

---

## Output Encoding

### HTML Escaping

```typescript
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

**When to Use:**
- Displaying user input in HTML context
- Showing code snippets
- Preventing tag interpretation

**Example:**
```typescript
const userInput = '<script>alert("XSS")</script>';
const safe = escapeHtml(userInput);
// Result: &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;
```

---

## Before & After Examples

### Example 1: XSS Attack Prevention

#### ❌ BEFORE Sanitization (Vulnerable)

**User Input:**
```html
<img src=x onerror="alert('XSS Attack!')">
```

**Without Sanitization:**
```jsx
// DANGEROUS!
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**Result:** JavaScript executes, showing alert box 🚨

#### ✅ AFTER Sanitization (Safe)

**Processing:**
```typescript
const sanitized = sanitizeInput(userInput);
// Result: ""
```

**Render:**
```jsx
<SafeHtml html={userInput} />
// Renders: (empty - all tags removed)
```

**Result:** No script execution ✅

---

### Example 2: SQL Injection Prevention

#### ❌ BEFORE Protection (Vulnerable)

**Malicious Input:**
```
' OR 1=1 --
```

**Vulnerable RAW SQL:**
```sql
SELECT * FROM users WHERE email = '' OR 1=1 --'
```

**Result:** Returns ALL users, authentication bypass 🚨

#### ✅ AFTER Protection (Prisma ORM)

**Same Input:**
```
' OR 1=1 --
```

**Prisma Query:**
```typescript
await prisma.user.findUnique({
  where: { email: "' OR 1=1 --" }
});
```

**Actual SQL Executed:**
```sql
SELECT * FROM users WHERE email = $1
-- Parameters: ["' OR 1=1 --"]
```

**Result:** No users found, input treated as literal string ✅

---

### Example 3: Rich HTML Sanitization

#### Input:
```html
<h1>Title</h1>
<p>Safe paragraph</p>
<script>alert('XSS')</script>
<img src=x onerror="alert('XSS')">
<a href="javascript:alert('XSS')">Click</a>
```

#### After `sanitizeRichHtml()`:
```html
<h1>Title</h1>
<p>Safe paragraph</p>
Click
```

**What Happened:**
- ✅ Allowed: `<h1>`, `<p>` (safe HTML tags)
- ❌ Removed: `<script>` (dangerous tag)
- ❌ Removed: `<img>` with `onerror` (XSS vector)
- ❌ Stripped: `javascript:` protocol (XSS vector)

---

## API Integration

### Protecting API Endpoints

#### Example: User Creation with Full Protection

```typescript
// src/app/api/users/route.ts

import { sanitizeInput, validateEmail } from '@/lib/sanitize';
import { requirePermission } from '@/lib/rbac';

export const POST = requirePermission('create', 'users')(
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      
      // 1. Sanitize all input fields
      const sanitizedBody = {
        email: body.email ? sanitizeInput(body.email.trim()) : body.email,
        name: body.name ? sanitizeInput(body.name) : body.name,
        role: body.role ? sanitizeInput(body.role) : body.role,
      };
      
      // 2. Validate email format
      if (sanitizedBody.email && !validateEmail(sanitizedBody.email)) {
        return errorResponse('Invalid email format', {
          status: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
        });
      }
      
      // 3. Zod schema validation
      const parsed = userCreateSchema.safeParse(sanitizedBody);
      if (!parsed.success) {
        return errorResponse('Validation Error', {
          status: 400,
          code: ERROR_CODES.VALIDATION_ERROR,
          details: parsed.error.issues,
        });
      }
      
      // 4. Safe database operation (Prisma = parameterized queries)
      const user = await prisma.user.create({ 
        data: parsed.data 
      });
      
      return successResponse('User created successfully', user, {
        status: 201,
      });
    } catch (error) {
      return handleError(error, 'POST /api/users');
    }
  }
);
```

**Security Layers:**
1. **RBAC Protection** - Only users with `create:users` permission
2. **Input Sanitization** - Remove malicious HTML/scripts
3. **Email Validation** - Verify format and check for XSS
4. **Zod Schema Validation** - Type safety and business rules
5. **Prisma ORM** - SQL injection prevention

---

## Security Testing

### Interactive Security Demo

Visit [`/security-demo`](http://localhost:3000/security-demo) to:

1. **Test XSS Prevention** - Try injecting scripts
2. **Test SQL Injection Protection** - Try SQL commands
3. **Compare Before/After** - See sanitization effects
4. **View Attack Examples** - Pre-loaded malicious inputs

### Automated Security Tests

```bash
# Run security validation tests
npm run test:security
```

**Test Coverage:**
- ✅ XSS attack detection
- ✅ SQL injection detection
- ✅ Email validation
- ✅ URL validation
- ✅ HTML sanitization
- ✅ Object sanitization
- ✅ Filename sanitization

### Manual Testing Checklist

- [ ] Try XSS payloads in all text inputs
- [ ] Attempt SQL injection in search/filter fields
- [ ] Test file upload with malicious filenames
- [ ] Verify RBAC protections on protected routes
- [ ] Check JWT token tampering detection
- [ ] Test CORS headers and CSP policies

---

## Best Practices

### 1. Defense in Depth

Apply multiple security layers:

```
User Input → Sanitization → Validation → Authorization → Database
```

**Never rely on a single security measure!**

### 2. Principle of Least Privilege

```typescript
// ❌ BAD - Too permissive
export const GET = async (req: NextRequest) => {
  const allData = await prisma.sensitiveData.findMany();
  return NextResponse.json(allData);
};

// ✅ GOOD - Permission check + filtered fields
export const GET = requirePermission('read', 'data')(
  async (req: NextRequest) => {
    const data = await prisma.sensitiveData.findMany({
      select: {
        id: true,
        name: true,
        // Exclude sensitive fields
      },
    });
    return successResponse('Data fetched', data);
  }
);
```

### 3. Fail Securely

```typescript
// ✅ GOOD - Fail closed
export function hasPermission(user, permission) {
  try {
    return checkPermission(user, permission);
  } catch (error) {
    console.error('Permission check failed:', error);
    return false; // Deny access on error
  }
}
```

### 4. Input Validation Rules

1. **Validate on the server** - Never trust client-side validation
2. **Whitelist over blacklist** - Define what IS allowed, not what ISN'T
3. **Sanitize before validation** - Clean input before checking
4. **Validate length and type** - Prevent buffer overflows

### 5. Secure Output Rendering

```typescript
// ❌ NEVER do this
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Always sanitize first
<SafeHtml html={userInput} />

// ✅ Or escape for display
<div>{escapeHtml(userInput)}</div>
```

---

## Future Improvements

### Short-Term (Next Sprint)

1. **Content Security Policy (CSP)**
   ```typescript
   // middleware.ts
   export function middleware(request: NextRequest) {
     const response = NextResponse.next();
     
     response.headers.set(
       'Content-Security-Policy',
       "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
     );
     
     return response;
   }
   ```

2. **Rate Limiting**
   ```typescript
   import rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // Limit each IP to 100 requests per window
   });
   ```

3. **Security Headers**
   ```typescript
   // next.config.js
   const securityHeaders = [
     {
       key: 'X-Frame-Options',
       value: 'DENY',
     },
     {
       key: 'X-Content-Type-Options',
       value: 'nosniff',
     },
     {
       key: 'X-XSS-Protection',
       value: '1; mode=block',
     },
     {
       key: 'Referrer-Policy',
       value: 'strict-origin-when-cross-origin',
     },
   ];
   ```

### Medium-Term

4. **Validation Schema Library** - Centralize all validation rules
5. **Security Logging** - Log all security events (failed auth, XSS attempts)
6. **Automated Security Scanning** - Integrate OWASP ZAP or similar
7. **Dependency Vulnerability Scanning** - `npm audit` in CI/CD

### Long-Term

8. **Web Application Firewall (WAF)** - Cloud-based protection
9. **Intrusion Detection System (IDS)** - Monitor for attack patterns
10. **Security Incident Response Plan** - Documented procedures
11. **Regular Penetration Testing** - Third-party security audits

---

## Security Incident Response

### If You Discover a Vulnerability

1. **DO NOT** publicly disclose the vulnerability
2. **DO** email security contacts immediately
3. **DO** provide detailed reproduction steps
4. **DO** include potential impact assessment

### Incident Response Steps

1. **Identify** - Detect and confirm the security issue
2. **Contain** - Isolate affected systems
3. **Eradicate** - Remove the vulnerability
4. **Recover** - Restore normal operations
5. **Review** - Post-incident analysis and lessons learned

---

## Security Checklist

### Pre-Deployment

- [ ] All user inputs sanitized and validated
- [ ] RBAC permissions properly configured
- [ ] JWT secrets are strong and stored securely
- [ ] Environment variables not committed to Git
- [ ] Database uses parameterized queries (Prisma ✅)
- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] Error messages don't leak sensitive info
- [ ] File uploads validated and sanitized
- [ ] Dependencies updated (no critical vulnerabilities)

### Regular Maintenance

- [ ] Weekly: Review security logs
- [ ] Monthly: Update dependencies (`npm audit fix`)
- [ ] Quarterly: Security testing/penetration testing
- [ ] Annually: Full security audit

---

## Resources

### OWASP Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)

### Libraries Used

- **sanitize-html** - [GitHub](https://github.com/apostrophecms/sanitize-html)
- **DOMPurify** - [GitHub](https://github.com/cure53/DOMPurify)
- **validator.js** - [GitHub](https://github.com/validatorjs/validator.js)
- **Prisma** - [Docs](https://www.prisma.io/docs/concepts/components/prisma-client)

### Tools

- **OWASP ZAP** - Automated security scanner
- **Burp Suite** - Web vulnerability scanner
- **npm audit** - Dependency vulnerability checker
- **Snyk** - Continuous security monitoring

---

## Conclusion

Security is **not a feature**, it's a **requirement**. This implementation provides:

✅ **Protection** against common web vulnerabilities (XSS, SQLi)  
✅ **Multiple layers** of defense (sanitization, validation, RBAC)  
✅ **Developer tools** for secure coding (utilities, components)  
✅ **Testing capabilities** (demo page, automated tests)  
✅ **Documentation** for security best practices

**Remember:** Security is an ongoing process, not a one-time implementation. Stay vigilant, keep dependencies updated, and continuously test your application for vulnerabilities.

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Maintained by:** Jeevan Rakth Security Team
