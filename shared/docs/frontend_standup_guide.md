# Frontend Standup Guide

## Overview
This guide outlines the recommended process for frontend standup reporting in the Recursive Learning platform. Standup reports help maintain alignment between frontend and backend teams, document progress, and ensure efficient resolution of integration issues.

## Standup Report Format

### Basic Template
```markdown
# Frontend Standup Report - [DATE] - [SEQUENCE]

## Team Member(s)
- [Your Name]

## Accomplishments
- [List major tasks completed]

## Current Work
- [List what you're currently working on]

## Blockers
- [List any issues blocking progress]

## Integration Notes
- [Any notes about integration with backend/Airtable/Softr]

## Next Steps
- [List planned next actions]
```

### Extended Version (For Complex Reports)
For more detailed reports, include these sections:

```markdown
## Technical Details
- [Relevant implementation details]

## Data Requirements
- [Data structures or API needs]

## Resource Requirements
- [Additional resources needed]

## Screenshots/Demos
- [Links to visual references]
```

## Reporting Process

1. **Create Report File**
   - Create a new file in `/shared/docs/standup-reports/`
   - Use naming convention: `[date]-frontend-standup-[sequence].mdc`
   - Example: `april-8-frontend-standup-01.mdc`

2. **Write Report Content**
   - Fill out all relevant sections
   - Be specific about integration points
   - Document any auth/API issues

3. **Include Diagnostic Information**
   - For auth/API issues, include console logs
   - Reference specific file paths when discussing code
   - Link to relevant docs or backend endpoints

4. **Push to Repository**
   - Commit with clear message
   - Example: `git commit -m "Add frontend standup report for April 8"`

5. **Publish to Airtable** (When Available)
   - Use the standup report publisher module
   - Tag relevant team members for visibility

## Integration Focus Areas

For Softr and admin integration specifically, always include:

1. **Authentication Status**
   - Document any auth issues with Softr
   - Check bracket notation usage for accessing user data
   - Verify field mapping (e.g., `First Name` vs `Name`)

2. **API Connectivity**
   - Test connection to backend endpoints
   - Document any CORS or permission issues
   - Verify correct header usage

3. **Airtable Integration**
   - Check data flow to/from Airtable
   - Document any field mapping issues
   - Verify permissions for write operations

## Tools and Resources

- **Diagnostic Tools**
  - Browser Console for auth/API debugging
  - Network tab for checking request headers
  - Application tab for localStorage inspection

- **Documentation Resources**
  - `/shared/docs/softr-integration-rules.mdc`
  - `/shared/docs/airtable_setup.mdc`
  - `/shared/docs/cross-domain-auth.mdc`
  - Backend API documentation

## Example Reports

See the following for examples:
- `/shared/docs/standup-reports/april-7-frontend-standup-01.mdc`
- `/shared/docs/standup-reports/april-6-frontend-standup-03.mdc`

## Publishing to Airtable

When the Airtable integration is functioning:

1. Create your report using this guide
2. Use the standup report publisher to submit
3. Include proper tags for the report type
4. Verify submission with the query tool

For temporary issues with Airtable integration, document the issue and use direct repository commits until resolved. 