import Redis from "ioredis";

const url = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new Redis(url);

// Optional: export a default TTL (seconds) that routes can reuse
export const DEFAULT_CACHE_TTL = Number(process.env.REDIS_TTL_SECONDS) || 60;

export default redis;
