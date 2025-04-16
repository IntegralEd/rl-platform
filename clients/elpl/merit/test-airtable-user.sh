#!/bin/bash

# Airtable API endpoint for the Users table
AIRTABLE_ENDPOINT="https://api.airtable.com/v0/appqFjYLZiRlgZQDM/tblbiZ0r6hIVfAWsY"

# Your Airtable API key (will be passed as an environment variable)
# Usage: AIRTABLE_API_KEY=your_key_here ./test-airtable-user.sh
if [ -z "$AIRTABLE_API_KEY" ]; then
    echo "Error: AIRTABLE_API_KEY environment variable is required"
    exit 1
fi

# Create new user record
curl -X POST "$AIRTABLE_ENDPOINT" \
  -H "Authorization: Bearer $AIRTABLE_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{
    "records": [
      {
        "fields": {
          "Email": "test@integral-ed.com",
          "Name": "Test User",
          "Status": "Active",
          "Role": "Teacher",
          "Grade_Level": "6",
          "Curriculum": "ELA",
          "Last_Login": "'"$(date -u +"%Y-%m-%dT%H:%M:%SZ")"'",
          "Thread_ID": null
        }
      }
    ]
  }'

# Note: Airtable will automatically assign:
# - Record ID (rec...)
# - Created time
# - Last modified time 