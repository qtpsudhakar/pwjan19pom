---
name: exploratory-testing-charters
description: Create structured exploratory testing charters and session reports for discovering issues and improving test coverage. Use when: investigating new features, supplementing automated test coverage, finding usability issues, creating ad-hoc test scenarios, documenting exploratory findings for automation.
---

# Exploratory Testing Charters Skill

## When to Use This Skill
- Investigating new or changed functionality before formal test creation
- Supplementing automated test coverage with human insight
- Discovering usability issues and edge cases missed in requirements
- Creating focused exploration sessions with clear objectives
- Converting exploratory findings into structured test cases

## Charter Structure Standards

### Charter Template
```
## Exploratory Testing Charter: [Session Name]
**Date**: [YYYY-MM-DD]
**Tester**: [Name]
**Duration**: [Planned time, e.g., 60 minutes]
**Build/Version**: [Application version]

### Mission
**Explore**: [What area/feature to investigate]
**With**: [Tools, techniques, data to use]  
**To Discover**: [Information, risks, questions to answer]

### Scope
**In Scope**:
- [Specific features or workflows to test]
- [User roles or scenarios to explore]
- [Data types or inputs to try]

**Out of Scope**:
- [Areas to explicitly avoid]
- [Known issues not to re-investigate]

### Test Ideas & Techniques
- [ ] [Specific testing technique or scenario]
- [ ] [Boundary value exploration]
- [ ] [Error condition investigation]
- [ ] [Integration point testing]

### Session Notes
[Real-time observations during testing]

### Findings Summary
**Issues Found**: [Number and brief description]
**Questions Raised**: [Items needing clarification]  
**Test Ideas Generated**: [Future test scenarios identified]
**Coverage Assessment**: [Areas well covered vs gaps found]

### Follow-Up Actions
- [ ] [Bug reports to file]
- [ ] [Test cases to create]
- [ ] [Areas needing deeper investigation]
```

## Testing Techniques and Approaches

### Systematic Exploration Techniques
1. **Feature Tours**
   - Walk through all primary user paths
   - Document workflow variations and shortcuts
   - Note UI/UX issues and inconsistencies

2. **Data Tours**
   - Test with various data types and volumes
   - Explore boundary conditions and edge cases
   - Test with missing, invalid, or corrupted data

3. **Platform Tours**
   - Cross-browser compatibility testing
   - Responsive design verification
   - Performance under different conditions

4. **User Role Tours**
   - Test with different permission levels
   - Verify role-based access controls
   - Explore workflow differences by user type

5. **Integration Tours**
   - Test connections between system components
   - Verify API integrations and data flow
   - Explore third-party service interactions

### Risk-Based Exploration

#### High-Risk Areas to Focus On
- **New Features**: Recently added functionality
- **Changed Features**: Modified workflows or UI
- **Integration Points**: System boundaries and connections
- **Security Boundaries**: Authentication, authorization, data access
- **Performance Bottlenecks**: Heavy processing, large datasets
- **User Pain Points**: Known usability challenges

#### Risk Assessment Questions
- What could go wrong here?
- What would users expect to happen?
- How might this feature be misused?
- What happens under stress or unusual conditions?
- Are there security or privacy concerns?

## Exploration Documentation

### Real-Time Note Taking
During exploration sessions, document:
- **Actions Taken**: What you did step-by-step
- **Observations**: What happened, including unexpected behavior
- **Questions**: Unclear requirements or confusing behavior
- **Ideas**: New test scenarios or automation opportunities
- **Issues**: Potential bugs or improvement suggestions

### Issue Classification
**Severity Levels**:
- **Critical**: System unusable, data loss, security breach
- **High**: Major feature broken, significant usability issue
- **Medium**: Minor feature issue, workaround available
- **Low**: Cosmetic issue, enhancement suggestion

**Issue Types**:
- **Functional**: Feature not working as expected
- **Usability**: Confusing or difficult user experience
- **Performance**: Slow response or resource usage
- **Compatibility**: Browser, device, or platform issues
- **Security**: Potential vulnerability or data exposure

## Converting Findings to Test Cases

### From Exploration to Automation
1. **Identify Repeatable Scenarios**
   - Steps that can be consistently reproduced
   - Clear pass/fail criteria without human judgment
   - Stable UI elements and workflows

2. **Document Automation Requirements**
   - Page objects needed for new workflows
   - Test data requirements and setup
   - Expected results that can be programmatically verified

3. **Create Structured Test Cases**
   - Follow Manual Test Case Design skill format
   - Include preconditions discovered during exploration
   - Add edge cases and error conditions found

### Test Coverage Analysis
After exploration sessions:
- **Coverage Gaps**: What areas need more testing?
- **Automation Opportunities**: What can be reliably automated?
- **Manual Only Scenarios**: What requires human judgment?
- **Risk Mitigation**: What high-risk areas need regular testing?

## Session Planning and Management

### Charter Planning
Before starting exploration:
1. **Define Clear Mission**: Specific goals for the session
2. **Set Time Boundaries**: Focused sessions (30-90 minutes typically)
3. **Prepare Test Data**: Realistic data for various scenarios
4. **Plan Documentation**: How to capture findings efficiently

### Session Execution Tips
- **Stay Focused**: Follow the charter mission but note interesting tangents
- **Document in Real-Time**: Don't rely on memory for important findings
- **Take Screenshots**: Visual evidence of issues or interesting behavior
- **Note Reproduction Steps**: Detailed steps for any issues found

### Post-Session Activities
1. **Summarize Findings**: Clear summary of what was discovered
2. **File Bug Reports**: Formal documentation of issues found
3. **Create Test Cases**: Convert exploration scenarios to formal tests
4. **Plan Follow-Up**: Determine next exploration areas or deeper investigation needs

## Integration with Playwright Project

### Page Object Implications
Document during exploration:
- **New Page Elements**: Selectors and interactions needed
- **Workflow Patterns**: Common user paths for automation
- **Assertion Points**: Where verification should occur in automation

### Test Data Insights
From exploration, identify:
- **Data Variations**: Different input types and formats to test
- **Edge Cases**: Boundary conditions and error scenarios
- **User Personas**: Different user types and their data needs

### Automation Readiness Assessment
For each workflow explored, evaluate:
- **Stability**: Are UI elements and behaviors consistent?
- **Determinism**: Do actions produce predictable results?
- **Complexity**: Can the scenario be reliably automated?

This skill ensures exploratory testing is structured, productive, and generates actionable insights for both immediate issue resolution and long-term test automation strategy.