# Security Deployment Checklist

Quick reference checklist for deploying Desperados Destiny securely.

---

## Pre-Production (CRITICAL)

### Environment Variables
- [ ] Generate new JWT_SECRET (min 64 chars)
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] Generate new JWT_REFRESH_SECRET
- [ ] Generate new SESSION_SECRET
- [ ] Set NODE_ENV=production
- [ ] Configure production MONGODB_URI
- [ ] Configure production REDIS_URL
- [ ] Set FRONTEND_URL to production domain
- [ ] Remove any DEBUG or DEV flags

### Security Middleware
- [ ] Verify Helmet is enabled (server.ts)
- [ ] Verify rate limiting is active
- [ ] Verify CORS is restricted to production domain
- [ ] Consider enabling CSRF protection
- [ ] Consider enabling input sanitization

### Database Security
- [ ] Enable MongoDB authentication
- [ ] Enable MongoDB encryption at rest
- [ ] Use strong database passwords
- [ ] Configure MongoDB to listen only on localhost
- [ ] Enable connection encryption (TLS)
- [ ] Set up database backups
- [ ] Test backup restoration

### SSL/TLS
- [ ] Install valid SSL certificate
- [ ] Configure HTTPS only
- [ ] Enable HSTS headers (already in Helmet)
- [ ] Test SSL configuration (ssllabs.com)
- [ ] Configure certificate auto-renewal

---

## Production Configuration

### Server Security
- [ ] Disable directory listing
- [ ] Configure firewall (only ports 80, 443, 22)
- [ ] Set up fail2ban for SSH
- [ ] Configure log rotation
- [ ] Disable server signatures
- [ ] Set up intrusion detection

### Monitoring & Logging
- [ ] Configure centralized logging
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up security event alerts
- [ ] Configure performance monitoring
- [ ] Set up log retention policy

### Backup & Recovery
- [ ] Automated daily database backups
- [ ] Test backup restoration procedure
- [ ] Off-site backup storage
- [ ] Document recovery process
- [ ] Test disaster recovery plan

---

## Application Security

### Authentication
- [x] Password hashing (bcrypt, 12 rounds)
- [x] Email verification required
- [x] JWT token expiration configured
- [x] Rate limiting on login (5/15min)
- [x] Secure cookie flags (httpOnly, secure, sameSite)
- [ ] Consider 2FA for admin accounts
- [ ] Consider account lockout after failed attempts

### Authorization
- [x] Character ownership validation
- [x] Gang permission system
- [x] Admin route protection
- [x] User-scoped queries
- [ ] Review all routes for auth requirements
- [ ] Audit admin access logs

### Input Validation
- [x] Character name validation
- [x] Email validation
- [x] Password strength requirements
- [x] Length limits on all text fields
- [x] XSS prevention
- [ ] Consider enabling global input sanitization

### Economy Security
- [x] MongoDB transactions enabled
- [x] Balance verification before deductions
- [x] Transaction audit trail
- [x] Negative value prevention
- [x] Race condition protection

---

## Network Security

### Firewall Rules
```
Allow:
- Port 80 (HTTP) → redirect to 443
- Port 443 (HTTPS)
- Port 22 (SSH) → restricted to specific IPs

Block:
- All other inbound traffic
- Direct MongoDB access (27017)
- Direct Redis access (6379)
```

### DDoS Protection
- [ ] Configure Cloudflare or AWS Shield
- [ ] Set up rate limiting at CDN level
- [ ] Configure connection limits
- [ ] Set up traffic analysis
- [ ] Document DDoS response procedure

---

## Testing Before Launch

### Security Testing
- [x] Run security audit script
- [ ] Professional penetration testing
- [ ] Vulnerability scanning
- [ ] SSL/TLS configuration test
- [ ] Security header verification
- [ ] Authentication flow testing
- [ ] Authorization bypass attempts

### Load Testing
- [ ] Concurrent user testing
- [ ] Database connection pool limits
- [ ] Rate limiting under load
- [ ] Memory leak testing
- [ ] CPU usage monitoring
- [ ] Response time benchmarks

### Compliance
- [ ] GDPR data export functionality
- [ ] Account deletion capability
- [ ] Privacy policy displayed
- [ ] Cookie consent management
- [ ] Terms of service acceptance
- [ ] Data retention policy

---

## Post-Launch

### Week 1
- [ ] Monitor error logs daily
- [ ] Check security alerts
- [ ] Review authentication failures
- [ ] Monitor rate limit hits
- [ ] Check database performance
- [ ] Verify backups working

### Week 2-4
- [ ] Review access logs
- [ ] Analyze security events
- [ ] Check for unusual patterns
- [ ] Update dependencies
- [ ] Run npm audit
- [ ] Review and rotate logs

### Monthly
- [ ] Security patch updates
- [ ] Dependency updates
- [ ] Review user permissions
- [ ] Audit admin actions
- [ ] Test backup restoration
- [ ] Review security metrics

### Quarterly
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Review security policies
- [ ] Update incident response plan
- [ ] Security training for team
- [ ] Review and update this checklist

---

## Incident Response

### If Security Breach Detected

1. **Immediate Actions**
   - [ ] Isolate affected systems
   - [ ] Preserve logs and evidence
   - [ ] Notify security team
   - [ ] Begin incident documentation

2. **Investigation**
   - [ ] Determine scope of breach
   - [ ] Identify attack vector
   - [ ] Assess data exposure
   - [ ] Document timeline

3. **Containment**
   - [ ] Patch vulnerability
   - [ ] Revoke compromised credentials
   - [ ] Reset affected passwords
   - [ ] Block malicious IPs

4. **Recovery**
   - [ ] Restore from clean backups
   - [ ] Verify system integrity
   - [ ] Enhanced monitoring
   - [ ] Gradual service restoration

5. **Post-Incident**
   - [ ] Complete incident report
   - [ ] Notify affected users (if required)
   - [ ] Update security measures
   - [ ] Lessons learned meeting
   - [ ] Update incident response plan

---

## Security Contacts

**Internal:**
- Security Lead: [To be assigned]
- DevOps Lead: [To be assigned]
- CTO/Technical Lead: [To be assigned]

**External:**
- Hosting Provider Support: [Configure]
- Security Consultant: [Configure]
- Legal Counsel: [Configure]

**Emergency:**
- Security Hotline: [Configure]
- After-hours Contact: [Configure]

---

## Quick Commands

### Check for vulnerabilities
```bash
npm audit
npm audit fix
```

### Generate secure secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Run security audit
```bash
node security-audit.test.js
```

### Check logs for failed logins
```bash
grep "Invalid email or password" logs/app.log | tail -50
```

### Check rate limit hits
```bash
grep "Rate limit exceeded" logs/app.log | tail -50
```

### Monitor active connections
```bash
# MongoDB
mongo --eval "db.serverStatus().connections"

# Redis
redis-cli INFO clients
```

---

## Security Resources

**Documentation:**
- SECURITY_AUDIT_REPORT.md - Full audit details
- SECURITY_FIXES_APPLIED.md - Changes made
- SECURITY_EXECUTIVE_SUMMARY.md - Management overview

**Tools:**
- security-audit.test.js - Automated testing
- npm audit - Dependency scanning
- SSL Labs - SSL/TLS testing (ssllabs.com)
- Security Headers - Header testing (securityheaders.com)

**External Resources:**
- OWASP Top 10: https://owasp.org/Top10/
- OWASP Testing Guide: https://owasp.org/www-project-web-security-testing-guide/
- Node.js Security Best Practices: https://nodejs.org/en/docs/guides/security/

---

**Last Updated:** November 18, 2025
**Next Review:** Before production launch
**Version:** 1.0
