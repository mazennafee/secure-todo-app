# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Features

This application implements multiple security layers:

### Authentication & Authorization
- **JWT Tokens** with 15-minute expiry
- **Bcrypt** password hashing (12 rounds)
- **Refresh token skeleton** for session management
- **User ownership checks** on all data operations

### Input Validation
- **Express-validator** for request validation
- **Custom validation** for passwords (complexity requirements)
- **Parameterized SQL queries** to prevent injection
- **Input sanitization** helpers

### HTTP Security
- **Helmet.js** for secure headers
- **CORS** restricted to frontend origin
- **Rate limiting** (recommended for production)
- **HTTPS enforcement** (production)

### Database Security
- **Connection pooling** with limits
- **Prepared statements** for all queries
- **User isolation** (todos belong to users)
- **SSL connections** in production

## Reporting a Vulnerability

**DO NOT** open a public issue for security vulnerabilities.

Instead, please email security reports to: **security@example.com**

Include:
1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested remediation (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 7 days
  - Medium: 30 days
  - Low: 90 days

## Security Checklist for Deployment

Before deploying to production:

- [ ] Change all default passwords and secrets
- [ ] Generate new JWT_SECRET (use `crypto.randomBytes(32).toString('hex')`)
- [ ] Enable HTTPS/TLS
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable database SSL
- [ ] Review and restrict database permissions
- [ ] Set NODE_ENV=production
- [ ] Implement refresh token storage
- [ ] Set up monitoring and alerting
- [ ] Enable audit logging
- [ ] Configure CSP headers
- [ ] Run OWASP ZAP scans
- [ ] Conduct code security review
- [ ] Set up automated vulnerability scanning

## Known Limitations

1. **Refresh Token**: Skeleton implementation only - requires database storage
2. **Rate Limiting**: Not implemented - add middleware for production
3. **Email Verification**: Not implemented
4. **2FA**: Not implemented
5. **Session Management**: Basic - consider Redis for production

## Security Best Practices

### For Developers

1. **Never commit secrets** - use `.env.example` templates
2. **Always use parameterized queries** - never concatenate SQL
3. **Validate all input** - client and server side
4. **Implement proper logging** - without sensitive data
5. **Keep dependencies updated** - run `npm audit` regularly

### For Operators

1. **Monitor logs** for suspicious activity
2. **Rotate secrets** regularly
3. **Keep backups** encrypted
4. **Use principle of least privilege**
5. **Enable audit trails**

## Vulnerability Disclosure Policy

We follow responsible disclosure practices. Security researchers are welcome to test this application in accordance with our [Rules of Engagement](docs/roeg.md).
