# Evidence Handling Guide

This directory is for storing security testing evidence in an organized manner.

## Purpose

Proper evidence handling ensures:
- Reproducibility of findings
- Clear communication with security team
- Audit trail for remediation
- Knowledge sharing and training

## Directory Structure

```
evidence/
├── README.md (this file)
├── YYYY-MM-DD-vulnerability-name/
│   ├── README.md (finding summary)
│   ├── screenshots/
│   │   ├── 01-login-page.png
│   │   ├── 02-injection-attempt.png
│   │   └── 03-successful-exploit.png
│   ├── requests/
│   │   ├── malicious-request.txt
│   │   └── response.txt
│   ├── poc-sanitized.md
│   └── notes.md
└── template/
    └── finding-template.md
```

## Creating a New Finding

### 1. Create Finding Directory

```bash
cd docs/evidence
mkdir $(date +%Y-%m-%d)-descriptive-name
cd $(date +%Y-%m-%d)-descriptive-name
```

### 2. Document the Finding

Create a `README.md` with:

```markdown
# [Vulnerability Name]

**Severity**: [Critical/High/Medium/Low]
**Status**: [New/Investigating/Confirmed/Fixed]
**Discovered**: YYYY-MM-DD
**Researcher**: [Name]

## Quick Summary

[One-paragraph description]

## Evidence Files

- `screenshots/`: Visual proof
- `requests/`: HTTP requests and responses
- `poc-sanitized.md`: Safe to share PoC
- `notes.md`: Detailed analysis notes
```

### 3. Collect Screenshots

- Take clear, annotated screenshots
- Number them sequentially (01, 02, 03...)
- Include relevant UI context
- Highlight important elements

**Tools**: 
- **Linux**: `gnome-screenshot`, `flameshot`
- **macOS**: `Cmd+Shift+4`
- **Windows**: `Snipping Tool`

### 4. Save HTTP Traffic

**Using Burp Suite**:
1. Capture the request
2. Right-click → Save item
3. Save both request and response

**Using Browser DevTools**:
1. Open Network tab
2. Right-click request → Copy → Copy as cURL
3. Save to `requests/curl-command.txt`

**Using ZAP**:
1. Right-click request in History
2. Export → Save

### 5. Write Sanitized PoC

Use the template from `docs/poc-sanitized.md` and:
- Remove actual exploit payloads
- Use placeholders like `[INJECTION_POINT]`
- Focus on demonstration, not exploitation
- Make it educational, not weaponized

### 6. Add Detailed Notes

In `notes.md`, document:
- How you discovered it
- Steps taken during investigation
- Variations you tried
- Related findings
- Ideas for remediation
- Questions for security team

## Evidence Best Practices

### ✅ DO

- **Organize systematically** using the directory structure
- **Timestamp everything** with ISO format (YYYY-MM-DD)
- **Sanitize sensitive data** before committing
- **Describe clearly** what each file shows
- **Keep original evidence** intact
- **Use descriptive names** for files and directories
- **Document your process** thoroughly

### ❌ DON'T

- **Commit actual exploits** to version control
- **Include real user data** or credentials
- **Mix multiple findings** in one directory
- **Use generic names** like "screenshot.png"
- **Forget to sanitize** before sharing
- **Delete original evidence** after sanitizing
- **Overcomplicate** the organization

## Sanitization Guidelines

Before sharing or committing evidence:

### Remove/Redact

- Real usernames and emails → `user@example.com`, `testuser`
- Passwords and API keys → `[REDACTED]`
- Session tokens → `[TOKEN]`
- Personal information → `[PII_REMOVED]`
- Internal IP addresses → `192.0.2.1` (documentation range)
- Actual exploit payloads → `[PAYLOAD]`

### Replace With

- Test data that demonstrates the issue
- Placeholders that explain what was removed
- Sanitized versions that show structure

### Example

**❌ Original**:
```
admin@company.com:P@ssw0rd123!
```

**✅ Sanitized**:
```
admin@example.com:[REDACTED]
```

## File Naming Conventions

### Directories

`YYYY-MM-DD-short-description`

Examples:
- `2025-12-07-sql-injection-login`
- `2025-12-08-xss-todo-title`
- `2025-12-09-auth-bypass-jwt`

### Screenshots

`NN-descriptive-name.png`

Examples:
- `01-login-form.png`
- `02-malicious-input.png`
- `03-database-error.png`

### Request Files

- `request.txt` - The HTTP request
- `response.txt` - The HTTP response
- `curl-command.txt` - cURL reproduction
- `burp-session.xml` - Burp Suite export

## Encryption

For sensitive evidence that must be kept locally:

```bash
# Encrypt sensitive file
gpg -c sensitive-evidence.txt

# Decrypt when needed
gpg sensitive-evidence.txt.gpg
```

**Never commit**:
- Unencrypted credentials
- Real session tokens
- Actual exploit code
- Personal data

## Retention Policy

- **Active findings**: Keep until remediated and verified
- **Closed findings**: Retain for 1 year after fix
- **Training material**: Keep indefinitely (sanitized only)
- **Personal data**: Delete as soon as not needed

## Reporting from Evidence

When creating a security report:

1. Review all evidence in the finding directory
2. Use `poc-sanitized.md` as the base
3. Attach screenshots and relevant logs
4. Reference the evidence directory in the report
5. Ensure everything is sanitized

## Example Finding Structure

```
2025-12-07-sql-injection-login/
├── README.md
│   Quick summary and index
├── screenshots/
│   ├── 01-normal-login.png
│   ├── 02-injection-attempt.png
│   ├── 03-database-error.png
│   └── 04-successful-bypass.png
├── requests/
│   ├── normal-request.txt
│   ├── malicious-request.txt
│   ├── error-response.txt
│   └── curl-commands.txt
├── poc-sanitized.md
│   Safe to share PoC
├── notes.md
│   Detailed investigation notes
└── remediation-test.md
    Verification after fix
```

## Questions?

Contact the security team: security@example.com
