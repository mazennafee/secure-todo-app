# Proof of Concept Template (Internal Use)

**⚠️ WARNING: This template is for INTERNAL use only. Contains actual exploit code.**

**DO NOT share this publicly. Use `poc-sanitized.md` for external sharing.**

---

## Vulnerability Information

**Title**: [Descriptive vulnerability title]

**Severity**: [Critical / High / Medium / Low]

**Date Discovered**: YYYY-MM-DD

**Discovered By**: [Your name/alias]

**Status**: [New / Confirmed / In Progress / Remediated]

---

## Description

[Detailed description of the vulnerability including root cause and impact]

---

## Affected Components

- **Component**: [e.g., Backend API, Frontend, Database, etc.]
- **File/Endpoint**: [Specific file or endpoint affected]
- **Version**: [Application version]

---

## Technical Details

### Root Cause

[Explanation of why this vulnerability exists]

### Attack Vector

[How an attacker would exploit this]

### Prerequisites

[Any requirements for successful exploitation]

---

## Proof of Concept

### Step-by-Step Reproduction

1. [First step]
2. [Second step]
3. [Etc.]

### HTTP Request Example

```http
POST /api/vulnerable-endpoint HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "malicious_input": "actual exploit payload here"
}
```

### Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "data": "sensitive information exposed"
}
```

### Exploit Code

```javascript
// Actual working exploit code
const exploit = async () => {
  // Full implementation here
};
```

---

## Impact Assessment

### Potential Damage

- [Impact 1]
- [Impact 2]
- [Etc.]

### CVSS Score

**Score**: X.X / 10

**Vector**: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H

---

## Remediation

### Recommended Fix

```javascript
// Recommended code changes
```

### Mitigation Steps

1. [Step 1]
2. [Step 2]

---

## Evidence

### Screenshots

![Screenshot 1](../evidence/YYYY-MM-DD-vuln-name/screenshot1.png)

### Logs

[Relevant log entries]

---

## References

- [OWASP Reference]
- [CWE Reference]
- [Related CVE if applicable]

---

## Timeline

- **2025-XX-XX**: Vulnerability discovered
- **2025-XX-XX**: Reported to security team
- **2025-XX-XX**: Acknowledged by team
- **2025-XX-XX**: Fix deployed
- **2025-XX-XX**: Verified remediation

---

## Notes

[Any additional notes or observations]
