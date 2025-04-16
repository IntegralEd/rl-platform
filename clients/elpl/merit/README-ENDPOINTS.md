# Merit Endpoint Configuration

⚠️ **CRITICAL WARNING: NEVER USE `_dev` IN PRODUCTION CODE** ⚠️

The `_dev` suffix in endpoints is strictly forbidden in production code. It was historically used for development but causes serious issues with DNS resolution and API routing.

## Endpoint Architecture

### 1. Lambda Endpoint (REQUIRED)
```javascript
const LAMBDA_ENDPOINT = process.env.LAMBDA_ENDPOINT || 'https://api.recursivelearning.app';
```
- **Primary endpoint for ALL business logic**
- Handles thread creation, message processing, and user management
- Must be used in production
- No fallbacks allowed

### 2. Redis Endpoint (Caching Only)
```javascript
const REDIS_CONFIG = {
    prefix: 'merit:ela',
    contextKey: 'context',
    threadKey: 'thread',
    ttl: 3600 // 1 hour for MVP
};
```
- Used only for caching and session management
- Never use for primary business logic
- Configured through Redis client, not direct HTTP calls

## Correct Implementation

```javascript
// ✅ CORRECT: Single source of truth
const API_CONFIG = {
    endpoint: process.env.LAMBDA_ENDPOINT || 'https://api.recursivelearning.app',
    projectId: 'proj_V4lrL1OSfydWCFW0zjgwrFRT'
};

// ✅ CORRECT: Simple API call
async function callAPI(action, payload) {
    const response = await fetch(API_CONFIG.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Project-ID': API_CONFIG.projectId
        },
        body: JSON.stringify({ action, ...payload })
    });
    return response.json();
}
```

## Common Mistakes

```javascript
// ❌ WRONG: Using _dev endpoint
const endpoint = 'https://api.recursivelearning.app/dev';  // NEVER DO THIS

// ❌ WRONG: Implementing fallback logic
const fallbackEndpoint = endpoint + '/dev';  // NEVER DO THIS

// ❌ WRONG: DNS retry with dev endpoint
if (error.code === 'ERR_NAME_NOT_RESOLVED') {
    return tryFallbackEndpoint();  // NEVER DO THIS
}
```

## Environment Configuration

```bash
# Development
LAMBDA_ENDPOINT=https://api.recursivelearning.app

# Production
LAMBDA_ENDPOINT=https://api.recursivelearning.app
```

## Error Handling

```javascript
// ✅ CORRECT: Proper error handling
try {
    const response = await callAPI('create_thread', payload);
    return response;
} catch (error) {
    console.error('API Error:', {
        endpoint: API_CONFIG.endpoint,
        error: error.message
    });
    throw error;
}
```

## Redis Usage (For Caching Only)

```javascript
// ✅ CORRECT: Redis for caching
async function cacheThreadId(threadId) {
    const key = `${REDIS_CONFIG.prefix}:${REDIS_CONFIG.threadKey}:${threadId}`;
    await redis.set(key, threadId, 'EX', REDIS_CONFIG.ttl);
}
```

## Migration Guide

If your code currently uses the `_dev` endpoint:

1. Remove all instances of `/dev` from endpoint URLs
2. Remove any fallback logic or retry attempts
3. Update error handling to properly report endpoint issues
4. Verify environment variables are correctly set
5. Update tests to use proper endpoint mocking

## Support

If you encounter DNS or routing issues:
1. Verify LAMBDA_ENDPOINT environment variable
2. Check API gateway configuration
3. Contact DevOps team for endpoint verification
4. DO NOT add `/dev` as a temporary fix

Remember: The existence of `/dev` in any endpoint URL indicates a configuration issue that must be fixed properly. 