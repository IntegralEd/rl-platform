# Frontend Standup Report Guide

## Overview

This guide explains how to submit your daily standup reports using the automated script. Reports are automatically formatted and submitted to Airtable, then published to Slack after review.

## Prerequisites

1. Ensure you have access to the repository
2. Run `npm install` to install dependencies
3. Make sure you're in the repository root directory
4. Verify you have AWS credentials configured

## Quick Start (Copy & Paste These Commands)

```bash
# 1. Create today's report (replace YYYY-MM-DD with today's date)
cp docs/standup_reports/TEMPLATE_frontend.md docs/standup_reports/$(date +%Y-%m-%d)-frontend.md

# 2. Edit your report
code docs/standup_reports/$(date +%Y-%m-%d)-frontend.md

# 3. Submit your report
node scripts/submit-standup.js docs/standup_reports/$(date +%Y-%m-%d)-frontend.md
```

## Report Format (MUST FOLLOW EXACTLY)

Your report MUST include these sections with EXACT headings:

```markdown
# Frontend Standup Report

## Metadata
Report_Source: Frontend_Cursor
User_ID: YOUR_NAME

## Priorities
- Priority item 1
- Priority item 2

## Findings
- Finding item 1
- Finding item 2

## Next Steps
1. Next step 1
2. Next step 2

## Future Feature Ideas
- Feature idea 1
- Feature idea 2
```

## Verification Steps

Before submitting, verify:

1. ✓ All section headers match EXACTLY (including ## and spacing)
2. ✓ Your name is correctly set in User_ID
3. ✓ Report_Source is set to "Frontend_Cursor"
4. ✓ File is saved in docs/standup_reports/ directory
5. ✓ Filename follows YYYY-MM-DD-frontend.md format

## Common Issues & Solutions

### "Error: Invalid report format"
- Check section headers match exactly
- Ensure no extra spaces in headers
- Verify all required sections are present

### "Error: Cannot find report file"
- Check file path is correct
- Ensure you're in repository root
- Verify file extension is .md

### "Error: Authentication failed"
- Check AWS credentials are configured
- Run 'aws configure' if needed
- Contact backend team for access

### "Error: Failed to post to Airtable"
- Verify your User_ID is correct
- Check Report_Source is "Frontend_Cursor"
- Try running with --mode=check first

## Example Successful Report

```markdown
# Frontend Standup Report

## Metadata
Report_Source: Frontend_Cursor
User_ID: Jane Smith

## Priorities
- Implementing goal setter UI components
- Fixing responsive design issues
- Adding error handling for webhook calls

## Findings
- Completed modal implementation
- Fixed mobile layout issues
- Added loading states for better UX

## Next Steps
1. Add form validation
2. Implement error messages
3. Update unit tests

## Future Feature Ideas
- Dark mode support
- Keyboard shortcuts
- Bulk action support
```

## Command Reference

```bash
# Check your report format
node scripts/standup_automation.js --mode=check --report=docs/standup_reports/YYYY-MM-DD-frontend.md

# Submit your report
node scripts/submit-standup.js docs/standup_reports/YYYY-MM-DD-frontend.md

# Get help
node scripts/standup_automation.js --help
```

## Report Status

After submission:
1. Report is saved as "Drafted" in Airtable
2. Backend team reviews within 24 hours
3. Approved reports are published to Slack
4. You'll receive a notification when published 

## New Submission Process

1. Create your report as before:
```bash
cp docs/standup_reports/TEMPLATE_frontend.md docs/standup_reports/$(date +%Y-%m-%d)-frontend.md
code docs/standup_reports/$(date +%Y-%m-%d)-frontend.md
```

2. Submit your report:
```bash
node scripts/submit-standup.js docs/standup_reports/$(date +%Y-%m-%d)-frontend.md
```

3. Verify and track your report:
   - Visit https://recursivelearning.app/admin/pages/direct.html
   - Click "Query Reports" to check your submission
   - Your report will show as "Drafted" initially
   - Once approved, it will be published to Slack

## Report Status Tracking

- **Drafted**: Initial submission
- **Under Review**: Being reviewed by backend team
- **Approved**: Ready for publication
- **Published**: Available in Slack
- **Rejected**: Needs revisions (you'll be notified)

## Script Implementation

Here's the updated script that integrates with the admin interface:

```javascript
const fs = require('fs');
const https = require('https');

function submitStandupReport(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Parse the content to extract metadata
  const metadata = {
    reportSource: 'Frontend_Cursor',
    // ... other metadata from the file
  };

  // Send to admin interface endpoint
  const data = JSON.stringify({
    report: content,
    metadata: metadata,
    action: 'submit' // or 'query' for checking status
  });

  const options = {
    hostname: 'recursivelearning.app',
    path: '/admin/api/standup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'X-Team': 'frontend'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(responseData));
        } else {
          reject(new Error(`Failed to submit: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Usage
const filePath = process.argv[2];
if (!filePath) {
  console.error('Please provide a file path');
  process.exit(1);
}

submitStandupReport(filePath)
  .then(result => {
    console.log(`
✅ Report submitted successfully!

Next steps:
1. Visit https://recursivelearning.app/admin/pages/direct.html
2. Click "Query Reports" to verify your submission
3. Your report will be reviewed by the backend team
4. Once approved, it will be published to Slack

Report ID: ${result.reportId}
Status: ${result.status}
    `);
  })
  .catch(error => {
    console.error('Error submitting report:', error);
    process.exit(1);
  });
```

To use this script:

1. Save it as `scripts/submit-standup.js`
2. Make it executable: `chmod +x scripts/submit-standup.js`
3. Run it with your report file: `node scripts/submit-standup.js docs/standup_reports/YYYY-MM-DD-frontend.md`

The script will:
- Read your report file
- Submit it to the admin interface
- Provide a Report ID for tracking
- Guide you through the next steps

## Need Help?

1. Check the admin interface for your report status
2. Contact backend team on Slack (#frontend-support)
3. Include your Report ID in any support requests 