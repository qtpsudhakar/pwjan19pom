# Running Playwright Tests in Docker

---

## 1. Install Docker

### Windows

1. Open https://www.docker.com/products/docker-desktop and click **Download for Windows**.
2. Run the downloaded `Docker Desktop Installer.exe`.
3. On the **Configuration** screen, make sure **Use WSL 2 instead of Hyper-V** is checked. If your Windows version does not support WSL 2, the installer will indicate this and fall back to Hyper-V automatically.
4. Click **OK** and wait for the installation to finish.
5. Click **Close and restart** when prompted. Your machine will reboot.
6. After reboot, Docker Desktop launches automatically. Watch the system tray (bottom-right of the taskbar) for the Docker whale icon. It animates while Docker is starting.
7. Wait until a tooltip on the icon reads **"Docker Desktop is running"**. This takes 30–60 seconds.

**Confirm WSL 2 is active after install:**

Open PowerShell and run:

```powershell
wsl --list --verbose
```

Expected output — at least one distro with VERSION `2`:

```
  NAME                   STATE           VERSION
* Ubuntu                 Running         2
```

If no distros are listed, install a WSL 2 distro:

```powershell
wsl --install -d Ubuntu
```

Then in Docker Desktop → Settings → Resources → WSL Integration, enable the Ubuntu distro.

---

### macOS

1. Open https://www.docker.com/products/docker-desktop and download the correct installer for your chip (**Apple Silicon** or **Intel**).
2. Open the downloaded `.dmg` and drag **Docker** to the Applications folder.
3. Open Docker from Applications. macOS will ask for your password to complete the install of networking components — enter it.
4. Docker appears in the menu bar (top-right). Click it and wait for **"Docker Desktop is running"**.

---

### Linux (Ubuntu / Debian)

```bash
# Remove any old Docker packages
sudo apt-get remove -y docker docker-engine docker.io containerd runc

# Install dependencies
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add the Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine + CLI + containerd
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Start Docker and enable it to start on boot
sudo systemctl enable --now docker

# Add your user to the docker group so you don't need sudo for every command
sudo usermod -aG docker $USER
```

**Important:** After `usermod`, log out and log back in. The group membership only takes effect in a new login session.

---

### Verify the Installation

Run these two commands from any terminal (PowerShell on Windows, Terminal on macOS/Linux):

```powershell
docker --version
```

Expected output:
```
Docker version 27.x.x, build xxxxxxx
```

```powershell
docker info
```

Expected output: a long block that begins with `Client:` and `Server:` sections. If you see `ERROR: Cannot connect to the Docker daemon`, Docker Desktop is not running — open it from the Start Menu / Applications and wait for the tray icon to confirm it is running before retrying.

---

## 2. Pull the Playwright Docker Image

This project uses the official Playwright image pinned to **v1.58.2-noble** (Ubuntu 24.04). The image bundles Chromium, Firefox, WebKit, and all their system dependencies.

Run this once before your first test execution (the wrapper script will pull automatically if the image is absent, but doing it separately shows progress and avoids a silent long wait):

```powershell
docker pull mcr.microsoft.com/playwright:v1.58.2-noble
```

You will see Docker downloading each image layer:

```
v1.58.2-noble: Pulling from playwright
a1a4f4a3d778: Pull complete
...
Status: Downloaded newer image for mcr.microsoft.com/playwright:v1.58.2-noble
```

Verify the image is present locally:

```powershell
docker images mcr.microsoft.com/playwright
```

Expected output:
```
REPOSITORY                        TAG              IMAGE ID       CREATED        SIZE
mcr.microsoft.com/playwright      v1.58.2-noble    xxxxxxxxxxxx   x days ago     ~2GB
```

> **Version alignment:** the image tag must match the `@playwright/test` version in `package.json`. This project declares `"@playwright/test": "^1.50.0"` and the installed version resolves to **1.58.2**. If you update `@playwright/test`, update the image tag in `scripts/run-playwright-docker.ps1` to match.

---

## 3. Understand What the Docker Wrapper Does

Before running, it helps to know what `scripts/run-playwright-docker.ps1` actually executes:

```powershell
docker run --rm --init --ipc=host `
  -e CI=1 `
  -e PW_HEADLESS=true `
  -v "D:\pwclasses\pwjan19pom:/work" `
  -w /work `
  mcr.microsoft.com/playwright:v1.58.2-noble `
  /bin/bash -lc "npm ci && npx playwright test"
```

| Flag | Purpose |
|---|---|
| `--rm` | Deletes the container automatically when it exits — no cleanup needed |
| `--init` | Runs a tiny init process as PID 1 to properly reap zombie processes |
| `--ipc=host` | Shares host IPC namespace — required by Chromium to avoid shared-memory crashes |
| `-e CI=1` | Signals CI mode to Playwright: enables `forbidOnly`, sets `workers: 1`, `retries: 2` |
| `-e PW_HEADLESS=true` | Sets `headless: true` in `playwright.config.ts` (it reads this env var) |
| `-v <host>:/work` | Bind-mounts your project folder into the container at `/work` |
| `-w /work` | Sets the working directory inside the container |
| `npm ci` | Installs node_modules from `package-lock.json` inside the container |
| `npx playwright test` | Runs tests; Playwright also starts `npm run start` (Express server on port 3000) automatically via `webServer` config |

Because of the bind-mount (`-v`), every file written by the container — reports, screenshots, XML, traces — lands directly in your project folder on the host. No `docker cp` is needed.

---

## 4. Execute Tests

Open a PowerShell terminal at the project root (`D:\pwclasses\pwjan19pom`) and run one of the following.

### Run all tests

```powershell
npm run test:docker
```

### Run only API tests (tagged `@api`)

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/run-playwright-docker.ps1 `
  -TestArgs "--grep @api"
```

### Run only smoke tests (tagged `@smoke`)

```powershell
npm run test:docker:smoke
```

### Run a single test file

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/run-playwright-docker.ps1 `
  -TestArgs "tests/login.spec.ts"
```

### Run a specific project (browser)

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/run-playwright-docker.ps1 `
  -TestArgs "--project=chromium"
```

### List all tests without running them

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/run-playwright-docker.ps1 `
  -TestArgs "--list"
```

### Use a different OS base image (Ubuntu 22.04)

```powershell
powershell -ExecutionPolicy Bypass -File ./scripts/run-playwright-docker.ps1 `
  -ImageTag v1.58.2-jammy
```

### What to expect during a run

```
Using Docker image: mcr.microsoft.com/playwright:v1.58.2-noble
Workspace mount: D:\pwclasses\pwjan19pom -> /work

added 232 packages, and audited 233 packages in 45s   ← npm ci output

  Running 83 tests using 1 worker

  ✓  1 [chromium] › apitests/auth.spec.ts › POST /auth/login — valid credentials return a token (312ms)
  ✓  2 [chromium] › apitests/auth.spec.ts › POST /auth/login — invalid credentials return 401 (98ms)
  ...
  83 passed (2m 14s)
```

A non-zero exit code means one or more tests failed. The report will still be generated.

---

## 5. View Test Results

All output files are written to the project folder (on your host machine) because of the bind-mount.

### HTML Report

The HTML report is the most useful way to review results. It shows pass/fail, timings, screenshots, and trace links.

```powershell
npx playwright show-report
```

This opens `playwright-report/index.html` in your default browser at `http://localhost:9323`. You will see:

- A summary row per test (pass / fail / skipped)
- Expandable steps showing each action
- Attached screenshots for failed tests
- A **Trace** button for tests that recorded a trace

### JUnit XML

```
results.xml
```

This file is written to the project root. It follows JUnit XML format and can be consumed by:

- Azure DevOps (Publish Test Results task)
- GitHub Actions (junit-reporter actions)
- Jenkins (JUnit plugin)
- Any CI system with JUnit support

### Artifacts (traces, videos, screenshots)

```
test-results/pwreport-<timestamp>/artifacts/
```

From `playwright.config.ts`:

- `trace: 'on-first-retry'` — a `.zip` trace is recorded when a test is retried
- `screenshot: 'only-on-failure'` — a PNG is saved for every failed test
- `video: 'on-first-retry'` — a video is recorded on retries

Open a trace file:

```powershell
npx playwright show-trace "test-results/pwreport-2026-03-18T.../artifacts/login-test/trace.zip"
```

The Trace Viewer shows a timeline of actions, DOM snapshots before and after each step, network requests, and console logs.

---

## 6. noVNC — Watch or Debug Tests Visually in the Container

noVNC lets you open a real desktop inside the Docker container in your browser. Use it to:

- Watch a headed test run exactly as it would execute inside Docker.
- Run `playwright codegen` against the app inside the container.
- Debug a specific test interactively.

### Setup

Create the file `.devcontainer/devcontainer.json` in the project root:

```json
{
  "image": "mcr.microsoft.com/playwright:v1.58.2-noble",
  "forwardPorts": [6080],
  "features": {
    "ghcr.io/devcontainers/features/desktop-lite:1": {
      "webPort": "6080",
      "vncPort": "5901"
    }
  }
}
```

### Steps to use it in VS Code

1. Install the **Dev Containers** extension in VS Code (Extension ID: `ms-vscode-remote.remote-containers`).
2. Open the project folder in VS Code.
3. Press `F1` → type **Reopen in Container** → press Enter.
4. VS Code builds the dev container (first time takes a few minutes as it installs the desktop-lite feature).
5. Once the container is running, VS Code shows **Dev Container: playwright** in the bottom-left corner.
6. Open your browser and navigate to **http://localhost:6080**.
7. A noVNC web page loads. Click **Connect**. You will see an Ubuntu desktop running inside the container.

### Run tests headed from inside the container terminal

In VS Code's integrated terminal (which is now running inside the container), install dependencies and run headed:

```bash
npm ci
npx playwright test --headed
```

You will see Chromium open on the noVNC desktop and execute the tests.

### Use Playwright Codegen from the container

```bash
npx playwright codegen http://localhost:3000
```

Codegen opens on the noVNC desktop. Interact with the app and Playwright generates test code in the side panel.

> The standard `npm run test:docker` wrapper always uses headless mode (`PW_HEADLESS=true`). noVNC is only for interactive/debugging sessions via the dev container.

---

## 7. Troubleshooting

### `Error: Cannot find module` or `browserType.launch: Executable doesn't exist`

The `@playwright/test` version in `package.json` does not match the Docker image tag. Check:

```powershell
# What version is actually installed?
npx playwright --version
```

Update the `-ImageTag` default in `scripts/run-playwright-docker.ps1` to match the output (e.g. `v1.58.2-noble`).

### Chromium crashes with `out of memory` or `SIGBUS`

`--ipc=host` is missing from the docker run command. It is already present in the wrapper script — if you are constructing a custom command, ensure it is included.

### Tests pass locally but fail in Docker

The most common cause is `headless: false` being hard-coded. This project reads `process.env.PW_HEADLESS` to decide headless mode. The wrapper passes `-e PW_HEADLESS=true`, so this should not happen unless you edited `playwright.config.ts` to hard-code `false`.

### `docker: command not found`

On Windows: Docker Desktop is not installed or not running. Start Docker Desktop from the Start Menu and wait for the tray icon.
On Linux: Docker Engine is not installed or the `docker` group membership has not been applied. Run `sudo docker info` to confirm it works, then log out and back in to pick up the group.

### `npm ci` fails inside the container with network errors

The container needs internet access to download packages. If you are behind a corporate proxy, add these flags to the `docker run` command in `scripts/run-playwright-docker.ps1`:

```powershell
-e HTTP_PROXY=$env:HTTP_PROXY `
-e HTTPS_PROXY=$env:HTTPS_PROXY `
-e NO_PROXY=$env:NO_PROXY `
```

### First run hangs for several minutes

Docker is downloading the Playwright image (~2 GB). This only happens once. All subsequent runs start in seconds because Docker reuses the cached image.

### `playwright-report/` is empty or missing after the run

This happens when the process crashes before any tests execute (e.g., `npm ci` fails). Check the terminal output for the real error before the test runner started.

### Port 3000 conflict

The Express server inside the container binds to port 3000 within the container's own network namespace — it does not bind to your host port 3000 unless you add `-p 3000:3000` to the docker run command. By default there is no conflict with any host process. If you added port mapping and see a conflict, stop the host process using port 3000 first.
