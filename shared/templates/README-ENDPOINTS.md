# Merit Endpoint Configuration

⚠️ **CRITICAL WARNING: NEVER USE `_dev` IN PRODUCTION CODE** ⚠️

The `_dev` suffix in endpoints is strictly forbidden in production code. It was historically used for development but causes serious issues with DNS resolution and API routing.

## Endpoint Architecture

### 1. API Gateway Endpoint (PREFERRED)
```javascript
const ENDPOINTS = {
    api: process.env.API_GATEWAY_ENDPOINT || 'https://29wtfiieig.execute-api.us-east-2.amazonaws.com/prod',
    apiKey: process.env.API_GATEWAY_KEY || '68gmsx2jsk',
    contextPrefix: 'merit:ela:context',
    threadPrefix: 'merit:ela:thread'
};
```
- **Primary endpoint for ALL production traffic**
- Provides CORS support for browser-based requests
- Includes proper error handling with CORS headers
- Verified and deployed May 19, 2025
- Uses API key authentication

### 2. Lambda Endpoint (FALLBACK)
```javascript
const ENDPOINTS = {
    lambda: process.env.LAMBDA_ENDPOINT || 'https://api.recursivelearning.app/prod',
    contextPrefix: 'merit:ela:context',
    threadPrefix: 'merit:ela:thread'
};
```
- Secondary endpoint for business logic
- Used as fallback if API Gateway is unavailable
- No CORS support built-in
- Still supported but API Gateway is preferred

### 3. Redis Endpoint (Caching Only)
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
// ✅ CORRECT: Single source of truth with API Gateway preference
class MeritOpenAIClient {
    constructor() {
        const ENDPOINTS = {
            // API Gateway is preferred for production
            api: process.env.API_GATEWAY_ENDPOINT || 'https://29wtfiieig.execute-api.us-east-2.amazonaws.com/prod',
            // Lambda still supported as fallback
            lambda: process.env.LAMBDA_ENDPOINT || 'https://api.recursivelearning.app/prod',
            contextPrefix: 'merit:ela:context',
            threadPrefix: 'merit:ela:thread'
        };
        
        // Prefer API Gateway endpoint
        this.baseUrl = ENDPOINTS.api;
        this.headers = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.API_GATEWAY_KEY || '68gmsx2jsk',
            'X-Project-ID': this.config.project_id,
            'Origin': 'https://recursivelearning.app'
        };
    }
}

// ✅ CORRECT: API request with CORS support
async sendRequest(action, payload) {
    try {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ action, ...payload }),
            mode: 'cors' // Include CORS mode for browser requests
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
}
```

## Common Mistakes

```javascript
// ❌ WRONG: Using _dev endpoint
const endpoint = 'https://api.recursivelearning.app/dev';  // NEVER DO THIS

// ❌ WRONG: Implementing fallback logic to dev
const fallbackEndpoint = endpoint + '/dev';  // NEVER DO THIS

// ❌ WRONG: DNS retry with dev endpoint
if (error.code === 'ERR_NAME_NOT_RESOLVED') {
    return tryFallbackEndpoint();  // NEVER DO THIS
}

// ❌ WRONG: Missing CORS mode for browser requests
fetch(this.baseUrl, {
    method: 'POST',
    headers: this.headers,
    body: JSON.stringify(data)
    // Missing 'mode: 'cors''
});

// ❌ WRONG: Missing Origin header
this.headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    // Missing 'Origin': 'https://recursivelearning.app'
};
```

## Environment Configuration

```bash
# Production Configuration
API_GATEWAY_ENDPOINT=https://29wtfiieig.execute-api.us-east-2.amazonaws.com/prod
API_GATEWAY_KEY=68gmsx2jsk
LAMBDA_ENDPOINT=https://api.recursivelearning.app/prod
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

If your code currently uses only the Lambda endpoint:

1. Update your code to use the API Gateway endpoint
2. Add the necessary CORS headers and mode
3. Ensure your API key is set correctly
4. Test with the provided test script (test-prod-endpoint.js)
5. Verify CORS headers are properly received

## Support

If you encounter API Gateway or CORS issues:
1. Verify API_GATEWAY_ENDPOINT and API_GATEWAY_KEY environment variables
2. Check CORS headers in network requests
3. Ensure 'Origin' header is set correctly
4. Test OPTIONS preflight request succeeds
5. Contact DevOps team for API Gateway verification

Remember: For browser-based requests, always include `mode: 'cors'` in your fetch options and set the 'Origin' header appropriately. 

# Merit API Gateway Endpoints

## Critical Blockers (May 19, 2025)

🚨 **VPC Link Creation Required**
- Current Status: Failed
- Error: "Vpc link VpcLink was not found in account 559050208320"
- Impact: API Gateway deployment blocked
- Resolution Path:
  1. Verify Load Balancer in account 559050208320
  2. Create VPC Link manually
  3. Update YAML configurations
  4. Redeploy API Gateway

## Configuration Files

- `client-merit-gateway-cors.yaml` - Primary production configuration (BLOCKED)
- `client-merit-gateway-cors-beautiful.yaml` - Testing/staging configuration (DO NOT DEPLOY)
- `client-merit-gateway-monitoring.yaml` - CloudWatch monitoring setup
- `client-merit-vpc-link.yaml` - VPC Link CloudFormation template (PENDING)

## Deployment Flow

1. **VPC Link Setup** (CRITICAL)
   - Create VPC Link in AWS Console
   - Document VPC Link ID
   - Update YAML configurations
   - Verify connectivity

2. **API Gateway Deployment** (BLOCKED)
   - Update configurations with VPC Link ID
   - Deploy to staging
   - Verify CORS and endpoints
   - Deploy to production

3. **Integration Testing** (PENDING)
   - Test all endpoints
   - Verify CORS headers
   - Validate error responses
   - Check monitoring

## Configuration Files

- `client-merit-gateway-cors.yaml` - Primary production CORS configuration
- `client-merit-gateway-cors-beautiful.yaml` - Testing/staging configuration (DO NOT DEPLOY)
  - Used for testing configuration changes
  - Parallel development file
  - Changes should be tested here first
  - Once verified, copy to primary configuration
- `client-merit-gateway-monitoring.yaml` - CloudWatch monitoring setup
- `client-merit-gateway-cors-review.yaml` - Review environment configuration
- `client-merit-gateway-cors-20240420.yaml` - Dated snapshot configuration 