# Merit End-to-End Integration Checklist
**Document Version:** 1.0.6
**Last Updated:** April 25, 2025 12:30 UTC
**Status:** Navigation Fixed, Environment Updated

## Overview
This checklist outlines the required changes to integrate the Merit client with the updated API Gateway and Redis caching system. Items are tagged as:
- 🔧 **[BACKEND]** - Backend team implementation required
- 👀 **[VERIFY]** - Frontend visual verification in console/network tab
- 🔄 **[FRONTEND]** - Frontend team implementation
- 🔐 **[ENV]** - Environment configuration required
- ✅ **[FIXED]** - Issue has been resolved

## Environment Setup
🔐 **[ENV]** Merit-specific configuration:
```bash
# Merit-specific .env (clients/elpl/merit/.env)
# OpenAI Configuration
OPENAI_API_KEY=sk-...  # Your OpenAI API key
OPENAI_PROJECT_ID=proj_V4lrL1OSfydWCFW0zjgwrFRT
MERIT_ASSISTANT_ID=asst_QoAA395ibbyMImFJERbG2hKT
MERIT_ORG_ID=recdg5Hlm3VVaBA2u

# API Gateway Configuration
LAMBDA_ENDPOINT=https://api.recursivelearning.app/prod/api/v1
API_GATEWAY_ENDPOINT=https://29wtfiieig.execute-api.us-east-2.amazonaws.com/prod
API_GATEWAY_KEY=68gmsx2jsk
MERIT_API_KEY=qoCr1UHh8A9IDFA55NDdO4CYMaB9LvL66Rmrga3J

# Schema Version
SCHEMA_VERSION=04102025.B01
```

## Browser Testing Steps

### 1. Network Tab Verification
👀 **[VERIFY]** Check request headers:
```javascript
// Every API request should include:
{
  'x-api-key': 'qoCr1UHh8A9IDFA55NDdO4CYMaB9LvL66Rmrga3J',
  'X-Project-ID': 'proj_V4lrL1OSfydWCFW0zjgwrFRT',
  'X-Assistant-ID': 'asst_QoAA395ibbyMImFJERbG2hKT',
  'Content-Type': 'application/json'
}
```

Expected Network Flow:
1. Initial schema fetch (`GET /schema/fields`)
2. Context initialization (`POST /context/init`)
3. Assistant connection (`GET /assistant/connect`)

### 2. Console Verification
👀 **[VERIFY]** Expected console messages:
```javascript
// Successful initialization:
[Merit] Environment loaded ✓
[Merit] API connection established ✓
[Merit] Assistant connected: asst_QoAA395ibbyMImFJERbG2hKT ✓

// Successful API calls:
[Merit API] Schema fields loaded
[Merit API] Context initialized
[Merit API] Assistant ready

// Error states (if any):
[Merit Error] API connection failed: Check API key
[Merit Error] Schema validation failed: Version mismatch
[Merit Error] Assistant unavailable: Check assistant ID
```

### 3. Visual Verification Points
👀 **[VERIFY]** Check for:
1. Assistant status indicator (top right):
   - 🟢 Green: Connected
   - 🟡 Yellow: Connecting
   - 🔴 Red: Error
2. Schema version display (footer):
   - Should show: `v04102025.B01`
3. Context panel (right sidebar):
   - Should list available fields
   - Should show field types
   - Should indicate cache status

### 4. Error Handling Verification
👀 **[VERIFY]** Test error scenarios:
1. Temporarily modify API key - should see:
   ```javascript
   [Merit Error] API connection failed (403)
   Error: Invalid API key provided
   ```

2. Modify Project ID - should see:
   ```javascript
   [Merit Error] Project validation failed
   Error: Project ID not found or unauthorized
   ```

3. Network disconnect - should see:
   ```javascript
   [Merit] Connection lost - retrying...
   [Merit] Reconnection attempt 1/3...
   ```

## Screenshot Verification Points

### 1. Network Panel
�� Capture showing:
- Request headers
- Response status codes
- Timing waterfall
- SSL/TLS verification

### 2. Console Output
📸 Capture showing:
- Initialization messages
- API connection status
- Schema validation
- Any warnings/errors

### 3. UI Elements
📸 Capture showing:
- Assistant status indicator
- Schema version display
- Context panel state
- Any error messages

## Common Issues and Solutions

### 1. API Connection Issues
- Verify all required headers are present
- Check API key format
- Confirm endpoint URL is correct
- Verify SSL certificate is valid

### 2. Schema Validation Failures
- Confirm schema version matches backend
- Check field registry is accessible
- Verify field types are correct

### 3. Assistant Connection Issues
- Verify Assistant ID is correct
- Check OpenAI API key
- Confirm project permissions

## Support Contacts
- API Issues: @api-team
- Schema Updates: @backend-team
- Frontend Integration: @frontend-team

## Initial Navigation Flow Verification
👀 **[VERIFY]** Welcome to Chat transition:

### 1. Welcome Screen Console Messages
```javascript
// Expected initialization sequence:
[Merit Flow] Build version: merit.html/04192025.12:04pm.v.1.16
[Merit HTML] No hash present - defaulting to #welcome
[Merit Flow] Initializing unified flow controller
[Merit Flow] Elements initialized: [...] // Should include 'chatWindow'
[Merit Flow] OpenAI client initialized {
  assistant: 'asst_QoAA395ibbyMImFJERbG2hKT',
  project: 'proj_V4lrL1OSfydWCFW0zjgwrFRT',
  endpoint: 'https://api.recursivelearning.app/prod'
}
```

### 2. Form Validation States
```javascript
// After grade selection:
[Merit Flow] validateForm: gradeLevel value: Grade 1
[Merit Flow] Next button updated: {disabled: false, active: true, formValid: true}
[Merit HTML] Grade level changed to: Grade 1
```

### 3. Known Issues to Fix
🔧 **[FRONTEND]** Current blockers:
1. ✅ **[FIXED]** Navigation Handler Error:
   ```javascript
   // Previous error (FIXED):
   Uncaught (in promise) TypeError: event.preventDefault is not a function
   at #handleNavigation (client-merit-instructional-flow.js:254:15)
   ```
   Fix implemented: Updated event handler to properly handle both string sections and event objects.

2. Node.js Module Error:
   ```javascript
   // Current error:
   Uncaught Error: Failed to bundle using Rollup v2.79.2: 
   the file imports a not supported node.js built-in module "net"
   ```
   Fix: Remove Node.js dependencies from browser bundle

### 4. Expected Navigation Flow
1. Welcome Screen Load:
   - Hash defaults to #welcome
   - Form elements initialize
   - Grade selector enabled

2. Grade Selection:
   - Form validates
   - Next button enables
   - Navigation state updates

3. Chat Transition:
   - Next button click handled
   - Hash updates to #chat
   - Chat interface loads

### 5. Verification Checklist
👀 **[VERIFY]** Check in sequence:
1. Initial Load:
   - [ ] Build version displays correctly
   - [ ] Welcome screen shows
   - [ ] Grade selector enabled

2. Grade Selection:
   - [ ] Form validates on change
   - [ ] Next button enables
   - [ ] No console errors

3. Navigation:
   - [ ] Next button clickable
   - [ ] URL hash updates
   - [ ] Chat interface loads

### 6. Required Fixes
🔄 **[FRONTEND]** Implementation updates needed:
```javascript
// 1. ✅ FIXED: Update navigation handler
async #handleNavigation(sectionOrEvent) {
  let targetSection;
  
  // Handle both event objects and direct section strings
  if (typeof sectionOrEvent === 'string') {
    targetSection = sectionOrEvent;
  } else if (sectionOrEvent?.preventDefault) {
    sectionOrEvent.preventDefault();
    targetSection = sectionOrEvent.target.getAttribute('href').substring(1);
  } else {
    console.error('[Merit Flow] Invalid navigation parameter');
    return;
  }
  
  // ... rest of navigation logic
}

// 2. Remove Node.js dependencies
// Replace 'net' module usage with browser-compatible alternative
// or move server-side functionality to API
```
