# GitHub Actions + Allure Report Setup Guide

This guide documents the complete setup of GitHub Actions CI workflows with Allure reporting and GitHub Pages publishing for a Playwright project. All issues encountered during setup and their fixes are documented so others can avoid the same pitfalls.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Workflow Files](#workflow-files)
4. [Issues Encountered and Fixes](#issues-encountered-and-fixes)
5. [How Allure History Works](#how-allure-history-works)
6. [Accessing the Report](#accessing-the-report)

---

## Overview

Two workflow files were created:

| File | Trigger | Purpose |
|---|---|---|
| `.github/workflows/playwright.yml` | Push / PR to `main` or `master` | Runs on every code change |
| `.github/workflows/nightly.yml` | Cron schedule (Wednesday 8:30 AM IST) + manual | Weekly regression run |

Both workflows:
- Run Playwright tests
- Generate an Allure HTML report with execution history/trends
- Publish the report to GitHub Pages
- Upload artifacts as backup

---

## Prerequisites

### 1. Install required npm packages

```bash
npm install --save-dev allure-playwright allure-commandline wait-on
```

> **Why `allure-commandline`?** Installing it as a local dev dependency pins the version. Using `npx allure` without it downloads the CLI fresh each run and can pick up a mismatched version causing generate failures.

### 2. Enable GitHub Pages

In your repository: **Settings → Pages → Build and deployment → Source → Deploy from a branch → `gh-pages` → `/` (root) → Save**

> The `gh-pages` branch is created automatically on the first workflow run. If Pages shows a 404 initially, wait ~2 minutes or trigger the workflow manually first.

### 3. No secrets needed

The workflows use the built-in `GITHUB_TOKEN` — no personal access token (PAT) setup is required, as long as `permissions: contents: write` is declared in the workflow.

### 4. Enable allure-playwright reporter in `playwright.config.ts`

```ts
reporter: [
  ['allure-playwright', { outputFolder: 'allure-results', detail: true, suiteTitle: true }],
  // ...other reporters
]
```

> The `outputFolder` must be explicitly set. Without it, `allure-playwright` v3.x may write results to an unexpected path, causing an empty report with no history.

---

## Workflow Files

### `.github/workflows/playwright.yml` (Push / PR trigger)

```yaml
name: Playwright Tests

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

permissions:
  contents: write

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:

    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: lts/*
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Install Playwright Browsers
      run: npx playwright install --with-deps chromium

    - name: Download previous Allure history
      uses: actions/checkout@v4
      continue-on-error: true
      with:
        ref: gh-pages
        path: gh-pages

    - name: Run Playwright tests
      run: npx playwright test --grep @api
      env:
        CI: true
      continue-on-error: true

    - name: Copy Allure history from previous run
      if: always()
      run: |
        if [ -d "gh-pages/allure/history" ]; then
          mkdir -p allure-results/history
          cp -r gh-pages/allure/history/. allure-results/history/
        else
          echo "No previous history found — first run baseline"
        fi

    - name: Generate Allure HTML report
      run: npx allure generate allure-results --clean -o allure-report
      if: always()

    - name: Prepare gh-pages directory structure
      if: always()
      run: |
        mkdir -p gh-pages-deploy/allure
        cp -r allure-report/. gh-pages-deploy/allure/

    - name: Publish Allure report to GitHub Pages
      uses: peaceiris/actions-gh-pages@v4
      if: always()
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_branch: gh-pages
        publish_dir: gh-pages-deploy
        keep_files: true

    - name: Upload Playwright HTML report
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report-${{ github.run_number }}
        path: playwright-report/
        retention-days: 30

    - name: Upload Allure results
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: allure-results-${{ github.run_number }}
        path: allure-results/
        retention-days: 30
```

### `.github/workflows/nightly.yml` (Scheduled trigger)

Same steps as above, but with a different trigger. Cron `0 3 * * 3` = Wednesday 8:30 AM IST (3:00 AM UTC).

---

## Issues Encountered and Fixes

---

### Issue 1: Local server timing out in CI

**Error:**
```
Error: Timed out waiting 120000ms from config.webServer.
Error: Process completed with exit code 1.
```

**Root cause:**  
`playwright.config.ts` had `webServer` configured to start the local server. In CI the server was crashing silently — Playwright kept polling the URL until timeout with no visible error.

**Fix:**  
Disable `webServer` in CI and start the server explicitly in the workflow so crash logs are visible:

In `playwright.config.ts`:
```ts
webServer: process.env.CI ? undefined : {
  command: 'node src/server.js',
  url: 'http://localhost:3000',
  reuseExistingServer: true,
  timeout: 120_000,
},
```

In the workflow:
```yaml
- name: Start API server
  run: node src/server.js > server.log 2>&1 &

- name: Wait for server to be ready
  run: npx wait-on http://localhost:3000 --timeout 30000 || (echo "=== Server startup log ===" && cat server.log && exit 1)
```

> `> server.log 2>&1` captures both stdout and stderr. If `wait-on` times out, the log is printed before failing — showing the exact crash reason.

---

### Issue 2: Headed browser failing in CI (no display)

**Error:**
```
Looks like you launched a headed browser without having a XServer running.
Set either 'headless: true' or use 'xvfb-run <your-playwright-app>' before running Playwright.
```

**Root cause:**  
`playwright.config.ts` had `headless: false` hardcoded. GitHub Actions runners have no display server.

**Fix:**
```ts
headless: !!process.env.CI,
```

Headed locally, headless in CI automatically.

---

### Issue 3: GitHub Pages publish failing — "not found deploy key or tokens"

**Error:**
```
Error: Action failed with "not found deploy key or tokens"
```

**Root cause:**  
The workflow was using `personal_token: ${{ secrets.GH_PAT }}` but no PAT secret had been configured in the repository.

**Fix:**  
Switch to the built-in `GITHUB_TOKEN` which is automatically available in every workflow run. The `permissions: contents: write` declaration grants it the access needed to push to the `gh-pages` branch.

```yaml
permissions:
  contents: write

# In the publish step:
- name: Publish Allure report to GitHub Pages
  uses: peaceiris/actions-gh-pages@v4
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}   # ✅ built-in, no setup needed
    publish_branch: gh-pages
```

> If you previously created a secret named `GH_PAT` or `GH_PAT_NEW`, they are not needed and can be ignored.

---

### Issue 4: Allure report showing but no history/trends

**Symptom:**  
Report displayed correctly but the "History", "Trend", and "Retries" tabs showed no data after multiple runs.

**Root cause — wrong step order:**  
History was copied into `allure-results/history/` *before* running tests. `allure-playwright` clears the `allure-results/` folder when it initialises, wiping the history before Allure could use it.

```
❌ Wrong order:
1. Copy history → allure-results/history/
2. Run tests    → allure-playwright CLEARS allure-results/ ← history deleted here
3. Generate     → no history found
```

**Fix — copy history AFTER tests, BEFORE generate:**
```
✅ Correct order:
1. Checkout gh-pages  (history source ready, tests not run yet)
2. Run tests          → allure-playwright writes fresh results to allure-results/
3. Copy history       → allure-results/history/ (now safe, allure-playwright won't run again)
4. Generate           → picks up results + history → trends work
```

---

### Issue 5: History directory nested incorrectly (`history/history/`)

**Symptom:**  
History step ran without error but trends still didn't appear. Debug log showed files inside `allure-results/history/history/`.

**Root cause:**  
`mkdir -p allure-results/history` creates the target directory, then `cp -r gh-pages/allure/history allure-results/` copies the *directory itself* into it, resulting in:
```
allure-results/history/history/categories-trend.json   ← wrong path
```
Allure expects:
```
allure-results/history/categories-trend.json           ← correct path
```

**Fix:**  
Use `/. ` to copy the *contents* of the directory:
```yaml
cp -r gh-pages/allure/history/. allure-results/history/
#                            ^^
#                            trailing /. copies contents, not the folder itself
```

---

### Issue 6: Allure reporter writing to unexpected output folder

**Symptom:**  
`allure generate allure-results` ran but produced a report with no test data because `allure-results/` was empty.

**Root cause:**  
`allure-playwright` v3.x does not default to `allure-results/` when `outputFolder` is not specified in the reporter config. The results were written to a different path.

**Fix:**  
Always explicitly configure `outputFolder` in `playwright.config.ts`:
```ts
['allure-playwright', { outputFolder: 'allure-results', detail: true, suiteTitle: true }]
```

And always use `--clean` in generate to avoid stale data from prior local runs:
```bash
npx allure generate allure-results --clean -o allure-report
```

---

## How Allure History Works

Allure history is stored as JSON files inside the generated report's `history/` folder. The workflow preserves history across runs like this:

```
Run N:
  gh-pages branch contains: allure/history/*.json  (from Run N-1)
  |
  ├─ Checkout gh-pages → available at ./gh-pages/
  ├─ Run tests → fresh allure-results/ written
  ├─ Copy gh-pages/allure/history/. → allure-results/history/
  ├─ allure generate → reads allure-results/ + allure-results/history/
  │                    writes allure-report/ with updated history/
  └─ Publish allure-report/ → gh-pages branch (overwrites old history with new)

Run N+1:
  gh-pages branch now contains history from Run N → trends visible
```

> History trends appear from the **second run** onwards. The first run establishes the baseline.

---

## Accessing the Report

Your Allure dashboard is published at:

```
https://<your-github-username>.github.io/<repository-name>/allure/
```

Example: `https://qtpsudhakarproducts.github.io/pwjan19pom/allure/`
