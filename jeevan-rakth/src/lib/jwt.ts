/**
 * JWT Utility Functions
 *
 * This module provides comprehensive JWT token management for authentication.
 * It implements a dual-token system with access tokens (short-lived) and
 * refresh tokens (long-lived) for enhanced security.
 *
 * JWT Structure:
 * - Header: Contains algorithm (HS256) and token type (JWT)
 * - Payload: Contains user claims (id, email, role) and expiry
 * - Signature: HMAC signature to verify token integrity
 */

import jwt from "jsonwebtoken";
import redis from "@/lib/redis";

// Environment variables with fallback (use .env in production!)
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "supersecretkey";
const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || "superrefreshsecretkey";

// Token expiry times
export const ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes - short-lived for security
export const REFRESH_TOKEN_EXPIRY = "7d"; // 7 days - long-lived for convenience

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

/**
 * Generate Access Token
 *
 * Access tokens are short-lived (15 minutes) and used for API requests.
 * They contain user identity and role information.
 *
 * @param payload - User information to encode in the token
 * @returns Signed JWT access token
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: "HS256",
  });
}

/**
 * Generate Refresh Token
 *
 * Refresh tokens are long-lived (7 days) and used to obtain new access tokens.
 * They should be stored securely in HTTP-only cookies.
 *
 * @param payload - User information to encode in the token
 * @returns Signed JWT refresh token
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    algorithm: "HS256",
  });
}

/**
 * Verify Access Token
 *
 * Validates the access token signature and checks expiry.
 * Throws error if token is invalid or expired.
 *
 * @param token - JWT access token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyAccessToken(token: string): DecodedToken {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as DecodedToken;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Access token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid access token");
    }
    throw error;
  }
}

/**
 * Verify Refresh Token
 *
 * Validates the refresh token signature and checks expiry.
 * Also verifies token hasn't been revoked in Redis.
 *
 * @param token - JWT refresh token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid, expired, or revoked
 */
export async function verifyRefreshToken(token: string): Promise<DecodedToken> {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as DecodedToken;

    // Check if token has been revoked (logged out)
    const isRevoked = await isRefreshTokenRevoked(decoded.id, token);
    if (isRevoked) {
      throw new Error("Refresh token has been revoked");
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Refresh token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid refresh token");
    }
    throw error;
  }
}

/**
 * Revoke Refresh Token
 *
 * Adds refresh token to Redis blacklist to prevent reuse after logout.
 * Tokens are stored with TTL matching their expiry time.
 *
 * @param userId - User ID who owns the token
 * @param token - Refresh token to revoke
 */
export async function revokeRefreshToken(
  userId: string,
  token: string
): Promise<void> {
  try {
    const key = `revoked:refresh:${userId}:${token}`;
    // Store with 7 days expiry (matching refresh token expiry)
    await redis.setex(key, 7 * 24 * 60 * 60, "1");
  } catch (error) {
    console.error("Failed to revoke refresh token:", error);
    // Don't throw - best effort revocation
  }
}

/**
 * Check if Refresh Token is Revoked
 *
 * Queries Redis to check if token has been blacklisted.
 *
 * @param userId - User ID who owns the token
 * @param token - Refresh token to check
 * @returns True if token is revoked, false otherwise
 */
export async function isRefreshTokenRevoked(
  userId: string,
  token: string
): Promise<boolean> {
  try {
    const key = `revoked:refresh:${userId}:${token}`;
    const result = await redis.get(key);
    return result === "1";
  } catch (error) {
    console.error("Failed to check token revocation:", error);
    // On Redis error, assume not revoked (fail open for availability)
    return false;
  }
}

/**
 * Generate Token Pair
 *
 * Convenience function to generate both access and refresh tokens.
 * Use this during login/signup to issue complete token set.
 *
 * @param payload - User information to encode in tokens
 * @returns Object containing both access and refresh tokens
 */
export function generateTokenPair(payload: TokenPayload): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Decode Token Without Verification
 *
 * Extracts payload from token without verifying signature.
 * Useful for getting user info from expired tokens.
 *
 * WARNING: Never use this for authentication! Only for debugging/logging.
 *
 * @param token - JWT token to decode
 * @returns Decoded payload or null if invalid
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    return jwt.decode(token) as DecodedToken;
  } catch {
    return null;
  }
}
