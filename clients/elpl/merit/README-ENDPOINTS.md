# Merit Endpoint Configuration

⚠️ **CRITICAL WARNING: NEVER USE `_dev` IN PRODUCTION CODE** ⚠️

The `_dev` suffix in endpoints is strictly forbidden in production code. It was historically used for development but causes serious issues with DNS resolution and API routing.

## Endpoint Architecture

### 1. Lambda Endpoint (REQUIRED)
```javascript
const ENDPOINTS = {
    lambda: process.env.LAMBDA_ENDPOINT || 'https://api.recursivelearning.app',
    contextPrefix: 'merit:ela:context',
    threadPrefix: 'merit:ela:thread'
};
```
- **Primary endpoint for ALL business logic**
- Handles thread creation, message processing, and user management
- Must be used in production
- No fallbacks allowed
- Includes standardized prefixes for context and thread management

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
class MeritOpenAIClient {
    constructor() {
        const ENDPOINTS = {
            lambda: process.env.LAMBDA_ENDPOINT || 'https://api.recursivelearning.app',
            contextPrefix: 'merit:ela:context',
            threadPrefix: 'merit:ela:thread'
        };
        
        this.baseUrl = ENDPOINTS.lambda;
        this.headers = {
            'Content-Type': 'application/json',
            'X-Project-ID': this.config.project_id
        };
    }
}

// ✅ CORRECT: Error handling with detailed logging
try {
    const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ action, ...payload })
    });
    if (!response.ok) {
        const error = await response.json();
        console.error('[Merit Flow] Error details:', {
            endpoint: this.baseUrl,
            headers: this.headers,
            error: error.message
        });
        throw error;
    }
    return response.json();
} catch (error) {
    this.state.hasError = true;
    this.state.errorMessage = error.message;
    throw error;
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
# Both Development and Production use the same endpoint
LAMBDA_ENDPOINT=https://api.recursivelearning.app
```

## Thread ID Format
```javascript
// ✅ CORRECT: Standardized thread ID format
const threadId = `threads:${orgId}:${userId}:${threadId}`;
```

## State Management
```javascript
// ✅ CORRECT: Proper state tracking
this.state = {
    isLoading: false,
    hasError: false,
    errorMessage: null,
    lastRequest: null,
    lastResponse: null,
    isPreloaded: false,
    context: null,
    projectPaired: false
};
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