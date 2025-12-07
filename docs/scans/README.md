# Security Scan Results

This directory contains security scan results from automated tools.

## Tools Used

- **OWASP ZAP**: Dynamic application security testing
- **npm audit**: Dependency vulnerability scanning
- **Trivy**: Container image scanning
- **Bandit**: Python security linting (if applicable)

## Directory Structure

```
scans/
├── README.md (this file)
├── zap/
│   ├── YYYY-MM-DD-baseline.html
│   ├── YYYY-MM-DD-full-scan.html
│   └── YYYY-MM-DD-api-scan.html
├── npm-audit/
│   └── YYYY-MM-DD-audit-report.json
├── trivy/
│   ├── backend-image-scan.json
│   └── frontend-image-scan.json
└── summary/
    └── YYYY-MM-DD-executive-summary.md
```

## Running Scans

### OWASP ZAP Baseline Scan

```bash
docker run -v $(pwd):/zap/wrk/:rw -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:5000 \
  -r zap-baseline-report.html
```

### OWASP ZAP Full Scan

```bash
docker run -v $(pwd):/zap/wrk/:rw -t owasp/zap2docker-stable zap-full-scan.py \
  -t http://localhost:5000 \
  -r zap-full-scan-report.html
```

### NPM Audit

```bash
cd backend
npm audit --json > ../docs/scans/npm-audit/$(date +%Y-%m-%d)-audit-report.json
npm audit
```

### Trivy Container Scan

```bash
trivy image --format json --output docs/scans/trivy/backend-image-scan.json secure-todo-backend:latest
trivy image --format json --output docs/scans/trivy/frontend-image-scan.json secure-todo-frontend:latest
```

## Interpreting Results

### OWASP ZAP

- **High**: Immediate attention required
- **Medium**: Should be addressed soon
- **Low**: Minor issues, address when possible
- **Informational**: Best practices and recommendations

### NPM Audit

- **Critical**: Update immediately
- **High**: Update as soon as possible
- **Moderate**: Plan to update
- **Low**: Monitor for updates

## CI/CD Integration

Scans are automatically run in GitHub Actions on:
- Push to `main` branch
- Push to `staging` branch
- Pull requests

Results are uploaded as artifacts and can be reviewed in the Actions tab.

## Remediation Tracking

When vulnerabilities are found:

1. Create an issue tracking the vulnerability
2. Assess severity and prioritize
3. Develop and test fix
4. Deploy fix
5. Re-scan to verify remediation
6. Update this README with findings and fixes

## Recent Scans

| Date       | Tool       | Critical | High | Medium | Low | Status     |
|------------|------------|----------|------|--------|-----|------------|
| 2025-XX-XX | OWASP ZAP  | 0        | 0    | 2      | 5   | Reviewed   |
| 2025-XX-XX | npm audit  | 0        | 0    | 0      | 3   | Monitoring |
| 2025-XX-XX | Trivy      | 0        | 1    | 4      | 10  | In Progress|

## Notes

- Scans should be run at least weekly
- All Critical and High findings must be addressed within SLA
- False positives should be documented
- Baseline scans help track security posture over time

## Contact

For questions about scan results: security@example.com
