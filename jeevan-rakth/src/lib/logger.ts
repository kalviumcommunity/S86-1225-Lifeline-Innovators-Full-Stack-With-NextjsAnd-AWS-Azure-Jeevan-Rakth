export const logger = {
  info: (message: string, meta?: Record<string, unknown> | null) => {
    console.log(
      JSON.stringify({
        level: "info",
        message,
        meta: meta ?? null,
        timestamp: new Date().toISOString(),
      })
    );
  },
  error: (message: string, meta?: Record<string, unknown> | null) => {
    console.error(
      JSON.stringify({
        level: "error",
        message,
        meta: meta ?? null,
        timestamp: new Date().toISOString(),
      })
    );
  },
};
