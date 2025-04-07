# Frontend Standup Guide

## Overview
This guide outlines the standardized process for frontend standup reporting in the Recursive Learning platform. Maintaining consistent documentation helps with backend integration, progress tracking, and ensures critical issues are communicated effectively.

## Standup Report Format

### Basic Template Structure
```markdown
# Frontend Standup Report - [DATE] - [SEQUENCE]

## Team Member(s)
- [Your Name]

## Overview
[Brief 1-2 sentence summary of the report's key points]

## Accomplishments
- [List major tasks completed with specific file paths or PRs]

## Current Work
- [List what you're actively working on with expected completion timeline]

## Blockers
- [List any issues blocking progress with specific error details]

## Integration Notes
- [Any notes about backend integration points]
- [API endpoint requirements]
- [Authentication details]

## Next Steps
- [List planned next actions with priorities]
```

### Required Sections for Detailed Reports
For integration-focused reports, include these additional sections:

```markdown
## Technical Implementation Details
- [Specific implementation aspects that affect the backend]
- [Data structures you're sending/receiving]
- [Authentication approaches used]

## API Requirements
- [Specific endpoints needed]
- [Required headers]
- [Expected response formats]

## External Integration Points
- [Airtable integration details]
- [Softr embedding requirements]
- [Other third-party services]

## Testing Steps
- [How to verify the implementation works]
- [Expected outcomes]

## Documentation Changes
- [Updates needed to existing docs]
- [New documentation created]
```

## Report Naming and Location

### File Location
- All frontend standup reports should be saved to: `/shared/docs/standup-reports/`

### Naming Convention
- Use the strict format: `[month]-[day]-frontend-standup-[sequence].mdc`
- Example: `april-7-frontend-standup-01.mdc`
- Sequence numbers should increment (01, 02, 03) for multiple reports on the same day

## Reporting Process and Schedule

1. **Daily Reporting Requirement**
   - At least one standup report must be filed per active development day
   - Reports should be filed by 5:00 PM EST or before ending work for the day

2. **Integration-Focused Reports**
   - Additional reports must be filed when:
     - Starting work on a backend integration
     - Encountering integration issues
     - Completing an integration milestone

3. **Report Writing Guidelines**
   - Be specific and include exact file paths
   - Include error messages and screenshots for issues
   - Reference related documentation or backend resources
   - Always include next steps, even if blocked

4. **Submission Process**
   - Commit report to the repository
   - Push to the current branch
   - When Airtable integration is functional, publish through API

## Integration Focus Areas

When documenting backend integration issues, always include:

1. **Authentication Context**
   - Current authentication method being used
   - Token handling approach
   - Any CORS or cross-origin issues

2. **API Connectivity Details**
   - Exact endpoint URLs being accessed
   - HTTP methods being used
   - Request/response headers
   - Request body format

3. **Error Diagnostics**
   - Exact error messages
   - HTTP status codes
   - Network request logs
   - Browser console output for client-side errors

4. **User Context**
   - User role/permissions being tested
   - Session state information
   - Field mapping issues (e.g., inconsistent naming)

## Airtable Publishing Process

When the Airtable integration is operational:

1. Create your report file following this guide
2. Ensure all required sections are completed
3. Use the standup report publisher to submit:
   ```javascript
   import { publishStandupReport } from '../assets/js/standup-report-publisher.js';
   
   publishStandupReport({
     filePath: '/shared/docs/standup-reports/april-7-frontend-standup-01.mdc',
     tags: ['frontend', 'authentication', 'integration']
   });
   ```
4. Verify submission using the query tool
5. Add report link to any related GitHub issues

## Related Documentation
- Backend integration documentation: `/shared/docs/backend-integration-checklist.mdc`
- Airtable setup documentation: `/shared/docs/airtable_setup.mdc`
- API client documentation: `/shared/docs/cross-domain-auth.mdc`
- Example reports in `/shared/docs/standup-reports/`

## Backend Team Alignment
This guide and template align with the backend team's requirements as specified in:
https://github.com/IntegralEd/rl-restapi-lambda/blob/main/docs/frontend_standup_guide.md

Always check for template updates at:
https://github.com/IntegralEd/rl-restapi-lambda/blob/main/docs/standup_reports/TEMPLATE_frontend.md 