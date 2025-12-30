# JWT Authentication System

## Overview

This application implements a secure, production-ready JWT (JSON Web Token) authentication system with dual-token architecture, automatic token refresh, and comprehensive security measures against common web vulnerabilities.

## Table of Contents

- [JWT Structure](#jwt-structure)
- [Access & Refresh Tokens](#access--refresh-tokens)
- [Token Storage & Security](#token-storage--security)
- [Token Refresh Flow](#token-refresh-flow)
- [Security Measures](#security-measures)
- [Implementation Details](#implementation-details)
- [API Endpoints](#api-endpoints)
- [Testing & Verification](#testing--verification)

---

## JWT Structure

A JSON Web Token consists of three parts separated by dots (`.`):

```
header.payload.signature
```

### Example Decoded JWT

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "id": "user-uuid-12345",
    "email": "user@example.com",
    "role": "user",
    "iat": 1735574400,
    "exp": 1735575300
  },
  "signature": "hashed-verification-string"
}
```

### JWT Components Explained

| Component | Description | Purpose |
|-----------|-------------|---------|
| **Header** | Contains algorithm (`HS256`) and token type (`JWT`) | Specifies how the token is signed |
| **Payload** | Contains claims (user data, expiry, issued-at time) | Stores user identity and metadata |
| **Signature** | HMAC-SHA256 hash of header + payload + secret | Ensures integrity - verifies token hasn't been tampered with |

**⚠️ Security Note:** JWTs are **encoded**, not **encrypted**. Never store sensitive data like passwords or credit card numbers in the payload - anyone can decode and read it!

---

## Access & Refresh Tokens

This implementation uses a **dual-token system** for optimal security and user experience:

### Access Token

- **Lifespan:** 15 minutes (short-lived)
- **Purpose:** Authorize API requests
- **Storage:** HTTP-only cookie (`accessToken`)
- **Usage:** Sent with every API call to verify user identity

### Refresh Token

- **Lifespan:** 7 days (long-lived)
- **Purpose:** Obtain new access tokens after expiry
- **Storage:** HTTP-only cookie (`refreshToken`) with restricted path
- **Usage:** Sent only to `/api/auth/refresh` to generate new access tokens

### Why Two Tokens?

```
┌─────────────────────────────────────────────────────────┐
│  Security vs Convenience Trade-off                      │
├─────────────────────────────────────────────────────────┤
│  Short-lived access tokens  → High security            │
│  Long-lived refresh tokens  → Better UX (less logins)  │
│                                                          │
│  If access token stolen → Only valid for 15 minutes    │
│  If refresh token stolen → Can be revoked in database  │
└─────────────────────────────────────────────────────────┘
```

---

## Token Storage & Security

### Cookie Configuration

Our implementation stores tokens in **HTTP-only cookies** with strict security settings:

```typescript
// Access Token Cookie
res.cookies.set("accessToken", token, {
  httpOnly: true,        // ✓ Not accessible to JavaScript
  secure: true,          // ✓ HTTPS only in production
  sameSite: "strict",    // ✓ Prevents CSRF attacks
  path: "/",             // ✓ Sent to all routes
  maxAge: 15 * 60,       // ✓ 15 minutes
});

// Refresh Token Cookie
res.cookies.set("refreshToken", token, {
  httpOnly: true,        
  secure: true,          
  sameSite: "strict",    
  path: "/api/auth/refresh",  // ✓ Only sent to refresh endpoint
  maxAge: 7 * 24 * 60 * 60,   // ✓ 7 days
});
```

### Storage Security Comparison

| Storage Method | XSS Vulnerable? | CSRF Vulnerable? | Our Choice |
|----------------|-----------------|------------------|------------|
| localStorage | ✗ Yes | ✓ No | ❌ Not used |
| sessionStorage | ✗ Yes | ✓ No | ❌ Not used |
| HTTP-only Cookie | ✓ No | ✗ Mitigated with SameSite | ✅ **Used** |
| Memory (React state) | ✗ Yes (if XSS exists) | ✓ No | ❌ Not used |

**Why HTTP-only cookies?**
- Protected from XSS (JavaScript can't access them)
- Automatically sent with requests
- Can be configured with `SameSite` to prevent CSRF

---

## Token Refresh Flow

### Sequence Diagram

```
┌────────┐                 ┌────────┐                ┌────────────┐
│ Client │                 │ Server │                │   Redis    │
└───┬────┘                 └───┬────┘                └─────┬──────┘
    │                          │                           │
    │  1. Login with credentials                          │
    ├────────────────────────► │                           │
    │                          │  2. Verify credentials    │
    │                          ├──────────────────────────►│
    │                          │                           │
    │  3. Access + Refresh Tokens                         │
    │ ◄────────────────────────┤                           │
    │                          │                           │
    │  4. API request with Access Token (15 min later)    │
    ├────────────────────────► │                           │
    │                          │  5. Token expired!        │
    │  6. 401 Unauthorized     │                           │
    │ ◄────────────────────────┤                           │
    │                          │                           │
    │  7. Request new Access Token (with Refresh Token)   │
    ├────────────────────────► │                           │
    │                          │  8. Verify Refresh Token  │
    │                          │  9. Check not revoked     │
    │                          ├──────────────────────────►│
    │                          │ ◄──────────────────────────┤
    │                          │                           │
    │  10. New Access Token    │                           │
    │ ◄────────────────────────┤                           │
    │                          │                           │
    │  11. Retry original request with new token          │
    ├────────────────────────► │                           │
    │                          │                           │
    │  12. Success response    │                           │
    │ ◄────────────────────────┤                           │
    │                          │                           │
```

### Automatic Refresh Implementation

The application automatically refreshes tokens when they expire:

**Client-side (`fetcher.ts`):**
```typescript
// 1. Make API request
const response = await fetch(url, { credentials: "include" });

// 2. If 401 with TOKEN_EXPIRED code
if (response.status === 401 && errorData.code === "TOKEN_EXPIRED") {
  // 3. Attempt refresh
  const refreshed = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include"
  });
  
  // 4. Retry original request with new token
  if (refreshed.ok) {
    return fetch(url, { credentials: "include" });
  }
}
```

**Server-side (`/api/auth/refresh`):**
```typescript
// 1. Verify refresh token
const decoded = await verifyRefreshToken(refreshToken);

// 2. Check if token is revoked (logged out)
const isRevoked = await isRefreshTokenRevoked(decoded.id, refreshToken);

// 3. Generate new access token
const newAccessToken = generateAccessToken(decoded);

// 4. (Optional) Rotate refresh token for security
const newRefreshToken = generateRefreshToken(decoded);
```

---

## Security Measures

### Threat Matrix & Mitigations

| Threat | Description | How We Mitigate |
|--------|-------------|----------------|
| **XSS (Cross-Site Scripting)** | Malicious scripts steal tokens from browser storage | ✅ HTTP-only cookies prevent JavaScript access<br>✅ Content Security Policy headers<br>✅ Input sanitization |
| **CSRF (Cross-Site Request Forgery)** | Attacker tricks user into making unwanted authenticated requests | ✅ `SameSite=Strict` cookies<br>✅ Origin validation in middleware |
| **Token Replay Attack** | Attacker reuses stolen token | ✅ Short token lifespan (15 min)<br>✅ Token rotation on refresh<br>✅ Refresh token revocation in Redis |
| **Man-in-the-Middle (MITM)** | Attacker intercepts tokens in transit | ✅ `secure: true` forces HTTPS<br>✅ TLS/SSL encryption |
| **Brute Force** | Attacker guesses tokens | ✅ Cryptographically strong secrets (256-bit)<br>✅ Rate limiting on login endpoints |
| **Session Fixation** | Attacker forces user to use known session | ✅ New tokens generated on each login<br>✅ Old tokens revoked on logout |

### Security Best Practices Implemented

#### 1. Strong Secret Keys

```bash
# Generate cryptographically secure secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Environment variables:**
```env
JWT_SECRET=<64-character-hex-string>
JWT_REFRESH_SECRET=<different-64-character-hex-string>
```

#### 2. Token Revocation

Refresh tokens are stored in Redis blacklist on logout:

```typescript
// On logout
await revokeRefreshToken(userId, refreshToken);

// On token refresh
const isRevoked = await isRefreshTokenRevoked(userId, refreshToken);
if (isRevoked) throw new Error("Token revoked");
```

#### 3. Refresh Token Rotation (Optional)

Enable with environment variable:
```env
ENABLE_REFRESH_TOKEN_ROTATION=true
```

When enabled, each token refresh:
1. Revokes old refresh token
2. Issues new refresh token
3. Prevents token reuse if stolen

#### 4. Role-Based Access Control (RBAC)

Middleware enforces role-based permissions:

```typescript
if (pathname.startsWith("/api/admin") && decoded.role !== "admin") {
  return NextResponse.json({ message: "Access denied" }, { status: 403 });
}
```

---

## Implementation Details

### File Structure

```
src/
├── lib/
│   └── jwt.ts                    # JWT utility functions
├── middleware.ts                 # Token validation middleware
├── app/api/auth/
│   ├── login/route.ts           # Login endpoint (issues tokens)
│   ├── signup/route.ts          # Signup endpoint (issues tokens)
│   ├── logout/route.ts          # Logout endpoint (revokes tokens)
│   ├── refresh/route.ts         # Token refresh endpoint
│   └── me/route.ts              # Get current user
├── context/
│   └── AuthContext.tsx          # Client-side auth state
└── lib/
    └── fetcher.ts               # API fetcher with auto-refresh
```

### Key Functions (`lib/jwt.ts`)

| Function | Purpose | Returns |
|----------|---------|---------|
| `generateAccessToken(payload)` | Create access token | 15-minute JWT |
| `generateRefreshToken(payload)` | Create refresh token | 7-day JWT |
| `verifyAccessToken(token)` | Validate access token | Decoded payload or throws |
| `verifyRefreshToken(token)` | Validate refresh token + check revocation | Decoded payload or throws |
| `revokeRefreshToken(userId, token)` | Blacklist token in Redis | void |
| `generateTokenPair(payload)` | Create both tokens | `{ accessToken, refreshToken }` |

---

## API Endpoints

### POST `/api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid-123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookies Set:**
- `accessToken` (15 minutes, path: `/`)
- `refreshToken` (7 days, path: `/api/auth/refresh`)

---

### POST `/api/auth/refresh`

**Request:** (No body, uses refresh token from cookie)

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookies Updated:**
- `accessToken` (new 15-minute token)
- `refreshToken` (new if rotation enabled)

---

### POST `/api/auth/logout`

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Cookies Cleared:**
- `accessToken` (set to empty, maxAge: 0)
- `refreshToken` (set to empty, maxAge: 0)

**Side Effects:**
- Refresh token added to Redis blacklist

---

### GET `/api/auth/me`

**Request:** (Uses access token from cookie)

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "user": {
    "id": "uuid-123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user"
  }
}
```

---

## Testing & Verification

### Manual Testing Steps

#### 1. Test Login & Token Generation

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt -v
```

**Expected:**
- ✅ `200 OK` response
- ✅ `Set-Cookie: accessToken=...` header
- ✅ `Set-Cookie: refreshToken=...` header
- ✅ Response body contains user and accessToken

#### 2. Test Access Token Validation

```bash
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

**Expected:**
- ✅ `200 OK` response
- ✅ User data returned

#### 3. Test Access Token Expiry

```bash
# Wait 16 minutes (token expires after 15 min)
sleep 960

curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

**Expected:**
- ✅ `401 Unauthorized` response
- ✅ Error code: `TOKEN_EXPIRED`

#### 4. Test Token Refresh

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt -c cookies.txt
```

**Expected:**
- ✅ `200 OK` response
- ✅ New `accessToken` in cookies
- ✅ Can now access protected routes again

#### 5. Test Logout & Token Revocation

```bash
# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt -c cookies.txt

# Try to refresh (should fail)
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt
```

**Expected:**
- ✅ Logout succeeds
- ✅ Refresh fails with `401` or `403`
- ✅ Refresh token is revoked in Redis

### Browser Developer Console Tests

#### Check Cookie Storage

```javascript
// Open DevTools → Application → Cookies
// Look for:
// - accessToken (httpOnly, secure, sameSite=Strict)
// - refreshToken (httpOnly, secure, sameSite=Strict, path=/api/auth/refresh)
```

#### Verify Automatic Refresh

```javascript
// 1. Login through UI
// 2. Wait 15+ minutes
// 3. Make API call (e.g., navigate to dashboard)
// 4. Check Network tab for:
//    - Original request (fails with 401)
//    - Refresh request to /api/auth/refresh
//    - Retry of original request (succeeds)
```

### Evidence of Working Implementation

#### Console Logs

When automatic refresh works, you'll see:

```
Access token expired, attempting refresh...
Access token refreshed successfully
```

#### Network Tab Flow

```
1. GET /api/users → 401 Unauthorized (TOKEN_EXPIRED)
2. POST /api/auth/refresh → 200 OK (new accessToken)
3. GET /api/users → 200 OK (data returned)
```

#### Redis Verification

Check revoked tokens:

```bash
redis-cli KEYS "revoked:refresh:*"
```

---

## Environment Configuration

### Required Environment Variables

```env
# JWT Secrets (REQUIRED - use strong random values in production!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# Optional: Enable refresh token rotation
ENABLE_REFRESH_TOKEN_ROTATION=false

# Redis (required for token revocation)
REDIS_URL=redis://localhost:6379
```

### Generating Secure Secrets

**Method 1: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Method 2: OpenSSL**
```bash
openssl rand -hex 64
```

**Method 3: Online Generator**
- https://www.grc.com/passwords.htm (Use "63 random alpha-numeric characters")

---

## Reflection on Security

### What We've Achieved

✅ **Protection against XSS:** HTTP-only cookies prevent JavaScript token theft  
✅ **Protection against CSRF:** `SameSite=Strict` cookies block cross-site requests  
✅ **Short attack window:** 15-minute access token lifespan limits damage from stolen tokens  
✅ **Token revocation:** Logout properly invalidates refresh tokens in Redis  
✅ **Automatic refresh:** Seamless UX without requiring frequent logins  
✅ **Defense in depth:** Multiple security layers (HTTPS, secure cookies, token rotation)  

### Remaining Considerations

⚠️ **Rate limiting:** Add rate limiting to prevent brute force attacks on login  
⚠️ **IP-based revocation:** Track token issuance by IP for suspicious activity detection  
⚠️ **Multi-device support:** Consider device fingerprinting for better session management  
⚠️ **Refresh token families:** Implement token families to detect token theft  

---

## Quick Reference

### Token Lifespans

| Token Type | Lifespan | Cookie Name | Path |
|------------|----------|-------------|------|
| Access Token | 15 minutes | `accessToken` | `/` |
| Refresh Token | 7 days | `refreshToken` | `/api/auth/refresh` |

### Common Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `TOKEN_EXPIRED` | Access token expired | Trigger refresh |
| `INVALID_REFRESH_TOKEN` | Refresh token invalid/expired | Redirect to login |
| `REFRESH_TOKEN_MISSING` | No refresh token in request | Redirect to login |
| `NOT_AUTHENTICATED` | No access token | Redirect to login |

### Debug Checklist

- [ ] Environment variables set correctly?
- [ ] Redis running and accessible?
- [ ] Cookies being sent with credentials: "include"?
- [ ] HTTPS enabled in production (for secure cookies)?
- [ ] Token secrets different and strong?
- [ ] Browser not blocking third-party cookies?

---

## Summary

This implementation provides:

1. **Dual-token architecture** with short-lived access tokens and long-lived refresh tokens
2. **Automatic token refresh** for seamless user experience
3. **Secure storage** in HTTP-only, SameSite=Strict cookies
4. **Token revocation** using Redis blacklist
5. **Comprehensive security** against XSS, CSRF, and token replay attacks
6. **Production-ready** with proper error handling and logging

The system balances security with usability, providing robust protection while maintaining a smooth authentication experience.
