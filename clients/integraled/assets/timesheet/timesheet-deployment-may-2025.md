# Timesheet Multiple Entry Deployment

## Overview
Timesheet feature for tracking individual time entries across multiple clients and projects.

## Authentication
- Uses Integral Ed auth system
- Config in `clients/integraled/auth.js`:
  ```js
  const AUTH_CONFIG = {
      clientId: 'integral-ed',
      authEndpoint: 'https://auth.integral-ed.com',
      redirectUri: window.location.origin + '/clients/integral-ed/'
  };
  ```
- Session stored in localStorage as 'auth_session'
- Protected routes require valid session
- Same auth flow as admin-tree

## Data Structure
Individual time entries with:
- user_id (from auth)
- client_project_billing (combined key)
- date
- start_time
- duration (minutes)
- notes (optional)
- validation fields

## Redis/Airtable Integration
- New fields needed in Redis registry
- Airtable table structure matches timesheet-fields.json
- Validation workflow through Airtable

## Deployment Steps
1. Add Redis fields:
   - time_entry:id
   - time_entry:user_id
   - time_entry:client_project_billing
   - time_entry:date
   - time_entry:start_time
   - time_entry:duration
   - time_entry:notes
   - time_entry:validated_at
   - time_entry:validated_by

2. Airtable Setup:
   - Create new table matching schema
   - Set up validation workflow
   - Configure user permissions

3. Auth Integration:
   - Ensure timesheet routes use same auth as admin-tree
   - Add timesheet-specific permissions if needed
   - Update redirectUri if needed

## Testing
- Verify auth flow
- Test time entry submission
- Validate data storage
- Check reporting aggregation

## Notes
- Individual entries vs aggregated totals
- Validation workflow through Airtable
- Reporting through admin interface
- Auth session management 