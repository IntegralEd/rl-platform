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
- [ ] Configure Redis with proper session-based flow:
  ```javascript
  // Redis Cache Structure
  const REDIS_CONFIG = {
      prefix: 'merit',
      ttl: 3600, // 1 hour temp cache
      keys: {
          // Anonymous-friendly session keys
          session: (sessionId) => `merit:session:${sessionId}`,
          context: (sessionId) => `merit:context:${sessionId}`,
          thread: (sessionId) => `merit:thread:${sessionId}`,
          
          // Optional authenticated user mapping
          user: (email) => `merit:user:${email}` // Only if authenticated
      }
  };

  // Session Context Flow
  const sessionFlow = {
      // 1. Generate session ID and cache data
      initial: {
          sessionId: generateSessionId(), // UUID v4
          gradeLevel: "Grade 3",
          curriculum: "ela",
          schema_version: process.env.SCHEMA_VERSION,
          isAuthenticated: false, // Default to anonymous
          email: null, // Optional, only if authenticated
          created_at: Date.now()
      },
      
      // 2. Only create AirTable record if authenticated
      airtable: {
          condition: "isAuthenticated",
          trigger: "chat_initialized",
          retry: 3,
          fields: [
              "Session_ID", // Required
              "Email",      // Optional
              "Grade_Level",
              "Curriculum",
              "Schema_Version",
              "Thread_ID"
          ]
      }
  };

  // Session ID Generation
  function generateSessionId() {
      return 'merit-' + 
             Date.now() + 
             '-' + 
             Math.random().toString(36).substring(2);
  }
  ```
- [ ] Implement session-based caching:
  1. Generate unique session ID on form load
  2. Cache form data with session ID
  3. Create AirTable record only if authenticated
  4. Maintain session mapping for authenticated users
- [ ] Set up proper error handling:
  - [ ] Redis connection failures
  - [ ] Session validation
  - [ ] AirTable sync for authenticated users
- [ ] Add monitoring for sessions:
  - [ ] Track active sessions
  - [ ] Monitor anonymous vs authenticated usage
  - [ ] Alert on session anomalies

### Progressive User Engagement Flow [MVP APPROACH]
- [x] Implement tiered session management:
  ```javascript
  // Session Tiers
  const SESSION_TYPES = {
    ANONYMOUS: 'anonymous',    // Browser session only
    PERSISTENT: 'persistent',  // User opted to save
    EMBEDDED: 'embedded'       // Auth from wrapper (Softr etc)
  };
  ```

- [x] Implement persistence prompt UI:
  ```javascript
  // Persistence Prompt Flow
  const PERSISTENCE_UI = {
    trigger: {
      messageCount: 3,      // Show after 3 messages
      position: 'top-right',
      animation: 'slide-in'
    },
    components: {
      title: 'Save Your Progress?',
      message: 'Would you like to save your chat history and preferences for future sessions?',
      actions: [
        {
          text: 'Maybe Later',
          type: 'secondary',
          action: 'dismiss'
        },
        {
          text: 'Save Progress',
          type: 'primary',
          action: 'enable_persistence'
        }
      ]
    },
    logging: {
      events: [
        'PERSISTENCE_PROMPT',    // When prompt is shown
        'PERSISTENCE_DISMISSED', // User clicks "Maybe Later"
        'PERSISTENCE_ENABLED'    // User opts to save
      ]
    }
  };
  ```

- [x] Add session flow logging:
  ```javascript
  // Session Flow Logging
  const SESSION_LOGGING = {
    events: {
      SESSION_CREATED: {
        data: {
          sessionId: 'merit-{timestamp}-{random}',
          type: 'anonymous',
          created_at: timestamp
        }
      },
      PERSISTENCE_PROMPT: {
        data: {
          sessionId: 'current',
          messageCount: 3,
          context: 'current'
        }
      },
      PERSISTENCE_DISMISSED: {
        data: {
          sessionId: 'current',
          timestamp: 'action_time'
        }
      },
      PERSISTENCE_ENABLED: {
        data: {
          sessionId: 'current',
          timestamp: 'action_time'
        }
      }
    },
    storage: {
      debug_panel: true,    // Show in debug UI
      console: true,        // Log to console
      redis: true          // Store in Redis
    }
  };
  ```

- [x] Implement session state transitions:
  ```javascript
  // Session State Machine
  const SESSION_STATES = {
    initial: 'anonymous',
    transitions: {
      anonymous: {
        on_persistence: 'collecting_email',
        on_dismiss: 'anonymous'
      },
      collecting_email: {
        on_submit: 'persistent',
        on_cancel: 'anonymous'
      },
      persistent: {
        on_expire: 'anonymous',
        on_logout: 'anonymous'
      }
    },
    ttl: {
      anonymous: 3600,    // 1 hour
      persistent: 2592000 // 30 days
    }
  };
  ```

### Testing Requirements [UPDATED]

#### Session Management Testing
- [ ] Verify anonymous session creation
  ```bash
  # Expected Console Output
  [2025-04-18T14:30:00.000Z] SESSION FLOW - SESSION_CREATED: {
    sessionId: "merit-1744982078625-abc123",
    type: "anonymous",
    created_at: 1744982078625
  }
  ```
- [ ] Test persistence prompt trigger
  ```bash
  # After 3 messages
  [2025-04-18T14:35:00.000Z] SESSION FLOW - PERSISTENCE_PROMPT: {
    sessionId: "merit-1744982078625-abc123",
    messageCount: 3,
    context: { ... }
  }
  ```
- [ ] Validate prompt UI
  - [ ] Appears in top-right corner
  - [ ] Slides in smoothly
  - [ ] Both buttons work correctly
  - [ ] Proper event logging
- [ ] Test state transitions
  - [ ] Anonymous → Collecting Email
  - [ ] Collecting Email → Persistent
  - [ ] Proper TTL updates

### Next Steps
1. [x] Add persistence prompt UI
2. [x] Implement session logging
3. [ ] Test session flow
4. [ ] Validate state transitions
5. [ ] Test email collection
6. [ ] Verify data persistence

### Quality Control
- [x] Session events logged to console
- [x] Debug panel shows session flow
- [x] Persistence prompt styled correctly
- [x] Smooth animations implemented
- [ ] Error states handled properly

### Storage Implementation
1. [ ] OpenAI Integration:
   - Immediate message storage
   - Thread management
   - Metadata attachment

2. [ ] Redis Caching:
   - Quick message retrieval
   - Session management
   - TTL based on user type

3. [ ] AirTable Storage:
   - ALL threads stored
   - ALL messages stored
   - Async but guaranteed
   - Retry on failure

### Data Consistency
- [ ] Verify thread creation in all systems
- [ ] Confirm message storage in AT tables
- [ ] Monitor Redis cache sync
- [ ] Track storage success rates

### Recovery Procedures
- [ ] Handle OpenAI failures
- [ ] Manage AT retry queue
- [ ] Redis cache rebuilding
- [ ] Session restoration

### Quality Control
- [x] All chats saved to OpenAI regardless of user type
- [x] All threads available for QC and learning
- [ ] User association optional but recoverable
- [ ] Session data encrypted in Redis

### Next Steps
1. Implement anonymous chat flow
2. Add message counter
3. Create save prompt UI
4. Build context persistence
5. Test session recovery

### Team Coordination
- [ ] UX team: Design save prompt
- [ ] Security: Review session handling
- [ ] QA: Test all user paths

### Contact Information
- Security Team: #security-team
- Redis Team: #redis-team
- Backend Team: #backend-team

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
- [x] Remove hardcoded API keys and project IDs from merit.html
- [x] Move version display from UI to console logging
- [x] Update header structure to match client layout rules

## Environment Testing
- [x] Create test script at `clients/elpl/merit/test-env.sh`
- [ ] Run environment verification:
  - [ ] Make script executable: `chmod +x test-env.sh`
  - [ ] Run script: `./test-env.sh`
- [ ] Verify all environment variables are loaded
  - [ ] MERIT_API_KEY
  - [ ] OPENAI_PROJECT_ID
  - [ ] SCHEMA_VERSION
  - [ ] LAMBDA_ENDPOINT
  - [ ] REDIS_URL
- [ ] Confirm API connectivity
- [ ] Test Redis connection
- [ ] Check schema version compatibility

## Redis Connection Resolution (BLOCKING)
- [x] Create Redis test script
- [ ] Verify Redis credentials
- [ ] Run connection tests
- [ ] Document any connection errors
- [ ] Update DNS records if needed

## Next Steps
1. Run Redis test script to verify connection
2. Test API key independently
3. Update checklist with findings
4. Coordinate with team on any blocking issues

## Team Coordination
- DevOps Lead: @devops-lead
- Backend Support: @backend-team
- Frontend Lead: @frontend-lead

## Support Contacts
- Redis Issues: devops@recursivelearning.app
- API Gateway: api-support@recursivelearning.app
- Frontend: frontend@recursivelearning.app

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

## API Gateway Configuration

### Current Status: READY FOR PRODUCTION
- [x] Direct API Gateway URL verified: https://29wtfiieig.execute-api.us-east-2.amazonaws.com/prod
- [x] Both endpoints tested and working:
  - `/api/v1/mock` - GET endpoint for testing
  - `/api/v1/context` - POST endpoint for context management

### Endpoint Status
1. Mock Endpoint (`/api/v1/mock`):
   ```bash
   # Test Results:
   - Status: 200 OK
   - CORS: https://recursivelearning.app
   - Headers: All required headers accepted
   - Response: {"message": "Mock response successful", "timestamp": "1745061601537"}
   ```

2. Context Endpoint (`/api/v1/context`):
   ```bash
   # Test Results:
   - Status: 200 OK
   - Method: POST
   - CORS: * (Consider restricting to specific origin)
   - Headers: All required headers accepted
   - Payload: Accepts grade level and curriculum
   - Response: Returns full context including assistant IDs
   ```

### Recommended Updates
1. Standardize CORS headers:
   ```javascript
   // Current configuration:
   /mock    -> https://recursivelearning.app
   /context -> *
   
   // Recommended:
   Both endpoints -> https://recursivelearning.app
   ```

2. Verify Lambda integrations:
   ```javascript
   // Both endpoints integrated with:
   - API key validation
   - Project ID header check
   - Proper error responses
   - CloudWatch logging enabled
   ```

### Next Steps
1. [ ] Standardize CORS headers across endpoints
2. [ ] Update client code to use direct API Gateway URL
3. [ ] Monitor CloudWatch logs for both endpoints
4. [ ] Set up alerts for error rates

## Build & Test Progression

### Stage 1: MVP Redis Chat [CURRENT FOCUS]
- [ ] Basic Redis Chat Implementation
  ```javascript
  // MVP Chat Flow
  const MVP_CHAT = {
    init: {
      sessionId: generateSessionId(),
      storage: {
        openai: true,      // Required for chat
        redis: true,       // Required for session
        airtable: true     // Required for persistence
      },
      identity: 'anonymous' // MVP starts anonymous
    },
    
    logging: {
      client: {
        SESSION_START: 'Chat initialized with session ${sessionId}',
        MESSAGE_SEND: 'Message sent to thread ${threadId}',
        MESSAGE_RECEIVE: 'Response received from assistant',
        STORAGE_SUCCESS: 'Thread stored in all systems'
      },
      page: {
        CHAT_READY: 'Chat component mounted and ready',
        REDIS_CONNECTED: 'Redis connection established',
        OPENAI_READY: 'OpenAI client initialized'
      }
    },
    
    validation: {
      required: [
        'redis.connection',
        'openai.thread',
        'airtable.access'
      ],
      optional: [
        'user.identity',
        'email.capture'
      ]
    }
  };
  ```

### Stage 2: Email Identity [NEXT]
- [ ] Email Capture UI/UX
  ```javascript
  // Email Identity Flow
  const EMAIL_IDENTITY = {
    trigger: {
      conditions: [
        'messageCount >= 3',
        'chatValue === true',
        'noExistingIdentity'
      ],
      ui: {
        type: 'inline-prompt',
        position: 'above-chat',
        style: 'non-disruptive'
      }
    },
    
    logging: {
      client: {
        PROMPT_SHOW: 'Email capture prompt displayed',
        EMAIL_SUBMIT: 'Email submitted: ${email}',
        IDENTITY_SET: 'User identity established'
      },
      page: {
        PROMPT_READY: 'Email capture component mounted',
        VALIDATION_PASS: 'Email validated successfully',
        CONTEXT_UPDATED: 'User context updated with email'
      }
    }
  };
  ```

### Stage 3: Softr Integration [AFTER EMAIL]
- [ ] Softr Wrapper Identity
  ```javascript
  // Softr Identity Flow
  const SOFTR_IDENTITY = {
    detection: {
      type: 'wrapper',
      source: 'softr',
      method: 'postMessage'
    },
    
    logging: {
      client: {
        WRAPPER_DETECTED: 'Softr wrapper detected',
        AUTH_RECEIVED: 'Softr auth data received',
        CONTEXT_SYNCED: 'Context synced with Softr'
      },
      page: {
        WRAPPER_READY: 'Wrapper communication established',
        AUTH_VERIFIED: 'Softr authentication verified',
        IDENTITY_LINKED: 'Identity linked to Softr user'
      }
    }
  };
  ```

### Stage 4: Storyline Integration [AFTER SOFTR]
- [ ] Storyline Embed Identity
  ```javascript
  // Storyline Identity Flow
  const STORYLINE_IDENTITY = {
    detection: {
      type: 'embed',
      source: 'storyline',
      method: 'iframe'
    },
    
    logging: {
      client: {
        EMBED_DETECTED: 'Storyline embed detected',
        CONTEXT_RECEIVED: 'Storyline context received',
        STATE_SYNCED: 'State synced with Storyline'
      },
      page: {
        EMBED_READY: 'Storyline communication ready',
        CONTEXT_VERIFIED: 'Storyline context verified',
        BRIDGE_ACTIVE: 'Storyline bridge active'
      }
    }
  };
  ```

### Stage 5: Anonymous Public [FINAL]
- [ ] Public Anonymous Access
  ```javascript
  // Anonymous Flow
  const ANONYMOUS_FLOW = {
    rules: {
      maxMessages: 10,
      sessionTTL: 3600,
      promptTrigger: 5
    },
    
    logging: {
      client: {
        SESSION_START: 'Anonymous session started',
        LIMIT_WARNING: 'Approaching message limit',
        PROMPT_TRIGGER: 'Save prompt triggered'
      },
      page: {
        ANON_READY: 'Anonymous mode active',
        LIMITS_SET: 'Session limits configured',
        STORAGE_TEMP: 'Temporary storage active'
      }
    }
  };
  ```

### Testing Gates & Validation

#### MVP Gate (Current Focus)
- [ ] Redis connection successful
- [ ] OpenAI thread creation working
- [ ] AirTable storage confirmed
- [ ] Basic chat functional
- [ ] Session management working

#### Identity Gate 1 (Email)
- [ ] Email prompt triggers correctly
- [ ] Validation working
- [ ] Context persistence verified
- [ ] Thread linking functional
- [ ] AirTable user record created

#### Identity Gate 2 (Softr)
- [ ] Wrapper detection working
- [ ] Auth flow functional
- [ ] Context sync verified
- [ ] User state maintained
- [ ] Error handling tested

#### Identity Gate 3 (Storyline)
- [ ] Embed detection working
- [ ] Context passing verified
- [ ] State sync functional
- [ ] Bridge communication tested
- [ ] Error recovery working

#### Identity Gate 4 (Anonymous)
- [ ] Session limits working
- [ ] Storage rules applied
- [ ] Prompt timing correct
- [ ] State cleanup verified
- [ ] Rate limiting active

### Console Logging Structure
```javascript
// Unified Logging System
const IDENTITY_LOGGING = {
  // Identity States
  STATES: {
    UNKNOWN: 'Identity not yet determined',
    EMAIL: 'Email identity confirmed',
    SOFTR: 'Softr wrapper identity',
    STORYLINE: 'Storyline embed identity',
    ANONYMOUS: 'Confirmed anonymous user'
  },

  // Log Levels
  LEVELS: {
    INFO: 'standard flow',
    WARN: 'potential issues',
    ERROR: 'blocking problems',
    DEBUG: 'development info'
  },

  // Identity Transitions
  TRANSITIONS: {
    DETECT: 'Starting identity detection',
    CONFIRM: 'Identity confirmed as ${type}',
    CHANGE: 'Identity changing from ${old} to ${new}',
    PERSIST: 'Identity persisted to storage'
  }
};

// Client-Side Logging
window.MERIT_LOGGER = {
  log: (level, category, message, data) => {
    console.log(
      `[MERIT ${level}] ${category}: ${message}`,
      data || ''
    );
    
    // Also send to monitoring if needed
    if (level === 'ERROR') {
      // Alert monitoring
    }
  }
};
```

### Build Order & Dependencies
1. MVP Redis Chat
   - Redis connection
   - OpenAI integration
   - Basic storage
   
2. Email Identity
   - Prompt UI/UX
   - Validation
   - Context update
   
3. Softr Integration
   - Wrapper detection
   - Auth flow
   - Context sync
   
4. Storyline Integration
   - Embed detection
   - Bridge setup
   - State sync
   
5. Anonymous Public
   - Session limits
   - Storage rules
   - Prompt system
