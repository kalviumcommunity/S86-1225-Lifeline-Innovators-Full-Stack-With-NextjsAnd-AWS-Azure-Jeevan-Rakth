import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Database Health Check Endpoint
 *
 * Tests database connectivity and returns health status
 * Useful for monitoring and validation of managed databases
 */

export async function GET() {
  const startTime = Date.now();

  try {
    // Test 1: Basic database connection
    const versionResult = await prisma.$queryRaw<Array<{ version: string }>>`
      SELECT version() as version
    `;

    // Test 2: Get current timestamp
    const timeResult = await prisma.$queryRaw<
      Array<{
        server_time: Date;
        db_name: string;
        ssl_enabled: boolean;
      }>
    >`
      SELECT 
        NOW() as server_time,
        current_database() as db_name,
        ssl_is_used() as ssl_enabled
    `;

    // Test 3: Count tables (verify schema exists)
    const tableCountResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;

    // Test 4: Check active connections
    const connectionResult = await prisma.$queryRaw<
      Array<{
        active_connections: bigint;
        max_connections: number;
      }>
    >`
      SELECT 
        (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()) as active_connections,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
    `;

    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "healthy",
        database: {
          connected: true,
          version: versionResult[0]?.version?.split(",")[0] || "Unknown",
          name: timeResult[0]?.db_name || "Unknown",
          ssl_enabled: timeResult[0]?.ssl_enabled || false,
          tables: Number(tableCountResult[0]?.count || 0),
          connections: {
            active: Number(connectionResult[0]?.active_connections || 0),
            max: connectionResult[0]?.max_connections || 0,
          },
        },
        timestamp: timeResult[0]?.server_time || new Date(),
        responseTime: `${responseTime}ms`,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error("Database health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        database: {
          connected: false,
          error: errorMessage,
        },
        timestamp: new Date(),
        responseTime: `${responseTime}ms`,
      },
      {
        status: 503, // Service Unavailable
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}

// Optional: Simple HEAD request for basic health check
export async function HEAD() {
  try {
    // Quick connection test
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
