---
name: manual-test-case-design
description: Design comprehensive test cases from user stories, requirements, and manual testing scenarios. Use when: converting manual test scenarios to structured test cases, analyzing requirements for test coverage, creating test case templates, preparing test cases for automation conversion, designing data-driven test scenarios.
---

# Manual Test Case Design Skill

## When to Use This Skill
- Converting manual test scenarios into structured, automatable test cases
- Analyzing user stories and requirements for comprehensive test coverage
- Creating test cases that can be easily converted to Playwright automation
- Designing data-driven test scenarios with clear preconditions and expected results
- Reviewing existing manual tests for automation readiness

## Test Case Structure Standards

### Required Components
Every test case must include:
1. **Test Case ID**: Unique identifier following pattern: `TC_[Component]_[Action]_[ExpectedResult]_[Number]`
2. **Title**: Clear, action-oriented description (3-8 words)
3. **Preconditions**: System state required before test execution
4. **Test Steps**: Numbered, specific actions using active voice
5. **Expected Results**: Observable, measurable outcomes for each step
6. **Test Data**: Input values, file uploads, selection options
7. **Priority**: Critical, High, Medium, Low
8. **Tags**: Component, smoke, regression, etc.

### Test Case Template
```
## Test Case: [Title]
**ID**: TC_[Component]_[Action]_[Result]_[Number]
**Priority**: [Critical/High/Medium/Low]
**Tags**: [component], [test-type], [feature]

### Preconditions
- [System state requirements]
- [User permissions required]
- [Test data setup needed]

### Test Steps
1. **Action**: [Specific user action]
   **Expected**: [Observable result]
   **Test Data**: [Input values if needed]

2. **Action**: [Next user action]
   **Expected**: [Observable result]

### Postconditions
- [System state after test]
- [Cleanup requirements]

### Automation Notes
- [Page objects needed]
- [Special considerations]
```

## Test Coverage Analysis

### Functional Coverage Checklist
- [ ] **Happy Path**: Primary user workflows
- [ ] **Edge Cases**: Boundary values, empty inputs, maximum lengths  
- [ ] **Error Handling**: Invalid inputs, network errors, permission failures
- [ ] **Integration Points**: API calls, database operations, third-party services
- [ ] **UI/UX**: Visual elements, responsive design, accessibility
- [ ] **Performance**: Load times, concurrent users, large datasets

### Coverage Categories
1. **Smoke Tests** - Core functionality verification
2. **Regression Tests** - Existing functionality protection  
3. **User Acceptance** - Business workflow validation
4. **Security Tests** - Authentication, authorization, data protection
5. **Compatibility Tests** - Browsers, devices, operating systems

## Data-Driven Test Design

### Test Data Patterns
- **Boundary Values**: Min, max, just inside/outside limits
- **Equivalence Classes**: Valid and invalid data groupings  
- **Special Characters**: Unicode, SQL injection, XSS attempts
- **File Types**: Valid formats, invalid extensions, corrupted files
- **User Roles**: Different permission levels and access rights

### Data Management Rules
- Use realistic but anonymized data
- Create reusable datasets for common scenarios
- Document data dependencies between test cases
- Plan for data cleanup and isolation
- Consider data privacy and compliance requirements

## Requirements Analysis for Testing

### Requirement Review Process
1. **Acceptance Criteria Analysis**
   - Extract testable conditions from user stories
   - Identify implicit requirements and assumptions
   - Note integration points with existing features

2. **Risk Assessment**
   - Business impact of feature failure
   - Technical complexity and dependencies
   - User workflow criticality

3. **Test Strategy Decisions**
   - Which tests need automation vs manual execution
   - Performance and security testing requirements
   - Browser and device coverage needs

## Automation Conversion Guidelines

### Automation-Ready Test Cases
- Clear, unambiguous steps that don't require human judgment
- Deterministic expected results that can be programmatically verified
- Minimal dependency on visual validation (unless testing UI/UX specifically)
- Stable selectors and elements (avoid testing volatile UI elements)

### Page Object Mapping
When designing test cases, consider:
- Which page objects will be needed
- What new page methods might be required
- How to structure assertions for reliable automation
- Data setup and teardown requirements

### Manual vs Automated Decision Matrix
**Automate When**:
- Repetitive, high-volume execution needed
- Regression testing for stable features  
- Data-driven scenarios with multiple inputs
- API or backend functionality testing

**Keep Manual When**:
- Exploratory testing and usability evaluation
- One-time or infrequent test scenarios
- Complex visual validation requiring human judgment
- Early feature testing with unstable UI

## Quality Gates

### Test Case Review Criteria
- [ ] Steps are specific and actionable
- [ ] Expected results are measurable and observable
- [ ] Test data is realistic and covers important scenarios
- [ ] Preconditions are clearly defined and achievable
- [ ] Test case can be executed independently
- [ ] Automation feasibility is assessed and documented

## Integration with Playwright Project

### Page Object Requirements
For each test case, identify:
- Which page classes need new methods
- What locators and interactions are required
- How to structure assertions using AssertHelpers
- WebHelpers methods needed for complex interactions

### Test Data Integration
- Map test data to JSON files in test-data/ directory
- Plan for parameterized test execution
- Consider data-driven test patterns for multiple scenarios

This skill ensures manual testing produces automation-ready test cases that follow your project's Page Object Model patterns and maintain high quality standards.