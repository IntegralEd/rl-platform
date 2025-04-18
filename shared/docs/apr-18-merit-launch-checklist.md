# Merit Launch Checklist - April 18, 2025
Version: 1.0.6

## **ATTN: Backend Team / DNS Config for Redis needed today**
**CRITICAL: Missing DNS Record Blocking Redis Connection**
- Current Status: ❌ No DNS record for `redis.recursivelearning.app`
- Required Action: Add CNAME record in Hover control panel
- Value: `29wtfiieig.execute-api.us-east-2.amazonaws.com` (Same as API Gateway)
- Priority: IMMEDIATE (blocking Merit launch)
- TTL: 15 Minutes (match existing records)
- Contact: Backend Team Lead for endpoint verification
- Validation: Will require DNS propagation check after addition

## **ATTN: Backend Team / API Gateway Configuration Required**
**CRITICAL: API Gateway Setup for Merit First End-to-End**
- Current Status: ❌ API Gateway needs configuration update
- API ID: `29wtfiieig` (us-east-2)
- Required Actions:
  1. Configure REST API endpoints:
     ```javascript
     // Current Configuration
     - Base Path: /api/v1
     - Stage: dev (needs prod)
     - Mock Integration: Enabled
     
     // Required Configuration
     - Add prod stage
     - Configure Lambda Integration
     - Update routing for Merit endpoints
     ```
  2. Update API Gateway settings:
     ```javascript
     // Required Method Settings
     {
       "methodSettings": {
         "*/*": {
           "throttlingBurstLimit": 100,
           "throttlingRateLimit": 50.0,
           "metricsEnabled": true,
           "dataTraceEnabled": true
         }
       }
     }
     ```
  3. Configure Authentication:
     ```bash
     # AWS CLI Commands Needed
     aws apigateway create-deployment \
       --rest-api-id 29wtfiieig \
       --stage-name prod \
       --region us-east-2
       
     aws apigateway update-stage \
       --rest-api-id 29wtfiieig \
       --stage-name prod \
       --patch-operations \
         op=replace,path=/*/*/logging/dataTrace,value=true \
         op=replace,path=/*/*/metrics/enabled,value=true
     ```
- Priority: IMMEDIATE (blocking Merit launch)
- Contact: Backend Team Lead for API Gateway configuration
- Validation: Will require end-to-end testing after changes

### Infrastructure Configuration [FROM LAMBDA TEAM]
```javascript
// Infrastructure Configuration
const ENDPOINTS = {
    // Main entrance - Web Traffic (Port 443)
    api: {
        url: 'https://api.recursivelearning.app/prod',
        port: 443,
        protocol: 'https',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.MERIT_API_KEY,
            'X-Project-ID': process.env.OPENAI_PROJECT_ID
        }
    },
    // Service entrance - Redis Traffic (Port 6379)
    redis: {
        url: 'redis://redis.recursivelearning.app',
        port: 6379,
        protocol: 'redis',
        auth: process.env.REDIS_AUTH_TOKEN
    }
};

// DNS Configuration in Hover
const DNS_RECORDS = {
    api: {
        type: 'CNAME',
        host: 'api',
        value: '29wtfiieig.execute-api.us-east-2.amazonaws.com',
        ttl: '15 Minutes'
    },
    redis: {
        type: 'CNAME',
        host: 'redis',
        value: '29wtfiieig.execute-api.us-east-2.amazonaws.com', // Same API Gateway
        ttl: '15 Minutes'
    }
};

// API Gateway Configuration
const GATEWAY_RULES = {
    'api.recursivelearning.app:443': {
        target: 'lambda',
        service: 'rl-restapi-lambda'
    },
    'redis.recursivelearning.app:6379': {
        target: 'redis',
        service: 'rl-redis-cache'
    }
};
```

This setup enables:
1. Chat traffic through `api.recursivelearning.app` (port 443)
2. Redis traffic through `redis.recursivelearning.app` (port 6379)
3. Both using the same API Gateway but different routing rules
4. Proper security isolation between services

The API Gateway intelligently routes:
- HTTPS requests to Lambda functions
- Redis protocol requests to Redis service
- All while maintaining proper security and authentication

## IMMEDIATE BLOCKERS [CRITICAL - MUST RESOLVE TODAY]

### 1. DNS Configuration [IN PROGRESS]
- [x] Main domain A records (@) pointing to GitHub Pages
  ```
  @ -> 185.199.108.153
  @ -> 185.199.109.153
  @ -> 185.199.110.153
  @ -> 185.199.111.153
  ```
- [x] API subdomain configuration
  ```
  api.recursivelearning.app -> 29wtfiieig.execute-api.us-east-2.amazonaws.com
  ```
- [x] ACM validation record
  ```
  _0c82b441670e25ae696abd2fe605696d.api -> d-ueohg7hhi6.execute-api.us-east-2.amazonaws.com
  ```
- [ ] Add Redis CNAME record
  ```
  redis.recursivelearning.app -> 29wtfiieig.execute-api.us-east-2.amazonaws.com
  ```
- [ ] Verify DNS propagation (can take up to 15 minutes)
- [ ] Test endpoint resolution:
  ```bash
  # Test API endpoint
  dig api.recursivelearning.app
  curl -v https://api.recursivelearning.app/health
  
  # Test Redis endpoint
  dig redis.recursivelearning.app
  nc -zv redis.recursivelearning.app 6379
  ```

### 2. API Authorization (403) [RESOLVED - MVP READY]
- [x] Check for IP restrictions
  ```javascript
  // API Gateway Configuration
  {
    "endpointConfiguration": {
      "types": ["REGIONAL"],
      "ipAddressType": "ipv4"
    }
  }
  // No IP restrictions found in resource policy
  // Using standard REGIONAL endpoint with IPv4
  ```
- [x] Test authentication methods:
  ```javascript
  // MVP Implementation: Simple API Key (✓ Working)
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': process.env.MERIT_API_KEY,
    'X-Project-ID': process.env.OPENAI_PROJECT_ID
  };
  
  // Note: AWS Signature V4 tested and working
  // Will be implemented post-MVP for enhanced security
  ```
- [x] Verify endpoint responses:
  ```javascript
  // Test Results (2025-04-18 13:14:38 GMT)
  {
    "statusCode": 200,
    "headers": {
      "access-control-allow-origin": "https://recursivelearning.app"
    },
    "body": {
      "message": "Mock response successful",
      "timestamp": "1744982078625"
    }
  }
  ```
- [ ] Next Steps:
  1. ✓ Verify no IP restrictions
  2. ✓ Test API key authentication
  3. [ ] Update client-merit-openai.js with API key auth
  4. [ ] Test remaining endpoints (/api/v1/context)
  5. [ ] Post-MVP: Implement AWS Signature V4 for enhanced security
- [x] Verify ACM certificate is valid and active
- [x] Confirm API Gateway stage deployment

### 3. Redis Integration [BLOCKING]
- [ ] Configure Redis with proper prefixes:
  ```javascript
  const REDIS_CONFIG = {
      prefix: 'merit:ela',
      contextKey: 'context',
      threadKey: 'thread',
      ttl: 3600 // 1 hour for MVP
  };
  ```
- [ ] Test Redis connectivity:
  ```javascript
  const redis = new Redis(process.env.REDIS_URL);
  await redis.ping();  // Should return PONG
  ```
- [ ] Implement context caching with schema validation
- [ ] Set up thread persistence with proper ID format:
  ```javascript
  const threadId = `threads:${orgId}:${userId}:${threadId}`;
  ```
- [ ] Add cache invalidation
- [ ] Test cache hit/miss ratios
- [ ] Verify TTL settings (3600s default)

## Implementation Priorities

### 1. Chat Functionality [HIGH]
- [ ] Complete end-to-end chat test with new environment config
- [ ] Verify thread creation with new endpoint
- [ ] Test message sending with proper headers
- [ ] Validate loading states
- [ ] Implement proper error recovery
- [ ] Add message queue for rate limiting
- [ ] Set up thread cleanup for abandoned sessions

### 2. Form & Navigation [HIGH]
- [ ] Complete grade-level validation
- [ ] Fix form initialization sequence
- [ ] Implement proper state management
- [ ] Add form data persistence
- [ ] Enhance navigation system
- [ ] Fix section transitions
- [ ] Add proper loading indicators

### 3. UI/UX Refinements [MEDIUM]
- [ ] Reduce vertical spacing between header and first card
- [ ] Standardize card padding to 24px
- [ ] Align form elements with 8px grid system
- [ ] Optimize welcome message container height
- [ ] Implement proper content max-width constraints
- [ ] Reduce footer height to 60px
- [ ] Improve button alignment in footer

### 4. Mobile & Responsive [MEDIUM]
- [ ] Complete mobile responsive testing
- [ ] Optimize tablet-specific layouts
- [ ] Improve mobile message display
- [ ] Verify touch target sizes
- [ ] Test responsive breakpoints
- [ ] Validate mobile footer layout

## Testing Requirements

### 1. Functionality Testing [HIGH]
- [ ] Test form submission flow
- [ ] Verify chat functionality
- [ ] Validate navigation system
- [ ] Check error handling
- [ ] Test loading states
- [ ] Verify button states
- [ ] Test message persistence

### 2. Performance Testing [MEDIUM]
- [ ] Measure render times
- [ ] Test scroll performance
- [ ] Verify loading states
- [ ] Check memory usage
- [ ] Monitor cache performance
- [ ] Test message virtualization
- [ ] Validate progressive loading

### 3. Accessibility Testing [HIGH]
- [ ] Complete accessibility audit
- [ ] Test screen reader compatibility
- [ ] Verify keyboard navigation
- [ ] Check ARIA labels
- [ ] Test high contrast mode
- [ ] Validate focus management
- [ ] Check color contrast compliance

## Integration Points

### 1. Backend Integration [HIGH]
- [ ] Verify API endpoint configuration
- [ ] Test authentication flow
- [ ] Implement retry logic
- [ ] Add proper error handling
- [ ] Set up monitoring
- [ ] Configure logging
- [ ] Test rate limiting

### 2. Redis Integration [HIGH]
- [ ] Complete Redis connection setup
- [ ] Test context caching
- [ ] Verify thread persistence
- [ ] Implement cache invalidation
- [ ] Monitor cache performance
- [ ] Set up error recovery
- [ ] Test concurrent access

## Documentation & Support

### 1. Technical Documentation [MEDIUM]
- [ ] Update implementation guide
- [ ] Document error handling
- [ ] Add troubleshooting guide
- [ ] Document Redis patterns
- [ ] Update API documentation
- [ ] Add deployment guide
- [ ] Create monitoring guide

### 2. User Documentation [MEDIUM]
- [ ] Create user guide
- [ ] Document known issues
- [ ] Add FAQ section
- [ ] Create support guide
- [ ] Document error messages
- [ ] Add usage examples
- [ ] Create quick start guide

## Launch Sequence

### 1. Pre-launch [HIGH]
- [ ] Complete all critical fixes
- [ ] Run full test suite
- [ ] Verify DNS configuration
- [ ] Check Redis integration
- [ ] Test error handling
- [ ] Verify monitoring
- [ ] Update documentation

### 2. Launch Day [HIGH]
- [ ] Deploy to production
- [ ] Monitor error rates
- [ ] Watch performance metrics
- [ ] Track user engagement
- [ ] Monitor cache performance
- [ ] Check error logs
- [ ] Verify DNS resolution

### 3. Post-launch [MEDIUM]
- [ ] Monitor user feedback
- [ ] Track performance metrics
- [ ] Watch error rates
- [ ] Monitor cache hits
- [ ] Check thread cleanup
- [ ] Verify data persistence
- [ ] Track user engagement

## Team Coordination

### 1. Backend Team
- [ ] Resolve DNS issues
- [ ] Verify API endpoints
- [ ] Configure rate limiting
- [ ] Set up monitoring
- [ ] Implement logging
- [ ] Test error handling
- [ ] Verify thread management

### 2. Frontend Team
- [ ] Complete UI refinements
- [ ] Fix navigation issues
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Test responsive design
- [ ] Verify accessibility
- [ ] Document components

### 3. DevOps Team
- [ ] Fix DNS configuration
- [ ] Set up monitoring
- [ ] Configure logging
- [ ] Verify Redis setup
- [ ] Test failover
- [ ] Monitor performance
- [ ] Track error rates

## Contact Information

### Critical Issues
- Backend Team Lead: [Contact for DNS/API issues]
- Redis Team: [Contact for cache issues]
- Frontend Team Lead: [Contact for UI/UX issues]
- DevOps Team: [Contact for infrastructure issues]

### Regular Updates
- Daily standup: 9:00 AM EDT
- Issue tracking: #merit-launch Slack channel
- Documentation: Shared drive /merit/launch
- Emergency contact: On-call rotation

## Notes
- All times in EDT
- Critical issues should be escalated immediately
- Use #merit-launch Slack channel for updates
- Document all changes in the changelog
- Follow the established deployment checklist
- Keep stakeholders updated on progress
- Monitor error rates closely during launch 

## Critical Blockers
- [x] Environment variables configured
- [ ] Redis connection issues resolved
- [ ] API authorization issues (403) resolved

## Environment & API Configuration
- [x] Create `.env` file with correct configuration
- [x] Update `client-merit-openai.js` configuration
- [x] Remove all instances of `/dev` from endpoint URLs
- [x] Update error handling to properly report endpoint issues
- [x] Verify environment variables are correctly loaded
- [x] Update tests to use proper endpoint mocking

## Redis Connection Resolution
- [x] Create Redis test script at `clients/elpl/merit/test-redis.js`
  - Implements platform standard access patterns
  - Tests read-only frontend access
  - Verifies context and schema access
  - Validates permission boundaries
- [ ] Verify Redis credentials
  - [ ] Check REDIS_PASSWORD environment variable
  - [ ] Confirm recursive-frontend user access
  - [ ] Test with direct redis-cli connection
- [ ] Run connection tests
  - [ ] Execute `node test-redis.js`
  - [ ] Verify DNS resolution for redis.recursivelearning.app
  - [ ] Check network connectivity to port 6379
  - [ ] Confirm SSL/TLS configuration if required
- [ ] Document any connection errors in detail
  - Error type (auth, permission, network)
  - Timestamp and frequency
  - Related environment variables

## Next Steps
1. Run Redis test script and document results
2. If DNS issues persist:
   ```bash
   dig redis.recursivelearning.app
   ping redis.recursivelearning.app
   telnet redis.recursivelearning.app 6379
   ```
3. Test API key independently:
   ```bash
   curl -v -H "Authorization: Bearer $API_KEY" $LAMBDA_ENDPOINT
   ```
4. Update this checklist with findings

## Team Coordination
- [ ] Share Redis test results with infrastructure team
- [ ] Coordinate with security for access review
- [ ] Schedule deployment window
- [ ] Prepare rollback plan

## Contact Information
- Infrastructure Support: #infra-support
- Security Team: #security-team
- Project Lead: @project-lead

### API Gateway Configuration [CRITICAL - NEW]
- [x] Confirm API Gateway endpoint structure
  ```javascript
  // Confirmed Working Configuration
  const API_CONFIG = {
    baseUrl: 'https://29wtfiieig.execute-api.us-east-2.amazonaws.com',
    stage: 'dev',
    basePath: '/api/v1',
    endpoints: {
      mock: '/mock',      // ✓ Tested & Working
      context: '/context' // Needs testing
    },
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.MERIT_API_KEY,
      'X-Project-ID': process.env.OPENAI_PROJECT_ID
    }
  };
  ```
- [x] Test mock endpoint
  ```bash
  # Test Results (2025-04-18 13:05:14 GMT):
  # Status: 200 OK
  # Response: {"message": "Mock response successful", "timestamp": "1744981514863"}
  # Request ID: 75e0e768-7b55-4297-994c-709a4936c449
  ```
- [ ] Create production stage
  - [ ] Stage name: prod
  - [ ] Enable CloudWatch logs
  - [ ] Configure throttling limits
  - [ ] Enable metrics
- [ ] Configure endpoints
  - [x] Test /api/v1/mock
  - [ ] Configure /api/v1/context
  - [ ] Add /auth/verify
  - [ ] Set up Lambda integrations
- [ ] Set up authentication
  - [ ] Configure IAM roles
  - [ ] Set up API key validation
  - [ ] Enable AWS_IAM authorization
- [ ] Testing and validation
  - [x] Verify API Gateway URL structure
  - [x] Test mock endpoint
  - [ ] Test context endpoint
  - [ ] Verify authentication
  - [ ] Check CloudWatch logs
  - [ ] Monitor metrics
