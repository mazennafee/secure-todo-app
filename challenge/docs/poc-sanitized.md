# Challenge: Echo Endpoint XSS Vulnerability (Sanitized)

**✅ SAFE FOR SHARING: This PoC contains no actual exploit payloads.**

---

## Vulnerability Information

**Title**: Cross-Site Scripting (XSS) in Echo Endpoint

**Severity**: High

**Type**: Reflected XSS (CWE-79)

**Status**: Intentionally Vulnerable (Training Exercise)

---

## Description

The `/vuln/echo` endpoint accepts user input and reflects it directly into an HTML response without proper sanitization or encoding. This allows an attacker to inject malicious scripts that will execute in the context of the user's browser.

---

## Affected Component

- **Endpoint**: `POST /vuln/echo`
- **File**: `challenge/app/routes/vulnerable.js`
- **Vulnerable Code**:

```javascript
router.post('/echo', (req, res) => {
  const { message } = req.body;
  res.send(`<p>You sent: ${message}</p>`);
});
```

---

## Technical Details

### Root Cause

The application takes user-controlled input from `req.body.message` and directly embeds it into an HTML response without:
1. Input validation
2. Output encoding/escaping
3. Content Security Policy headers

### Attack Vector

An attacker can craft a malicious message containing HTML or JavaScript that will be rendered and executed by the victim's browser.

---

## Proof of Concept (Sanitized)

### Step 1: Normal Request

```bash
curl -X POST http://localhost:3000/vuln/echo \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World"}'
```

**Response**: Normal text is echoed back.

### Step 2: Malicious Input (Conceptual)

```bash
curl -X POST http://localhost:3000/vuln/echo \
  -H "Content-Type: application/json" \
  -d '{"message": "[XSS_PAYLOAD]"}'
```

**Note**: `[XSS_PAYLOAD]` represents where JavaScript injection would occur. Actual payload has been removed for safety.

### Step 3: Observation

When the malicious payload is processed:
- The user input is embedded directly into HTML
- No encoding is applied
- JavaScript code executes in the browser
- Demonstrates successful XSS

---

## Impact

### Potential Consequences

- **Session Hijacking**: Attacker could steal session cookies
- **Phishing**: Inject fake login forms
- **Malware Distribution**: Redirect to malicious sites
- **Data Theft**: Access sensitive information in the page
- **Defacement**: Modify page content

### CVSS Score

**Score**: 7.1 / 10 (High)

**Vector**: CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N

---

## Remediation

### Option 1: Use JSON Responses

```javascript
router.post('/echo', (req, res) => {
  const { message } = req.body;
  
  // Validate input
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }
  
  // Return JSON instead of HTML
  res.json({ echo: message.slice(0, 200) });
});
```

### Option 2: Proper HTML Escaping

```javascript
import escapeHtml from 'escape-html';

router.post('/echo', (req, res) => {
  const { message } = req.body;
  
  // Escape HTML special characters
  const safe = escapeHtml(message);
  
  res.send(`<p>You sent: ${safe}</p>`);
});
```

### Option 3: Template Engine with Auto-Escaping

Use a template engine like Handlebars or EJS with auto-escaping enabled.

### Additional Measures

1. Implement Content Security Policy headers
2. Add input length limits
3. Validate input format
4. Use HTTP-only cookies for sessions

---

## References

- [CWE-79: Cross-site Scripting](https://cwe.mitre.org/data/definitions/79.html)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

## Key Learnings

1. **Never trust user input**: Always validate and sanitize
2. **Context matters**: Different contexts require different encoding (HTML, JavaScript, URL, etc.)
3. **Defense in depth**: Use multiple layers (validation + encoding + CSP)
4. **Modern frameworks help**: Many frameworks auto-escape by default
5. **Test thoroughly**: Include security tests in your test suite

---

## For Students

**Questions to Consider**:

1. Why is output encoding important even after input validation?
2. What other types of XSS exist (stored, DOM-based)?
3. How would you test for this vulnerability with automated tools?
4. What role does Content Security Policy play in XSS prevention?

---

**Completed**: [Your completion date]

**Learning objectives achieved**:
- [ ] Understanding of XSS vulnerabilities
- [ ] Knowledge of proper input handling
- [ ] Awareness of output encoding techniques
- [ ] Familiarity with CSP headers
