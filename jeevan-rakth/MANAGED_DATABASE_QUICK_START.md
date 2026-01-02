# Quick Start: Managed Database Setup

**Fast track guide to get your managed PostgreSQL database up and running.**

---

## 🚀 5-Minute Setup (Development)

### Step 1: Choose Your Provider

**AWS RDS** (Free tier available for 12 months)
```bash
# Recommended for: AWS ecosystem, cost-effective testing
```

**Azure Database** (No free tier, but great auto-scaling)
```bash
# Recommended for: Azure integration, production workloads
```

---

## AWS RDS Quick Setup

### 1. Create Database (AWS Console - 2 minutes)

1. Go to [AWS RDS Console](https://console.aws.amazon.com/rds)
2. Click **Create database**
3. Select:
   - Engine: **PostgreSQL**
   - Template: **Free tier**
   - DB instance identifier: `jeevan-rakth-db`
   - Master username: `adminuser`
   - Master password: [Generate strong password]
   - Public access: **Yes** (for testing only)
4. Click **Create database**
5. Wait 5-10 minutes for provisioning

### 2. Configure Security Group (1 minute)

```bash
# Get your IP
curl https://api.ipify.org

# Add your IP to security group (via Console)
# EC2 → Security Groups → [your-db-sg] → Inbound rules → Add rule
# Type: PostgreSQL, Port: 5432, Source: [Your IP]/32
```

### 3. Get Connection String (30 seconds)

```bash
# From RDS Console, copy the endpoint
# Format: jeevan-rakth-db.xxxxx.region.rds.amazonaws.com
```

### 4. Update Your App (1 minute)

```bash
# Edit .env
DATABASE_URL="postgresql://adminuser:YOUR_PASSWORD@jeevan-rakth-db.xxxxx.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require"

# Install dependencies
npm install

# Test connection
npm run test:connection
```

### 5. Run Migrations (1 minute)

```bash
npx prisma migrate deploy
npm run dev
```

✅ **Done!** Your app is connected to AWS RDS.

---

## Azure Database Quick Setup

### 1. Create Database (Azure Portal - 2 minutes)

1. Go to [Azure Portal](https://portal.azure.com)
2. Create resource → **Azure Database for PostgreSQL** → **Flexible Server**
3. Configure:
   - Server name: `jeevan-rakth-db`
   - Admin username: `adminuser`
   - Password: [Generate strong password]
   - Compute: **Burstable B1ms**
   - Networking: **Public access**
   - Firewall: **Add your client IP**
4. Click **Review + Create**
5. Wait 5-10 minutes for deployment

### 2. Configure Firewall (Done automatically if you selected "Add your client IP")

```bash
# If you need to add IP manually via CLI
az postgres flexible-server firewall-rule create \
  --resource-group YOUR_RG \
  --name jeevan-rakth-db \
  --rule-name AllowMyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP
```

### 3. Get Connection String (30 seconds)

```bash
# From Azure Portal, copy the connection string
# Format: jeevan-rakth-db.postgres.database.azure.com
```

### 4. Update Your App (1 minute)

```bash
# Edit .env
DATABASE_URL="postgresql://adminuser:YOUR_PASSWORD@jeevan-rakth-db.postgres.database.azure.com:5432/postgres?sslmode=require"

# Install dependencies
npm install

# Test connection
npm run test:connection
```

### 5. Run Migrations (1 minute)

```bash
npx prisma migrate deploy
npm run dev
```

✅ **Done!** Your app is connected to Azure Database.

---

## Validation Checklist

Run these commands to verify everything works:

```bash
# 1. Test database connection
npm run test:connection

# 2. Validate database configuration
npm run validate:database

# 3. Check health endpoint (after starting dev server)
curl http://localhost:3000/api/health/database

# 4. Verify backups (optional)
npm run verify:backups
```

**Expected Output:**
- ✅ All tests passing
- ✅ SSL/TLS enabled
- ✅ Successful connection to managed database
- ✅ Health endpoint returns 200 OK

---

## Common First-Time Issues

### ❌ Connection Timeout

**Problem:** Can't connect to database

**Solutions:**
```bash
# 1. Check security group/firewall allows your IP on port 5432
# 2. Verify "Public Access" is enabled (for testing)
# 3. Check VPC/VNet configuration
# 4. Confirm database is "Available" / "Ready"
```

### ❌ SSL Certificate Error

**Problem:** SSL certificate verification failed

**Solution:**
```bash
# Use sslmode=require instead of verify-full
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### ❌ Permission Denied

**Problem:** Can't create tables or run migrations

**Solution:**
```bash
# 1. Verify username/password are correct
# 2. Check user has CREATE permissions
# 3. Ensure database name is correct (default is 'postgres')
```

### ❌ Password Authentication Failed

**Problem:** Wrong credentials

**Solution:**
```bash
# 1. Verify password (no special characters causing issues)
# 2. Reset password via console if needed
# 3. URL-encode password if it contains special characters
```

---

## Environment Variables Template

Copy this to your `.env` file:

```bash
# AWS RDS
DATABASE_URL="postgresql://adminuser:YOUR_PASSWORD@jeevan-rakth-db.xxxxx.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require"

# OR Azure Database
DATABASE_URL="postgresql://adminuser:YOUR_PASSWORD@jeevan-rakth-db.postgres.database.azure.com:5432/postgres?sslmode=require"

# Connection Pool (optional but recommended)
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_POOL_IDLE_TIMEOUT=10000

# SSL Configuration
DATABASE_SSL_ENABLED=true

# JWT Secrets (generate new ones!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-CHANGE-THIS
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars-CHANGE-THIS
```

**Generate Strong JWT Secrets:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Next Steps

### For Development
1. ✅ Database connected and tested
2. ✅ Run `npm run dev` to start development
3. ✅ Access app at http://localhost:3000
4. ✅ Test health endpoint: http://localhost:3000/api/health/database

### For Production
1. 📖 Read [Managed Database Setup Guide](./MANAGED_DATABASE_SETUP.md)
2. ✅ Complete [Deployment Checklist](./DATABASE_DEPLOYMENT_CHECKLIST.md)
3. 🔒 Configure private network access (no public IP)
4. 💾 Enable automated backups
5. 📊 Set up monitoring and alerts
6. 🔐 Move credentials to secrets manager
7. ⚡ Configure connection pooling (RDS Proxy / PgBouncer)

---

## Quick Commands Reference

```bash
# Test connection
npm run test:connection

# Validate everything
npm run validate:database

# Check backups
npm run verify:backups

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# View database in browser
npx prisma studio

# Check migration status
npx prisma migrate status

# Start dev server
npm run dev
```

---

## Help & Support

### Getting Help
1. Check [Troubleshooting Guide](./MANAGED_DATABASE_SETUP.md#troubleshooting)
2. Review [Common Issues](#common-first-time-issues) above
3. Run `npm run validate:database` for diagnostic info
4. Check logs in AWS CloudWatch or Azure Monitor

### Useful Links
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [Azure PostgreSQL Documentation](https://docs.microsoft.com/azure/postgresql/)
- [Prisma Documentation](https://www.prisma.io/docs/)

---

## Cost Estimate

### Development Environment
- **AWS RDS:** Free tier (12 months) or ~$15/month
- **Azure Database:** ~$30/month (Burstable B1ms)

### Production Environment (Small)
- **AWS RDS:** ~$60/month (db.t4g.medium Multi-AZ)
- **Azure Database:** ~$150/month (General Purpose D2s_v3)

💡 **Tip:** Use auto-stop for dev/test environments to save costs!

---

## Success Criteria

You're ready to develop when:

✅ `npm run test:connection` passes all tests  
✅ `npm run validate:database` shows all green checkmarks  
✅ Health endpoint returns `{"status": "healthy"}`  
✅ `npm run dev` starts without database errors  
✅ You can create/read/update/delete data  

---

## Production Readiness

Before deploying to production:

⚠️ **Security**
- [ ] Public access disabled
- [ ] SSL/TLS enforced
- [ ] Credentials in secrets manager
- [ ] Security groups restrict access to app only

⚠️ **Reliability**
- [ ] Automated backups enabled (7+ days retention)
- [ ] Multi-AZ / Zone redundancy enabled
- [ ] Connection pooling configured
- [ ] Health monitoring set up

⚠️ **Documentation**
- [ ] [Deployment Checklist](./DATABASE_DEPLOYMENT_CHECKLIST.md) completed
- [ ] Backup/restore procedures documented
- [ ] Emergency contacts documented

---

**Quick Start Complete!** 🎉

For detailed setup and production deployment, see:
- [Managed Database Setup Guide](./MANAGED_DATABASE_SETUP.md)
- [Deployment Checklist](./DATABASE_DEPLOYMENT_CHECKLIST.md)
- [Main README](./README.md)
