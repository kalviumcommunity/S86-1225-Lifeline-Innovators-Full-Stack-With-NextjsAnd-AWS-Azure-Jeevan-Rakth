# Security Headers Quick Reference

## 🚀 Quick Start

### Testing Security Headers Locally

```bash
# Start your app
npm run dev

# In another terminal, run the test script
node scripts/test-security-headers.js

# Or test a deployed app
TEST_URL=https://your-domain.com node scripts/test-security-headers.js
```

### Check Headers in Browser

1. Open DevTools (F12)
2. Network tab
3. Reload page
4. Click on the document request
5. Headers tab → Response Headers

---

## 📋 Header Checklist

### Before Deployment

- [ ] **HSTS** is enabled with `max-age=63072000`
- [ ] **CSP** includes all required domains for third-party scripts
- [ ] **CORS** `allowedOrigins` updated with production domain
- [ ] **X-Frame-Options** set to `SAMEORIGIN` or `DENY`
- [ ] **X-Content-Type-Options** set to `nosniff`
- [ ] All third-party integrations tested with CSP
- [ ] CORS tested with actual frontend domain
- [ ] Security headers scanned with securityheaders.com

---

## 🔧 Common Configurations

### Adding a Third-Party Script (e.g., Google Analytics)

**In `next.config.js`:**

```javascript
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com",
    "connect-src 'self' https://www.google-analytics.com",
    // ... rest of CSP
  ].join('; ')
}
```

### Adding Production Domain to CORS

**In `src/lib/securityHeaders.ts`:**

```typescript
export const corsConfig = {
  allowedOrigins: [
    'http://localhost:3000', // dev
    'https://jeevan-rakth.com', // production
    'https://www.jeevan-rakth.com', // production www
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean),
  // ...
};
```

### Using CORS Wrapper in API Routes

**Example API route:**

```typescript
import { withCors } from '@/lib/corsMiddleware';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withCors(async (req: NextRequest) => {
  return NextResponse.json({ message: 'Hello World' });
});

export const POST = withCors(async (req: NextRequest) => {
  const body = await req.json();
  // Process request
  return NextResponse.json({ success: true });
});
```

---

## 🐛 Troubleshooting

### CSP Blocking Inline Scripts

**Error:**
```
Refused to execute inline script because it violates CSP directive
```

**Fix:**
Move inline scripts to external files or use nonces.

### CORS Error

**Error:**
```
Access to fetch has been blocked by CORS policy
```

**Check:**
1. Is origin in `allowedOrigins`?
2. Is middleware matcher correct?
3. Is OPTIONS handler working?

**Debug:**
```javascript
// Add logging in middleware.ts
console.log('Request origin:', req.headers.get('origin'));
console.log('Allowed origins:', corsConfig.allowedOrigins);
```

### Image Not Loading

**Error:**
```
Refused to load image because it violates CSP
```

**Fix:**
Update CSP `img-src` directive:
```javascript
"img-src 'self' data: https: blob:;"
```

---

## 🎯 Security Grades

| Grade | Description | Action |
|-------|-------------|--------|
| A+ | All headers perfect | Ready for production |
| A | All headers present, minor warnings | Review warnings, deploy if acceptable |
| B | Missing optional headers | Fix before production |
| C | Missing required headers | Do not deploy |
| D/F | Critical issues | Major fixes needed |

---

## 🔗 Useful Links

- **Test Headers:** https://securityheaders.com
- **Mozilla Observatory:** https://observatory.mozilla.org
- **HSTS Preload:** https://hstspreload.org
- **CSP Evaluator:** https://csp-evaluator.withgoogle.com
- **Full Documentation:** [SECURITY_HEADERS.md](./SECURITY_HEADERS.md)

---

## 📞 Support

For detailed explanations, examples, and troubleshooting, see:
- **[SECURITY_HEADERS.md](./SECURITY_HEADERS.md)** - Complete guide
- **[SECURITY.md](./SECURITY.md)** - General security practices

---

*Last Updated: December 31, 2025*
