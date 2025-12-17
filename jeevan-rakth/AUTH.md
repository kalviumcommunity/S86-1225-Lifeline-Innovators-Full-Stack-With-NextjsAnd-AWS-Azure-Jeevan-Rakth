# Authentication APIs (Signup / Login)

This file documents the implemented authentication endpoints, how they work, and example requests.

Overview
- Passwords are hashed with `bcrypt` before being stored in the database.
- JWTs are issued on successful login/signup and set as an `httpOnly` cookie named `token`.
- Endpoints also return the JWT in the response body to simplify testing with tools like Postman or curl.

Endpoints

- POST `/api/auth/signup`
  - Body: `{ name, email, password }`
  - Validates input with Zod (`src/lib/schemas/authSchema.ts`).
  - Returns: `{ success, message, data: { user, token } }` and sets an httpOnly cookie `token`.

- POST `/api/auth/login`
  - Body: `{ email, password }`
  - Validates input with Zod (`src/lib/schemas/authSchema.ts`).
  - Returns: `{ success, message, data: { user, token } }` and sets an httpOnly cookie `token`.

- POST `/api/auth/logout`
  - Clears the `token` cookie.

- GET `/api/users`
  - Protected: requires `Authorization: Bearer <token>` header or an active `token` cookie.

Security notes
- For production, replace `JWT_SECRET` in `.env` with a strong secret and keep it out of source control.
- Consider storing short-lived access tokens in httpOnly cookies and rotating with refresh tokens for long sessions.

Examples (curl)

Signup:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"mypassword"}'
```

Login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"mypassword"}'
```

Protected users route (cookie or header):

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <TOKEN_FROM_LOGIN>"
```
