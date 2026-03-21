---
name: user-story-analysis
description: Analyze user stories and requirements to extract comprehensive test scenarios, acceptance criteria, and edge cases. Use when: converting user stories to test cases, reviewing requirements for testability, identifying missing acceptance criteria, planning test coverage for new features.
---

# User Story Analysis for Testing Skill

## When to Use This Skill
- Converting user stories into comprehensive test scenarios
- Reviewing requirements for testability and completeness
- Identifying missing or ambiguous acceptance criteria
- Planning test coverage during sprint planning or feature design
- Extracting edge cases and error scenarios from user stories

## User Story Analysis Framework

### Story Structure Review
Analyze each user story component:

```
**As a** [user type/persona]
**I want** [functionality/feature]  
**So that** [business value/benefit]

**Acceptance Criteria:**
- [Specific, testable conditions]
- [Clear pass/fail criteria]
- [Edge cases and constraints]

**Definition of Done:**
- [Technical requirements]
- [Quality standards]
- [Testing requirements]
```

### Analysis Template
```
## User Story Analysis: [Story Title]

### Story Details
**Story ID**: US-[Number]
**Epic**: [Parent Epic Name]
**Priority**: [High/Medium/Low]
**Story Points**: [Estimate]

**User Story**:
As a [persona], I want [functionality] so that [benefit].

### Testability Assessment
**Clarity Score**: [1-5] - How clearly is the requirement defined?
**Testability Score**: [1-5] - How easily can this be tested?
**Completeness Score**: [1-5] - How complete are the acceptance criteria?

### Acceptance Criteria Analysis
| Criteria | Clear? | Testable? | Test Scenarios Needed |
|----------|--------|-----------|----------------------|
| AC-1: User can login with email | ✅ Yes | ✅ Yes | Valid login, invalid email, wrong password |
| AC-2: System remembers preferences | ⚠️ Vague | ❌ No | Need specifics on what preferences |

### Test Scenario Generation
#### Happy Path Scenarios
1. **Primary Success Path**
   - [Main user workflow from start to finish]
   - [Expected system behavior and user experience]

#### Alternative Path Scenarios  
2. **Alternative Valid Paths**
   - [Different ways to achieve the same goal]
   - [Optional steps or different user choices]

#### Error/Edge Case Scenarios
3. **Error Handling**
   - [Invalid inputs and system responses]
   - [Network/system failures]
   - [Permission/authorization issues]

4. **Boundary Conditions**
   - [Minimum/maximum values]
   - [Empty/null inputs]
   - [Special characters and formats]

### Questions for Clarification
- [ ] [Specific technical questions about implementation]
- [ ] [Business rule clarifications needed]
- [ ] [Integration or dependency questions]
```

## Requirements Analysis Techniques

### Acceptance Criteria Evaluation
**Well-Written Criteria Should Be**:
- **Specific**: Clear, unambiguous language
- **Measurable**: Observable pass/fail conditions
- **Achievable**: Technically feasible
- **Relevant**: Directly related to user story
- **Time-bound**: Clear definition of when it's complete

### SMART Criteria Conversion
Transform vague requirements into SMART acceptance criteria:

❌ **Vague**: "System should be fast"
✅ **SMART**: "Login page loads within 2 seconds on standard network connection"

❌ **Vague**: "Users can manage their accounts"  
✅ **SMART**: "Users can update email, change password, and delete account with confirmation"

### Story Refinement Questions
**Functional Questions**:
- What exactly should happen when [specific action]?
- How should the system respond to [error condition]?
- What are the validation rules for [input field]?
- What permissions are required for [action]?

**Technical Questions**:
- What browsers/devices must be supported?
- Are there performance requirements?  
- What happens if external services are unavailable?
- How should data be persisted/validated?

**User Experience Questions**:
- How should errors be displayed to users?
- What feedback should users get for [action]?
- How should the feature work on mobile devices?
- Are there accessibility requirements?

## Test Scenario Extraction

### Scenario Categories
1. **Primary Workflows** - Main user paths through the feature
2. **Alternative Workflows** - Different ways to accomplish the goal  
3. **Error Scenarios** - Invalid inputs, failures, edge cases
4. **Integration Scenarios** - Interaction with other system components
5. **Security Scenarios** - Authorization, data protection, access control
6. **Performance Scenarios** - Load, speed, resource usage requirements

### Scenario Documentation Template
```
### Test Scenario: [Descriptive Name]
**Type**: Happy Path / Alternative / Error / Integration / Security / Performance
**Priority**: Critical / High / Medium / Low
**User Role**: [Who performs this scenario]

**Preconditions**:
- [Required system state]
- [User permissions needed]
- [Test data setup required]

**Steps**:
1. [User action with specific details]
2. [System response expected]
3. [Next user action]

**Expected Results**:
- [Observable outcomes]
- [System state changes]
- [User feedback provided]

**Automation Notes**:
- [Page objects needed]
- [Test data requirements]
- [Special considerations]
```

## Edge Case Identification

### Systematic Edge Case Analysis
**Input Validation Edge Cases**:
- Empty/null values
- Minimum/maximum length boundaries  
- Special characters and Unicode
- SQL injection and XSS attempts
- File upload types and sizes

**Workflow Edge Cases**:
- Incomplete workflows (user abandons process)
- Concurrent user actions (race conditions)
- Session timeout during operations
- Browser back/forward button usage
- Direct URL access to protected pages

**Data Edge Cases**:
- Large datasets (pagination, performance)
- Missing required data
- Duplicate data handling
- Data format variations
- Legacy data compatibility

### Risk-Based Scenario Prioritization
**High Risk**: 
- Security-sensitive operations
- Payment/financial transactions
- Data modification/deletion
- Integration with external systems

**Medium Risk**:
- User account management  
- Search and filtering
- Notification systems
- Reporting features

**Low Risk**:
- Cosmetic UI elements
- Help/documentation  
- Optional user preferences
- Enhanced user experience features

## Integration Analysis

### Dependency Mapping
Identify integration points that need testing:
- **Internal APIs**: Other microservices or system components
- **External APIs**: Third-party services, payment gateways
- **Database Operations**: Data creation, updates, queries
- **File Systems**: Uploads, downloads, file processing
- **Authentication Systems**: SSO, OAuth, user directories

### Integration Test Scenarios
```
### Integration Point: Payment Processing
**Systems Involved**: Order Service ↔ Payment Gateway ↔ Email Service

**Success Scenarios**:
- Valid payment processed → Order confirmed → Confirmation email sent
- Multiple payment methods → User selects preferred → Transaction completes

**Failure Scenarios**:
- Payment gateway timeout → User notified → Order remains pending
- Invalid payment method → Error displayed → User can retry
- Email service down → Payment succeeds → Manual email follow-up

**Boundary Conditions**:
- Minimum/maximum payment amounts
- International payment methods
- Concurrent payment attempts
```

## Review and Validation Process

### Story Readiness Checklist
Before development begins:
- [ ] All acceptance criteria are specific and testable
- [ ] Edge cases and error scenarios are identified
- [ ] Integration points are documented
- [ ] Test data requirements are defined
- [ ] Definition of done includes testing requirements

### Collaborative Review Process
1. **Three Amigos Sessions**: Developer, Tester, Product Owner review together
2. **Acceptance Criteria Refinement**: Clarify vague or missing criteria
3. **Test Scenario Review**: Ensure comprehensive coverage planned
4. **Technical Constraint Discussion**: Identify technical testing challenges

## Integration with Playwright Project

### Automation Planning from Stories
For each user story:
1. **Page Object Requirements**: Which page classes need updates or creation
2. **Test Data Needs**: What data scenarios must be supported  
3. **Assertion Strategy**: How to verify acceptance criteria programmatically
4. **Test Structure**: How to organize tests by user workflow

### Story-Driven Test Organization
```typescript
// Organize tests by user story for traceability
describe('US-123: User Login Management', () => {
  describe('AC-1: Email Login', () => {
    test('should login with valid credentials', async ({ loginPage }) => {
      // Test implementation
    });
    
    test('should reject invalid email format', async ({ loginPage }) => {
      // Test implementation  
    });
  });
  
  describe('AC-2: Password Requirements', () => {
    // Related test cases
  });
});
```

This skill ensures user stories are thoroughly analyzed to produce comprehensive, well-organized test scenarios that provide complete coverage and can be efficiently converted to automated tests.