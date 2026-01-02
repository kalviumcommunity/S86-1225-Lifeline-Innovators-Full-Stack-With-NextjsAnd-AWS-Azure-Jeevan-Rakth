/**
 * Database Connection Test Script
 *
 * Tests connection to managed PostgreSQL database (AWS RDS or Azure Database)
 * Validates connectivity, SSL, and basic query execution
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { Pool } = require("pg");

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testDatabaseConnection() {
  const startTime = Date.now();

  log("\n" + "=".repeat(60), colors.cyan);
  log("DATABASE CONNECTION TEST", colors.bold + colors.cyan);
  log("=".repeat(60) + "\n", colors.cyan);

  // Get DATABASE_URL from environment
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    log("❌ ERROR: DATABASE_URL environment variable is not set", colors.red);
    log("\nPlease set DATABASE_URL in your .env file:", colors.yellow);
    log(
      "  DATABASE_URL=postgresql://user:password@host:5432/database",
      colors.yellow
    );
    process.exit(1);
  }

  // Parse connection string to display info (hide password)
  let connectionInfo = databaseUrl;
  try {
    const url = new URL(databaseUrl);
    connectionInfo = `${url.protocol}//${url.username}:****@${url.host}${url.pathname}`;

    log("📍 Connection Target:", colors.cyan);
    log(`   Protocol: ${url.protocol}`, colors.reset);
    log(`   Host: ${url.hostname}`, colors.reset);
    log(`   Port: ${url.port || "5432"}`, colors.reset);
    log(
      `   Database: ${url.pathname.substring(1).split("?")[0]}`,
      colors.reset
    );
    log(`   Username: ${url.username}`, colors.reset);
    log(
      `   SSL Mode: ${url.searchParams.get("sslmode") || "prefer"}`,
      colors.reset
    );
    log("");
  } catch {
    log(`   ${connectionInfo.replace(/:[^:@]+@/, ":****@")}`, colors.reset);
    log("");
  }

  // Determine database provider
  const isAWS = databaseUrl.includes("rds.amazonaws.com");
  const isAzure = databaseUrl.includes("postgres.database.azure.com");
  const provider = isAWS
    ? "AWS RDS"
    : isAzure
      ? "Azure Database"
      : "PostgreSQL";

  log(`🔧 Detected Provider: ${provider}`, colors.cyan);
  log("");

  // Create connection pool
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl:
      databaseUrl.includes("sslmode=require") || isAWS || isAzure
        ? { rejectUnauthorized: false }
        : false,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 1, // Single connection for testing
  });

  const tests = [];
  let allTestsPassed = true;

  try {
    // Test 1: Basic Connection
    log("🔌 Test 1: Basic Connection...", colors.cyan);
    const connectStart = Date.now();
    const client = await pool.connect();
    const connectTime = Date.now() - connectStart;
    client.release();
    tests.push({ name: "Basic Connection", passed: true, time: connectTime });
    log(`   ✅ Connected successfully (${connectTime}ms)`, colors.green);
    log("");

    // Test 2: Database Version
    log("🔍 Test 2: Database Version...", colors.cyan);
    const versionStart = Date.now();
    const versionResult = await pool.query("SELECT version()");
    const versionTime = Date.now() - versionStart;
    const version = versionResult.rows[0].version;
    tests.push({ name: "Database Version", passed: true, time: versionTime });
    log(`   ✅ ${version.split(",")[0]} (${versionTime}ms)`, colors.green);
    log("");

    // Test 3: Current Timestamp
    log("⏰ Test 3: Server Timestamp...", colors.cyan);
    const timeStart = Date.now();
    const timeResult = await pool.query(
      "SELECT NOW() as server_time, current_database() as db_name"
    );
    const timeQueryTime = Date.now() - timeStart;
    const { server_time, db_name } = timeResult.rows[0];
    tests.push({ name: "Server Timestamp", passed: true, time: timeQueryTime });
    log(`   ✅ Server Time: ${server_time} (${timeQueryTime}ms)`, colors.green);
    log(`   ✅ Database: ${db_name}`, colors.green);
    log("");

    // Test 4: SSL/TLS Encryption
    log("🔒 Test 4: SSL/TLS Encryption...", colors.cyan);
    const sslStart = Date.now();
    const sslResult = await pool.query("SELECT ssl_is_used() as ssl_enabled");
    const sslTime = Date.now() - sslStart;
    const sslEnabled = sslResult.rows[0].ssl_enabled;

    if (sslEnabled) {
      tests.push({ name: "SSL Encryption", passed: true, time: sslTime });
      log(`   ✅ SSL/TLS is ENABLED (${sslTime}ms)`, colors.green);

      // Get SSL version
      try {
        await pool.query("SELECT version() as ssl_version");
        log(`   ✅ Connection is encrypted`, colors.green);
      } catch {
        // SSL version query might not be available on all systems
      }
    } else {
      tests.push({ name: "SSL Encryption", passed: false, time: sslTime });
      log(
        `   ⚠️  SSL/TLS is DISABLED - NOT recommended for production (${sslTime}ms)`,
        colors.yellow
      );
      allTestsPassed = false;
    }
    log("");

    // Test 5: Connection Pool Stats
    log("📊 Test 5: Connection Pool Info...", colors.cyan);
    log(`   ✅ Total Connections: ${pool.totalCount}`, colors.green);
    log(`   ✅ Idle Connections: ${pool.idleCount}`, colors.green);
    log(`   ✅ Waiting Requests: ${pool.waitingCount}`, colors.green);
    tests.push({ name: "Connection Pool", passed: true, time: 0 });
    log("");

    // Test 6: Database Permissions
    log("🔐 Test 6: Database Permissions...", colors.cyan);
    const permStart = Date.now();
    try {
      // Check if we can create a test table
      await pool.query(
        "CREATE TABLE IF NOT EXISTS _connection_test (id SERIAL PRIMARY KEY, test_value TEXT)"
      );
      await pool.query(
        "INSERT INTO _connection_test (test_value) VALUES ($1)",
        ["test"]
      );
      await pool.query("SELECT * FROM _connection_test LIMIT 1");
      await pool.query("DROP TABLE _connection_test");
      const permTime = Date.now() - permStart;
      tests.push({
        name: "Database Permissions",
        passed: true,
        time: permTime,
      });
      log(
        `   ✅ CREATE, INSERT, SELECT, DROP permissions verified (${permTime}ms)`,
        colors.green
      );
    } catch (error) {
      const permTime = Date.now() - permStart;
      tests.push({
        name: "Database Permissions",
        passed: false,
        time: permTime,
      });
      log(`   ⚠️  Limited permissions detected (${permTime}ms)`, colors.yellow);
      log(`   ℹ️  Error: ${error.message}`, colors.yellow);
      allTestsPassed = false;
    }
    log("");

    // Test 7: Response Time (Latency)
    log("⚡ Test 7: Latency Test (10 queries)...", colors.cyan);
    const latencies = [];
    for (let i = 0; i < 10; i++) {
      const latencyStart = Date.now();
      await pool.query("SELECT 1");
      latencies.push(Date.now() - latencyStart);
    }
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const minLatency = Math.min(...latencies);
    const maxLatency = Math.max(...latencies);

    tests.push({ name: "Latency Test", passed: true, time: avgLatency });
    log(`   ✅ Average Latency: ${avgLatency.toFixed(2)}ms`, colors.green);
    log(`   ✅ Min/Max: ${minLatency}ms / ${maxLatency}ms`, colors.green);

    if (avgLatency > 100) {
      log(
        `   ⚠️  High latency detected - consider moving closer to database region`,
        colors.yellow
      );
    }
    log("");

    // Test 8: Managed Database Features
    if (isAWS || isAzure) {
      log("☁️  Test 8: Managed Database Features...", colors.cyan);
      try {
        // Check database size
        const sizeResult = await pool.query(
          `SELECT pg_size_pretty(pg_database_size(current_database())) as db_size`
        );
        log(`   ✅ Database Size: ${sizeResult.rows[0].db_size}`, colors.green);

        // Check active connections
        const connResult = await pool.query(
          `SELECT count(*) as active_connections FROM pg_stat_activity WHERE datname = current_database()`
        );
        log(
          `   ✅ Active Connections: ${connResult.rows[0].active_connections}`,
          colors.green
        );

        // Check max connections
        const maxConnResult = await pool.query(
          `SELECT setting as max_connections FROM pg_settings WHERE name = 'max_connections'`
        );
        log(
          `   ✅ Max Connections: ${maxConnResult.rows[0].max_connections}`,
          colors.green
        );

        tests.push({ name: "Managed Features", passed: true, time: 0 });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        log(
          `   ⚠️  Could not retrieve some managed database features`,
          colors.yellow
        );
        log(`   ℹ️  Error: ${errorMessage}`, colors.yellow);
        tests.push({ name: "Managed Features", passed: false, time: 0 });
      }
      log("");
    }
  } catch (error) {
    log(`❌ CONNECTION FAILED: ${error.message}`, colors.red);
    log("", colors.reset);
    log("Troubleshooting Tips:", colors.yellow);
    log("1. Verify DATABASE_URL is correct in .env file", colors.yellow);
    log("2. Check if database server is running and accessible", colors.yellow);
    log("3. Verify firewall/security group allows your IP", colors.yellow);
    log("4. Ensure credentials (username/password) are correct", colors.yellow);
    log("5. For managed databases, check SSL/TLS configuration", colors.yellow);
    log("", colors.reset);

    if (isAWS) {
      log("AWS RDS Specific:", colors.yellow);
      log(
        "- Check VPC security group inbound rules (port 5432)",
        colors.yellow
      );
      log(
        '- Verify "Publicly Accessible" is enabled (for testing)',
        colors.yellow
      );
      log('- Check RDS instance status is "Available"', colors.yellow);
    } else if (isAzure) {
      log("Azure Database Specific:", colors.yellow);
      log("- Check firewall rules allow your IP address", colors.yellow);
      log(
        '- Verify "Allow public access" is enabled (for testing)',
        colors.yellow
      );
      log('- Check server status is "Ready"', colors.yellow);
    }

    allTestsPassed = false;
  } finally {
    await pool.end();
  }

  // Summary
  const totalTime = Date.now() - startTime;
  log("=".repeat(60), colors.cyan);
  log("TEST SUMMARY", colors.bold + colors.cyan);
  log("=".repeat(60), colors.cyan);
  log("");

  tests.forEach((test) => {
    const status = test.passed ? "✅ PASS" : "❌ FAIL";
    const statusColor = test.passed ? colors.green : colors.red;
    const timeStr = test.time > 0 ? ` (${test.time}ms)` : "";
    log(`${status} - ${test.name}${timeStr}`, statusColor);
  });

  log("");
  const passedTests = tests.filter((t) => t.passed).length;
  const totalTests = tests.length;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  log(
    `Tests Passed: ${passedTests}/${totalTests} (${successRate}%)`,
    colors.cyan
  );
  log(`Total Time: ${totalTime}ms`, colors.cyan);
  log("");

  if (allTestsPassed && passedTests === totalTests) {
    log(
      "🎉 ALL TESTS PASSED! Database is ready for use.",
      colors.green + colors.bold
    );
  } else {
    log(
      "⚠️  Some tests failed. Please review the errors above.",
      colors.yellow + colors.bold
    );
  }

  log("=".repeat(60) + "\n", colors.cyan);

  process.exit(allTestsPassed && passedTests === totalTests ? 0 : 1);
}

// Run the test
testDatabaseConnection().catch((error) => {
  log(`\n❌ UNEXPECTED ERROR: ${error.message}`, colors.red);
  log(error.stack, colors.red);
  process.exit(1);
});
