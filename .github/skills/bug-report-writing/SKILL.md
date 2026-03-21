---
name: bug-report-writing
description: Write detailed, actionable bug reports that enable fast reproduction and resolution. Use when: documenting defects found during testing, reporting issues from exploratory sessions, creating regression test scenarios from fixed bugs, communicating issues to development teams.
---

# Bug Report Writing Skill

## When to Use This Skill
- Documenting defects found during manual or exploratory testing
- Converting unclear issue descriptions into actionable bug reports
- Creating detailed reproduction steps for development teams
- Establishing bug reports that can become regression test cases
- Communicating issues effectively across technical and non-technical stakeholders

## Bug Report Structure Standards

### Essential Components
Every bug report must include:
1. **Bug ID**: Unique identifier (if using bug tracking system)
2. **Summary**: Clear, concise title describing the issue (one line)
3. **Environment**: Browser, OS, application version, test environment
4. **Severity/Priority**: Business impact and urgency classification  
5. **Steps to Reproduce**: Detailed, numbered steps
6. **Expected Result**: What should happen
7. **Actual Result**: What actually happens
8. **Evidence**: Screenshots, videos, logs, error messages
9. **Workaround**: Temporary solution if available

### Bug Report Template
```
## Bug Report: [Clear, specific title]

### Summary
[One-sentence description of the issue]

### Environment
- **Browser**: Chrome 130.0.6723.92 (or specific browser/version)
- **OS**: Windows 11 / macOS Sonoma / Ubuntu 22.04
- **Application Version**: v2.3.1
- **Test Environment**: Staging / Production / Local
- **Screen Resolution**: 1920x1080 (if UI-related)
- **User Role**: Admin / Standard User / Guest

### Severity & Priority
- **Severity**: Critical / High / Medium / Low
- **Priority**: P1 / P2 / P3 / P4

### Steps to Reproduce
1. [Specific action with exact values]
2. [Next action with any required data]
3. [Continue with precise steps]
4. [Include timing if relevant]

### Expected Result
[What should happen according to requirements]

### Actual Result  
[What actually happens, be specific]

### Evidence
- Screenshots: [Attach or link to images]
- Error Messages: [Exact text of any errors]
- Console Logs: [Browser console errors if applicable]
- Network Issues: [Failed requests if relevant]

### Additional Information
- **Reproducibility**: Always / Sometimes / Once
- **Workaround**: [Temporary solution if available]
- **Impact**: [Business or user impact description]
- **Related Issues**: [Links to similar bugs if applicable]

### Test Data Used
- Input Values: [Specific data that caused the issue]
- File Uploads: [File types, sizes, formats used]
- User Accounts: [Test accounts or roles used]
```

## Severity and Priority Guidelines

### Severity Classifications
**Critical**: 
- System crash, data corruption, security breach
- Core functionality completely broken
- Prevents users from completing primary workflows

**High**:
- Major feature not working as designed
- Significant loss of functionality
- Serious usability issues affecting many users

**Medium**:
- Minor feature issues with workarounds available
- Non-critical functionality affected
- Cosmetic issues in important areas

**Low**:
- Minor cosmetic issues
- Enhancement suggestions
- Issues in rarely-used features

### Priority Classifications
**P1 (Immediate)**: Fix before next release
**P2 (High)**: Fix in current sprint/iteration  
**P3 (Medium)**: Fix in next sprint/iteration
**P4 (Low)**: Fix when time permits

## Effective Reproduction Steps

### Writing Clear Steps
- **Use Active Voice**: "Click Save button" not "Save button is clicked"
- **Be Specific**: Include exact field names, button labels, menu options
- **Include Data**: Specify input values, file names, selection options
- **One Action Per Step**: Don't combine multiple actions
- **Include Timing**: Note if delays or specific timing is required

### Example: Poor vs Good Steps
❌ **Poor Steps**:
1. Go to login page
2. Enter credentials  
3. Login fails

✅ **Good Steps**:
1. Navigate to https://app.example.com/login
2. Enter "testuser@example.com" in Email field
3. Enter "password123" in Password field
4. Click "Login" button
5. Observe the error message displayed

### Data Requirements
Include in steps:
- **Exact Input Values**: Don't use "some text" 
- **File Details**: File names, types, sizes for uploads
- **Selection Values**: Specific dropdown/radio button choices
- **User Credentials**: Test account details (if safe to share)

## Evidence Collection

### Screenshot Best Practices
- **Capture Full Context**: Include relevant UI elements and browser chrome
- **Highlight Issues**: Use arrows or callouts to point out problems
- **Before/After**: Show expected state vs error state when possible
- **Multiple Views**: Different screen sizes if responsive issue

### Error Message Documentation
- **Exact Text**: Copy/paste exact error messages
- **Error Codes**: Include any error codes or reference numbers
- **Browser Console**: Check for JavaScript errors in console
- **Network Tab**: Note failed requests or unusual responses

### Video/Animation for Complex Issues
Create screen recordings for:
- Multi-step workflows with timing issues
- Animation or transition problems  
- Issues that are hard to capture in static screenshots
- Intermittent problems that require multiple attempts

## Bug Analysis and Categorization

### Root Cause Analysis Questions
- Is this a new feature regression or existing functionality?
- Does the issue occur in all browsers/environments?
- Is this related to specific user permissions or data?
- Are there patterns in when/where the issue occurs?

### Issue Categories
**Functional Issues**:
- Features not working according to specifications
- Business logic errors
- Calculation or data processing problems

**UI/UX Issues**:
- Layout problems, responsiveness issues
- Confusing user interface elements
- Accessibility problems

**Performance Issues**:
- Slow loading times, timeouts
- Memory leaks, resource usage
- Scalability problems

**Security Issues**:
- Authentication/authorization failures
- Data exposure or privacy concerns
- Input validation problems

## Integration with Testing Process

### Converting Bugs to Test Cases
After bug fixes:
1. **Create Regression Test**: Ensure fixed bug doesn't reoccur
2. **Expand Test Coverage**: Test related scenarios and edge cases
3. **Update Automation**: Add automated test for regression prevention

### Bug Triage Information
Include details to help triage:
- **User Impact**: How many users affected?
- **Business Impact**: What business processes are disrupted?
- **Frequency**: How often does this occur?
- **Blocking**: Does this prevent other testing or development?

## Quality Gates for Bug Reports

### Before Submitting, Verify:
- [ ] Issue is consistently reproducible
- [ ] Steps are clear and complete
- [ ] Expected vs actual results are documented
- [ ] Appropriate evidence is attached
- [ ] Severity and priority are accurate
- [ ] Similar existing bugs are noted or ruled out

### Follow-Up Responsibilities
- **Clarification**: Respond promptly to developer questions
- **Verification**: Test fixes when available
- **Regression**: Confirm fixes don't break other functionality
- **Documentation**: Update test cases based on resolution

## Integration with Playwright Project

### Automation Considerations
When writing bug reports, consider:
- **Test Case Creation**: How this bug becomes a regression test
- **Page Object Updates**: What page methods might need adjustment  
- **Test Data**: What test data scenarios should be added
- **Assertion Needs**: What verification points should be automated

This skill ensures bug reports are actionable, complete, and contribute to improved test coverage and quality assurance processes.