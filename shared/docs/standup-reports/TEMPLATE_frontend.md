# Frontend Standup Report Template

## Webhook Submission Method

Use this curl command to submit your report:

```bash
curl -X POST https://hook.us1.make.com/2p4n1yv1urc4upm9xlkiy459t1yd87fj \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Frontend_Cursor | YYYY.MM.DD.V",
    "ID": "YYYY-MM-DD-NNN",
    "Created": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
    "Findings": [
      "Finding item 1",
      "Finding item 2",
      "Finding item 3"
    ],
    "Priorities": [
      "Priority item 1",
      "Priority item 2",
      "Priority item 3"
    ],
    "Next_Steps": [
      "Next step 1",
      "Next step 2",
      "Next step 3"
    ],
    "Future_Features": [
      "Feature idea 1",
      "Feature idea 2",
      "Feature idea 3"
    ]
  }'
```

## JSON Format (Replace with your content)

```json
{
  "Title": "Frontend_Cursor | YYYY.MM.DD.V",
  "ID": "YYYY-MM-DD-NNN",
  "Created": "YYYY-MM-DDThh:mm:ss.000Z",
  "Findings": [
    "Finding item 1",
    "Finding item 2",
    "Finding item 3"
  ],
  "Priorities": [
    "Priority item 1",
    "Priority item 2",
    "Priority item 3"
  ],
  "Next_Steps": [
    "Next step 1",
    "Next step 2",
    "Next step 3"
  ],
  "Future_Features": [
    "Feature idea 1",
    "Feature idea 2",
    "Feature idea 3"
  ]
}
```

## Format Requirements

- **Title**: Must follow format "Frontend_Cursor | YYYY.MM.DD.V" where V is version number
- **ID**: Must follow format "YYYY-MM-DD-NNN" where NNN is sequential for the day (001, 002, etc.)
- **Created**: Must be ISO-8601 timestamp format (use the date command in the curl example)
- **All arrays**: Must contain at least one item

## Reference

See full documentation in `/shared/docs/frontend_standup_guide.md`

## Team Member(s)
- [Your Name]

## Overview
[Brief 1-2 sentence summary of what this report covers]

## Accomplishments
- [Task completed with file path or PR reference]
- [Another completed task with specific details]
- [Include links to relevant commits or PRs where applicable]

## Current Work
- [Task in progress with completion estimate]
- [Another task with details on current state]
- [Be specific about what you're working on right now]

## Blockers
- [Specific blocker with exact error message]
- [Another blocker with reproduction steps]
- [Include console logs, HTTP status codes, or screenshots if applicable]

## Integration Notes
- [API endpoint being used/needed: `/api/endpoint`]
- [Authentication approach: token type, header format]
- [Data format requirements or issues]
- [Cross-domain considerations]

## Next Steps
- [High priority] [Next specific action with timeline]
- [Medium priority] [Another next step]
- [Low priority] [Future consideration]

## Technical Implementation Details
- [Data structures used/needed]
- [Authentication implementation details]
- [Frontend-specific considerations that impact the backend]
- [Library or framework requirements]

## API Requirements
- Endpoint: `/api/endpoint`
  - Method: GET/POST/PUT/DELETE
  - Headers: `Authorization`, `Content-Type`
  - Request format: `{ "key": "value" }`
  - Expected response: `{ "status": "success" }`

## External Integration Points
- [Airtable base/table references]
- [Softr embedding requirements]
- [Third-party services integrated]
- [Cross-domain considerations]

## Testing Steps
- [Step 1 to verify functionality]
- [Step 2 with expected outcome]
- [Include test user credentials if needed: `testuser@example.com` / DO NOT include real passwords]

## Documentation Changes
- [Updates made to existing documentation]
- [New documentation created]
- [Suggested documentation improvements]

## Appendix: Error Logs
```
[Paste relevant error logs here]
```

## Appendix: Screenshots
[Description of screenshot]
[Link or embed screenshot] 