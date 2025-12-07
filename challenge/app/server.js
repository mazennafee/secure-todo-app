// challenge/app/server.js
// ⚠️ WARNING: This server contains INTENTIONAL vulnerabilities for training purposes
// DO NOT use in production or deploy publicly!

import express from 'express';
import bodyParser from 'body-parser';
import vulnerableRoutes from './routes/vulnerable.js';

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Vulnerable routes
app.use('/vuln', vulnerableRoutes);

app.get('/', (req, res) => {
    res.send(`
    <h1>⚠️ Vulnerable ToDo Challenge</h1>
    <p><strong>WARNING:</strong> This application contains intentional security vulnerabilities.</p>
    <p>Use for training and educational purposes only!</p>
    <h2>Challenges:</h2>
    <ul>
      <li><code>POST /vuln/echo</code> - Find and exploit the vulnerability</li>
    </ul>
    <p>See <a href="https://github.com/Mazennafee/secure-todo-app/tree/main/challenge">documentation</a> for details.</p>
  `);
});

app.listen(PORT, () => {
    console.log(`⚠️  Vulnerable Challenge Server running on port ${PORT}`);
    console.log(`⚠️  FOR TRAINING PURPOSES ONLY - DO NOT EXPOSE TO INTERNET!`);
});
