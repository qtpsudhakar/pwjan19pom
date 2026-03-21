# Testing Skills Index

This directory contains specialized skills for AI-assisted test case generation, automation development, and quality assurance processes. Each skill provides domain expertise, best practices, and standardized workflows for producing high-quality testing outputs.

## Manual Testing Skills

These skills support manual testing activities and test case generation that can be converted to automation:

### 📝 [manual-test-case-design](./manual-test-case-design/)
**Use when:** Converting manual test scenarios to structured test cases, analyzing requirements for test coverage, creating test case templates, preparing test cases for automation conversion

**Key Features:**
- Standardized test case templates with automation-ready format
- Test coverage analysis and risk assessment
- Data-driven test design patterns
- Requirements analysis for comprehensive testing
- Integration guidelines for Playwright project conversion

### 🔍 [exploratory-testing-charters](./exploratory-testing-charters/)  
**Use when:** Investigating new features, supplementing automated test coverage, finding usability issues, creating ad-hoc test scenarios, documenting exploratory findings

**Key Features:**
- Structured charter templates for focused exploration sessions
- Risk-based exploration techniques and systematic approaches  
- Real-time documentation standards and issue classification
- Converting findings to automated test cases
- Integration with Page Object Model patterns

### 🐛 [bug-report-writing](./bug-report-writing/)
**Use when:** Documenting defects found during testing, reporting issues from exploratory sessions, creating regression test scenarios from fixed bugs

**Key Features:**
- Detailed bug report templates with evidence collection
- Severity and priority classification guidelines
- Effective reproduction steps and data requirements
- Integration with development workflow and automation conversion
- Quality gates for actionable bug reports

### 📊 [test-coverage-analysis](./test-coverage-analysis/)
**Use when:** Evaluating test completeness, identifying untested scenarios, planning test automation priorities, conducting coverage reviews for releases

**Key Features:**  
- Multi-dimensional coverage analysis framework (functional, platform, user, integration)
- Coverage metrics and measurement techniques
- Gap analysis and prioritization matrices
- Risk-based coverage assessment
- Integration with CI/CD and automation planning

### 📋 [user-story-analysis](./user-story-analysis/)
**Use when:** Converting user stories to test cases, reviewing requirements for testability, identifying missing acceptance criteria, planning test coverage for new features

**Key Features:**
- User story testability assessment and refinement
- Systematic test scenario extraction from requirements
- Edge case identification and risk-based prioritization  
- Integration analysis for complex workflows
- Story-driven automation planning

## Playwright Automation Skills

These skills support Playwright test development using Page Object Model patterns:

### 🎭 [playwright-pom](./playwright-pom/)
**Use when:** Creating Page Object Model classes, adding page locators and actions, extending BasePage, writing page methods that wrap locator interactions

**Key Features:**
- BasePage inheritance patterns and locator management
- WebHelpers/AssertHelpers composition for robust interactions
- TypeScript path aliases and project structure
- **CRITICAL RULE:** Tests must only use page object methods, never direct locators

### 🧪 [playwright-test-patterns](./playwright-test-patterns/)
**Use when:** Creating spec files, adding test.describe blocks, writing hooks, adding tags and annotations, writing data-driven tests from JSON

**Key Features:**
- Test structure and organization patterns
- Data-driven testing with JSON test data
- Login-before-each patterns and user workflow testing
- Test retry and status detection with test.info()

### ⚙️ [playwright-fixtures](./playwright-fixtures/)
**Use when:** Adding page object fixtures, creating worker-scoped API auth fixtures, wiring up new pages into basetest.ts, setting up auto-running beforeEach navigation

**Key Features:**
- UI fixture patterns with basetest.ts integration
- Worker-scoped auth token patterns for API testing
- Auto-navigation setup and shared context management
- **CRITICAL:** Tests must only use page object methods from fixtures

### 🛠️ [playwright-helpers](./playwright-helpers/)
**Use when:** Adding web interaction wrappers, creating assertion helpers, using helpers inside page methods, handling locator errors with logging

**Key Features:**  
- Try-catch-rethrow patterns for reliable interactions
- Locator.description() logging for better debugging
- AssertHelpers assertion library integration
- **CRITICAL:** Helpers are only for use inside page object methods, never directly in tests

### 🌐 [playwright-api-testing](./playwright-api-testing/)
**Use when:** Creating REST API tests, testing POST/GET/PUT/PATCH/DELETE endpoints, validating response status and body, using Bearer token auth

**Key Features:**
- API test structure in tests/apitests/ with fixtures/apitest.ts
- Bearer token authentication patterns
- Response validation and error testing (400/401/404)
- Unique test data generation for API calls

## Skill Usage Guidelines

### When to Load Skills
**ALWAYS load relevant skills FIRST** using `read_file` tool before generating any test content:
- Multiple skills can be combined when tasks span different domains
- Load skills immediately when user requests involve testing activities
- Never reference skills without actually reading the skill files

### Skill Integration
- **Manual + Automation**: Use manual testing skills to design comprehensive test scenarios, then apply Playwright skills for automation implementation
- **Coverage-Driven**: Use coverage analysis to identify gaps, then apply appropriate skills to fill them
- **Story-Driven**: Start with user story analysis, create manual test cases, then convert to automation

### Quality Standards
All skills enforce strict quality standards:
- **No Locators in Tests**: Tests must only call page object methods
- **Action + Verification**: Every action must be followed by verification
- **Comprehensive Coverage**: Consider functional, platform, user, and integration dimensions
- **Automation-Ready**: Manual tests should be designed for easy automation conversion

## Project Integration

These skills are specifically designed for the Playwright + Page Object Model project structure:
- **Test Organization**: Follows existing project patterns
- **TypeScript Integration**: Leverages project's TypeScript configuration  
- **Data Management**: Integrates with test-data/ directory structure
- **CI/CD Ready**: Supports continuous integration and deployment workflows

Use these skills to maintain consistent, high-quality testing practices across manual testing, automation development, and quality assurance processes.