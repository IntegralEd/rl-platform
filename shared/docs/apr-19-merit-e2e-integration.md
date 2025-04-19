# Merit End-to-End Integration Checklist
**Document Version:** 1.0.2
**Last Updated:** April 19, 2025 17:00 UTC
**Status:** Ready for Implementation

## Overview
This checklist outlines the required changes to integrate the Merit client with the updated API Gateway and Redis caching system. Items are tagged as:
- 🔧 **[BACKEND]** - Backend team implementation required
- 👀 **[VERIFY]** - Frontend visual verification in console/network tab
- 🔄 **[FRONTEND]** - Frontend team implementation

## Pre-Implementation Verification

### 1. Redis Access Verification
🔧 **[BACKEND]** Configure Redis ACL:
```bash
# Backend team to implement:
redis-cli -h redis.recursivelearning.app -a ADMIN_PASSWORD ACL SETUSER recursive-frontend on >context:* allkeys +get +ping +info
```

👀 **[VERIFY]** Frontend team to confirm:
```javascript
// Open browser console, look for:
[Merit Redis] Connection successful: recursive-frontend
[Merit Redis] Read access confirmed for context:*
[Merit Redis] Write access blocked as expected
```

### 2. Schema Version Validation
🔧 **[BACKEND]** Set schema version:
```bash
# Backend team to implement:
redis-cli -h redis.recursivelearning.app -a ADMIN_PASSWORD SET "schema:exposed_fields:rollout_version" "04102025.B01"
```

👀 **[VERIFY]** Frontend team to confirm:
```javascript
// Console should show:
[Merit Schema] Version check passed: 04102025.B01
[Merit Schema] Field registry accessible
```

## Frontend Implementation Steps

### 1. API Authentication
🔄 **[FRONTEND]** Update headers:
```javascript
this.headers = {
    'Content-Type': 'application/json',
    'x-api-key': window.env.MERIT_API_KEY,
    'X-Project-ID': this.config.project_id
};
```

👀 **[VERIFY]** Check Network tab:
- Request headers show `x-api-key`
- No `Authorization: Bearer` present
- Response: 200 OK

### 2. Redis Key Pattern Verification
🔧 **[BACKEND]** Configure key patterns:
```bash
# Backend team to implement:
redis-cli -h redis.recursivelearning.app -a ADMIN_PASSWORD SET "schema:key_patterns:context" "context:{org_id}:{thread_id}:{field_id}"
```

👀 **[VERIFY]** Frontend team to confirm:
```javascript
// Console should show:
[Merit Redis] Key pattern validated: context:test_org:test_thread:test_field
[Merit Redis] TTL confirmed: 3600
```

### 3. Field Validation
🔧 **[BACKEND]** Configure field registry:
```bash
# Backend team to implement:
redis-cli -h redis.recursivelearning.app -a ADMIN_PASSWORD HSET "schema:fields:allowed" "Field_AT_ID" "1" "Field_ID" "1"
```

👀 **[VERIFY]** Frontend team to confirm:
```javascript
// Console should show:
[Merit Schema] Required fields present
[Merit Schema] Field types valid
[Merit Schema] Cache flags enabled
```

## Common Failure Scenarios

### 1. Redis ACL Blocks
🔧 **[BACKEND]** Symptoms to fix:
- ACL logs show denied commands
- Frontend user lacks read permissions

👀 **[VERIFY]** Frontend team to check:
```javascript
// Console should show:
[Merit Redis] Permission check: READ ✓
[Merit Redis] Permission check: WRITE ✗ (expected)
[Merit Redis] Key pattern access: ✓
```

### 2. Schema Version Mismatch
🔧 **[BACKEND]** Actions:
- Update schema version in Redis
- Sync field registry

👀 **[VERIFY]** Frontend team to check:
```javascript
// Console should show:
[Merit Schema] Version: 04102025.B01 ✓
[Merit Schema] Registry: Connected ✓
[Merit Schema] Fields: Synced ✓
```

## Monitoring Setup

### 1. Redis Monitoring
🔧 **[BACKEND]** Configure:
- CloudWatch metrics for Redis
- ACL violation alerts
- Connection rate monitoring

👀 **[VERIFY]** Frontend team to check:
```javascript
// Console should show:
[Merit Monitor] Redis connection: Active
[Merit Monitor] Read latency: <100ms
[Merit Monitor] Cache hit rate: >80%
```

### 2. API Gateway Monitoring
🔧 **[BACKEND]** Configure:
- 403 error rate alerts
- CORS validation logging
- Latency thresholds

👀 **[VERIFY]** Frontend team to check:
```javascript
// Console should show:
[Merit API] Gateway status: Connected
[Merit API] Auth format: Valid
[Merit API] CORS: Enabled
```

## Implementation Timeline

1. 🔧 **[BACKEND]** Setup (2 hours):
   - Configure Redis ACL
   - Set schema version
   - Enable monitoring

2. 👀 **[VERIFY]** Initial Checks (1 hour):
   - Confirm Redis access
   - Validate schema version
   - Test key patterns

3. 🔄 **[FRONTEND]** Implementation (3 hours):
   - Update authentication
   - Implement Redis client
   - Add error handling

4. 👀 **[VERIFY]** Final Validation (1 hour):
   - End-to-end testing
   - Error scenario validation
   - Performance checks

## Support Contacts
- Redis ACL Issues: @devops-team
- Schema Updates: @backend-team
- Frontend Integration: @frontend-team 