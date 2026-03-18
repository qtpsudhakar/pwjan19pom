# Fork Setup Guide

This guide is for anyone who forks this repository and wants to run the tests locally and in GitHub Actions CI with Allure reporting on GitHub Pages.

---

## Table of Contents

1. [What's in This Repository](#whats-in-this-repository)
2. [Local Setup](#local-setup)
3. [Running Tests Locally](#running-tests-locally)
4. [GitHub Actions Setup](#github-actions-setup)
5. [Accessing Your Allure Report](#accessing-your-allure-report)
6. [Project Structure Reference](#project-structure-reference)

---

## What's in This Repository

This is a **Playwright API + UI test automation framework** using the Page Object Model pattern.

- **API server** — a local Express server (`src/server.js`) running on port `3000` that exposes a mock Employee CRUD API protected by 6 different auth mechanisms (JWT, Basic Auth, API Key, OAuth 2.0, Session, HMAC)
- **API tests** — tagged `@api`, test all authentication methods and employee endpoints
- **UI tests** — tagged `@login`, `@employee`, test an OrangeHRM demo site
- **Allure reporting** — results published automatically to GitHub Pages on every CI run

---

## Local Setup

### Step 1 — Clone / fork the repository

```bash
git clone https://github.com/<your-username>/pwjan19pom.git
cd pwjan19pom
```

### Step 2 — Install Node.js

Requires **Node.js 18 or higher**. Check your version:

```bash
node --version
```

Download from [nodejs.org](https://nodejs.org) if needed.

### Step 3 — Install dependencies

```bash
npm install
```

This installs everything declared in `package.json` — the test runner, Allure reporter, Allure CLI, server dependencies, and all other packages. No separate installs needed.

### Step 4 — Install Playwright browsers

```bash
npx playwright install chromium
```

This step is separate because browser binaries are **not bundled inside npm packages** — Playwright downloads them independently regardless of `npm install`.

> Install all browsers only if you need them: `npx playwright install`

The API tests require the local server to be running on port `3000`. Open a terminal and start it:

```bash
npm start
```

Keep this terminal open while running tests. You should see:
```
Employee API running at http://localhost:3000
```

---

## Running Tests Locally

### Run all tests

```bash
npx playwright test
```

### Run only API tests

```bash
npx playwright test --grep @api
```

### Run only login/UI tests

```bash
npx playwright test --grep @login
```

### Run with a visible browser (headed mode)

```bash
npx playwright test --headed
```

### Open the interactive UI mode

```bash
npx playwright test --ui
```

### View the HTML report after a run

```bash
npx playwright show-report
```

### Generate and open Allure report locally

```bash
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report
```

Or use the shortcut script:

```bash
npm run generate:allure
npm run open:allure
```

---

### Local API credentials reference

The server has these built-in test users and credentials — no configuration needed:

| Auth type | Credential | Value |
|---|---|---|
| JWT / Session | username | `standard_user` or `admin_user` |
| JWT / Session | password | `secret_sauce` / `admin_pass` |
| Basic Auth | same as above | same as above |
| API Key | x-api-key | `key-standard-abc123` or `key-admin-xyz789` |
| OAuth 2.0 | client_id | `test-client` or `admin-client` |
| OAuth 2.0 | client_secret | `test-secret` or `admin-secret` |
| HMAC | client id | `client-abc` or `client-xyz` |
| HMAC | secret key | `secret-key-abc` or `secret-key-xyz` |

---

## GitHub Actions Setup

After forking, two things need to be configured in your GitHub repository before the workflows will run successfully.

### Step 1 — Enable GitHub Pages

1. Go to your forked repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar under "Code and automation")
3. Under **Build and deployment → Source**, select **Deploy from a branch**
4. Set branch to **`gh-pages`** and folder to **`/ (root)`**
5. Click **Save**

> The `gh-pages` branch is created automatically on the first successful workflow run — you don't need to create it manually.

### Step 2 — No secrets required

The workflows use GitHub's built-in `GITHUB_TOKEN` with `permissions: contents: write`. **No personal access token (PAT) needs to be created or configured.** Everything works out of the box after enabling Pages.

### Step 3 — Verify the workflow triggers

| Workflow | File | Trigger |
|---|---|---|
| Playwright Tests | `.github/workflows/playwright.yml` | Push or PR to `main` / `master` |
| Nightly Playwright Tests | `.github/workflows/nightly.yml` | Every Wednesday 8:30 AM IST + manual |

To run the nightly workflow manually at any time:
1. Go to **Actions** tab in your repository
2. Select **Nightly Playwright Tests**
3. Click **Run workflow** → **Run workflow**

---

### What happens in the workflow

```
1. Checkout code
2. Install Node.js + npm dependencies
3. Install Playwright browsers (Chromium)
4. Checkout gh-pages branch → save previous Allure history
5. Start local API server (node src/server.js)
6. Wait for server to be ready on http://localhost:3000
7. Run Playwright tests (continue even if tests fail)
8. Copy previous Allure history into allure-results/
9. Generate Allure HTML report (with trend data)
10. Publish report to GitHub Pages
11. Upload Playwright report as artifact (30-day retention)
12. Upload Allure results as artifact (30-day retention)
```

---

## Accessing Your Allure Report

After the first successful workflow run, your report is available at:

```
https://<your-github-username>.github.io/pwjan19pom/allure/
```

Replace `<your-github-username>` with your actual GitHub username.

> History and trend charts appear from the **second run** onwards. The first run establishes the baseline.

---

## Project Structure Reference

```
pwjan19pom/
├── src/
│   └── server.js              # Local Express API server (port 3000)
├── tests/
│   ├── login.spec.ts           # UI login tests (@login)
│   ├── addemployee.spec.ts     # UI employee tests (@employee)
│   └── apitests/
│       ├── auth.spec.ts        # JWT auth tests (@api)
│       ├── basicauth.spec.ts   # Basic auth tests (@api)
│       ├── apikey.spec.ts      # API key tests (@api)
│       ├── oauth.spec.ts       # OAuth 2.0 tests (@api)
│       ├── session.spec.ts     # Session/cookie tests (@api)
│       ├── hmac.spec.ts        # HMAC signature tests (@api)
│       ├── getemployees.spec.ts
│       ├── createemployee.spec.ts
│       ├── empputpatch.spec.ts
│       └── empdelete.spec.ts
├── pages/                     # Page Object Model classes
├── fixtures/                  # Custom Playwright fixtures
├── utils/                     # Helper utilities
├── test-data/                 # Test data (users.json, employeeData.json)
├── playwright.config.ts       # Playwright configuration
├── .github/workflows/
│   ├── playwright.yml         # CI workflow (push/PR)
│   └── nightly.yml            # Nightly scheduled workflow
└── docs/
    ├── github-actions-allure-setup-guide.md  # Troubleshooting guide
    └── fork-setup-guide.md    # This file
```

---

## Troubleshooting

**Tests fail with "Connection refused" on port 3000**
- Make sure `npm start` is running in a separate terminal before running tests
- In CI this is handled automatically by the workflow

**`allure: command not found`**
- Run `npm install` — `allure-commandline` is a local dev dependency
- Use `npx allure` instead of `allure` directly

**GitHub Pages shows a 404**
- Make sure Pages is enabled: Settings → Pages → Source → **Deploy from a branch** → `gh-pages` → `/` (root)
- Wait ~2 minutes after the first workflow run for Pages to deploy
- The `gh-pages` branch is created on the first run — if it doesn't exist yet, trigger the workflow manually first

**No history/trends in Allure report**
- History appears from the **second run** onwards — this is expected
- If it still doesn't appear after multiple runs, check the "Copy Allure history" step in the Actions log for the message "History files copied" and the list of files

For a detailed breakdown of all issues encountered during setup and their fixes, see [github-actions-allure-setup-guide.md](github-actions-allure-setup-guide.md).
