# Playwright POM Framework

A Playwright test automation framework built with the **Page Object Model** pattern, covering both **UI testing** and **API testing** with a local mock Express server. Includes GitHub Actions CI workflows with **Allure reports published to GitHub Pages**.

---

## Features

- **UI Tests** — Login, Add Employee, Dashboard flows using Page Object Model
- **API Tests** — Full CRUD employee API with 6 authentication methods (JWT, Basic Auth, API Key, OAuth 2.0, Session, HMAC)
- **Local API Server** — Express server (`src/server.js`) runs on port `3000`, no external services needed
- **Allure Reporting** — Rich HTML reports with history and trend charts published to GitHub Pages
- **GitHub Actions** — Two ready-to-use workflows (push/PR trigger + nightly schedule)
- **Docker Support** — Run tests in a containerised environment

---

## Quick Start

### Prerequisites

- [Node.js 18+](https://nodejs.org)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/pwjan19pom.git
cd pwjan19pom
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install Playwright browsers

```bash
npx playwright install chromium
```

### 4. Start the local API server

```bash
npm start
```

Keep this running in a separate terminal. You should see:
```
Employee API running at http://localhost:3000
```

### 5. Run the tests

```bash
# All tests
npx playwright test

# API tests only
npm run runapi

# UI login tests only
npx playwright test --grep @login
```

---

## npm Scripts

| Script | Command | Description |
|---|---|---|
| `npm test` | `npx playwright test` | Run all tests |
| `npm run test:headed` | `npx playwright test --headed` | Run with visible browser |
| `npm run test:ui` | `npx playwright test --ui` | Interactive UI mode |
| `npm run test:debug` | `npx playwright test --debug` | Debug mode |
| `npm run test:report` | `npx playwright show-report` | Open last HTML report |
| `npm run test:chrome` | `npx playwright test --project=chromium` | Chromium only |
| `npm run runapi` | `npx playwright test --grep @api` | API tests only |
| `npm run generate:allure` | `npx allure generate ...` | Generate Allure HTML report |
| `npm run open:allure` | `npx allure open allure-report` | Open Allure report |
| `npm run runapiwithallure` | run api + generate + open | API tests with Allure report |
| `npm start` | `node src/server.js` | Start local API server |

---

## API Server

The local server exposes a mock Employee API at `http://localhost:3000` protected by six different authentication methods — ideal for practising API test automation.

### Authentication methods

| Auth type | Endpoint | Credentials |
|---|---|---|
| JWT Bearer | `POST /auth/login` → use token | `admin_user` / `admin_pass` |
| Basic Auth | `Authorization: Basic ...` | `standard_user` / `secret_sauce` |
| API Key | `x-api-key` header | `key-standard-abc123` |
| OAuth 2.0 | `POST /oauth/token` → use token | `test-client` / `test-secret` |
| Session/Cookie | `POST /session/login` → cookie | `admin_user` / `admin_pass` |
| HMAC Signature | `Authorization: HMAC-SHA256 ...` | `client-abc` / `secret-key-abc` |

### Employee endpoints

Each auth method exposes the same CRUD endpoints at its own path prefix:

```
/employees          → JWT
/basic/employees    → Basic Auth
/apikey/employees   → API Key
/oauth/employees    → OAuth 2.0
/session/employees  → Session
/hmac/employees     → HMAC
```

| Method | Path | Description |
|---|---|---|
| `GET` | `/employees` | List all employees |
| `GET` | `/employees/:id` | Get employee by ID |
| `POST` | `/employees` | Create employee |
| `PUT` | `/employees/:id` | Replace employee |
| `PATCH` | `/employees/:id` | Update employee fields |
| `DELETE` | `/employees/:id` | Delete employee |

---

## Project Structure

```
pwjan19pom/
├── src/
│   └── server.js                    # Local Express API server
├── tests/
│   ├── login.spec.ts                # UI login tests (@login)
│   ├── addemployee.spec.ts          # UI add employee tests (@employee)
│   ├── addemployeeDataDriver.spec.ts
│   ├── advanced.spec.ts
│   ├── advanced-ocr.spec.ts
│   └── apitests/
│       ├── auth.spec.ts             # JWT authentication (@api)
│       ├── basicauth.spec.ts        # Basic auth (@api)
│       ├── apikey.spec.ts           # API key auth (@api)
│       ├── oauth.spec.ts            # OAuth 2.0 (@api)
│       ├── session.spec.ts          # Session/cookie (@api)
│       ├── hmac.spec.ts             # HMAC signature (@api)
│       ├── getemployees.spec.ts     # GET endpoints (@api)
│       ├── createemployee.spec.ts   # POST endpoint (@api)
│       ├── empputpatch.spec.ts      # PUT/PATCH endpoints (@api)
│       └── empdelete.spec.ts        # DELETE endpoint (@api)
├── pages/                           # Page Object Model classes
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── AddEmployeePage.ts
│   ├── EmployeeListPage.ts
│   └── BasePage.ts
├── fixtures/                        # Custom Playwright fixtures
│   ├── basetest.ts
│   └── apitest.ts                   # Worker-scoped auth token fixture
├── utils/                           # Helpers
│   ├── assertHelpers.ts
│   ├── dataHelpers.ts
│   └── webhelpers.ts
├── test-data/
│   ├── users.json
│   └── employeeData.json
├── scripts/
│   └── run-playwright-docker.ps1    # Docker test runner script
├── playwright.config.ts             # Playwright configuration
├── .github/workflows/
│   ├── playwright.yml               # CI workflow (push / PR)
│   └── nightly.yml                  # Nightly scheduled workflow
└── docs/
    ├── fork-setup-guide.md          # Full setup guide for forks
    └── github-actions-allure-setup-guide.md  # CI + Allure troubleshooting
```

---

## GitHub Actions & Allure Reports

### Workflows

| Workflow | Trigger | Description |
|---|---|---|
| **Playwright Tests** | Push / PR to `main` or `master` | Runs on every code change |
| **Nightly Playwright Tests** | Wednesday 8:30 AM IST + manual | Scheduled regression run |

Both workflows automatically:
- Run tests with the local API server
- Generate an Allure report with execution history and trends
- Publish the report to GitHub Pages

### Allure dashboard URL

```
https://<your-github-username>.github.io/pwjan19pom/allure/
```

### Forking this repository?

See **[docs/fork-setup-guide.md](docs/fork-setup-guide.md)** for step-by-step instructions on getting CI and Allure reporting working in your fork. The only setup required is enabling GitHub Pages — no secrets needed.

> **Important:** In your forked repo, go to **Settings → Pages → Build and deployment → Source** and set it to **Deploy from a branch → `gh-pages` → `/` (root)**. The `gh-pages` branch is created automatically on the first workflow run.

---

## Documentation

| Document | Description |
|---|---|
| [docs/fork-setup-guide.md](docs/fork-setup-guide.md) | Complete guide for forking — local setup, CI configuration, GitHub Pages |
| [docs/github-actions-allure-setup-guide.md](docs/github-actions-allure-setup-guide.md) | All issues encountered configuring CI + Allure and how they were fixed |
| [docs/api-testing-guide.md](docs/api-testing-guide.md) | API testing patterns and examples |
| [docs/docker-testing.md](docs/docker-testing.md) | Running tests in Docker |
