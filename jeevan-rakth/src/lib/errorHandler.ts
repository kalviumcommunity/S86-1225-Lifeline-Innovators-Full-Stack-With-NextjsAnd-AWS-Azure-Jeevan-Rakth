import { logger } from "./logger";
import { errorResponse, ERROR_CODES } from "./responseHandler";

type ErrorHandlerOptions = {
  status?: number;
  code?: (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
};

export function handleError(
  error: unknown,
  context: string,
  options?: ErrorHandlerOptions
) {
  const isProd = process.env.NODE_ENV === "production";
  const status = options?.status ?? 500;
  const code = options?.code ?? ERROR_CODES.UNKNOWN_ERROR;

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  logger.error(`Error in ${context}`, {
    message,
    stack: isProd ? "REDACTED" : stack,
    context,
  });

  const userMessage = isProd
    ? "Something went wrong. Please try again later."
    : (message ?? "Unknown error");

  return errorResponse(userMessage, {
    status,
    code,
    details: isProd ? undefined : { stack },
  });
}
