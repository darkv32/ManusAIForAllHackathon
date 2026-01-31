# Security Recommendations for Matsu Matcha Dashboard

This document outlines security best practices and recommendations for protecting confidential business data in the Matsu Matcha Dashboard.

## Current Security Features

### Authentication
- **Login Page**: Secure login page with username/password authentication
- **Session Management**: Sessions stored in browser sessionStorage with 8-hour expiration
- **Route Protection**: All dashboard routes require authentication
- **Logout Functionality**: Users can securely log out from the user menu

### Default Credentials
- **Username**: `admin`
- **Password**: `admin`

> ⚠️ **Important**: Change these default credentials before deploying to production!

## Recommended Security Enhancements

### 1. Password Security (High Priority)

**Current State**: Passwords are validated client-side with plaintext comparison.

**Recommendation**: Implement server-side password hashing using bcrypt or Argon2.

```typescript
// Example: Server-side password hashing with bcrypt
import bcrypt from 'bcrypt';

// Hash password when creating/updating user
const hashedPassword = await bcrypt.hash(password, 12);

// Verify password on login
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

### 2. Rate Limiting (High Priority)

**Current State**: No rate limiting on login attempts.

**Recommendation**: Implement rate limiting to prevent brute-force attacks.

```typescript
// Example: Rate limiting with express-rate-limit
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later'
});

app.post('/api/auth/login', loginLimiter, loginHandler);
```

### 3. HTTPS Enforcement (High Priority)

**Recommendation**: Ensure all traffic uses HTTPS in production.

- Configure SSL/TLS certificates
- Redirect HTTP to HTTPS
- Set `Secure` flag on cookies

### 4. Session Security (Medium Priority)

**Current State**: Sessions stored in sessionStorage.

**Recommendations**:
- Use HTTP-only cookies for session tokens
- Implement CSRF protection
- Add session fingerprinting (IP, User-Agent)
- Implement session invalidation on password change

### 5. Audit Logging (Medium Priority)

**Recommendation**: Log security-relevant events for monitoring and compliance.

Events to log:
- Login attempts (successful and failed)
- Logout events
- Password changes
- Data exports
- Administrative actions
- Unusual access patterns

```typescript
// Example: Audit log entry
interface AuditLog {
  timestamp: Date;
  userId: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, unknown>;
  success: boolean;
}
```

### 6. Role-Based Access Control (Medium Priority)

**Current State**: Single admin role.

**Recommendation**: Implement granular permissions.

| Role | Permissions |
|------|-------------|
| Admin | Full access to all features |
| Manager | View all data, edit inventory, no settings access |
| Staff | Stock input only, view limited data |
| Viewer | Read-only access to reports |

### 7. Data Encryption (Medium Priority)

**Recommendations**:
- Encrypt sensitive data at rest (ingredient costs, profit margins)
- Use environment variables for secrets
- Implement field-level encryption for PII

### 8. Input Validation (Medium Priority)

**Recommendations**:
- Validate all user inputs server-side
- Sanitize data before database operations
- Use parameterized queries (already done with Drizzle ORM)

### 9. Security Headers (Low Priority)

**Recommendation**: Add security headers to HTTP responses.

```typescript
// Recommended headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

### 10. Regular Security Audits (Ongoing)

**Recommendations**:
- Conduct periodic security reviews
- Keep dependencies updated
- Monitor for vulnerabilities with `npm audit`
- Implement automated security scanning in CI/CD

## Compliance Considerations

For businesses handling financial data, consider:
- **PDPA (Singapore)**: Personal Data Protection Act compliance
- **PCI DSS**: If handling payment card data
- **SOC 2**: For enterprise customers

## Emergency Procedures

### Suspected Breach
1. Immediately disable affected accounts
2. Rotate all credentials and API keys
3. Review audit logs for unauthorized access
4. Notify affected parties as required
5. Document incident and remediation steps

### Password Reset
1. Verify user identity through secondary channel
2. Generate secure temporary password
3. Force password change on next login
4. Log the reset event

---

*Last updated: January 2026*
*Document version: 1.0*
