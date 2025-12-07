# Contributing to Secure ToDo App

Thank you for considering contributing to this project! 

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, open a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)

### Suggesting Features

1. Open an issue with the `enhancement` label
2. Describe the feature and its use case
3. Explain why it would be valuable

### Code Contributions

1. **Fork** the repository
2. **Create a branch** for your feature (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following our coding standards
4. **Write tests** for new functionality
5. **Run tests** (`npm test`) and ensure they pass
6. **Commit** with clear messages (`git commit -m 'Add amazing feature'`)
7. **Push** to your fork (`git push origin feature/amazing-feature`)
8. **Open a Pull Request** using our template

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/secure-todo-app.git
cd secure-todo-app

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Set up environment
cp backend/.env.example backend/.env

# Start with Docker
docker-compose up
```

## Coding Standards

### JavaScript/Node.js

- Use **ES modules** (import/export)
- Follow **ESLint** rules
- Use **meaningful variable names**
- Add **comments** for complex logic
- Keep functions **small and focused**

### Security

- **Never commit secrets** or `.env` files
- **Always use parameterized queries**
- **Validate all user input**
- **Follow OWASP best practices**
- **Add security tests** for new endpoints

### Git Commits

- Use present tense ("Add feature" not "Added feature")
- Keep first line under 50 characters
- Add detailed description if needed

## Pull Request Process

1. Update README.md if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update documentation
5. Link related issues
6. Wait for review from maintainers

## Security Contributions

For security vulnerabilities, please see [README_SECURITY.md](README_SECURITY.md) and follow responsible disclosure.

Thank you for contributing! 🎉
