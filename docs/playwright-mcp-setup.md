# Playwright MCP Setup Guide

## Overview
This guide explains how to configure and use Playwright MCP (Model Context Protocol) with VS Code and GitHub Copilot.

## What is Playwright MCP?
Playwright MCP is a Model Context Protocol server that enables GitHub Copilot to interact with your Playwright tests and browser automation directly. It provides specialized tools for:

- **Browser Automation**: Navigate, click, fill forms, take screenshots
- **Test Management**: Find, execute, and analyze Playwright tests (with `--caps=testing`)
- **Test Debugging**: Analyze test failures and inspect test artifacts
- **Page Exploration**: Explore web pages using accessibility snapshots

### MCP vs CLI
The official Playwright project offers two approaches:
- **MCP (This Setup)**: Best for persistent browser state, rich introspection, and iterative reasoning over page structure
- **[CLI + SKILLS](https://github.com/microsoft/playwright-cli)**: More token-efficient for high-throughput coding agents working with large codebases

This setup uses MCP for direct browser automation and test interaction through natural language.

## Installation

The Playwright MCP package has been installed in this project:

```bash
npm install -D @playwright/mcp
```

**Note:** With the global configuration using `npx @playwright/mcp@latest`, the local installation is optional. The `npx` command will automatically fetch the latest version. However, installing it locally ensures version consistency for your team and faster startup times.

## Configuration

The MCP server is configured globally at the IDE level in your VS Code User Settings (`%APPDATA%\Code\User\settings.json`) with the following settings:

```json
{
  "github.copilot.chat.mcp.enabled": true,
  "github.copilot.chat.mcp.servers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest"
      ]
    }
  }
}
```

### Configuration Options

You can customize the MCP server behavior by adding arguments to the `args` array. Some commonly used options:

```json
{
  "github.copilot.chat.mcp.enabled": true,
  "github.copilot.chat.mcp.servers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--headless",
        "--browser=chromium",
        "--viewport-size=1920x1080"
      ]
    }
  }
}
```

Available configuration arguments:
- `--headless` - Run browser in headless mode (default is headed)
- `--browser` - Browser to use: `chrome`, `firefox`, `webkit`, `msedge`
- `--viewport-size` - Browser viewport (e.g., `1280x720`)
- `--device` - Device to emulate (e.g., `"iPhone 15"`)
- `--timeout-action` - Action timeout in ms (default: 5000)
- `--timeout-navigation` - Navigation timeout in ms (default: 60000)
- `--user-data-dir` - Path to user data directory for persistent sessions
- `--storage-state` - Path to storage state file for isolated contexts
- `--isolated` - Keep browser profile in memory, don't save to disk
- `--caps` - Additional capabilities: `vision`, `pdf`, `devtools`, `config`, `network`, `storage`, `testing`

For a complete list, see the [official documentation](https://github.com/microsoft/playwright-mcp#configuration).

## How to Use

After configuration, you can interact with Playwright through GitHub Copilot chat using natural language.

### Browser Automation Examples (Core - Always Available)
- "Navigate to the login page"
- "Click the submit button"
- "Fill in the login form with test credentials"
- "Take a snapshot of the current page"

### Test Execution Examples (Requires --caps=testing)
To use test-related features, update your configuration to include testing capabilities:

```json
"args": ["@playwright/mcp@latest", "--caps=testing"]
```

Then you can use:
- "Run the login tests"
- "Execute all tests with @smoke tag"
- "Show me all available tests"
- "Find tests related to employee management"
- "Analyze the last test failure"
- "Get test artifacts from the last run"
- "Show me the test code for addemployee"

### Vision Examples (Requires --caps=vision)
- "Take a screenshot of the dashboard"
- "Capture the current page state"

## Available MCP Tools

### Core Automation (Always Available)
- `browser_navigate`: Navigate to URLs
- `browser_click`: Click elements
- `browser_fill_form`: Fill form fields
- `browser_type`: Type text into elements
- `browser_press_key`: Press keyboard keys
- `browser_hover`: Hover over elements
- `browser_wait_for`: Wait for specific conditions
- `browser_evaluate`: Run JavaScript in the browser
- `browser_snapshot`: Get accessibility snapshot of the page

### Tab Management (Always Available)
- `browser_tabs`: Manage browser tabs
- `browser_close`: Close browser or tabs

### Test Execution (Opt-in: --caps=testing)
- `find_tests`: Search for tests by name, tag, or file
- `get_test_code`: Retrieve test source code
- `execute_test`: Run specific Playwright tests
- `run_tests`: Execute multiple tests
- `analyze_test_failure`: Detailed analysis of test failures
- `get_test_artifacts`: Access screenshots, traces, videos

### Vision Capabilities (Opt-in: --caps=vision)
- `browser_drag`: Drag and drop using coordinates
- `browser_take_screenshot`: Capture screenshots

### PDF Generation (Opt-in: --caps=pdf)
- PDF generation tools for saving pages as PDF

### Network Tools (Opt-in: --caps=network)
- `browser_network_requests`: Monitor network requests

### Storage Tools (Opt-in: --caps=storage)
- Storage management for cookies, localStorage, etc.

### DevTools (Opt-in: --caps=devtools)
- Browser DevTools integration

### Configuration Tools (Opt-in: --caps=config)
- Runtime configuration management

**Note:** To enable optional capabilities, add them to your configuration:
```json
"args": ["@playwright/mcp@latest", "--caps=testing,vision,network"]
```

## Verification

To verify the MCP server is working:

1. Reload VS Code (or restart VS Code)
2. Open GitHub Copilot Chat
3. Try asking: "List all Playwright tests in this project"

The Copilot should be able to access and execute your Playwright tests directly.

**Note:** Since MCP is configured globally at the IDE level, it will be available in all your VS Code workspaces, not just this repository.

## Troubleshooting

### MCP Server Not Working
- Ensure you've reloaded/restarted VS Code after adding the configuration
- Check that `@playwright/mcp` is installed in `node_modules`
- Verify the path to `playwright.config.ts` is correct

### Permission Issues
- On Windows, ensure PowerShell execution policy allows script execution
- Check that Node.js is installed and accessible in PATH

### Test Execution Issues
- Verify your Playwright configuration in [playwright.config.ts](../playwright.config.ts)
- Ensure all test dependencies are installed (`npm install`)
- Check that browsers are installed (`npx playwright install`)

## Benefits

Using Playwright MCP with GitHub Copilot provides:

1. **Faster Test Development**: Ask Copilot to generate tests based on existing patterns
2. **Easier Debugging**: Get AI-powered analysis of test failures
3. **Interactive Testing**: Execute and explore tests conversationally
4. **Better Documentation**: Automatically understand test coverage and structure

## Configuration Scope

**This project uses IDE-level (global) configuration**, which means:

✅ **Advantages:**
- MCP is available in **all your VS Code workspaces**, not just this repository
- Single configuration point - update once, applies everywhere
- No need to configure MCP for each new project
- Consistent experience across all projects

⚠️ **Considerations:**
- Different projects may need different capabilities (e.g., `--caps=testing` for some)
- Team members need to set up their own IDE-level configuration

**Alternative: Workspace-Level Configuration**

If you prefer repository-specific settings (e.g., for team sharing), you can create [.vscode/settings.json](.vscode/settings.json) in the repository with the same MCP configuration. Workspace settings override user settings.

## Related Documentation

- [API Testing Guide](api-testing-guide.md)
- [Docker Testing Setup](docker-testing.md)
- [GitHub Actions with Allure](github-actions-allure-setup-guide.md)

## Additional Resources

- [Official Playwright MCP Repository](https://github.com/microsoft/playwright-mcp)
- [Playwright MCP on npm](https://www.npmjs.com/package/@playwright/mcp)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Playwright CLI with SKILLS](https://github.com/microsoft/playwright-cli) - Alternative approach for coding agents
