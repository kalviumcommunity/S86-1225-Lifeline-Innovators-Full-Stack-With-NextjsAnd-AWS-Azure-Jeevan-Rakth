# Managed Database Setup - Evidence & Documentation Guide

This guide helps you collect and document evidence of your managed database setup for project submission or review.

---

## 📸 Required Evidence & Screenshots

### 1. Database Provisioning Evidence

#### AWS RDS
Take screenshots of:

**A. RDS Instance Overview**
- [ ] AWS Console → RDS → Databases → [your-instance]
- [ ] Should show:
  - DB instance identifier
  - Engine (PostgreSQL)
  - Status (Available)
  - Endpoint & port
  - Instance size
  - Storage

**B. Configuration Details**
- [ ] Connectivity & Security tab showing:
  - VPC
  - Subnet group
  - Public accessibility setting
  - Security groups
  - Availability zone

**C. Backup Configuration**
- [ ] Maintenance & backups tab showing:
  - Backup retention period
  - Backup window
  - Latest backup time
  - Automated backups status

**D. Monitoring Dashboard**
- [ ] CloudWatch metrics showing:
  - CPU Utilization
  - Database Connections
  - Free Storage Space

#### Azure Database for PostgreSQL
Take screenshots of:

**A. Server Overview**
- [ ] Azure Portal → PostgreSQL Server → [your-server]
- [ ] Should show:
  - Server name
  - Status (Available)
  - Server version
  - Location
  - Pricing tier

**B. Networking Configuration**
- [ ] Networking tab showing:
  - Public access setting
  - Firewall rules
  - VNet integration (if configured)

**C. Backup & Restore**
- [ ] Backup and restore tab showing:
  - Backup retention period
  - Geo-redundant backup setting
  - Available backups

**D. Monitoring Metrics**
- [ ] Metrics tab showing:
  - CPU percent
  - Memory percent
  - Storage used
  - Active connections

---

### 2. Connection Validation Evidence

#### Terminal/Command Line Screenshots

**A. Connection Test**
```bash
npm run test:connection
```
- [ ] Screenshot showing:
  - ✅ All tests passing
  - Connection target (host, port, database)
  - SSL/TLS enabled
  - Performance metrics

**B. Database Validation**
```bash
npm run validate:database
```
- [ ] Screenshot showing:
  - ✅ Environment variables validated
  - ✅ Connection successful
  - ✅ Schema validation passed
  - ✅ Security configuration validated

**C. Backup Verification (Optional)**
```bash
npm run verify:backups
```
- [ ] Screenshot showing:
  - Backup configuration details
  - Recent snapshots listed
  - Retention period

#### Health Check Endpoint

**D. API Health Check**
```bash
curl http://localhost:3000/api/health/database
# OR visit in browser
```
- [ ] Screenshot showing JSON response:
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "version": "PostgreSQL 15.x",
    "ssl_enabled": true,
    ...
  }
}
```

---

### 3. Database Client Validation

#### Using pgAdmin / Azure Data Studio

**A. Connection Configuration**
- [ ] Screenshot of connection dialog showing:
  - Host/endpoint
  - Port (5432)
  - Database name
  - Username
  - SSL mode (Require)

**B. Successful Connection**
- [ ] Screenshot of database tree showing:
  - Connected database
  - Tables listed
  - Successful query result

**C. Sample Query**
- [ ] Screenshot of query execution:
```sql
SELECT version();
SELECT NOW();
SELECT count(*) FROM "User";
```

---

### 4. Application Integration Evidence

#### Environment Configuration

**A. .env File (Redacted)**
- [ ] Screenshot of .env file with:
  - DATABASE_URL configured (password hidden: ****)
  - JWT secrets configured
  - Connection pool settings

```bash
# Example (hide actual password)
DATABASE_URL="postgresql://adminuser:****@endpoint.rds.amazonaws.com:5432/jeevanrakth?sslmode=require"
```

#### Development Server Running

**B. Application Startup**
- [ ] Screenshot of terminal showing:
```bash
npm run dev
# Should show:
# ✓ Ready on http://localhost:3000
# No database connection errors
```

**C. Prisma Migrations**
- [ ] Screenshot of successful migration:
```bash
npx prisma migrate deploy
# Should show:
# ✓ Migrations applied successfully
```

**D. Application Logs**
- [ ] Screenshot showing successful database operations:
  - User authentication
  - Data retrieval
  - No connection errors

---

### 5. Security Configuration Evidence

#### Network Security

**A. Security Groups (AWS)**
- [ ] Screenshot showing:
  - Inbound rules for port 5432
  - Source IP restrictions
  - Description of rules

**B. Firewall Rules (Azure)**
- [ ] Screenshot showing:
  - Firewall rules configured
  - Allowed IP addresses
  - Connection security settings

#### SSL/TLS Verification

**C. SSL Connection**
- [ ] Screenshot of connection test showing:
  - ✅ SSL/TLS is ENABLED
  - Connection encrypted

---

### 6. Monitoring & Alerting Setup

#### CloudWatch (AWS) / Azure Monitor

**A. Metrics Dashboard**
- [ ] Screenshot showing:
  - CPU utilization graph
  - Memory usage graph
  - Storage metrics
  - Connection count

**B. Alarms/Alerts**
- [ ] Screenshot showing configured alerts:
  - High CPU alert
  - Storage threshold alert
  - Connection limit alert

---

## 📝 Documentation Files to Include

### Required Documentation

1. **README.md** (Updated)
   - Database setup instructions
   - Environment configuration
   - Troubleshooting guide

2. **MANAGED_DATABASE_SETUP.md**
   - Complete setup guide
   - Provider-specific instructions
   - Security best practices

3. **.env.example**
   - Template with managed database connections
   - Commented configuration options

### Evidence Folder Structure

Create an `evidence/` folder:

```
evidence/
├── screenshots/
│   ├── 01-aws-rds-overview.png
│   ├── 02-aws-rds-connectivity.png
│   ├── 03-aws-rds-backups.png
│   ├── 04-cloudwatch-metrics.png
│   ├── 05-connection-test.png
│   ├── 06-validation-results.png
│   ├── 07-health-check.png
│   ├── 08-pgadmin-connection.png
│   └── 09-app-running.png
├── configs/
│   ├── rds-config.json (exported config)
│   ├── security-group.json
│   └── backup-policy.txt
└── logs/
    ├── connection-test.log
    ├── validation.log
    └── app-startup.log
```

---

## 📊 Evidence Checklist

### Provisioning
- [ ] Cloud console screenshot (RDS/Azure Database overview)
- [ ] Database configuration details
- [ ] Instance/server specifications
- [ ] Region and availability zone

### Network & Security
- [ ] Security group/firewall rules screenshot
- [ ] SSL/TLS configuration
- [ ] Network topology (if applicable)
- [ ] VPC/VNet configuration

### Backups
- [ ] Backup retention configuration
- [ ] Recent snapshots list
- [ ] Restore capability verification
- [ ] Automated backup schedule

### Monitoring
- [ ] CloudWatch/Azure Monitor dashboard
- [ ] Key metrics graphs
- [ ] Alert configuration
- [ ] Log collection setup

### Application Integration
- [ ] Successful connection test results
- [ ] Database validation results
- [ ] Health check endpoint response
- [ ] Application running with database

### Testing
- [ ] Connection test output
- [ ] Validation script results
- [ ] Sample queries executed
- [ ] Performance metrics

---

## 📄 Documentation Template

### Database Setup Report

Use this template for your documentation:

```markdown
# Managed Database Setup Report

**Project:** Jeevan Rakth
**Date:** [Date]
**Author:** [Your Name]

## Overview

This document provides evidence of managed PostgreSQL database setup for the Jeevan Rakth application.

## 1. Provider Selection

**Selected Provider:** [AWS RDS / Azure Database for PostgreSQL]

**Justification:**
- [Reason 1]
- [Reason 2]
- [Reason 3]

## 2. Database Configuration

**Instance Details:**
- Instance ID/Name: [instance-name]
- PostgreSQL Version: [15.x]
- Instance Type: [db.t3.micro / Standard_B1ms]
- Storage: [20 GB]
- Region: [us-east-1 / East US]

**Network Configuration:**
- VPC/VNet: [vpc-id / vnet-name]
- Subnet: [subnet-id / subnet-name]
- Security Group: [sg-id / firewall-name]
- Public Access: [Enabled for testing / Disabled]
- SSL/TLS: Enabled ✅

**Backup Configuration:**
- Automated Backups: Enabled ✅
- Retention Period: [7 days]
- Backup Window: [03:00-04:00 UTC]
- Multi-AZ/HA: [Enabled/Disabled]

## 3. Connection Validation

**Connection String Format:**
```
postgresql://adminuser:****@endpoint:5432/database?sslmode=require
```

**Validation Results:**
- Connection Test: ✅ PASSED
- SSL/TLS Verification: ✅ ENABLED
- Performance (avg latency): [XX ms]
- Health Check: ✅ HEALTHY

[INSERT SCREENSHOTS HERE]

## 4. Security Implementation

**Network Security:**
- Private subnet: [Yes/No]
- Security rules: [Specific app servers only / IP allowlist]
- SSL/TLS enforced: ✅ Yes

**Credential Management:**
- Stored in: [AWS Secrets Manager / Azure Key Vault / .env]
- Password strength: ✅ 16+ characters
- Rotation policy: [Defined/Not defined]

## 5. Cost Estimation

**Current Configuration:**
- Instance cost: $[XX]/month
- Storage cost: $[XX]/month
- Backup cost: $[XX]/month
- **Total estimated cost:** $[XXX]/month

## 6. Validation Evidence

[INSERT SCREENSHOTS]

### Connection Test Results
[Screenshot: npm run test:connection]

### Database Validation
[Screenshot: npm run validate:database]

### Health Check Endpoint
[Screenshot: curl health endpoint]

### Cloud Console
[Screenshot: AWS RDS / Azure Portal]

### Monitoring Dashboard
[Screenshot: CloudWatch / Azure Monitor]

## 7. Troubleshooting & Issues

**Issues Encountered:**
1. [Issue 1]
   - Solution: [How it was resolved]

2. [Issue 2]
   - Solution: [How it was resolved]

## 8. Reflection

### What Worked Well
- [Point 1]
- [Point 2]

### Challenges
- [Challenge 1]
- [Challenge 2]

### Future Improvements
- [ ] Implement connection pooling (RDS Proxy)
- [ ] Set up read replicas for scaling
- [ ] Configure cross-region replication
- [ ] Implement automated failover testing

## 9. Trade-offs

### Public vs Private Access
- **Current:** [Public with IP restrictions / Private]
- **Reason:** [Explanation]
- **Future:** [Plan for production]

### Backup Strategy
- **Current:** [7-day retention, daily backups]
- **RPO:** [1 day]
- **RTO:** [30-60 minutes]

### Cost vs Performance
- **Instance size:** [Chosen for balance of cost/performance]
- **Scaling plan:** [When to upgrade]

## 10. Next Steps

- [ ] Move to private subnet for production
- [ ] Implement connection pooling
- [ ] Set up comprehensive monitoring
- [ ] Configure automated alerts
- [ ] Test disaster recovery procedure
- [ ] Document backup/restore process

## Appendix

### A. Commands Used
```bash
# Connection test
npm run test:connection

# Validation
npm run validate:database

# Backup verification
npm run verify:backups
```

### B. Configuration Files
- See: evidence/configs/

### C. Screenshots
- See: evidence/screenshots/

### D. Logs
- See: evidence/logs/

---

**Prepared by:** [Your Name]
**Date:** [Date]
**Status:** ✅ Complete
```

---

## 🎯 Submission Checklist

Before submitting your evidence:

### Documentation
- [ ] Main README.md updated with database setup
- [ ] MANAGED_DATABASE_SETUP.md included
- [ ] DATABASE_DEPLOYMENT_CHECKLIST.md reviewed
- [ ] Evidence report written (using template above)

### Screenshots
- [ ] Cloud console (RDS/Azure) overview
- [ ] Network configuration
- [ ] Backup configuration
- [ ] Connection test results
- [ ] Validation script output
- [ ] Health check endpoint response
- [ ] Monitoring dashboard
- [ ] Application running successfully

### Configuration Files
- [ ] .env.example provided (no real credentials)
- [ ] Package.json with database scripts
- [ ] Prisma schema annotated
- [ ] Security group/firewall config documented

### Testing Evidence
- [ ] All validation scripts run successfully
- [ ] Health endpoint returns 200 OK
- [ ] Application can read/write to database
- [ ] SSL/TLS verified as enabled

### Reflection
- [ ] Documented provisioning steps taken
- [ ] Explained network configuration choices
- [ ] Justified backup strategy
- [ ] Reflected on cost vs performance trade-offs
- [ ] Identified future improvements

---

## 💡 Tips for Quality Evidence

### Screenshots
1. **Use high resolution** - Text should be readable
2. **Include timestamps** - Shows when work was done
3. **Highlight important details** - Use arrows or boxes
4. **Consistent naming** - Use numbered, descriptive filenames
5. **Include context** - Show URLs, terminal prompts

### Documentation
1. **Be specific** - Include actual values (except passwords)
2. **Explain decisions** - Why you chose certain options
3. **Show understanding** - Don't just copy-paste commands
4. **Document issues** - Show problem-solving skills
5. **Provide context** - Explain what each screenshot shows

### Code/Configuration
1. **Never commit credentials** - Always redact passwords
2. **Comment thoroughly** - Explain configuration choices
3. **Use version control** - Show commit history if applicable
4. **Include validation** - Show tests passing
5. **Document scripts** - Explain what each script does

---

## ✅ Quality Checklist

Your evidence is complete when:

✅ All required screenshots are clear and annotated  
✅ Documentation explains all configuration choices  
✅ Validation tests show all passing  
✅ Security measures are documented and implemented  
✅ Cost estimates are provided and justified  
✅ Reflection includes trade-offs and future improvements  
✅ No credentials are exposed in any files  
✅ File organization is clear and logical  
✅ Evidence demonstrates understanding, not just execution  

---

## 📞 Need Help?

### Common Questions

**Q: What if I can't afford AWS/Azure costs?**
A: Document local PostgreSQL setup with discussion of how it would translate to managed database. Show understanding through documentation.

**Q: Should I include actual credentials?**
A: **NO!** Always redact passwords. Use `****` or `[REDACTED]`.

**Q: How many screenshots are enough?**
A: Enough to prove you completed the task. Usually 8-12 key screenshots.

**Q: What if something didn't work?**
A: Document the issue and how you resolved it. Shows problem-solving!

**Q: Do I need all the validation scripts?**
A: Run them and include output. Shows thoroughness.

---

**Ready to collect your evidence?** Follow this guide and you'll have comprehensive documentation of your managed database setup!
