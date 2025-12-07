// challenge/app/routes/vulnerable.js
// ⚠️ DELIBERATELY VULNERABLE CODE - FOR TRAINING ONLY

import express from 'express';

const router = express.Router();

// VULNERABLE: Unsafe input reflection (potential XSS)
// This endpoint reflects user input without sanitization
router.post('/echo', (req, res) => {
    const { message } = req.body;

    // VULNERABILITY: No input validation or sanitization
    // User input is directly embedded in HTML response
    res.send(`
    <html>
      <head><title>Echo Response</title></head>
      <body>
        <h1>Echo Service</h1>
        <p>You sent: ${message}</p>
        <hr>
        <small>Challenge: Can you find the security issue?</small>
      </body>
    </html>
  `);
});

// Additional vulnerable endpoint examples can be added here
// Examples: SQL injection, command injection, SSRF, etc.

export default router;
