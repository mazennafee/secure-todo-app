# 🎯 Vulnerable ToDo Challenge

## ⚠️ WARNING

**This application contains INTENTIONAL security vulnerabilities.**

- **DO NOT deploy to production**
- **DO NOT expose to the internet**
- **FOR LOCAL TRAINING ONLY**

## Purpose

This challenge environment is designed for:
- Security training and education
- Practice identifying vulnerabilities
- Learning secure coding practices
- Testing security tools

## Getting Started

### Run Locally

```bash
cd challenge
docker build -t vulnerable-todo-challenge .
docker run -p 3000:3000 vulnerable-todo-challenge
```

Access at: `http://localhost:3000`

### Challenge Endpoints

#### 1. Echo Endpoint

**Endpoint**: `POST /vuln/echo`

**Description**: An endpoint that echoes back user input.

**Your Task**: Find and exploit the vulnerability.

**Example Request**:
```bash
curl -X POST http://localhost:3000/vuln/echo \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World"}'
```

## Rules

1. **Local Only**: Only test on your local instance
2. **No Harm**: Don't attack other systems
3. **Document Findings**: Use the PoC template
4. **Learn and Share**: Help others learn (with sanitized examples)

## Hints

<details>
<summary>Click for Hint #1</summary>

Look at how user input is handled in the response.

</details>

<details>
<summary>Click for Hint #2</summary>

The vulnerability is related to how the HTML response is constructed.

</details>

<details>
<summary>Click for Hint #3</summary>

Try injecting HTML or JavaScript in the message field.

</details>

## Learning Objectives

After completing this challenge, you should understand:

1. **Input Validation**: Why validating user input is critical
2. **Output Encoding**: How to safely display user content
3. **XSS Prevention**: Techniques to prevent cross-site scripting
4. **Secure Coding**: Best practices for handling user input

## Remediation

<details>
<summary>Click to see the secure version</summary>

```javascript
// SECURE VERSION
router.post('/echo', (req, res) => {
  const { message } = req.body;
  
  // Validate input
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }
  
  // Sanitize and limit length
  const sanitized = message.slice(0, 200);
  
  // Use JSON response instead of HTML
  res.json({ echo: sanitized });
});
```

**Or**, if HTML response is needed:
```javascript
import { escapeHtml } from 'escape-html';

router.post('/echo', (req, res) => {
  const { message } = req.body;
  const escaped = escapeHtml(message);
  
  res.send(`
    <html>
      <head><title>Echo Response</title></head>
      <body>
        <h1>Echo Service</h1>
        <p>You sent: ${escaped}</p>
      </body>
    </html>
  `);
});
```

</details>

## Documentation

After finding the vulnerability:

1. Use the template: `challenge/docs/poc-sanitized.md`
2. Document your findings (sanitized)
3. Explain the impact
4. Suggest remediation

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)

## Additional Challenges

Want more practice? Try:
- Add input validation
- Implement Content Security Policy
- Add rate limiting
- Create automated tests

## Questions?

See the main project [README](../README.md) for more information.

---

**Remember**: The goal is to learn, not to cause harm. Always practice ethical hacking and responsible disclosure.
