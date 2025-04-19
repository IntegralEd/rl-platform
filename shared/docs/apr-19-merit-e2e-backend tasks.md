# Merit E2E Integration - Backend Verification Guide

## Backend Responsibilities Checklist

### 1. Redis Configuration
- [x] Ensure `recursive-frontend` user exists with correct ACL
- [x] Set up key pattern monitoring for `context:*`
- [x] Configure TTL enforcement (3600s)
- [x] Set up Redis metrics in CloudWatch
- [x] Create Redis connection test endpoint

### 2. Schema Management
- [x] Maintain current schema version (`04102025.B01`)
- [x] Validate Field_AT_ID registry
- [x] Set up schema version monitoring
- [x] Create schema validation endpoint
- [x] Document field type requirements

### 3. API Gateway
- [x] Configure CORS for `https://recursivelearning.app`
- [x] Set up API key validation
- [x] Create mock endpoint for testing
- [x] Configure error responses
- [x] Set up API metrics

### 4. Error Handling
- [x] Create error logging pipeline
- [x] Set up CloudWatch alarms
- [x] Document error codes
- [x] Create error recovery procedures
- [x] Set up retry mechanisms

### 5. Monitoring
- [x] Set up Redis metrics
- [x] Configure API Gateway metrics
- [x] Create schema validation alerts
- [x] Set up performance monitoring
- [x] Create dashboard for key metrics

### 6. Rollback Procedures
- [x] Document Redis rollback steps
- [x] Create API Gateway rollback plan
- [x] Set up schema version rollback
- [x] Create emergency contact list
- [x] Document rollback verification steps

### 7. Documentation
- [x] Update API documentation
- [x] Create integration guide
- [x] Document error scenarios
- [x] Create troubleshooting guide
- [x] Update support contacts

## Frontend Configuration Steps

### 1. Environment Setup
```bash
# Platform-level .env (root of recursivelearning.app)
REDIS_HOST=redis.recursivelearning.app
REDIS_PORT=6379
REDIS_USER=recursive-frontend
REDIS_PASSWORD=${decrypted_from_ssm}
REDIS_SSL=true
REDIS_TLS=true

# Merit-specific .env (clients/merit/.env)
ASSISTANT_ID=asst_QoAA395ibbyMImFJERbG2hKT
OPENAI_PROJECT_ID=proj_abc123
SCHEMA_VERSION=04102025.B01
ORG_ID=recdg5Hlm3VVaBA2u
```

### 2. Redis Client Configuration
```javascript
// redis-client.js
const redis = require('redis');

const client = redis.createClient({
  url: `rediss://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  socket: {
    tls: true,
    rejectUnauthorized: false
  }
});

// Key pattern validation
const validateKeyPattern = (key) => {
  return /^context:[a-zA-Z0-9]+:[a-zA-Z0-9]+:[a-zA-Z0-9]+$/.test(key);
};
```

### 3. API Client Setup
```javascript
// api-client.js
const config = {
  baseUrl: 'https://29wtfiieig.execute-api.us-east-2.amazonaws.com/prod',
  headers: {
    'x-api-key': process.env.API_KEY,
    'X-Project-ID': process.env.PROJECT_ID,
    'Content-Type': 'application/json'
  }
};
```

### 4. Schema Validation
```javascript
// schema-validator.js
const validateSchema = (data) => {
  const requiredFields = {
    Field_AT_ID: true,
    Field_ID: true,
    Table_ID: true,
    Table_Name: true,
    Field_Name: true
  };
  
  return Object.keys(requiredFields).every(field => data[field]);
};
```

### 5. Error Handling
```javascript
// error-handler.js
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const handleRedisError = (error) => {
  if (error.code === 'ECONNREFUSED') {
    throw new ApiError('Redis connection failed', 503);
  }
  throw error;
};
```

### 6. Testing Setup
```javascript
// test-config.js
const testConfig = {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    user: process.env.REDIS_USER
  },
  api: {
    baseUrl: process.env.API_BASE_URL,
    key: process.env.API_KEY
  },
  schema: {
    version: process.env.SCHEMA_VERSION
  }
};
```

## Pre-Implementation Checks

### 1. Redis Access Verification
```bash
# Test Redis connection with frontend user
redis-cli -h redis.recursivelearning.app -a FRONTEND_PASSWORD ping

# Verify ACL permissions
redis-cli -h redis.recursivelearning.app -a FRONTEND_PASSWORD ACL WHOAMI
# Should return: "user recursive-frontend"

# Test key pattern access
redis-cli -h redis.recursivelearning.app -a FRONTEND_PASSWORD GET "context:test_org:test_thread:test_field"
# Should succeed for read, fail for write
```

### 2. Schema Version Validation
```bash
# Check current schema version
redis-cli -h redis.recursivelearning.app -a FRONTEND_PASSWORD GET "schema:exposed_fields:rollout_version"
# Must match: 04102025.B01

# Verify field registry
curl -v \
  -H "x-api-key: YOUR_API_KEY" \
  -H "X-Project-ID: YOUR_PROJECT_ID" \
  https://29wtfiieig.execute-api.us-east-2.amazonaws.com/prod/api/v1/schema/fields
```

### 3. API Key Format Test
```bash
# Test with correct format
curl -v \
  -H "x-api-key: YOUR_API_KEY" \
  -H "X-Project-ID: YOUR_PROJECT_ID" \
  https://29wtfiieig.execute-api.us-east-2.amazonaws.com/prod/api/v1/mock

# Test with incorrect format (should fail)
curl -v \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-Project-ID: YOUR_PROJECT_ID" \
  https://29wtfiieig.execute-api.us-east-2.amazonaws.com/prod/api/v1/mock
```

## Implementation Verification Steps

### 1. Redis Key Pattern Validation
```javascript
// Test key pattern generation
const testKey = `context:${org_id}:${thread_id}:${Field_AT_ID}`;
// Verify against regex: /^context:[a-zA-Z0-9]+:[a-zA-Z0-9]+:[a-zA-Z0-9]+$/

// Test TTL setting
redis.set(key, value, 'EX', 3600); // Must include TTL
```

### 2. Context Field Validation
```javascript
// Before writing to Redis, validate:
const requiredFields = {
  Field_AT_ID: true,
  Field_ID: true,
  Table_ID: true,
  Table_Name: true,
  Field_Name: true
};

// Check field type
const validTypes = [
  'singleLineText',
  'richText',
  'date',
  'number',
  'url',
  'email',
  'checkbox',
  'array',
  'lookup',
  'formula'
];
```

### 3. Error Handling Verification
```javascript
// Test Redis connection failure
try {
  await redis.ping();
} catch (error) {
  // Should log to CloudWatch
  console.error('[Redis] Connection failed:', error);
}

// Test schema validation failure
try {
  await validateSchemaVersion();
} catch (error) {
  // Should trigger rollback
  console.error('[Schema] Version mismatch:', error);
}
```

## Common Failure Scenarios

### 1. Redis ACL Blocks
```bash
# Symptoms:
# - Silent failures on Redis operations
# - No error messages in console

# Resolution:
# 1. Verify user is 'recursive-frontend'
# 2. Check key pattern matches 'context:*'
# 3. Confirm no write operations attempted
```

### 2. Schema Version Mismatch
```bash
# Symptoms:
# - Redis writes rejected
# - Error: "Schema version mismatch"

# Resolution:
# 1. Check current version in Redis
# 2. Update frontend config
# 3. Retry with correct version
```

### 3. Invalid Field_AT_ID
```bash
# Symptoms:
# - Redis writes rejected
# - Error: "Invalid field identifier"

# Resolution:
# 1. Verify Field_AT_ID in schema registry
# 2. Check field is marked Redis_Cache = true
# 3. Confirm TTL is set
```

## Monitoring Checklist

### 1. Redis Metrics
- Connection success rate
- Key pattern compliance
- TTL enforcement
- ACL violation attempts

### 2. API Gateway Metrics
- 403 error rate (API key format)
- CORS preflight success
- Integration latency

### 3. Schema Metrics
- Version validation success
- Field registry hits
- Cache hit/miss ratio

## Rollback Procedures

### 1. Redis Rollback
```bash
# Clear test keys
redis-cli -h redis.recursivelearning.app KEYS "context:test_*" | xargs redis-cli DEL

# Reset schema version if needed
redis-cli -h redis.recursivelearning.app SET "schema:exposed_fields:rollout_version" "04102025.B01"
```

### 2. API Gateway Rollback
```bash
# Revert to previous API key format if needed
aws apigateway update-method \
  --rest-api-id 29wtfiieig \
  --resource-id YOUR_RESOURCE_ID \
  --http-method GET \
  --patch-operations op=replace,path=/apiKeyRequired,value=true
```

## Support Contacts
- Redis Issues: @devops-team
- Schema Issues: @backend-team
- API Gateway: @api-team
- Emergency Rollback: @devops-lead 