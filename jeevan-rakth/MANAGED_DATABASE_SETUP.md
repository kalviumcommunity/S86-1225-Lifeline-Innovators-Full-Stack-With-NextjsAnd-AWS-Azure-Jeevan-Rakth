# Managed PostgreSQL Database Setup Guide

Complete guide for provisioning and connecting to AWS RDS or Azure Database for PostgreSQL for the Jeevan Rakth application.

## 📋 Table of Contents

1. [Understanding Managed Databases](#understanding-managed-databases)
2. [AWS RDS PostgreSQL Setup](#aws-rds-postgresql-setup)
3. [Azure Database for PostgreSQL Setup](#azure-database-for-postgresql-setup)
4. [Network Configuration](#network-configuration)
5. [Application Integration](#application-integration)
6. [Connection Validation](#connection-validation)
7. [Backup & Maintenance](#backup--maintenance)
8. [Security Best Practices](#security-best-practices)
9. [Cost Optimization](#cost-optimization)
10. [Troubleshooting](#troubleshooting)

---

## Understanding Managed Databases

### What is a Managed Database?

A managed database service handles operational tasks automatically:

- ✅ **Automated Backups** - Daily snapshots with point-in-time recovery
- ✅ **Patch Management** - Automatic OS and database engine updates
- ✅ **Scaling** - Vertical (compute/memory) and horizontal (read replicas)
- ✅ **High Availability** - Multi-AZ deployments with automatic failover
- ✅ **Monitoring** - Built-in metrics, logging, and alerts
- ✅ **Security** - Network isolation, encryption at rest/transit, IAM integration

### Provider Comparison

| Feature | AWS RDS PostgreSQL | Azure Database for PostgreSQL |
|---------|-------------------|-------------------------------|
| **Free Tier** | 750 hours/month (12 months) | ❌ No free tier |
| **Minimum Instance** | db.t3.micro | B1ms (1 vCore, 2GB) |
| **Autoscaling** | Storage only | Compute + Storage |
| **Monitoring** | CloudWatch | Azure Monitor |
| **Backup Retention** | 0-35 days | 7-35 days |
| **Read Replicas** | Up to 5 | Up to 5 |
| **Multi-AZ** | ✅ Built-in | ✅ Zone redundancy |
| **Connection Pooling** | RDS Proxy | Built-in pgBouncer |
| **Best For** | AWS ecosystem, cost-effective | Azure integration, auto-scaling |

---

## AWS RDS PostgreSQL Setup

### Step 1: Create RDS Instance

#### Via AWS Management Console

1. **Navigate to RDS**
   - Go to [AWS Console](https://console.aws.amazon.com/) → Services → RDS
   - Click **Databases** → **Create database**

2. **Engine Selection**
   ```
   Engine type: PostgreSQL
   Version: PostgreSQL 15.x (latest stable)
   Template: Free tier (for testing) or Dev/Test
   ```

3. **Settings**
   ```
   DB instance identifier: jeevan-rakth-db
   Master username: adminuser
   Master password: [Generate strong password - min 16 chars]
   ```

4. **Instance Configuration**
   ```
   DB instance class: db.t3.micro (Free tier) or db.t4g.small (Prod)
   Storage type: General Purpose SSD (gp3)
   Allocated storage: 20 GB
   Enable storage autoscaling: Yes
   Maximum storage: 100 GB
   ```

5. **Connectivity**
   ```
   VPC: Default VPC (or your custom VPC)
   Subnet group: Default
   Public access: Yes (for testing only - No for production)
   VPC security group: Create new → jeevan-rakth-sg
   Availability Zone: No preference
   Database port: 5432
   ```

6. **Additional Configuration**
   ```
   Initial database name: jeevanrakth
   DB parameter group: default.postgres15
   Backup retention: 7 days
   Enable encryption: Yes
   Enable Enhanced Monitoring: Yes (60 seconds)
   Enable Performance Insights: Yes (7 days retention)
   ```

7. **Click "Create database"** - Wait 5-10 minutes for provisioning

#### Via AWS CLI

```bash
# Set variables
export DB_INSTANCE_ID="jeevan-rakth-db"
export DB_NAME="jeevanrakth"
export DB_USERNAME="adminuser"
export DB_PASSWORD="YourSecurePassword123!"
export DB_SECURITY_GROUP="sg-xxxxxxxxx"  # Your security group ID

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier $DB_INSTANCE_ID \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.5 \
  --master-username $DB_USERNAME \
  --master-user-password $DB_PASSWORD \
  --allocated-storage 20 \
  --storage-type gp3 \
  --storage-encrypted \
  --vpc-security-group-ids $DB_SECURITY_GROUP \
  --db-name $DB_NAME \
  --backup-retention-period 7 \
  --publicly-accessible \
  --enable-performance-insights \
  --monitoring-interval 60 \
  --monitoring-role-arn arn:aws:iam::ACCOUNT_ID:role/rds-monitoring-role \
  --tags Key=Project,Value=JeevanRakth Key=Environment,Value=Development

# Wait for instance to be available
aws rds wait db-instance-available --db-instance-identifier $DB_INSTANCE_ID

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier $DB_INSTANCE_ID \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

### Step 2: Configure Security Group

1. **Go to EC2 Console** → Security Groups
2. **Find** `jeevan-rakth-sg`
3. **Edit Inbound Rules** → Add Rule:
   ```
   Type: PostgreSQL
   Protocol: TCP
   Port: 5432
   Source: My IP (for testing)
   Description: Dev machine access
   ```

4. **For Production**: Use specific IPs or security groups
   ```
   Source: sg-xxxxxxxx (Application server SG)
   Description: App server access only
   ```

### Step 3: Get Connection Details

```bash
# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier jeevan-rakth-db \
  --query 'DBInstances[0].[Endpoint.Address,Endpoint.Port,DBName]' \
  --output table
```

**Example output:**
```
jeevan-rakth-db.c9akcl32r1ad.us-east-1.rds.amazonaws.com
5432
jeevanrakth
```

---

## Azure Database for PostgreSQL Setup

### Step 1: Create PostgreSQL Server

#### Via Azure Portal

1. **Navigate to Azure Portal**
   - Go to [Azure Portal](https://portal.azure.com/) → Create a resource
   - Search "Azure Database for PostgreSQL" → Select **Flexible Server**

2. **Basics Tab**
   ```
   Subscription: [Your subscription]
   Resource group: jeevan-rakth-rg (create new)
   Server name: jeevan-rakth-db
   Region: East US 2 (or nearest)
   PostgreSQL version: 15
   Workload type: Development
   Compute + storage: Configure server
     - Compute tier: Burstable
     - Compute size: B1ms (1 vCore, 2 GiB RAM)
     - Storage: 32 GiB
     - IOPS: Default
   ```

3. **Authentication**
   ```
   Authentication method: PostgreSQL authentication only
   Admin username: adminuser
   Password: [Strong password - min 16 chars]
   ```

4. **Networking Tab**
   ```
   Connectivity method: Public access (for testing)
   Firewall rules:
     - Add your client IP: Yes
     - Allow Azure services: Yes
   ```

5. **Review + Create** → Wait 5-10 minutes

#### Via Azure CLI

```bash
# Login to Azure
az login

# Set variables
export RESOURCE_GROUP="jeevan-rakth-rg"
export SERVER_NAME="jeevan-rakth-db"
export LOCATION="eastus2"
export ADMIN_USER="adminuser"
export ADMIN_PASSWORD="YourSecurePassword123!"
export DB_NAME="jeevanrakth"

# Create resource group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Create PostgreSQL Flexible Server
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $SERVER_NAME \
  --location $LOCATION \
  --admin-user $ADMIN_USER \
  --admin-password "$ADMIN_PASSWORD" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 15 \
  --storage-size 32 \
  --public-access 0.0.0.0 \
  --tags Project=JeevanRakth Environment=Development

# Create database
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $SERVER_NAME \
  --database-name $DB_NAME

# Add firewall rule for your IP
MY_IP=$(curl -s https://api.ipify.org)
az postgres flexible-server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --name $SERVER_NAME \
  --rule-name AllowMyIP \
  --start-ip-address $MY_IP \
  --end-ip-address $MY_IP

# Get connection string
az postgres flexible-server show-connection-string \
  --server-name $SERVER_NAME \
  --database-name $DB_NAME \
  --admin-user $ADMIN_USER \
  --admin-password "$ADMIN_PASSWORD"
```

### Step 2: Configure Firewall

**Via Portal:**
1. Go to your PostgreSQL server → **Networking** (under Settings)
2. **Firewall rules** → Add rule:
   ```
   Rule name: AllowMyIP
   Start IP: [Your IP]
   End IP: [Your IP]
   ```
3. **Save**

**Security Note:** In production, use Private Endpoints instead of public access.

### Step 3: Get Connection Details

The connection string format:
```
postgresql://adminuser:YourPassword@jeevan-rakth-db.postgres.database.azure.com:5432/jeevanrakth?sslmode=require
```

---

## Network Configuration

### AWS RDS Security Best Practices

#### Development Environment
```hcl
# Allow your IP
Type: PostgreSQL
Protocol: TCP
Port: 5432
Source: [Your IP]/32
Description: Developer workstation
```

#### Production Environment
```hcl
# Method 1: Application Security Group
Type: PostgreSQL
Protocol: TCP
Port: 5432
Source: sg-xxxxxxxx (App server SG)
Description: Application tier only

# Method 2: Private Subnet (Recommended)
- Deploy RDS in private subnet
- No public IP
- Access via VPC peering or VPN
- Use RDS Proxy for connection pooling
```

### Azure Database Network Security

#### Development
```bash
# Add your IP via CLI
az postgres flexible-server firewall-rule create \
  --resource-group jeevan-rakth-rg \
  --name jeevan-rakth-db \
  --rule-name MyDevMachine \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP
```

#### Production (Private Endpoint)
```bash
# Create VNet integration
az postgres flexible-server vnet create \
  --resource-group jeevan-rakth-rg \
  --name jeevan-rakth-db \
  --vnet myVNet \
  --subnet mySubnet \
  --location eastus2

# Disable public access
az postgres flexible-server update \
  --resource-group jeevan-rakth-rg \
  --name jeevan-rakth-db \
  --public-access Disabled
```

---

## Application Integration

### Update Environment Variables

Create or update `.env.local` in your Next.js app:

#### AWS RDS
```bash
# AWS RDS PostgreSQL Connection
DATABASE_URL="postgresql://adminuser:YourPassword@jeevan-rakth-db.c9akcl32r1ad.us-east-1.rds.amazonaws.com:5432/jeevanrakth?schema=public&sslmode=require"

# Connection Pool Settings (Optional)
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_POOL_IDLE_TIMEOUT=10000

# Enable SSL/TLS
DATABASE_SSL_ENABLED=true
```

#### Azure Database
```bash
# Azure PostgreSQL Connection
DATABASE_URL="postgresql://adminuser:YourPassword@jeevan-rakth-db.postgres.database.azure.com:5432/jeevanrakth?schema=public&sslmode=require"

# Connection Pool Settings
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_POOL_IDLE_TIMEOUT=10000

# SSL is required for Azure
DATABASE_SSL_ENABLED=true
```

### Prisma Configuration

Your `schema.prisma` should already be configured:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

### Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed database
npx prisma db seed

# Verify schema
npx prisma db pull
```

### Connection Pooling (Recommended for Production)

#### Using Prisma Accelerate or PgBouncer

**Option 1: Prisma Data Platform (Easiest)**
```bash
# Install Prisma Accelerate
npm install @prisma/extension-accelerate

# Update DATABASE_URL to use Accelerate
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
```

**Option 2: PgBouncer (Self-hosted)**
```bash
# Docker compose example
services:
  pgbouncer:
    image: pgbouncer/pgbouncer
    environment:
      - DATABASES_HOST=your-db-endpoint
      - DATABASES_PORT=5432
      - DATABASES_USER=adminuser
      - DATABASES_PASSWORD=password
      - POOL_MODE=transaction
      - MAX_CLIENT_CONN=100
      - DEFAULT_POOL_SIZE=20
    ports:
      - "6432:6432"

# Update DATABASE_URL to use pgbouncer
DATABASE_URL="postgresql://adminuser:password@localhost:6432/jeevanrakth"
```

**Option 3: AWS RDS Proxy**
```bash
# Create RDS Proxy via AWS Console or CLI
aws rds create-db-proxy \
  --db-proxy-name jeevan-rakth-proxy \
  --engine-family POSTGRESQL \
  --auth SecretArn=arn:aws:secretsmanager:region:account:secret:name \
  --role-arn arn:aws:iam::account:role/RDSProxyRole \
  --vpc-subnet-ids subnet-1 subnet-2 \
  --require-tls

# Use proxy endpoint
DATABASE_URL="postgresql://adminuser:password@jeevan-rakth-proxy.proxy-xxxxx.region.rds.amazonaws.com:5432/jeevanrakth"
```

---

## Connection Validation

### Method 1: Using psql CLI

```bash
# AWS RDS
psql -h jeevan-rakth-db.c9akcl32r1ad.us-east-1.rds.amazonaws.com \
     -U adminuser \
     -d jeevanrakth \
     -p 5432

# Azure Database
psql "host=jeevan-rakth-db.postgres.database.azure.com port=5432 dbname=jeevanrakth user=adminuser password=YourPassword sslmode=require"

# Test query
jeevanrakth=> SELECT version();
jeevanrakth=> \dt  -- List tables
jeevanrakth=> \q   -- Quit
```

### Method 2: Using pgAdmin

1. **Download**: [pgAdmin](https://www.pgadmin.org/download/)
2. **Add Server**:
   - Name: Jeevan Rakth AWS/Azure
   - Host: `<your-endpoint>`
   - Port: 5432
   - Database: jeevanrakth
   - Username: adminuser
   - Password: `<your-password>`
   - SSL Mode: Require

### Method 3: Using Node.js Script

Run the test script:

```bash
# Test connection
node scripts/test-db-connection.js

# Test with Prisma
npx prisma db execute --sql "SELECT NOW()"
```

### Method 4: Via Next.js API Route

```bash
# Start dev server
npm run dev

# Test endpoint
curl http://localhost:3000/api/health/database

# Expected response
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-01-02T10:30:00.000Z",
  "version": "PostgreSQL 15.5"
}
```

---

## Backup & Maintenance

### AWS RDS Backups

#### Automated Backups
```bash
# Enable automated backups (via CLI)
aws rds modify-db-instance \
  --db-instance-identifier jeevan-rakth-db \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --apply-immediately

# List available snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier jeevan-rakth-db

# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier jeevan-rakth-db \
  --db-snapshot-identifier jeevan-rakth-manual-$(date +%Y%m%d)

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier jeevan-rakth-restored \
  --db-snapshot-identifier jeevan-rakth-manual-20260102
```

#### Point-in-Time Recovery
```bash
# Restore to specific time
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier jeevan-rakth-db \
  --target-db-instance-identifier jeevan-rakth-recovered \
  --restore-time 2026-01-02T10:30:00Z
```

#### Export Snapshots to S3
```bash
# Export snapshot to S3 (for long-term archival)
aws rds start-export-task \
  --export-task-identifier jeevan-rakth-export-$(date +%Y%m%d) \
  --source-arn arn:aws:rds:region:account:snapshot:snapshot-name \
  --s3-bucket-name jeevan-rakth-backups \
  --iam-role-arn arn:aws:iam::account:role/RDSExportRole \
  --kms-key-id arn:aws:kms:region:account:key/key-id
```

### Azure Database Backups

#### Automated Backups
```bash
# Azure automatically backs up with 7-35 day retention
# Update backup retention
az postgres flexible-server update \
  --resource-group jeevan-rakth-rg \
  --name jeevan-rakth-db \
  --backup-retention 14

# List backups
az postgres flexible-server backup list \
  --resource-group jeevan-rakth-rg \
  --name jeevan-rakth-db

# Restore to point in time
az postgres flexible-server restore \
  --resource-group jeevan-rakth-rg \
  --name jeevan-rakth-restored \
  --source-server jeevan-rakth-db \
  --restore-time "2026-01-02T10:30:00Z"
```

#### Long-Term Backup to Azure Storage
```bash
# Export using pg_dump via Azure VM or local machine
pg_dump -h jeevan-rakth-db.postgres.database.azure.com \
        -U adminuser \
        -d jeevanrakth \
        -F c \
        -f backup-$(date +%Y%m%d).dump

# Upload to Azure Blob Storage
az storage blob upload \
  --account-name jeevanrakthstorage \
  --container-name backups \
  --name backup-$(date +%Y%m%d).dump \
  --file backup-$(date +%Y%m%d).dump
```

### Backup Verification Script

```bash
# Run backup verification
npm run verify:backups
```

### Maintenance Windows

**AWS RDS:**
```bash
# Set maintenance window (Sunday 2-3 AM UTC)
aws rds modify-db-instance \
  --db-instance-identifier jeevan-rakth-db \
  --preferred-maintenance-window sun:02:00-sun:03:00 \
  --apply-immediately
```

**Azure:**
```bash
# Set maintenance window
az postgres flexible-server update \
  --resource-group jeevan-rakth-rg \
  --name jeevan-rakth-db \
  --maintenance-window Day=0 StartHour=2 StartMinute=0
```

---

## Security Best Practices

### 1. Use Strong Passwords
```bash
# Generate strong password (Linux/Mac)
openssl rand -base64 32

# Generate strong password (PowerShell)
Add-Type -AssemblyName System.Web
[System.Web.Security.Membership]::GeneratePassword(32,10)
```

### 2. Enable SSL/TLS Encryption

**Force SSL in PostgreSQL:**
```sql
-- Connect as admin
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_min_protocol_version = 'TLSv1.2';
SELECT pg_reload_conf();
```

**Application (always use sslmode):**
```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### 3. Rotate Credentials Regularly

```bash
# AWS - Update password
aws rds modify-db-instance \
  --db-instance-identifier jeevan-rakth-db \
  --master-user-password NewSecurePassword123! \
  --apply-immediately

# Azure - Reset password
az postgres flexible-server update \
  --resource-group jeevan-rakth-rg \
  --name jeevan-rakth-db \
  --admin-password NewSecurePassword123!
```

### 4. Use AWS Secrets Manager / Azure Key Vault

**AWS Secrets Manager:**
```bash
# Store database credentials
aws secretsmanager create-secret \
  --name jeevan-rakth/db/credentials \
  --secret-string '{"username":"adminuser","password":"YourPassword","host":"endpoint","port":"5432","dbname":"jeevanrakth"}'

# Retrieve in application
aws secretsmanager get-secret-value \
  --secret-id jeevan-rakth/db/credentials \
  --query SecretString \
  --output text
```

**Azure Key Vault:**
```bash
# Create Key Vault
az keyvault create \
  --name jeevan-rakth-kv \
  --resource-group jeevan-rakth-rg \
  --location eastus2

# Store connection string
az keyvault secret set \
  --vault-name jeevan-rakth-kv \
  --name DatabaseConnectionString \
  --value "postgresql://adminuser:password@host:5432/db?sslmode=require"

# Retrieve secret
az keyvault secret show \
  --vault-name jeevan-rakth-kv \
  --name DatabaseConnectionString \
  --query value \
  --output tsv
```

### 5. Enable Audit Logging

**AWS RDS:**
```sql
-- Enable pgAudit extension
CREATE EXTENSION pgaudit;

-- Configure audit logging
ALTER SYSTEM SET pgaudit.log = 'all';
SELECT pg_reload_conf();
```

**Azure:**
```bash
# Enable query logging
az postgres flexible-server parameter set \
  --resource-group jeevan-rakth-rg \
  --server-name jeevan-rakth-db \
  --name log_statement \
  --value all
```

### 6. Network Isolation

**AWS - Private Subnet:**
```hcl
# Terraform example
resource "aws_db_subnet_group" "private" {
  name       = "jeevan-rakth-private"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]
}

resource "aws_db_instance" "main" {
  publicly_accessible = false
  db_subnet_group_name = aws_db_subnet_group.private.name
}
```

**Azure - Private Link:**
```bash
# Disable public access
az postgres flexible-server update \
  --resource-group jeevan-rakth-rg \
  --name jeevan-rakth-db \
  --public-access Disabled
```

---

## Cost Optimization

### AWS RDS Costs

**Free Tier (12 months):**
- 750 hours/month db.t2.micro or db.t3.micro
- 20 GB General Purpose SSD
- 20 GB backup storage

**Estimated Monthly Costs (after free tier):**

| Instance Type | vCPU | RAM | Storage | Cost/Month |
|---------------|------|-----|---------|------------|
| db.t3.micro | 2 | 1 GB | 20 GB | ~$15 |
| db.t4g.micro | 2 | 1 GB | 20 GB | ~$12 |
| db.t4g.small | 2 | 2 GB | 20 GB | ~$24 |
| db.t4g.medium | 2 | 4 GB | 50 GB | ~$60 |

**Cost Reduction Tips:**
1. Use ARM-based instances (db.t4g.* = 20% cheaper)
2. Reserved Instances (1-year = 40% off, 3-year = 60% off)
3. Stop instance during non-business hours (dev/test)
4. Use gp3 storage instead of io1
5. Minimize cross-AZ data transfer

```bash
# Stop instance (dev/test only)
aws rds stop-db-instance --db-instance-identifier jeevan-rakth-db

# Start instance
aws rds start-db-instance --db-instance-identifier jeevan-rakth-db
```

### Azure Database Costs

**Pricing Tiers:**

| Tier | vCPU | RAM | Storage | Cost/Month |
|------|------|-----|---------|------------|
| Burstable B1ms | 1 | 2 GB | 32 GB | ~$30 |
| General Purpose D2s_v3 | 2 | 8 GB | 128 GB | ~$150 |
| Memory Optimized E2s_v3 | 2 | 16 GB | 128 GB | ~$200 |

**Cost Reduction Tips:**
1. Use Burstable tier for dev/test
2. Enable autoscaling (pay only for what you use)
3. Use Azure Hybrid Benefit (if eligible)
4. Stop server during off-hours
5. Reserved capacity (1-year = 30% off, 3-year = 55% off)

```bash
# Stop server
az postgres flexible-server stop \
  --resource-group jeevan-rakth-rg \
  --name jeevan-rakth-db

# Start server
az postgres flexible-server start \
  --resource-group jeevan-rakth-rg \
  --name jeevan-rakth-db
```

### Cost Monitoring

**AWS:**
```bash
# Enable Cost Explorer
# Set up billing alerts via CloudWatch

# Get current month costs
aws ce get-cost-and-usage \
  --time-period Start=2026-01-01,End=2026-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --filter file://rds-filter.json
```

**Azure:**
```bash
# View costs
az consumption usage list \
  --start-date 2026-01-01 \
  --end-date 2026-01-31 \
  --query "[?contains(instanceName,'jeevan-rakth')]"
```

---

## Troubleshooting

### Cannot Connect to Database

**Issue:** Connection timeout or refused

**Solutions:**

1. **Check Security Group/Firewall**
   ```bash
   # AWS - Verify security group
   aws rds describe-db-instances \
     --db-instance-identifier jeevan-rakth-db \
     --query 'DBInstances[0].VpcSecurityGroups'
   
   # Azure - Check firewall rules
   az postgres flexible-server firewall-rule list \
     --resource-group jeevan-rakth-rg \
     --name jeevan-rakth-db
   ```

2. **Verify Public Access**
   ```bash
   # AWS
   aws rds describe-db-instances \
     --db-instance-identifier jeevan-rakth-db \
     --query 'DBInstances[0].PubliclyAccessible'
   
   # Azure
   az postgres flexible-server show \
     --resource-group jeevan-rakth-rg \
     --name jeevan-rakth-db \
     --query publicNetworkAccess
   ```

3. **Test Network Connectivity**
   ```bash
   # Test if port is reachable
   telnet your-endpoint 5432
   
   # Or use netcat
   nc -zv your-endpoint 5432
   
   # Or use PowerShell
   Test-NetConnection -ComputerName your-endpoint -Port 5432
   ```

### SSL/TLS Certificate Issues

**Issue:** `SSL error: certificate verify failed`

**Solution:**

```bash
# Download RDS CA certificate
wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

# Update connection string
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require&sslrootcert=global-bundle.pem"

# Or disable SSL verification (NOT recommended for production)
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require&sslcert=false"
```

### Connection Pool Exhausted

**Issue:** `Error: Can't reach database server`

**Solution:**

1. **Increase Pool Size**
   ```env
   DATABASE_POOL_MAX=20  # Default is usually 10
   ```

2. **Use Connection Pooler**
   - AWS RDS Proxy
   - PgBouncer
   - Prisma Accelerate

3. **Check Open Connections**
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   SELECT max_connections FROM pg_settings WHERE name = 'max_connections';
   ```

### Slow Query Performance

**Issue:** Queries taking too long

**Solutions:**

1. **Enable Performance Insights** (AWS) or **Query Performance Insight** (Azure)

2. **Check Slow Query Log**
   ```sql
   -- Enable slow query log
   ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s
   SELECT pg_reload_conf();
   
   -- View slow queries
   SELECT query, mean_exec_time, calls
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

3. **Add Indexes**
   ```sql
   -- Analyze table
   ANALYZE users;
   
   -- Check missing indexes
   SELECT * FROM pg_stat_user_tables WHERE idx_scan = 0;
   ```

4. **Upgrade Instance Size**
   ```bash
   # AWS - Scale up
   aws rds modify-db-instance \
     --db-instance-identifier jeevan-rakth-db \
     --db-instance-class db.t4g.medium \
     --apply-immediately
   
   # Azure - Scale up
   az postgres flexible-server update \
     --resource-group jeevan-rakth-rg \
     --name jeevan-rakth-db \
     --sku-name Standard_D2s_v3
   ```

### Database Running Out of Storage

**Issue:** Storage full warning

**Solutions:**

1. **Enable Storage Autoscaling** (AWS)
   ```bash
   aws rds modify-db-instance \
     --db-instance-identifier jeevan-rakth-db \
     --max-allocated-storage 100 \
     --apply-immediately
   ```

2. **Manually Increase Storage**
   ```bash
   # AWS
   aws rds modify-db-instance \
     --db-instance-identifier jeevan-rakth-db \
     --allocated-storage 50 \
     --apply-immediately
   
   # Azure
   az postgres flexible-server update \
     --resource-group jeevan-rakth-rg \
     --name jeevan-rakth-db \
     --storage-size 64
   ```

3. **Clean Up Old Data**
   ```sql
   -- Vacuum old data
   VACUUM FULL;
   
   -- Drop old tables
   DROP TABLE IF EXISTS old_logs;
   ```

### Migration Failures

**Issue:** Prisma migrate fails

**Solutions:**

1. **Check Database Connection**
   ```bash
   npx prisma db execute --sql "SELECT 1"
   ```

2. **Reset Database (Dev Only)**
   ```bash
   npx prisma migrate reset
   ```

3. **Deploy Migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Resolve Schema Drift**
   ```bash
   npx prisma db push --accept-data-loss
   ```

---

## Verification Checklist

### Pre-Deployment Checklist

- [ ] Database instance provisioned successfully
- [ ] Strong password set (min 16 characters)
- [ ] Security group/firewall configured correctly
- [ ] SSL/TLS enabled and enforced
- [ ] Automated backups enabled (7+ days retention)
- [ ] Maintenance window configured
- [ ] Monitoring and alerting enabled
- [ ] Connection pooling configured
- [ ] Secrets stored in Secrets Manager/Key Vault
- [ ] Network isolation (private subnet/VNet) for production
- [ ] Cost alerts configured
- [ ] Database credentials NOT committed to Git
- [ ] `.env` file added to `.gitignore`

### Post-Deployment Validation

```bash
# Run all validation tests
npm run validate:database

# Individual tests
npm run test:connection      # Test basic connectivity
npm run test:ssl             # Verify SSL/TLS
npm run test:performance     # Run performance benchmarks
npm run test:backups         # Verify backup configuration
npm run test:security        # Security audit
```

### Evidence Collection

**Take Screenshots of:**

1. ✅ Database instance overview page (AWS RDS or Azure Portal)
2. ✅ Security group/firewall rules configuration
3. ✅ Backup configuration settings
4. ✅ Successful connection from psql/pgAdmin
5. ✅ Successful Prisma migration
6. ✅ Application health check response
7. ✅ Monitoring dashboard (CloudWatch/Azure Monitor)
8. ✅ Cost estimate/billing dashboard

**Save Configuration Files:**
```bash
# Export AWS RDS configuration
aws rds describe-db-instances \
  --db-instance-identifier jeevan-rakth-db \
  > docs/evidence/rds-config.json

# Export Azure configuration
az postgres flexible-server show \
  --resource-group jeevan-rakth-rg \
  --name jeevan-rakth-db \
  > docs/evidence/azure-db-config.json
```

---

## Reflection & Trade-offs

### Public vs Private Access

| Aspect | Public Access | Private Access |
|--------|---------------|----------------|
| **Security** | ⚠️ Lower - exposed to internet | ✅ Higher - internal only |
| **Setup Complexity** | ✅ Simple | ⚠️ Complex (VPN/VPC peering) |
| **Cost** | ✅ Free | 💰 Additional (VPN/PrivateLink) |
| **Use Case** | Development/Testing | Production |
| **Best Practice** | IP allowlisting required | Recommended for production |

**Recommendation:** Use public access for development with strict IP allowlisting. Use private endpoints/VPC for production.

### Backup Strategies

| Strategy | RPO | RTO | Cost | Complexity |
|----------|-----|-----|------|------------|
| **Automated Snapshots** | 1 day | 30-60 min | Low | Low |
| **Point-in-Time Recovery** | 5 min | 30-60 min | Medium | Low |
| **Read Replica** | Real-time | <5 min | High | Medium |
| **Multi-AZ** | Real-time | <1 min | High | Low |
| **Cross-Region Replica** | Real-time | Manual | Very High | High |

**Recommendation:** Start with automated snapshots + PITR. Add Multi-AZ for production critical apps.

### Scaling Considerations

**Vertical Scaling (Scale Up/Down):**
- ✅ Simple - just change instance type
- ⚠️ Requires downtime (5-15 minutes)
- 💡 Best for: Handling increased load temporarily

**Horizontal Scaling (Read Replicas):**
- ✅ No downtime
- ✅ Improved read performance
- ⚠️ Eventual consistency for reads
- ⚠️ Write operations still go to primary
- 💡 Best for: Read-heavy workloads

**Connection Pooling:**
- ✅ Handles more concurrent connections
- ✅ Reduces connection overhead
- ⚠️ Additional infrastructure
- 💡 Best for: High connection count apps (serverless)

**Future Scaling Path:**
```
1. Start: db.t3.micro (2 vCPU, 1GB RAM)
2. Grow: db.t4g.small (2 vCPU, 2GB RAM)
3. Scale: db.t4g.medium + Read Replica
4. Enterprise: db.r6g.xlarge + Multi-AZ + 2 Read Replicas
```

### Cost Projections

**Development Environment:**
- Database: ~$15-30/month
- Backups: Included
- Data Transfer: ~$5/month
- **Total: ~$20-35/month**

**Production Environment (Small):**
- Database: ~$60/month (db.t4g.medium Multi-AZ)
- RDS Proxy/Connection Pooling: ~$15/month
- Enhanced Monitoring: ~$5/month
- Backups: ~$10/month (100GB)
- Data Transfer: ~$20/month
- **Total: ~$110/month**

**Production Environment (Medium):**
- Database: ~$250/month (db.r6g.large Multi-AZ)
- Read Replicas (2): ~$250/month
- RDS Proxy: ~$15/month
- Enhanced Monitoring: ~$10/month
- Backups: ~$50/month
- Data Transfer: ~$50/month
- **Total: ~$625/month**

---

## Additional Resources

### Official Documentation
- [AWS RDS PostgreSQL Documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [Azure Database for PostgreSQL Documentation](https://docs.microsoft.com/en-us/azure/postgresql/)
- [Prisma with PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/index.html)

### Tools
- [pgAdmin](https://www.pgadmin.org/) - GUI management tool
- [Azure Data Studio](https://docs.microsoft.com/en-us/sql/azure-data-studio/) - Cross-platform database tool
- [DBeaver](https://dbeaver.io/) - Universal database tool
- [psql](https://www.postgresql.org/docs/current/app-psql.html) - Command-line tool

### Monitoring & Observability
- [AWS CloudWatch for RDS](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/monitoring-cloudwatch.html)
- [Azure Monitor for PostgreSQL](https://docs.microsoft.com/en-us/azure/postgresql/concepts-monitoring)
- [Datadog RDS Integration](https://docs.datadoghq.com/integrations/amazon_rds/)
- [New Relic PostgreSQL Monitoring](https://docs.newrelic.com/docs/infrastructure/host-integrations/host-integrations-list/postgresql-monitoring-integration/)

---

## Next Steps

1. ✅ **Choose Your Provider**: AWS RDS or Azure Database
2. ✅ **Provision Database**: Follow the setup guide above
3. ✅ **Configure Network**: Set up security groups/firewall rules
4. ✅ **Update Application**: Configure `.env.local` with connection string
5. ✅ **Run Migrations**: Deploy Prisma schema to managed database
6. ✅ **Validate Connection**: Test with multiple methods
7. ✅ **Enable Backups**: Configure automated backup policy
8. ✅ **Set Up Monitoring**: Configure alerts and dashboards
9. ✅ **Document**: Update README with your specific configuration
10. ✅ **Security Audit**: Run security validation scripts

---

**Questions or Issues?** Check the [Troubleshooting](#troubleshooting) section or refer to the official documentation.

**Ready to deploy?** See [JWT_DEPLOYMENT_CHECKLIST.md](./JWT_DEPLOYMENT_CHECKLIST.md) for complete deployment preparation.
