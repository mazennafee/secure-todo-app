# Rules of Engagement (RoE)

## Purpose

This document defines the rules of engagement for security testing of the Secure ToDo application.

## Scope

### In Scope

- All components of the Secure ToDo application:
  - Frontend (React/Vite)
  - Backend API (Express/Node.js)
  - Database interactions
  - Authentication flows
  - Authorization mechanisms
  
- Test environments:
  - Local development instances
  - Staging environment (if available)
  - Challenge branch (`challenge/` directory)

### Out of Scope

- Production systems (if deployed)
- Third-party dependencies (report through proper channels)
- Social engineering attacks
- Physical attacks
- Denial of Service (DoS) attacks
- Spam or excessive automated requests

## Authorized Testing Methods

### Allowed

✅ SQL Injection testing using parameterized test inputs
✅ Cross-Site Scripting (XSS) testing
✅ Authentication bypass attempts
✅ Authorization testing (horizontal/vertical privilege escalation)
✅ Input validation testing
✅ Session management testing
✅ CSRF testing
✅ Security header analysis
✅ Dependency vulnerability scanning
✅ Code review and static analysis
✅ OWASP ZAP automated scanning

### Prohibited

❌ Attacking production systems
❌ Denial of Service attacks
❌ Data destruction or corruption
❌ Accessing other users' actual data
❌ Social engineering of users or administrators
❌ Physical attacks on infrastructure
❌ Attacks on third-party services

## Testing Guidelines

### Before Testing

1. Set up your own local instance using Docker
2. Use the provided seed data or create your own test accounts
3. Review this document and security policy
4. Ensure you have proper authorization

### During Testing

1. **Document everything**: Keep detailed notes of your findings
2. **Use test data only**: Never use real credentials or PII
3. **Respect rate limits**: Don't overwhelm the system
4. **Stay in scope**: Only test authorized targets
5. **Stop if unsure**: Contact security team if you find something critical

### After Testing

1. **Report findings** following the disclosure policy
2. **Preserve evidence** (see Evidence Handling below)
3. **Allow time** for remediation before public disclosure
4. **Sanitize PoCs** before sharing (see poc-sanitized.md template)

## Evidence Handling

### What to Collect

- Screenshots of vulnerabilities
- HTTP request/response logs
- Proof of Concept code (sanitized)
- Steps to reproduce
- Impact assessment

### Where to Store

- Local machine only (encrypted if sensitive)
- Use the `docs/evidence/` directory for organized storage
- Never commit actual exploit code to public repos
- Use sanitized versions for documentation

### Evidence Format

```
docs/evidence/
├── YYYY-MM-DD-finding-name/
│   ├── screenshots/
│   ├── requests.txt
│   ├── poc-sanitized.md
│   └── notes.md
```

## Reporting Process

### 1. Initial Report

- **Email**: security@example.com
- **Subject**: [SECURITY] Brief description
- **Include**:
  - Vulnerability description
  - Severity assessment (Critical/High/Medium/Low)
  - Steps to reproduce
  - Potential impact
  - Suggested remediation (optional)

### 2. Sanitized PoC

- Use the template in `docs/poc-sanitized.md`
- Remove actual exploit payloads
- Use placeholders like `[PAYLOAD]` or `[INJECTION_POINT]`
- Focus on demonstrating the vulnerability, not exploiting it

### 3. Collaboration

- Work with the security team to verify and remediate
- Provide additional information if requested
- Test proposed fixes if asked

### 4. Disclosure

- **Embargo period**: 90 days from initial report
- **Coordinated disclosure**: Work with maintainers on timing
- **Credit**: Security researchers will be credited (if desired)

## Severity Classification

### Critical
- Remote code execution
- Authentication bypass
- SQL injection with data access
- Complete system compromise

### High
- Privilege escalation
- Sensitive data exposure
- Authorization bypass
- XSS with session hijacking

### Medium
- Limited XSS
- Information disclosure
- CSRF on sensitive actions
- Security misconfiguration

### Low
- Verbose error messages
- Missing security headers
- Information leakage (minor)

## Safe Harbor

Security researchers who:
- Follow these rules of engagement
- Report vulnerabilities responsibly
- Do not exploit findings maliciously
- Respect embargo periods

Will be considered to be acting in good faith and will not face legal action.

## Contact

- **Security Team**: security@example.com
- **Project Lead**: Mazennafee
- **Response Time**: Within 48 hours for acknowledgment

## Updates

This document may be updated periodically. Check back before starting new testing.

**Last Updated**: 2025-12-07
