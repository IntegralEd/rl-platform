# Apr-17 Merit Integration Checklist

## User Flow & Code Integration

### 1. Initial Form (`client-merit-instructional-flow.js`) [MVP]
```javascript
// Current State
this.state = {
  section: 'welcome',
  formValid: false,
  gradeLevel: null,
  curriculum: 'ela'
};

// Required Redis Changes
- [x] Add temp user ID generation
- [x] Implement Redis context preload
- [ ] Add Airtable record creation
```

**Form Submission Flow:**
1. User selects grade/curriculum
2. `validateForm()` triggers
3. On submit:
   - Generate temp ID: `merit-${Date.now()}`
   - Create Redis context: `context:{org_id}:{temp_id}:grade_level`
   - Initiate Airtable record creation
   - Preload assistant context

### 2. Context Building (`client-merit-openai.js`) [MVP]
```javascript
// Current State
this.threadId = null;
this.context = {};

// Required Redis Changes
- [x] Add Redis thread creation
- [x] Implement context hydration
- [x] Add empty message trigger
```

**Redis Thread Creation:**
```javascript
// Thread Metadata
`thread:{thread_id}:meta` = {
  created_at: timestamp,
  user_id: temp_id,
  grade_level: selected,
  curriculum: 'ela',
  status: 'preloading'
}

// Initial Message
`thread:{thread_id}:messages` = [{
  role: 'system',
  content: 'Grade level context loaded',
  timestamp: timestamp
}]
```

### 3. User Record Sync [Post-MVP]
```javascript
// Current State
this.userId = 'default-user'; // ❌ Needs Fix

// Required Redis Changes
- [ ] Implement Airtable sync listener
- [ ] Add Redis key migration
- [ ] Update thread metadata
```

**Sync Process:**
1. Airtable creates record → returns `user_id`
2. Update Redis keys:
   ```javascript
   // Migrate context
   RENAME context:{org_id}:{temp_id}:* context:{org_id}:{user_id}:*
   
   // Update thread metadata
   HSET thread:{thread_id}:meta user_id {user_id}
   ```
3. Update client state with real `user_id`

### 4. Chat Experience [MVP]
```javascript
// Current State
this.messages = [];

// Required Redis Changes
- [x] Implement message persistence
- [x] Add thread status tracking
- [ ] Add context updates
```

**Message Flow:**
1. User sends message
2. Store in Redis:
   ```javascript
   // Add to messages list
   RPUSH thread:{thread_id}:messages {
     role: 'user',
     content: message,
     timestamp: Date.now()
   }
   
   // Update context if needed
   HSET context:{org_id}:{user_id}:{field_id} value
   ```
3. Assistant responds
4. Store response:
   ```javascript
   RPUSH thread:{thread_id}:messages {
     role: 'assistant',
     content: response,
     timestamp: Date.now()
   }
   ```

## Redis Key Patterns
```
context:{org_id}:{user_id}:{field_id}  # User context
thread:{thread_id}:meta                # Thread metadata
thread:{thread_id}:messages            # Message history
```

## Implementation Guidance

### Frontend Integration Steps

1. **Initial Form Setup**
   ```javascript
   // See: tests/integration/redis-test-portal.html
   // Key files:
   // - client-merit-instructional-flow.js
   // - client-merit-openai.js
   ```

2. **Redis Integration**
   ```javascript
   // See: tests/integration/server.js
   // Key patterns:
   // - Context storage
   // - Thread management
   // - Message persistence
   ```

3. **Airtable Integration** [Post-MVP]
   ```javascript
   // See: docs/airtable-integration-script.js
   // Key steps:
   // - Record creation
   // - ID mapping
   // - Sync handling
   ```

### Testing Strategy

1. **Local Testing**
   - Use Redis test portal
   - Validate key patterns
   - Check message flow

2. **Integration Testing**
   - Form submission
   - Context building
   - Message persistence

3. **Production Testing**
   - Endpoint validation
   - Error handling
   - Performance metrics

## 1. Core Integration Tasks
- [x] Update schema version to 04102025.B01
- [x] Implement Redis key patterns:
  - `context:{org_id}:{thread_id}:{Field_AT_ID}`
  - `thread:{thread_id}:meta`
  - `thread:{thread_id}:messages`
- [x] Set Redis TTL to 3600s (1 hour)
- [x] Add schema version validation
- [x] Implement retry logic for DNS issues

## 2. State Management
- [x] Combine core and UI state
- [x] Add error state tracking
- [x] Implement context preloading
- [x] Add loading state management
- [x] Track Redis connection state

## 3. UI Components
- [x] Update form validation
- [x] Add loading indicators
- [x] Implement error states
- [x] Add navigation controls
- [x] Update welcome flow

## 4. Error Handling
- [x] Add DNS fallback logic
- [x] Implement retry mechanism
- [x] Add validation error tracking
- [x] Update error UI feedback
- [x] Add Redis error handling

## 5. Testing Requirements
- [ ] Form validation
- [ ] Navigation flow
- [ ] Error handling
- [ ] Redis integration
- [ ] State persistence
- [ ] UI responsiveness

## 6. Deployment Checklist
- [ ] Update version numbers
- [ ] Run test suite
- [ ] Update documentation
- [ ] Deprecate old files
- [ ] Verify Redis connectivity
- [ ] Test production endpoints

## 7. Documentation Updates
- [x] Create migration guide
- [x] Add deprecation notice
- [x] Update README
- [x] Document Redis patterns
- [x] Add error handling docs

## 8. Code Cleanup
- [x] Remove deprecated code
- [x] Update imports
- [x] Clean up comments
- [x] Standardize error messages
- [x] Update logging

## 9. Performance
- [x] Implement caching
- [x] Add request batching
- [x] Optimize state updates
- [x] Add loading indicators
- [x] Implement lazy loading

## 10. Security
- [x] Validate schema versions
- [x] Sanitize inputs
- [x] Add rate limiting
- [x] Implement error masking
- [x] Add request validation

## Notes
- All changes target production environment
- Schema version 04102025.B01 is required
- Redis TTL set to 1 hour
- DNS fallback to DEV endpoint if needed
- Contact David for questions 

## Follow-up Updates (Apr 17)

### Slack Update: Merit Live Page Simplification
```
:wrench: Quick update on Merit integration:
- Simplified merit_live.html to directly iframe the chatbase placeholder
- Removed version switching for now (will add back with admin panel)
- Focus: getting iframe sizing/integration right with Storyline
- Current URL: recursivelearning.app/clients/elpl/merit/merit_live.html

This lets us focus on getting the core Merit experience right before adding version management. Will circle back to add proper routing once we have the admin panel ready.
```

### Next Steps
- [x] Simplify merit_live.html to basic iframe
- [x] Update loading text for clarity
- [x] Add production switch note in code
- [ ] Verify no 404s on recursivelearning.app
- [ ] Test iframe sizing in Storyline
- [ ] Plan admin panel integration for version management 