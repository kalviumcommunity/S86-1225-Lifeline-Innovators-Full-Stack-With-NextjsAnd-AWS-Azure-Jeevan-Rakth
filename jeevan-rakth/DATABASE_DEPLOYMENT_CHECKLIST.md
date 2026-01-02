# Managed Database Deployment Checklist

Complete pre-deployment validation checklist for AWS RDS and Azure Database for PostgreSQL.

## 📋 Pre-Deployment Checklist

Use this checklist before deploying your application to production with a managed database.

---

## ✅ Database Provisioning

### AWS RDS
- [ ] RDS instance created with appropriate instance type (min: db.t4g.small for production)
- [ ] PostgreSQL version 15 or later
- [ ] Storage autoscaling enabled (max storage set to reasonable limit)
- [ ] Storage encryption enabled (KMS key configured)
- [ ] Multi-AZ deployment enabled for high availability
- [ ] Enhanced Monitoring enabled (60-second interval)
- [ ] Performance Insights enabled (7+ days retention)
- [ ] Backup retention period set (minimum 7 days, recommended 14-30 days)
- [ ] Preferred backup window configured (off-peak hours)
- [ ] Preferred maintenance window configured
- [ ] Parameter group configured (if custom settings needed)
- [ ] Option group configured (if needed)

### Azure Database for PostgreSQL
- [ ] Flexible Server created with appropriate SKU (min: Standard_D2s_v3 for production)
- [ ] PostgreSQL version 15 or later
- [ ] Storage autoscaling enabled
- [ ] Zone redundancy enabled for high availability
- [ ] Backup retention period set (minimum 7 days, recommended 14-30 days)
- [ ] Geo-redundant backup enabled (if needed)
- [ ] Maintenance window configured
- [ ] Server parameters configured (if custom settings needed)

---

## 🔒 Network & Security Configuration

### Network Access
- [ ] VPC/VNet properly configured
- [ ] Private subnet configured for database (recommended for production)
- [ ] Security group / firewall rules configured:
  - [ ] Allow application server IP/security group on port 5432
  - [ ] Deny all other inbound traffic
  - [ ] (Development only) Allow specific developer IPs if needed
- [ ] Public access disabled (production) or properly restricted (development)
- [ ] SSL/TLS encryption enforced (`sslmode=require` in connection string)
- [ ] VPN or bastion host configured for admin access (if needed)

### AWS RDS Specific
- [ ] RDS is in private subnet (no public IP)
- [ ] RDS Proxy configured for connection pooling (if using serverless/Lambda)
- [ ] VPC peering or Transit Gateway configured (if multi-VPC)
- [ ] Route tables configured correctly
- [ ] Network ACLs reviewed and configured

### Azure Specific
- [ ] Private endpoint configured (production)
- [ ] VNet integration enabled
- [ ] NSG (Network Security Group) rules configured
- [ ] Service endpoints enabled (if needed)

---

## 🔐 Credentials & Secrets Management

- [ ] Strong database password generated (min 16 characters, alphanumeric + symbols)
- [ ] Database credentials stored in secrets manager:
  - [ ] AWS: AWS Secrets Manager or Systems Manager Parameter Store
  - [ ] Azure: Azure Key Vault
- [ ] Database credentials NOT committed to git
- [ ] `.env` file added to `.gitignore`
- [ ] Application configured to retrieve secrets from secrets manager
- [ ] Credential rotation policy defined
- [ ] Service account / managed identity configured for application access

### Environment Variables
- [ ] `DATABASE_URL` configured with correct connection string
- [ ] SSL parameters included in connection string (`sslmode=require`)
- [ ] Connection pool settings configured:
  - [ ] `DATABASE_POOL_MIN` (recommended: 2)
  - [ ] `DATABASE_POOL_MAX` (recommended: 10-20)
  - [ ] `DATABASE_POOL_IDLE_TIMEOUT` (recommended: 10000ms)
- [ ] `JWT_SECRET` set to strong random value (min 32 characters)
- [ ] `JWT_REFRESH_SECRET` set to strong random value (min 32 characters)

---

## 🗄️ Database Schema & Migrations

- [ ] Prisma schema validated (`npx prisma validate`)
- [ ] All migrations tested in staging environment
- [ ] Migration rollback plan documented
- [ ] Database seeding script tested (if applicable)
- [ ] Indexes created for frequently queried columns
- [ ] Foreign key constraints properly configured
- [ ] Data validation rules implemented at database level
- [ ] Backup taken before running migrations in production

### Migration Execution
- [ ] Run `npx prisma migrate deploy` on staging first
- [ ] Verify all migrations applied successfully
- [ ] Test application functionality after migrations
- [ ] Document migration execution steps
- [ ] Plan for zero-downtime migrations (if needed)

---

## 💾 Backup & Disaster Recovery

### Backup Configuration
- [ ] Automated backups enabled
- [ ] Backup retention period adequate (7-30 days)
- [ ] Point-in-time recovery (PITR) enabled
- [ ] Backup window scheduled during low-traffic hours
- [ ] Manual snapshot taken before major changes
- [ ] Backup verification performed:
  - [ ] Run `npm run verify:backups`
  - [ ] Review backup status in console
  - [ ] Verify backup files exist

### Disaster Recovery Plan
- [ ] Recovery Time Objective (RTO) defined
- [ ] Recovery Point Objective (RPO) defined
- [ ] Restore procedure documented and tested
- [ ] Cross-region backup configured (if needed)
- [ ] Backup export to S3/Azure Storage configured (for long-term retention)
- [ ] Database restore tested in non-production environment
- [ ] Failover procedure documented (Multi-AZ / Zone redundancy)

---

## 📊 Monitoring & Alerting

### Monitoring Setup
- [ ] CloudWatch / Azure Monitor configured
- [ ] Key metrics monitored:
  - [ ] CPU utilization
  - [ ] Memory utilization
  - [ ] Storage utilization
  - [ ] IOPS (read/write)
  - [ ] Connection count
  - [ ] Replication lag (if using replicas)
  - [ ] Query performance
- [ ] Custom dashboard created
- [ ] Slow query logging enabled
- [ ] Error logs configured and accessible

### Alerting
- [ ] Alerts configured for:
  - [ ] CPU > 80%
  - [ ] Memory > 85%
  - [ ] Storage > 80%
  - [ ] Connection count > 80% of max
  - [ ] Replication lag > threshold
  - [ ] Backup failures
  - [ ] Database unavailability
- [ ] Alert notification channels configured (email, Slack, PagerDuty, etc.)
- [ ] On-call rotation defined
- [ ] Escalation policy documented

---

## ⚡ Performance Optimization

### Database Configuration
- [ ] Connection pooling configured (RDS Proxy / PgBouncer / Prisma Accelerate)
- [ ] Appropriate instance size selected based on load testing
- [ ] Storage type appropriate for workload (gp3 for AWS, Premium SSD for Azure)
- [ ] IOPS configured if using provisioned IOPS
- [ ] Read replicas created (if read-heavy workload)
- [ ] Query caching strategy implemented
- [ ] Indexes reviewed and optimized

### Application Configuration
- [ ] Database queries optimized (avoid N+1 queries)
- [ ] Prisma Client configured with optimal settings
- [ ] Connection pool size tuned based on application needs
- [ ] Query timeout configured
- [ ] Transaction isolation level appropriate
- [ ] Prepared statements used where possible

---

## 🧪 Testing & Validation

### Pre-Deployment Tests
- [ ] Connection test passed: `npm run test:connection`
- [ ] Database validation passed: `npm run validate:database`
- [ ] Application health check endpoint working: `/api/health/database`
- [ ] Load testing performed
- [ ] Failover testing completed (Multi-AZ / Zone redundancy)
- [ ] Backup and restore tested
- [ ] Migration tested in staging environment
- [ ] Security scan completed (no exposed credentials, SQL injection vulnerabilities)

### Post-Deployment Validation
- [ ] Application successfully connects to database
- [ ] All database tables created
- [ ] Sample queries executing successfully
- [ ] Authentication working
- [ ] No connection pool exhaustion
- [ ] Monitoring dashboards showing expected metrics
- [ ] Logs showing no database errors
- [ ] Performance within acceptable thresholds

---

## 📖 Documentation

- [ ] Database connection details documented (without credentials)
- [ ] Architecture diagram created showing application and database
- [ ] Backup and restore procedures documented
- [ ] Failover procedures documented
- [ ] Scaling procedures documented (vertical and horizontal)
- [ ] Maintenance window procedures documented
- [ ] Troubleshooting guide created
- [ ] Runbook created for common operations
- [ ] Access control procedures documented
- [ ] Emergency contact information documented

---

## 💰 Cost Optimization

- [ ] Right-sizing analysis completed
- [ ] Reserved instances evaluated (for long-term production)
- [ ] Storage autoscaling limits set appropriately
- [ ] Backup retention period balanced with cost
- [ ] Delete old snapshots policy defined
- [ ] Non-production environments configured with smaller instances
- [ ] Auto-stop configured for dev/test environments (if supported)
- [ ] Cost alerts configured
- [ ] Monthly cost estimate documented
- [ ] Budget allocated and approved

---

## 🔄 Maintenance & Operations

### Regular Maintenance
- [ ] Maintenance window scheduled and communicated
- [ ] Minor version auto-upgrade configured (or manual upgrade schedule defined)
- [ ] Major version upgrade plan documented
- [ ] Database parameter changes tested in staging
- [ ] Vacuum and analyze schedule defined (if needed)
- [ ] Index maintenance plan defined
- [ ] Statistics update schedule defined

### Operational Procedures
- [ ] Change management process defined
- [ ] Deployment checklist reviewed and approved
- [ ] Rollback plan documented
- [ ] Communication plan for maintenance windows
- [ ] Post-deployment verification checklist
- [ ] Incident response plan documented

---

## ✅ Final Pre-Deployment Sign-Off

### Technical Review
- [ ] All items in this checklist completed
- [ ] Code review completed
- [ ] Security review completed
- [ ] Performance testing results reviewed
- [ ] Database design reviewed
- [ ] All tests passing

### Stakeholder Approval
- [ ] Development team approval
- [ ] DevOps/SRE team approval
- [ ] Security team approval
- [ ] Product owner approval
- [ ] Deployment scheduled and communicated

### Deployment Day
- [ ] Deployment runbook reviewed
- [ ] Team members assigned and available
- [ ] Rollback plan ready
- [ ] Monitoring dashboards open
- [ ] Communication channels active
- [ ] Database backup taken immediately before deployment
- [ ] Deployment executed
- [ ] Post-deployment validation completed
- [ ] Deployment success communicated to stakeholders

---

## 📝 Post-Deployment Activities

Within 24 hours:
- [ ] Monitor application and database performance
- [ ] Review logs for any errors or warnings
- [ ] Verify all features working as expected
- [ ] Check cost usage and compare to estimates
- [ ] Document any issues encountered
- [ ] Update runbooks based on deployment experience

Within 1 week:
- [ ] Review and adjust monitoring thresholds if needed
- [ ] Optimize database queries based on slow query logs
- [ ] Adjust connection pool settings if needed
- [ ] Review backup success and timing
- [ ] Conduct retrospective meeting
- [ ] Update documentation based on learnings

Within 1 month:
- [ ] Review cost and optimize if needed
- [ ] Conduct disaster recovery drill
- [ ] Review and adjust alerting if needed
- [ ] Plan for any necessary scaling
- [ ] Review security posture

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ Application successfully connects to managed database  
✅ All features working correctly  
✅ Performance within acceptable thresholds  
✅ No errors in logs  
✅ Monitoring showing healthy status  
✅ Backups completing successfully  
✅ Cost within budget  
✅ Security requirements met  
✅ Documentation complete and accessible  
✅ Team trained on operational procedures  

---

## 📞 Emergency Contacts

Document your emergency contacts:

- Database Administrator: _______________
- DevOps/SRE Team: _______________
- Security Team: _______________
- On-Call Engineer: _______________
- Cloud Provider Support: _______________

---

## 📚 Related Documentation

- [Managed Database Setup Guide](./MANAGED_DATABASE_SETUP.md)
- [JWT Deployment Checklist](./JWT_DEPLOYMENT_CHECKLIST.md)
- [Security Guide](./SECURITY.md)
- [Main README](./README.md)

---

**Last Updated:** January 2, 2026  
**Version:** 1.0.0

---

**Next Steps:** After completing this checklist, proceed with deployment and monitor closely for the first 24-48 hours.
