# Merit Launch Checklist - April 18, 2025
Version: 1.0.3

## IMMEDIATE BLOCKERS [CRITICAL - MUST RESOLVE TODAY]

### 1. Environment & API Configuration From Lambda Team
- [ ] Create `clients/elpl/merit/.env` file with correct configuration:
  ```env
  # Merit API Configuration
  MERIT_API_KEY=qoCr1UHh8A9IDFA55NDdO4CYMaB9LvL66Rmrga3J
  LAMBDA_ENDPOINT=https://api.recursivelearning.app/prod
  OPENAI_PROJECT_ID=proj_V4lrL1OSfydWCFW0zjgwrFRT
  MERIT_ASSISTANT_ID=asst_QoAA395ibbyMImFJERbG2hKT
  REDIS_URL=redis://redis.recursivelearning.app:6379
  
  # Organization Configuration
  ORG_ID=recdg5Hlm3VVaBA2u
  SCHEMA_VERSION=04102025.B01
  ```

- [ ] Test API endpoint with proper headers:
  ```bash
  curl -v -H "Content-Type: application/json" \
       -H "x-api-key: qoCr1UHh8A9IDFA55NDdO4CYMaB9LvL66Rmrga3J" \
       -H "X-Project-ID: proj_V4lrL1OSfydWCFW0zjgwrFRT" \
       https://api.recursivelearning.app/prod/chat
  ```

- [ ] Update `client-merit-openai.js` configuration:
  ```javascript
  // Core configuration
  this.config = {
      org_id: process.env.ORG_ID,
      assistant_id: process.env.MERIT_ASSISTANT_ID,
      project_id: process.env.OPENAI_PROJECT_ID,
      schema_version: process.env.SCHEMA_VERSION
  };
  
  // Request headers
  this.headers = {
      'Content-Type': 'application/json',
      'x-api-key': process.env.MERIT_API_KEY,
      'X-Project-ID': this.config.project_id
  };
  ```

- [ ] Remove all instances of `/dev` from endpoint URLs
- [ ] Update error handling to properly report endpoint issues
- [ ] Verify environment variables are correctly loaded
- [ ] Update tests to use proper endpoint mocking
### Port Configuration & Traffic Routing

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

This setup allows:
1. Chat traffic through `api.recursivelearning.app` (port 443)
2. Redis traffic through `redis.recursivelearning.app` (port 6379)
3. Both using the same API Gateway but different routing rules
4. Proper security isolation between services

The API Gateway intelligently routes:
- HTTPS requests to Lambda functions
- Redis protocol requests to Redis service
- All while maintaining proper security and authentication

### 2. DNS Resolution Issue
- [ ] Fix DNS resolution failure:
  ```bash
  # Test primary endpoint (should work)
  curl -v https://api.recursivelearning.app/chat
  
  # Verify headers
  curl -v -H "Content-Type: application/json" \
       -H "X-Project-ID: proj_V4lrL1OSfydWCFW0zjgwrFRT" \
       https://api.recursivelearning.app/chat
  ```
- [ ] Verify API gateway configuration
- [ ] Contact DevOps team for endpoint verification
- [ ] Remove any temporary `/dev` fixes
- [ ] Update DNS records if needed
- [ ] Implement proper error handling for DNS failures

### 3. Redis Integration [IN PROGRESS]
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
