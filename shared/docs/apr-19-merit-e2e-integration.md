# Merit End-to-End Integration Checklist
**Document Version:** 1.0.0
**Last Updated:** April 19, 2025 16:00 UTC
**Status:** Ready for Implementation

## Overview
This checklist outlines the required changes to integrate the Merit client with the updated API Gateway and Redis caching system. Each change requires human verification to ensure proper implementation.

## 1. Update API Authentication (client-merit-openai.js)
- [ ] Replace Bearer token with x-api-key header
```javascript
this.headers = {
    'Content-Type': 'application/json',
    'x-api-key': window.env.MERIT_API_KEY,  // Changed from Authorization: Bearer
    'X-Project-ID': this.config.project_id
};
```
**Rationale:** API Gateway expects x-api-key header format instead of Bearer token
**Human Verification:**
1. Check Network tab in DevTools
2. Verify request headers show `x-api-key` not `Authorization`
3. Confirm successful API response (200 OK)

## 2. Update API Endpoint Structure (client-merit-openai.js)
- [ ] Add /api/v1 prefix to endpoints
```javascript
const ENDPOINTS = {
    prod: `${window.env.LAMBDA_ENDPOINT}/api/v1`,
    contextPrefix: 'context',
    threadPrefix: 'thread'
};
```
**Rationale:** New API Gateway structure requires /api/v1 prefix for versioning
**Human Verification:**
1. Check Network tab for requests
2. Verify URLs contain `/api/v1/`
3. Confirm no 404 errors

## 3. Add Redis Configuration (client-merit-openai.js)
- [ ] Add Redis config block with TTLs and key patterns
```javascript
this.redisConfig = {
    endpoint: window.env.REDIS_URL,
    ttl: {
        session: 3600,   // 1 hour
        cache: 3600,     // 1 hour
        temp: 900        // 15 minutes
    },
    keyPatterns: {
        context: `context:${this.config.org_id}:{thread_id}:{field}`,
        thread: `thread:{thread_id}:meta`,
        messages: `thread:{thread_id}:messages`
    }
};
```
**Rationale:** Standardize Redis access patterns and TTLs across platform
**Human Verification:**
1. Check Redis CLI for correct key patterns
2. Verify TTL values on stored keys
3. Confirm no orphaned keys

## 4. Add Retry Logic (client-merit-openai.js)
- [ ] Implement exponential backoff retry
```javascript
async #withRetry(fn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            const delay = Math.pow(2, i) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
```
**Rationale:** Handle transient network issues and rate limiting gracefully
**Human Verification:**
1. Temporarily disable network to trigger retries
2. Check console for retry attempts
3. Verify exponential delay between retries

## 5. Add Schema Validation (client-merit-instructional-flow.js)
- [ ] Add schema version check
```javascript
#validateSchemaVersion() {
    const currentSchema = window.env.SCHEMA_VERSION;
    if (currentSchema !== '04102025.B01') {
        throw new Error('Schema version mismatch');
    }
}
```
**Rationale:** Ensure client and API schema versions match
**Human Verification:**
1. Check console for schema version log
2. Try with mismatched version to verify error
3. Confirm correct version passes

## 6. Add Redis Connection Check (client-merit-instructional-flow.js)
- [ ] Implement Redis connection verification
```javascript
async #verifyRedisConnection() {
    if (!this.#state.redisConnected) {
        throw new Error('Redis connection not established');
    }
}
```
**Rationale:** Fail fast if Redis is unavailable
**Human Verification:**
1. Check Redis connection status in console
2. Verify error when Redis is down
3. Confirm success when Redis is up

## 7. Update Environment Config (merit.html)
- [ ] Update window.env with new values
```javascript
window.env = {
    SCHEMA_VERSION: '04102025.B01',
    MERIT_API_KEY: "qoCr1UHh8A9IDFA55NDdO4CYMaB9LvL66Rmrga3J",
    LAMBDA_ENDPOINT: 'https://29wtfiieig.execute-api.us-east-2.amazonaws.com/prod',
    REDIS_URL: 'redis://redis.recursivelearning.app:6379'
};
```
**Rationale:** Centralize configuration and use new endpoints
**Human Verification:**
1. Check console for env values
2. Verify no sensitive data exposed
3. Confirm all required values present

## 8. Create Redis Client (new file: client-merit-redis.js)
- [ ] Create dedicated Redis client class
```javascript
export class MeritRedisClient {
    constructor(config) {
        this.config = config;
        this.redis = null;
    }

    async connect() {
        try {
            this.redis = new window.Redis(this.config.endpoint);
            await this.redis.ping();
            return true;
        } catch (error) {
            console.error('[Merit Redis] Connection error:', error);
            return false;
        }
    }

    async getContext(threadId, field) {
        const key = this.config.keyPatterns.context
            .replace('{thread_id}', threadId)
            .replace('{field}', field);
        return await this.redis.get(key);
    }

    async setContext(threadId, field, value) {
        const key = this.config.keyPatterns.context
            .replace('{thread_id}', threadId)
            .replace('{field}', field);
        await this.redis.set(key, value, 'EX', this.config.ttl.cache);
    }
}
```
**Rationale:** Encapsulate Redis operations and standardize key management
**Human Verification:**
1. Test Redis connection success/failure
2. Verify key patterns in Redis CLI
3. Confirm TTLs are applied correctly

## End-to-End Testing
After implementing all changes, perform these verification steps:

1. Initial Load
- [ ] Check schema version logged
- [ ] Verify Redis connection established
- [ ] Confirm API key format correct

2. Create Thread
- [ ] Verify API request format
- [ ] Check Redis keys created
- [ ] Confirm response handling

3. Send Message
- [ ] Check message stored in Redis
- [ ] Verify API request succeeds
- [ ] Confirm response rendered

4. Error Scenarios
- [ ] Test network failure recovery
- [ ] Verify Redis disconnect handling
- [ ] Check schema mismatch errors

## Sign-off Required
- [ ] Frontend Team Lead
- [ ] Backend Team Lead
- [ ] DevOps Engineer
- [ ] QA Engineer

## Rollback Plan
If issues are encountered:
1. Revert to previous API authentication method
2. Disable Redis integration
3. Return to previous schema version
4. Contact DevOps for immediate support 