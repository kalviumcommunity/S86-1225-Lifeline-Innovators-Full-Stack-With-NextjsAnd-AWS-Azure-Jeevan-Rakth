// lib/responseHandler.ts
import { NextResponse } from "next/server";

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK",
  ROLLBACK_TEST: "ROLLBACK_TEST",
  ORDERS_FETCH_FAILED: "ORDERS_FETCH_FAILED",
  ORDER_TRANSACTION_FAILED: "ORDER_TRANSACTION_FAILED",
  USERS_FETCH_FAILED: "USERS_FETCH_FAILED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  EMAIL_CONFLICT: "EMAIL_CONFLICT",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
  // JWT Authentication error codes
  REFRESH_TOKEN_MISSING: "REFRESH_TOKEN_MISSING",
  INVALID_REFRESH_TOKEN: "INVALID_REFRESH_TOKEN",
  REFRESH_FAILED: "REFRESH_FAILED",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  NOT_AUTHENTICATED: "NOT_AUTHENTICATED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

type SuccessOptions<M> = {
  status?: number;
  meta?: M;
};

type ErrorOptions = {
  status?: number;
  code?: ErrorCode;
  details?: unknown;
};

export function successResponse<T, M = undefined>(
  message: string,
  data?: T,
  options?: SuccessOptions<M>
) {
  const { status = 200, meta } = options ?? {};

  return NextResponse.json(
    {
      success: true,
      message,
      data: data ?? null,
      ...(meta !== undefined ? { meta } : {}),
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function errorResponse(message: string, options?: ErrorOptions) {
  const {
    status = 400,
    code = ERROR_CODES.UNKNOWN_ERROR,
    details,
  } = options ?? {};

  return NextResponse.json(
    {
      success: false,
      message,
      error: {
        code,
        ...(details !== undefined ? { details } : {}),
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
