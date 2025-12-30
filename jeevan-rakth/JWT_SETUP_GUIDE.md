# Quick Start: JWT Authentication Setup

## Installation Steps

### 1. Install Type Definitions

The implementation requires TypeScript type definitions for `jsonwebtoken` and `bcrypt`:

```bash
npm install --save-dev @types/jsonwebtoken @types/bcrypt
```

Or if using yarn:

```bash
yarn add -D @types/jsonwebtoken @types/bcrypt
```

### 2. Set Environment Variables

Generate secure secrets:

```bash
# Generate JWT access token secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT refresh token secret (use different value!)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Add to your `.env` file:

```env
# JWT Authentication Secrets
JWT_SECRET=<paste-first-generated-secret-here>
JWT_REFRESH_SECRET=<paste-second-generated-secret-here>

# Optional: Enable refresh token rotation for enhanced security
ENABLE_REFRESH_TOKEN_ROTATION=false

# Redis (required for token revocation)
REDIS_URL=redis://localhost:6379
```

**⚠️ Important:** Never commit these secrets to version control! Keep them in `.env` (which should be in `.gitignore`).

### 3. Ensure Redis is Running

JWT token revocation requires Redis:

```bash
# Option 1: Using Docker
docker run -d --name redis-local -p 6379:6379 redis:8

# Option 2: Using local installation
redis-server

# Verify Redis is running
docker ps | grep redis  # for Docker
# or
redis-cli ping  # should return "PONG"
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Database Migrations

Ensure your database is up to date:

```bash
npx prisma migrate dev
```

### 6. Start Development Server

```bash
npm run dev
```

The server should start at `http://localhost:3000`

---

## Verification

### Test the Implementation

Run the automated test script:

```bash
node scripts/test-jwt.js
```

**Expected output:**
```
🧪 JWT Authentication Test Suite
============================================================

✓ Test 1: Login and receive tokens
------------------------------------------------------------
✅ Login successful
   User: Test User (test@example.com)
   Role: user
   Access Token: eyJhbGciOiJIUzI1NiIsInR5cC...
   Cookies set: accessToken, refreshToken

... (more tests)

============================================================
🎉 All tests completed successfully!
```

### Manual Verification

1. **Login via UI:**
   - Navigate to `http://localhost:3000/login`
   - Login with test credentials
   - Open DevTools → Application → Cookies
   - Verify `accessToken` and `refreshToken` cookies exist

2. **Check Cookie Properties:**
   - `HttpOnly`: ✓ (should be checked)
   - `Secure`: ✓ in production
   - `SameSite`: Strict
   - `Path`: `/` for accessToken, `/api/auth/refresh` for refreshToken

3. **Test Token Refresh:**
   - Make API requests
   - Wait 16+ minutes (access token expires after 15 min)
   - Make another API request
   - Check Network tab - should see automatic refresh call
   - Original request should succeed after refresh

---

## Troubleshooting

### Error: "Could not find a declaration file for module 'jsonwebtoken'"

**Solution:** Install type definitions:
```bash
npm install --save-dev @types/jsonwebtoken @types/bcrypt
```

### Error: "Redis connection failed"

**Solution:** Ensure Redis is running:
```bash
docker run -d --name redis-local -p 6379:6379 redis:8
```

### Error: "JWT_SECRET is not defined"

**Solution:** Set environment variables in `.env`:
```env
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-other-secret-here
```

### Login works but protected routes return 401

**Possible causes:**
1. Access token expired (wait for automatic refresh)
2. Cookie not being sent (check `credentials: 'include'` in fetch)
3. Middleware not running (check `middleware.ts` config)

**Solution:** Check browser console for error messages and network tab for request details.

### Token refresh not working

**Checklist:**
- [ ] Refresh token cookie exists
- [ ] Refresh token path is `/api/auth/refresh`
- [ ] Fetcher has automatic refresh logic
- [ ] Error response includes `TOKEN_EXPIRED` code
- [ ] Redis is running (for revocation check)

---

## Next Steps

1. ✅ Read [JWT_AUTHENTICATION.md](./JWT_AUTHENTICATION.md) for complete documentation
2. ✅ Review [JWT_SECURITY_VISUAL_GUIDE.md](./JWT_SECURITY_VISUAL_GUIDE.md) for security details
3. ✅ Check [IMPLEMENTATION_SUMMARY_JWT.md](./IMPLEMENTATION_SUMMARY_JWT.md) for implementation overview
4. ✅ Test all authentication flows (login, logout, refresh, protected routes)
5. ✅ Deploy to production with HTTPS enabled

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Generate strong secrets (64+ characters, cryptographically random)
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (required for `secure: true` cookies)
- [ ] Configure Redis in production environment
- [ ] Set `ENABLE_REFRESH_TOKEN_ROTATION=true` for enhanced security
- [ ] Add rate limiting to login endpoint
- [ ] Configure CORS properly
- [ ] Enable security headers (CSP, HSTS, etc.)
- [ ] Test all flows in production environment

---

## Support

For issues or questions:
1. Check the comprehensive documentation in `JWT_AUTHENTICATION.md`
2. Review error logs in browser console and server terminal
3. Run the test script: `node scripts/test-jwt.js`
4. Verify all environment variables are set correctly

---

**Ready to go! 🚀**
