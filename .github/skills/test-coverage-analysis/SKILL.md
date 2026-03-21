---
name: test-coverage-analysis
description: Analyze test coverage gaps, create coverage matrices, and ensure comprehensive testing across features, user journeys, and risk areas. Use when: evaluating test completeness, identifying untested scenarios, planning test automation priorities, conducting coverage reviews for releases.
---

# Test Coverage Analysis Skill

## When to Use This Skill
- Evaluating completeness of test suites before releases
- Identifying gaps in manual and automated test coverage
- Planning test automation priorities based on risk and coverage analysis
- Creating coverage matrices for complex features or user workflows
- Conducting coverage reviews for new features or changed functionality

## Coverage Analysis Framework

### Coverage Dimensions Matrix
Create comprehensive coverage by analyzing multiple dimensions:

| Dimension | Coverage Areas | Examples |
|-----------|---------------|----------|
| **Functional** | Features, workflows, business rules | Login, checkout, user management |
| **Data** | Input types, boundaries, volumes | Valid/invalid inputs, edge cases |
| **Platform** | Browsers, devices, OS | Chrome, Safari, mobile, desktop |
| **User** | Roles, permissions, personas | Admin, customer, guest |
| **Integration** | APIs, third-party services | Payment gateways, email services |
| **Performance** | Load, stress, endurance | Peak usage, large datasets |
| **Security** | Authentication, authorization | Role-based access, data protection |
| **Usability** | User experience, accessibility | Screen readers, keyboard navigation |

### Coverage Analysis Template
```
## Test Coverage Analysis: [Feature/Release Name]

### Analysis Overview
- **Analysis Date**: [YYYY-MM-DD]
- **Analyst**: [Name]
- **Scope**: [What is being analyzed]
- **Analysis Method**: [Requirements-based, Risk-based, etc.]

### Requirements Coverage
| Requirement ID | Description | Test Cases | Coverage Status | Risk Level |
|----------------|-------------|------------|-----------------|------------|
| REQ-001 | User login functionality | TC_001, TC_002, TC_003 | ✅ Complete | High |
| REQ-002 | Password reset flow | TC_004, TC_005 | ⚠️ Partial | Medium |
| REQ-003 | Two-factor authentication | None | ❌ Missing | High |

### Coverage Metrics
- **Functional Coverage**: 85% (17/20 requirements covered)
- **Platform Coverage**: 75% (3/4 browsers tested) 
- **User Role Coverage**: 60% (3/5 roles tested)
- **Integration Coverage**: 40% (2/5 integrations tested)

### Coverage Gaps Identified
#### High Priority Gaps
- [ ] Two-factor authentication workflows (REQ-003)
- [ ] Admin role specific functionality (USER-ADMIN)
- [ ] Safari browser compatibility (PLATFORM-SAFARI)

#### Medium Priority Gaps  
- [ ] Password reset edge cases (REQ-002)
- [ ] Mobile responsive design testing (PLATFORM-MOBILE)

#### Low Priority Gaps
- [ ] Performance under high load (PERF-LOAD)
- [ ] Accessibility compliance testing (ACCESS-WCAG)

### Recommended Actions
1. **Immediate**: Create test cases for high-priority gaps
2. **Next Sprint**: Address medium-priority coverage gaps
3. **Future Planning**: Incorporate low-priority items in test automation roadmap
```

## Coverage Analysis Techniques

### Requirements-Based Coverage
1. **Requirements Traceability**
   - Map each requirement to specific test cases
   - Identify requirements without corresponding tests
   - Verify test cases align with acceptance criteria

2. **User Story Coverage**
   - Ensure all acceptance criteria are tested
   - Test alternative flows and exception scenarios
   - Verify integration points between stories

### Risk-Based Coverage
1. **Risk Assessment Matrix**
   | Risk Factor | Impact | Probability | Priority | Coverage Needed |
   |-------------|---------|-------------|----------|-----------------|
   | Payment failure | High | Medium | High | Comprehensive |
   | UI responsiveness | Low | Low | Low | Basic |
   | Data corruption | High | Low | Medium | Focused |

2. **Risk Categories**
   - **Business Critical**: Core revenue/user flows
   - **Security Sensitive**: Authentication, data protection
   - **Integration Dependent**: Third-party services, APIs
   - **User Experience**: Usability, performance, accessibility
   - **Regulatory**: Compliance, data privacy requirements

### User Journey Coverage
1. **End-to-End Workflows**
   - Map complete user journeys from start to finish
   - Identify all possible paths through workflows
   - Test happy paths, alternative paths, and error scenarios

2. **User Persona Coverage**
   ```
   ### User Persona: Customer
   **Primary Journeys**:
   - [ ] Account registration → Email verification → First purchase
   - [ ] Browse products → Add to cart → Checkout → Payment
   - [ ] View order history → Return item → Refund process
   
   **Edge Case Journeys**:
   - [ ] Abandoned cart recovery → Return to complete purchase
   - [ ] Multiple payment method failures → Successful alternative payment
   ```

## Coverage Metrics and Measurement

### Quantitative Metrics
1. **Requirements Coverage**: `(Tested Requirements / Total Requirements) × 100`
2. **Code Coverage**: Percentage of code executed by tests (for automation)
3. **Platform Coverage**: `(Tested Platforms / Target Platforms) × 100`
4. **User Role Coverage**: `(Tested Roles / Total Roles) × 100`

### Qualitative Assessment
- **Depth of Testing**: Are edge cases and error scenarios covered?
- **Test Quality**: Are test cases realistic and comprehensive?
- **Automation Readiness**: Can manual tests be reliably automated?
- **Maintenance Burden**: Are tests sustainable and maintainable?

### Coverage Reporting
```
### Weekly Coverage Report
**Date**: Week of [Date]
**Overall Coverage**: 78% (Target: 85%)

**Progress This Week**:
- ✅ Added API integration tests (+5% coverage)
- ✅ Completed mobile browser testing (+3% coverage)
- ⚠️ Outstanding: Security testing scenarios

**Next Week Priorities**:
1. Authentication/authorization test scenarios
2. Error handling edge cases
3. Performance baseline establishment

**Blockers**:
- Waiting for test environment access for security testing
```

## Gap Analysis and Prioritization

### Coverage Gap Categories
1. **Critical Gaps**: High-risk areas with no testing
2. **Partial Coverage**: Areas with insufficient test scenarios
3. **Platform Gaps**: Missing browser/device coverage
4. **Automation Gaps**: Manual-only testing of automatable scenarios

### Gap Prioritization Matrix
| Gap Type | Business Impact | Technical Risk | Test Effort | Priority |
|----------|----------------|----------------|-------------|----------|
| Payment API failure handling | High | High | Medium | P1 |
| Mobile responsive layout | Medium | Low | High | P3 |
| Admin dashboard edge cases | Low | Medium | Low | P2 |

### Action Planning
For each identified gap:
1. **Root Cause**: Why was this area not covered?
2. **Coverage Plan**: What testing is needed?
3. **Resource Requirements**: Time, tools, expertise needed
4. **Timeline**: When will coverage be implemented?
5. **Success Criteria**: How will adequate coverage be measured?

## Integration with Playwright Project

### Automation Coverage Analysis
1. **Automated vs Manual Coverage**
   - Identify scenarios suitable for automation
   - Plan conversion of manual tests to Playwright tests
   - Maintain appropriate balance of automated and exploratory testing

2. **Page Object Coverage**
   - Ensure all page objects have comprehensive test coverage
   - Identify missing page methods needed for full coverage
   - Plan test data requirements for various scenarios

3. **CI/CD Integration**
   - Determine which tests should run in different pipeline stages
   - Plan smoke, regression, and full test suite coverage
   - Establish coverage gates for deployment decisions

### Coverage-Driven Test Planning
Use coverage analysis to:
- Prioritize new test case creation
- Plan test automation roadmap
- Identify areas needing exploratory testing
- Guide resource allocation for testing activities

## Quality Gates and Review Process

### Coverage Review Checklist
- [ ] All critical user journeys are tested
- [ ] High-risk areas have comprehensive coverage
- [ ] Integration points are adequately tested
- [ ] Error scenarios and edge cases are included
- [ ] Platform and browser coverage meets requirements
- [ ] Security and performance aspects are addressed

### Regular Coverage Reviews
- **Sprint Planning**: Review coverage for new features
- **Release Preparation**: Comprehensive coverage analysis
- **Post-Release**: Assess coverage effectiveness and gaps
- **Quarterly**: Strategic coverage planning and improvement

This skill ensures systematic, thorough analysis of test coverage to identify gaps, prioritize testing efforts, and maintain high-quality software delivery through comprehensive testing strategies.