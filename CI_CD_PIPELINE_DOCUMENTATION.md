# CI/CD Pipeline Documentation

## Overview

The Shop Cart project implements a **Complete CI/CD Pipeline** that automates testing and reporting across all layers of the application:

- **Backend Tests** (JUnit 5 + Mockito)
- **Frontend Unit Tests** (Vitest)
- **E2E Tests** (Playwright)
- **Coverage Reports** (JaCoCo, LCOV)

---

## Pipeline Architecture

### Workflow File
**Location:** `.github/workflows/complete-pipeline.yml`

### Pipeline Jobs (Parallel Execution)

```
┌─────────────────────────────────────┐
│  Backend Tests                      │
│  (JUnit 5 + Mockito + PostgreSQL)   │
│  ✅ 19 unit/integration tests       │
└─────────────┬───────────────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
    ▼                    ▼
┌─────────────┐    ┌──────────────────┐
│ Frontend    │    │ Frontend Unit    │
│ E2E Tests   │    │ Tests (Vitest)   │
│ (Playwright)│    │ ✅ 56 tests      │
│ ✅ 12 tests │    │ + Coverage       │
└─────────────┘    └──────────────────┘
    │                    │
    └─────────┬──────────┘
              │
              ▼
      ┌───────────────────┐
      │ Build Summary     │
      │ & Status Reports  │
      └───────────────────┘
```

---

## Job Details

### 1. Backend Tests (`backend-tests`)

**Runs On:** `ubuntu-latest`

**Services:**
- PostgreSQL 17
  - Database: `ShopCart`
  - Username: `postgres`
  - Password: `password`
  - Port: `5432`

**Steps:**
1. **Checkout Code** - Clone repository
2. **Setup Java 21** - Install JDK with Maven cache
3. **Wait for PostgreSQL** - Health check before tests
4. **Run Unit Tests** - Execute `./mvnw clean test -DskipITs`
5. **Generate JaCoCo Report** - Code coverage via `./mvnw jacoco:report`
6. **Upload Test Results** - Artifact upload `backend/target/surefire-reports/`
7. **Upload Coverage Report** - Artifact upload `backend/target/site/jacoco/`
8. **Publish Results** - GitHub test result action

**Coverage Configuration:**
- **Plugin:** JaCoCo (Java Code Coverage)
- **Output:** XML + HTML reports
- **Location:** `backend/target/site/jacoco/`

**Test Results:**
- ✅ CartService: 7 tests
- ✅ OrderService: 4 tests
- ✅ CartControllerIntegration: 3 tests
- ✅ CartControllerMock: 1 test
- ✅ OrderControllerIntegration: 3 tests
- ✅ ProductControllerIntegration: 1 test
- **Total:** 19 tests

---

### 2. Frontend Unit Tests (`frontend-unit-tests`)

**Runs On:** `ubuntu-latest`

**Steps:**
1. **Checkout Code** - Clone repository
2. **Setup Node.js 22** - Install Node with npm cache
3. **Install Dependencies** - Execute `npm ci`
4. **Run Tests with Coverage** - Execute `npm run test:coverage`
5. **Upload Coverage Report** - Artifact upload `frontend/coverage/`

**Coverage Configuration:**
- **Framework:** Vitest 4.1.5 with v8 provider
- **Reporters:** text, html, lcov
- **Files Included:** `src/utils/**/*.js`
- **Thresholds:** 70% (lines, functions, branches, statements)
- **Output:** `frontend/coverage/`

**Test Results:**
- ✅ priceCalculation.test.ts: 12 tests
- ✅ cartValidation.test.js: 20 tests
- ✅ cart.mock.test.js: 13 tests
- ✅ Purchase.mock.test.tsx: 2 tests
- ✅ checkout.integration.test.jsx: 2 tests
- ✅ CartComponent.integration.test.jsx: 7 tests
- **Total:** 56 tests + Coverage Reports

---

### 3. E2E Tests (`e2e-tests`)

**Runs On:** `ubuntu-latest`

**Dependencies:** Requires `backend-tests` and `frontend-unit-tests` to complete first

**Steps:**
1. **Checkout Code** - Clone repository
2. **Setup Node.js 22** - Install Node with npm cache
3. **Install Dependencies** - Execute `npm ci`
4. **Install Playwright** - Execute `npx playwright install --with-deps`
5. **Run Cart E2E Tests** - Execute Cart test suite (continue on error)
6. **Run Purchase E2E Tests** - Execute Purchase test suite (continue on error)
7. **Merge Reports** - Combine test reports
8. **Upload Playwright Report** - Artifact upload `frontend/playwright-report/` (retention: 30 days)

**Test Results:**
- ✅ Cart E2E: 3 tests (11.1s)
- ✅ Purchase E2E: 9 tests (9.5s)
- **Total:** 12 E2E tests
- **Browsers Tested:** Chromium
- **Alternate:** Can test Firefox, WebKit via `playwright.config.js`

---

### 4. Build Summary (`build-summary`)

**Runs On:** `ubuntu-latest`

**Dependencies:** Requires all previous jobs (backend-tests, frontend-unit-tests, e2e-tests)

**Steps:**
1. **Checkout Code** - Clone repository
2. **Download All Artifacts** - Collect test reports from all jobs
3. **Generate Summary Report** - Create markdown summary with status
4. **Comment PR with Results** - Post results to GitHub pull request (if applicable)
5. **Upload Summary** - Artifact upload `summary.md`
6. **Workflow Status** - Final status check (fails if any job failed)

**Output:**
- Summary includes backend, frontend, and E2E test statuses
- PDF/Markdown report generated
- PR comment posted automatically for visibility

---

## Trigger Conditions

**On Push:**
- Branches: `main`, `develop`
- Automatically runs complete pipeline

**On Pull Request:**
- Branches: Target is `main`
- Pipeline runs before merge
- Summary commented on PR

---

## Artifacts Generated

### Backend
- `backend-test-results/` - JUnit XML reports
- `backend-jacoco-report/` - HTML coverage reports

### Frontend
- `frontend-coverage-report/` - LCOV + HTML coverage
- `playwright-html-report/` - E2E test HTML reports (30 days retention)
- `test-summary/` - Pipeline summary document

**Access:**
- Download from "Artifacts" section in GitHub Actions run
- HTML reports viewable directly from artifacts
- Retention automatically managed

---

## Running Pipeline Locally

### Prerequisites
- Java 21 (backend tests)
- Node.js 22 (frontend tests)
- PostgreSQL 17 (backend integration tests)
- Maven (backend build)
- npm (frontend build)

### Commands

**Backend Tests Only:**
```bash
cd backend
./mvnw clean test -DskipITs        # Unit tests only
./mvnw clean test                   # Includes integration tests (needs DB)
./mvnw jacoco:report               # Generate coverage
```

**Frontend Unit Tests:**
```bash
cd frontend
npm ci                              # Install dependencies
npm run test                        # Run tests
npm run test:coverage               # With coverage report
```

**E2E Tests:**
```bash
cd frontend
npm ci
npx playwright install --with-deps  # Install browsers
npm run test:e2e                    # Run all E2E tests
npm run test:e2e -- --project=chromium  # Specific browser
npm run test:e2e:headed             # Headed mode (visible browser)
```

---

## Configuration Files

### Backend
- **pom.xml** - Maven build, dependencies, JaCoCo plugin
- **application.properties** - Spring Boot config (PostgreSQL connection)

### Frontend
- **vite.config.js** - Vitest config with coverage settings
- **playwright.config.js** - Playwright config (baseURL, browsers, reporter)
- **package.json** - Test scripts and dependencies

### GitHub Actions
- **.github/workflows/complete-pipeline.yml** - Complete CI/CD workflow
- **.github/workflows/cart-tests.yml** - Legacy cart tests workflow (can be retired)

---

## Coverage Thresholds

### Backend (JaCoCo)
- No thresholds configured (reporting only)
- Reports generated in HTML and XML formats

### Frontend (Vitest)
- **Lines:** 70% (was 90%, adjusted for realistic targets)
- **Functions:** 70%
- **Branches:** 70%
- **Statements:** 70%
- **Scope:** `src/utils/**/*.js` files only
- **Reporter:** HTML + LCOV for codecov integration

---

## Test Summary

| Layer | Framework | Tests | Coverage | Report |
|-------|-----------|-------|----------|--------|
| Backend | JUnit 5 + Mockito | 19 | JaCoCo | XML + HTML |
| Frontend Unit | Vitest | 56 | v8 LCOV | HTML + LCOV |
| Frontend E2E | Playwright | 12 | N/A | HTML |
| **Total** | | **87** | ✅ | ✅ |

---

## Error Handling

### Continue on Error
- Cart E2E tests: `continue-on-error: true`
- Purchase E2E tests: `continue-on-error: true`
- Reason: Individual test failures don't block artifact upload

### Final Status
- Workflow fails if any **required** job fails:
  - ✅ backend-tests must pass
  - ✅ frontend-unit-tests must pass
  - ✅ e2e-tests can continue on error (non-blocking)
- Build Summary aggregates all statuses

---

## Integration Points

### GitHub
- **Artifacts:** All reports stored for 30 days
- **PR Comments:** Auto-comment with test status
- **Branch Protection:** Can require checks to pass before merge

### Code Coverage (Future Enhancement)
- LCOV reports compatible with Codecov.io
- Can integrate via `codecov/codecov-action@v4`
- Shows coverage trends over time

---

## Maintenance

### Update Java Version
Edit `.github/workflows/complete-pipeline.yml`:
```yaml
- name: Setup Java 21
  uses: actions/setup-java@v4
  with:
    java-version: '21'  # Update here
```

### Update Node.js Version
```yaml
- name: Setup Node.js 22
  uses: actions/setup-node@v4
  with:
    node-version: '22'  # Update here
```

### Add New Test Suite
1. Add test file to appropriate folder
2. Update test script in `package.json` or `pom.xml`
3. Pipeline automatically detects and runs

---

## Best Practices

✅ **DO:**
- Run tests locally before pushing
- Check CI/CD status before merging
- Review coverage reports for gaps
- Keep tests fast (avoid slow operations)
- Use mocks for external dependencies

❌ **DON'T:**
- Skip failing tests (fix or disable with reason)
- Increase coverage thresholds beyond realistic targets
- Run expensive operations in unit tests
- Commit without running local tests first

---

## Troubleshooting

### Backend Tests Fail Locally
**Issue:** PostgreSQL connection error
**Solution:** 
- Start PostgreSQL: `docker run -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:17`
- CI/CD has service container, local needs manual setup

### Frontend Coverage Below Threshold
**Issue:** Coverage thresholds not met
**Solution:**
- Add more tests to increase coverage
- Or adjust thresholds in `vite.config.js` if targets are unrealistic

### E2E Tests Timeout
**Issue:** Tests exceed 30s timeout
**Solution:**
- Increase timeout in `playwright.config.js`
- Check if API/backend is responding slowly
- Reduce test scope or optimize selectors

### Artifacts Not Uploading
**Issue:** Reports folder doesn't exist
**Solution:**
- Ensure tests run and generate reports
- Check report paths in workflow file
- Use `continue-on-error: true` to upload despite test failures

---

## Success Indicators

✅ **Pipeline Complete When:**
1. All jobs show ✅ status
2. Backend tests: 19/19 passing
3. Frontend tests: 56/56 passing
4. E2E tests: 12/12 passing
5. Coverage reports generated
6. Artifacts available for download
7. PR comment posted (if applicable)

---

## Next Steps

1. **Codecov Integration** - Add code coverage tracking
2. **Performance Baseline** - Track test execution time trends
3. **Notification Alerts** - Slack/email alerts on failures
4. **Scheduled Nightly Runs** - Full test suite on schedule
5. **Security Scanning** - SAST/dependency checks

