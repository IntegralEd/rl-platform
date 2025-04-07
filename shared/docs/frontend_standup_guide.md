# Frontend Standup Report Guide (Updated April 12, 2025)

## Overview

This guide documents the standardized webhook approach for submitting frontend standup reports. Reports are automatically formatted and published to Airtable via the secure webhook system.

## Quick Start

Send your report with:

```bash
curl -X POST https://hook.us1.make.com/2p4n1yv1urc4upm9xlkiy459t1yd87fj \
  -H "Content-Type: application/json" \
  -d '{
    "Title": "Frontend_Cursor | 2025.04.12.1",
    "ID": "2025-04-12-001",
    "Created": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
    "Findings": [
      "Your completed work item 1",
      "Your completed work item 2"
    ],
    "Priorities": [
      "Your priority 1",
      "Your priority 2"
    ],
    "Next_Steps": [
      "Your next step 1",
      "Your next step 2"
    ],
    "Future_Features": [
      "Your feature idea 1",
      "Your feature idea 2"
    ]
  }'
```

## Report Format

Your report MUST follow this exact JSON structure:

```json
{
  "Title": "Frontend_Cursor | YYYY.MM.DD.V",
  "ID": "YYYY-MM-DD-NNN",
  "Created": "YYYY-MM-DDThh:mm:ss.000Z",
  "Findings": [
    "Finding item 1",
    "Finding item 2"
  ],
  "Priorities": [
    "Priority item 1",
    "Priority item 2"
  ],
  "Next_Steps": [
    "Next step 1",
    "Next step 2"
  ],
  "Future_Features": [
    "Feature idea 1",
    "Feature idea 2"
  ]
}
```

## Format Requirements

- **Title**: Must follow format "Frontend_Cursor | YYYY.MM.DD.V" where V is the version number
- **ID**: Must follow format "YYYY-MM-DD-NNN" where NNN is sequential for the day (001, 002, etc.)
- **Created**: Must be ISO-8601 timestamp format
- **All arrays**: Must contain at least one item

## Verification Steps

Before submitting, verify:

1. ✓ All required fields are present
2. ✓ Title and ID follow the required format
3. ✓ Created field has correct ISO timestamp format
4. ✓ All arrays contain at least one item

## Common Issues & Solutions

### "Error: Invalid payload"
- Check JSON structure matches exactly
- Ensure all required fields are present
- Verify date format is correct

### "Error: Authentication failed"
- Check webhook URL is correct (must use the one above)
- Verify Content-Type header is set to "application/json"
- Contact backend team for access issues

## Example Successful Report

```json
{
  "Title": "Frontend_Cursor | 2025.04.12.1",
  "ID": "2025-04-12-001",
  "Created": "2025-04-12T15:23:47.000Z",
  "Findings": [
    "Implemented goal setter UI components",
    "Fixed responsive design issues",
    "Added loading states for better UX"
  ],
  "Priorities": [
    "Implement form validation",
    "Fix mobile layout issues",
    "Add error handling for API calls"
  ],
  "Next_Steps": [
    "Complete form validation implementation",
    "Test on mobile devices",
    "Update documentation"
  ],
  "Future_Features": [
    "Dark mode support",
    "Keyboard shortcuts",
    "Offline mode"
  ]
}
```

## Security Requirements

- **CRITICAL**: Do NOT attempt direct Airtable writes for standup reports
- Use ONLY the webhook approach documented here
- This method ensures proper security and consistent formatting

## Need Help?

1. Check the webhook response for error messages
2. Contact backend team on Slack (#frontend-support)
3. Include the full error response in your support request

## Implementation Status

This webhook system is fully operational as of April 12, 2025.
All previous reporting methods are now deprecated and should not be used. 