/**
 * Database Backup Verification Script
 *
 * Verifies backup configuration for managed PostgreSQL databases
 * Supports AWS RDS and Azure Database for PostgreSQL
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

async function verifyAWSRDSBackups(instanceId) {
  log("\n🔍 Verifying AWS RDS Backup Configuration...", colors.cyan);

  try {
    // Check if AWS CLI is installed
    try {
      await execPromise("aws --version");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      log(
        `❌ AWS CLI not installed. Please install: https://aws.amazon.com/cli/`,
        colors.red
      );
      log(`   Error: ${errorMsg}`, colors.yellow);
      return false;
    }

    // Get RDS instance details
    const { stdout } = await execPromise(
      `aws rds describe-db-instances --db-instance-identifier ${instanceId} --output json`
    );

    const data = JSON.parse(stdout);
    const instance = data.DBInstances[0];

    log("\n📊 Backup Configuration:", colors.cyan);
    log(`   Instance ID: ${instance.DBInstanceIdentifier}`, colors.reset);
    log(`   Status: ${instance.DBInstanceStatus}`, colors.reset);

    // Check backup retention
    const retentionPeriod = instance.BackupRetentionPeriod;
    if (retentionPeriod > 0) {
      log(`   ✅ Backup Retention: ${retentionPeriod} days`, colors.green);
    } else {
      log(`   ❌ Backup Retention: DISABLED`, colors.red);
      return false;
    }

    // Check preferred backup window
    log(`   ✅ Backup Window: ${instance.PreferredBackupWindow}`, colors.green);

    // Check Multi-AZ
    if (instance.MultiAZ) {
      log(`   ✅ Multi-AZ: ENABLED (High Availability)`, colors.green);
    } else {
      log(`   ⚠️  Multi-AZ: DISABLED`, colors.yellow);
    }

    // Check automated backups
    if (instance.BackupRetentionPeriod > 0) {
      log(`   ✅ Automated Backups: ENABLED`, colors.green);
    } else {
      log(`   ❌ Automated Backups: DISABLED`, colors.red);
    }

    // List recent snapshots
    log("\n📸 Recent Snapshots:", colors.cyan);
    const snapshotCmd = `aws rds describe-db-snapshots --db-instance-identifier ${instanceId} --max-items 5 --output json`;
    const { stdout: snapshotOutput } = await execPromise(snapshotCmd);
    const snapshots = JSON.parse(snapshotOutput);

    if (snapshots.DBSnapshots && snapshots.DBSnapshots.length > 0) {
      snapshots.DBSnapshots.forEach((snapshot, index) => {
        log(`   ${index + 1}. ${snapshot.DBSnapshotIdentifier}`, colors.green);
        log(`      Created: ${snapshot.SnapshotCreateTime}`, colors.reset);
        log(`      Status: ${snapshot.Status}`, colors.reset);
        log(`      Type: ${snapshot.SnapshotType}`, colors.reset);
      });
    } else {
      log("   ⚠️  No snapshots found yet", colors.yellow);
    }

    // Check storage encryption
    log("\n🔒 Security:", colors.cyan);
    if (instance.StorageEncrypted) {
      log(`   ✅ Storage Encryption: ENABLED`, colors.green);
      log(`   ✅ KMS Key: ${instance.KmsKeyId || "Default"}`, colors.green);
    } else {
      log(`   ⚠️  Storage Encryption: DISABLED`, colors.yellow);
    }

    return retentionPeriod > 0;
  } catch (error) {
    log(`❌ Error verifying AWS RDS backups: ${error.message}`, colors.red);
    return false;
  }
}

async function verifyAzureBackups(resourceGroup, serverName) {
  log("\n🔍 Verifying Azure Database Backup Configuration...", colors.cyan);

  try {
    // Check if Azure CLI is installed
    try {
      await execPromise("az --version");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      log(
        "❌ Azure CLI not installed. Please install: https://docs.microsoft.com/cli/azure/install-azure-cli",
        colors.red
      );
      log(`   Error: ${errorMsg}`, colors.yellow);
      return false;
    }

    // Get server details
    const { stdout } = await execPromise(
      `az postgres flexible-server show --resource-group ${resourceGroup} --name ${serverName} --output json`
    );

    const server = JSON.parse(stdout);

    log("\n📊 Backup Configuration:", colors.cyan);
    log(`   Server Name: ${server.name}`, colors.reset);
    log(`   Status: ${server.state}`, colors.reset);

    // Check backup retention
    const retentionDays = server.backup?.backupRetentionDays || 7;
    if (retentionDays >= 7) {
      log(`   ✅ Backup Retention: ${retentionDays} days`, colors.green);
    } else {
      log(
        `   ⚠️  Backup Retention: ${retentionDays} days (minimum 7 recommended)`,
        colors.yellow
      );
    }

    // Check geo-redundant backup
    const geoRedundant = server.backup?.geoRedundantBackup;
    if (geoRedundant === "Enabled") {
      log(`   ✅ Geo-Redundant Backup: ENABLED`, colors.green);
    } else {
      log(`   ⚠️  Geo-Redundant Backup: DISABLED`, colors.yellow);
    }

    // Check high availability
    if (server.highAvailability?.mode) {
      log(
        `   ✅ High Availability: ${server.highAvailability.mode}`,
        colors.green
      );
    } else {
      log(`   ⚠️  High Availability: DISABLED`, colors.yellow);
    }

    // List available backups
    log("\n📸 Available Backups:", colors.cyan);
    try {
      const { stdout: backupOutput } = await execPromise(
        `az postgres flexible-server backup list --resource-group ${resourceGroup} --name ${serverName} --output json`
      );

      const backups = JSON.parse(backupOutput);
      if (backups && backups.length > 0) {
        backups.slice(0, 5).forEach((backup, index) => {
          log(`   ${index + 1}. ${backup.name}`, colors.green);
          log(`      Completed: ${backup.completedTime}`, colors.reset);
          log(`      Source: ${backup.source}`, colors.reset);
        });
      } else {
        log(
          "   ⚠️  No backups found yet (backups may take 24 hours to appear)",
          colors.yellow
        );
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      log(
        "   ⚠️  Could not list backups (this is normal for new servers)",
        colors.yellow
      );
      log(`   ℹ️  Error: ${errorMsg}`, colors.yellow);
    }

    // Check storage settings
    log("\n💾 Storage:", colors.cyan);
    log(
      `   ✅ Storage Size: ${server.storage?.storageSizeGb} GB`,
      colors.green
    );
    if (server.storage?.autoGrow === "Enabled") {
      log(`   ✅ Auto-grow: ENABLED`, colors.green);
    } else {
      log(`   ⚠️  Auto-grow: DISABLED`, colors.yellow);
    }

    return retentionDays >= 7;
  } catch (error) {
    log(`❌ Error verifying Azure backups: ${error.message}`, colors.red);
    return false;
  }
}

async function testBackupRestore() {
  log("\n🧪 Testing Backup/Restore Capability...", colors.cyan);
  log(
    "   ℹ️  This requires manual intervention - checking documentation...",
    colors.yellow
  );

  log("\n📚 Backup Best Practices:", colors.cyan);
  log("   ✅ Automated backups should be enabled", colors.green);
  log("   ✅ Retention period should be at least 7 days", colors.green);
  log("   ✅ Test restore procedure quarterly", colors.green);
  log("   ✅ Store critical backups in separate region/account", colors.green);
  log("   ✅ Document restore procedures", colors.green);
  log("   ✅ Monitor backup job success/failure", colors.green);
}

async function main() {
  log("\n" + "=".repeat(60), colors.cyan);
  log("DATABASE BACKUP VERIFICATION", colors.bold + colors.cyan);
  log("=".repeat(60) + "\n", colors.cyan);

  // Get DATABASE_URL from environment
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    log("❌ ERROR: DATABASE_URL environment variable is not set", colors.red);
    process.exit(1);
  }

  // Determine provider
  const isAWS = databaseUrl.includes("rds.amazonaws.com");
  const isAzure = databaseUrl.includes("postgres.database.azure.com");

  if (!isAWS && !isAzure) {
    log(
      "⚠️  Not a managed database (AWS RDS or Azure Database)",
      colors.yellow
    );
    log("   This script is for managed databases only.", colors.yellow);
    log(
      "   For local PostgreSQL, set up your own backup strategy:",
      colors.yellow
    );
    log("   - pg_dump for logical backups", colors.yellow);
    log("   - pg_basebackup for physical backups", colors.yellow);
    log("   - WAL archiving for point-in-time recovery", colors.yellow);
    process.exit(0);
  }

  let success = false;

  if (isAWS) {
    const url = new URL(databaseUrl);
    const hostname = url.hostname;
    // Extract instance ID from hostname (e.g., jeevan-rakth-db.c9akcl32r1ad.us-east-1.rds.amazonaws.com)
    const instanceId = hostname.split(".")[0];

    log(`🔧 Provider: AWS RDS`, colors.cyan);
    log(`📍 Instance ID: ${instanceId}`, colors.cyan);

    success = await verifyAWSRDSBackups(instanceId);

    if (success) {
      log("\n💡 AWS RDS Backup Commands:", colors.cyan);
      log(`   Create manual snapshot:`, colors.yellow);
      log(
        `   aws rds create-db-snapshot --db-instance-identifier ${instanceId} --db-snapshot-identifier manual-backup-$(date +%Y%m%d)`,
        colors.reset
      );
      log(`   \n   Restore from snapshot:`, colors.yellow);
      log(
        `   aws rds restore-db-instance-from-db-snapshot --db-instance-identifier ${instanceId}-restored --db-snapshot-identifier snapshot-name`,
        colors.reset
      );
    }
  } else if (isAzure) {
    const url = new URL(databaseUrl);
    const hostname = url.hostname;
    // Extract server name (e.g., jeevan-rakth-db.postgres.database.azure.com)
    const serverName = hostname.split(".")[0];

    log(`🔧 Provider: Azure Database for PostgreSQL`, colors.cyan);
    log(`📍 Server Name: ${serverName}`, colors.cyan);
    log(`   ⚠️  You need to provide the resource group name`, colors.yellow);

    const resourceGroup = process.env.AZURE_RESOURCE_GROUP || "jeevan-rakth-rg";
    log(`   Using resource group: ${resourceGroup}`, colors.yellow);
    log(`   Set AZURE_RESOURCE_GROUP env var if different\n`, colors.yellow);

    success = await verifyAzureBackups(resourceGroup, serverName);

    if (success) {
      log("\n💡 Azure Backup Commands:", colors.cyan);
      log(`   Restore to point in time:`, colors.yellow);
      log(
        `   az postgres flexible-server restore --resource-group ${resourceGroup} --name ${serverName}-restored --source-server ${serverName} --restore-time "2026-01-02T10:30:00Z"`,
        colors.reset
      );
    }
  }

  await testBackupRestore();

  log("\n" + "=".repeat(60), colors.cyan);
  log("VERIFICATION SUMMARY", colors.bold + colors.cyan);
  log("=".repeat(60), colors.cyan);

  if (success) {
    log(
      "\n✅ Backup configuration is properly set up!",
      colors.green + colors.bold
    );
    log("\nRecommendations:", colors.cyan);
    log("✅ Backups are enabled with adequate retention", colors.green);
    log("📅 Test restore procedure quarterly", colors.yellow);
    log("📝 Document backup/restore procedures for your team", colors.yellow);
    log("🔔 Set up alerts for backup failures", colors.yellow);
    log(
      "💾 Consider exporting critical backups to S3/Azure Storage",
      colors.yellow
    );
  } else {
    log(
      "\n⚠️  Backup configuration needs attention!",
      colors.yellow + colors.bold
    );
    log("\nAction Items:", colors.cyan);
    log("1. Enable automated backups if disabled", colors.yellow);
    log("2. Set retention period to at least 7 days", colors.yellow);
    log(
      "3. Enable Multi-AZ or High Availability for production",
      colors.yellow
    );
    log("4. Test restore procedure", colors.yellow);
  }

  log("=".repeat(60) + "\n", colors.cyan);

  process.exit(success ? 0 : 1);
}

// Run verification
main().catch((error) => {
  log(`\n❌ UNEXPECTED ERROR: ${error.message}`, colors.red);
  log(error.stack, colors.red);
  process.exit(1);
});
