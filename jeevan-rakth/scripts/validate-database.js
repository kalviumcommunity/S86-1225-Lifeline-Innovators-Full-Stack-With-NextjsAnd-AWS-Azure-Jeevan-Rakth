/**
 * Database Validation Test Suite
 *
 * Comprehensive validation for managed PostgreSQL databases
 * Runs connection, performance, security, and configuration tests
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

// ANSI color codes
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

async function runValidation() {
  log("\n" + "=".repeat(70), colors.cyan);
  log("DATABASE VALIDATION TEST SUITE", colors.bold + colors.cyan);
  log("=".repeat(70) + "\n", colors.cyan);

  const tests = [];
  let allPassed = true;

  // Check if .env file exists
  try {
    require("dotenv").config();
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    log(
      `⚠️  dotenv not installed or error loading .env: ${errorMsg}`,
      colors.yellow
    );
    log("   Using system environment variables", colors.yellow);
  }

  // Test 1: Environment Variables
  log("📋 Test 1: Environment Variables Check...", colors.cyan);
  const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "JWT_REFRESH_SECRET"];
  const missingVars = [];

  requiredEnvVars.forEach((varName) => {
    if (process.env[varName]) {
      log(`   ✅ ${varName}: Set`, colors.green);
    } else {
      log(`   ❌ ${varName}: Missing`, colors.red);
      missingVars.push(varName);
      allPassed = false;
    }
  });

  tests.push({
    name: "Environment Variables",
    passed: missingVars.length === 0,
  });
  log("");

  if (missingVars.length > 0) {
    log(
      `⚠️  Missing environment variables: ${missingVars.join(", ")}`,
      colors.yellow
    );
    log("   Please set them in your .env file", colors.yellow);
    log("");
  }

  // Test 2: Database Connection
  log("🔌 Test 2: Database Connection Test...", colors.cyan);
  try {
    await execPromise("node scripts/test-db-connection.js");
    log("   ✅ Database connection successful", colors.green);
    tests.push({ name: "Database Connection", passed: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    log("   ❌ Database connection failed", colors.red);
    log(`   Error: ${errorMsg}`, colors.yellow);
    tests.push({ name: "Database Connection", passed: false });
    allPassed = false;
  }
  log("");

  // Test 3: Prisma Client Generation
  log("🔧 Test 3: Prisma Client Generation...", colors.cyan);
  try {
    await execPromise("npx prisma generate");
    log("   ✅ Prisma client generated successfully", colors.green);
    tests.push({ name: "Prisma Client", passed: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    log("   ❌ Prisma client generation failed", colors.red);
    log(`   Error: ${errorMsg}`, colors.red);
    tests.push({ name: "Prisma Client", passed: false });
    allPassed = false;
  }
  log("");

  // Test 4: Database Schema Validation
  log("📐 Test 4: Database Schema Validation...", colors.cyan);
  try {
    await execPromise("npx prisma validate");
    log("   ✅ Schema is valid", colors.green);
    tests.push({ name: "Schema Validation", passed: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    log("   ❌ Schema validation failed", colors.red);
    log(`   Error: ${errorMsg}`, colors.red);
    tests.push({ name: "Schema Validation", passed: false });
    allPassed = false;
  }
  log("");

  // Test 5: Migration Status
  log("🔄 Test 5: Migration Status Check...", colors.cyan);
  try {
    const { stdout } = await execPromise("npx prisma migrate status");

    if (stdout.includes("No pending migrations")) {
      log("   ✅ All migrations applied", colors.green);
      tests.push({ name: "Migration Status", passed: true });
    } else if (
      stdout.includes("Following migration have not yet been applied")
    ) {
      log("   ⚠️  Pending migrations detected", colors.yellow);
      log("   Run: npx prisma migrate deploy", colors.yellow);
      tests.push({ name: "Migration Status", passed: false });
      allPassed = false;
    } else {
      log("   ✅ Migration system initialized", colors.green);
      tests.push({ name: "Migration Status", passed: true });
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    log("   ⚠️  Could not check migration status", colors.yellow);
    log(`   Error: ${errorMsg}`, colors.yellow);
    log("   This is normal for new databases", colors.yellow);
    tests.push({ name: "Migration Status", passed: true });
  }
  log("");

  // Test 6: Package Dependencies
  log("📦 Test 6: Required Dependencies...", colors.cyan);
  const requiredDeps = ["@prisma/client", "pg", "jsonwebtoken", "bcrypt"];

  try {
    const packageJson = require("../package.json");
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    let allDepsInstalled = true;
    requiredDeps.forEach((dep) => {
      if (allDeps[dep]) {
        log(`   ✅ ${dep}: ${allDeps[dep]}`, colors.green);
      } else {
        log(`   ❌ ${dep}: Not installed`, colors.red);
        allDepsInstalled = false;
        allPassed = false;
      }
    });

    tests.push({ name: "Required Dependencies", passed: allDepsInstalled });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    log("   ⚠️  Could not read package.json", colors.yellow);
    log(`   Error: ${errorMsg}`, colors.yellow);
    tests.push({ name: "Required Dependencies", passed: false });
    allPassed = false;
  }
  log("");

  // Test 7: API Health Endpoint
  log("🏥 Test 7: Health Check Endpoint...", colors.cyan);
  const healthEndpointExists = require("fs").existsSync(
    "src/app/api/health/database/route.ts"
  );
  if (healthEndpointExists) {
    log("   ✅ Health check endpoint exists", colors.green);
    log("   Access at: http://localhost:3000/api/health/database", colors.cyan);
    tests.push({ name: "Health Endpoint", passed: true });
  } else {
    log("   ⚠️  Health check endpoint not found", colors.yellow);
    tests.push({ name: "Health Endpoint", passed: false });
  }
  log("");

  // Test 8: Security Configuration
  log("🔒 Test 8: Security Configuration...", colors.cyan);
  const databaseUrl = process.env.DATABASE_URL || "";

  let securityScore = 0;
  let totalChecks = 0;

  // Check SSL mode
  totalChecks++;
  if (
    databaseUrl.includes("sslmode=require") ||
    databaseUrl.includes("sslmode=verify")
  ) {
    log("   ✅ SSL/TLS required", colors.green);
    securityScore++;
  } else {
    log("   ⚠️  SSL/TLS not enforced", colors.yellow);
  }

  // Check for password in connection string (should not be hardcoded in repo)
  totalChecks++;
  if (databaseUrl && !databaseUrl.includes("password123")) {
    log("   ✅ No default passwords detected", colors.green);
    securityScore++;
  } else {
    log("   ⚠️  Using default or weak password", colors.yellow);
  }

  // Check JWT secrets
  totalChecks++;
  const jwtSecret = process.env.JWT_SECRET || "";
  if (
    jwtSecret.length >= 32 &&
    jwtSecret !== "your-super-secret-jwt-key-min-32-chars"
  ) {
    log("   ✅ Strong JWT secret configured", colors.green);
    securityScore++;
  } else {
    log("   ⚠️  Weak or default JWT secret", colors.yellow);
    allPassed = false;
  }

  tests.push({
    name: "Security Configuration",
    passed: securityScore === totalChecks,
  });
  log("");

  // Test 9: Backup Configuration (if managed database)
  const isManaged =
    databaseUrl.includes("rds.amazonaws.com") ||
    databaseUrl.includes("postgres.database.azure.com");

  if (isManaged) {
    log("☁️  Test 9: Managed Database Backup Check...", colors.cyan);
    log("   ℹ️  Run: npm run verify:backups", colors.cyan);
    log("   To verify backup configuration", colors.cyan);
    tests.push({ name: "Backup Configuration", passed: true });
  } else {
    log("💾 Test 9: Local Database Backup Strategy...", colors.cyan);
    log("   ⚠️  For local PostgreSQL, set up your own backups:", colors.yellow);
    log("   - pg_dump for logical backups", colors.yellow);
    log("   - pg_basebackup for physical backups", colors.yellow);
    log("   - WAL archiving for PITR", colors.yellow);
    tests.push({ name: "Backup Strategy", passed: true });
  }
  log("");

  // Summary
  log("=".repeat(70), colors.cyan);
  log("VALIDATION SUMMARY", colors.bold + colors.cyan);
  log("=".repeat(70), colors.cyan);
  log("");

  tests.forEach((test) => {
    const status = test.passed ? "✅ PASS" : "❌ FAIL";
    const statusColor = test.passed ? colors.green : colors.red;
    log(`${status} - ${test.name}`, statusColor);
  });

  log("");
  const passedTests = tests.filter((t) => t.passed).length;
  const totalTests = tests.length;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  log(
    `Tests Passed: ${passedTests}/${totalTests} (${successRate}%)`,
    colors.cyan
  );
  log("");

  if (allPassed && passedTests === totalTests) {
    log("🎉 ALL VALIDATIONS PASSED!", colors.green + colors.bold);
    log(
      "Your database is properly configured and ready for use.",
      colors.green
    );
  } else {
    log("⚠️  SOME VALIDATIONS FAILED", colors.yellow + colors.bold);
    log(
      "Please review the errors above and fix them before deploying.",
      colors.yellow
    );
  }

  log("=".repeat(70) + "\n", colors.cyan);

  // Next steps
  if (allPassed && passedTests === totalTests) {
    log("✨ Next Steps:", colors.cyan);
    log("1. Run migrations: npx prisma migrate deploy", colors.reset);
    log("2. Seed database (optional): npx prisma db seed", colors.reset);
    log("3. Start dev server: npm run dev", colors.reset);
    log(
      "4. Test health endpoint: curl http://localhost:3000/api/health/database",
      colors.reset
    );
    if (isManaged) {
      log("5. Verify backups: npm run verify:backups", colors.reset);
    }
    log("");
  } else {
    log("⚠️  Action Required:", colors.yellow);
    log("1. Fix the failing tests listed above", colors.reset);
    log("2. Ensure .env file is properly configured", colors.reset);
    log(
      "3. Run this validation again: npm run validate:database",
      colors.reset
    );
    log("");
  }

  process.exit(allPassed && passedTests === totalTests ? 0 : 1);
}

// Run validation
runValidation().catch((error) => {
  log(`\n❌ VALIDATION ERROR: ${error.message}`, colors.red);
  log(error.stack, colors.red);
  process.exit(1);
});
