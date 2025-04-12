# Merit MVP Launch - Instructional Page Template
Version: 1.0.0 [April 12, 2025]

## Overview
This template defines the implementation pattern for instructional pages on the Recursive Learning platform, focusing on completing the UX/UI MVP and integrating with OpenAI Assistants through Redis handshake.

## v1.0.12 (08:40) Verification Results

### Layout Status
1. Header State
   - [✓] EL Education white logo, left-aligned
   - [✓] Version "v1.0.12 (08:40)" in white, right-aligned
   - [✓] Crimson background (#c6123f)
   - [✓] 60px height, full width
   - [✗] Box shadow missing or too subtle

2. Sidebar State
   - [!] Not visible in screenshot - CRITICAL ISSUE
   - [ ] Fixed 250px width
   - [ ] White background
   - [ ] Navigation links missing
   - [ ] Need to verify hover states

3. Welcome Content
   - [✓] Centered in content area
   - [✓] "Welcome to Merit" h1
   - [✓] Subtitle as h2
   - [✓] Form with:
     - [✓] Grade level dropdown (empty)
     - [✓] ELA curriculum dropdown (selected)
     - [✓] Custom dropdown arrows (crimson)
     - [✓] Proper spacing between elements

4. Footer State
   - [!] Not visible in screenshot - CRITICAL ISSUE
   - [ ] Need to verify 80px height
   - [ ] Need to verify grid layout
   - [ ] Need to verify button states

### Console Output Analysis
```javascript
// Initialization Sequence Working:
[✓] Flow controller initializes
[✓] Navigates to welcome section
[✓] Navigation completes successfully
[✓] State logging works:
    - Current Section: welcome
    - Form Valid: false (expected)
    - Grade Level: null (expected)
    - Curriculum: ela (expected)
    - Path: correct with #welcome hash
```

### Critical Issues Found
1. Missing Components
   - [!] Sidebar completely absent
   - [!] Footer not visible
   - [!] Navigation system partially implemented

2. Working Features
   - [✓] Instructional flow initialization
   - [✓] Form state management
   - [✓] URL hash handling
   - [✓] Version display

3. Next Actions
   1. Restore Sidebar:
      ```javascript
      // Check CSS display property
      .sidebar {
          display: flex !important; // Override any display: none
          visibility: visible;
      }
      ```
   
   2. Fix Footer:
      ```javascript
      // Verify footer CSS
      .client-footer {
          position: fixed;
          bottom: 0;
          width: 100%;
          z-index: 100;
      }
      ```

   3. Verify Navigation:
      ```javascript
      // Add logging to navigation handlers
      handleNavigation(sectionId) {
          console.log('[Merit Flow] Handling navigation:', sectionId);
          // ... existing code
      }
      ```

### Test Results
1. Initial Load ⚠️
   - [✓] Version display correct
   - [✗] Layout missing critical components
   - [✓] Form state correct
   - [✓] Console logging working

2. Form State ✓
   - [✓] Initial state correct
   - [✓] Grade level null
   - [✓] Curriculum set to "ela"
   - [✓] Form validation false

3. Flow Control ⚠️
   - [✓] Initialization sequence works
   - [✓] State management working
   - [✗] Navigation system incomplete
   - [✗] Component visibility issues

### Next Steps
1. Immediate Fixes
   - Restore sidebar visibility
   - Verify footer positioning
   - Test navigation handlers
   - Add missing box shadows

2. Secondary Issues
   - Verify hover states
   - Test responsive layout
   - Complete navigation system
   - Add loading indicators

## Critical Implementation Priorities

### 1. Complete UX/UI MVP [IMMEDIATE]
- [ ] Fix tab navigation and section transitions
  - [ ] Ensure proper form initialization
  - [ ] Fix section visibility toggling
  - [ ] Synchronize footer state changes
  - [ ] Add loading indicators

- [ ] Form Validation & Flow
  - [ ] Grade level selection validation
  - [ ] Immediate chat access post-validation
  - [ ] Form state persistence
  - [ ] Error message display

- [ ] Mobile Responsive Testing
  - [ ] Test all breakpoints
  - [ ] Verify sidebar behavior
  - [ ] Check input/button sizing
  - [ ] Validate touch targets

### 2. Redis Handshake Integration [NEXT]
- [ ] Implement Redis connection with VPC settings
  - [ ] Use updated MVP TTL settings
  - [ ] Configure user ID mapping
  - [ ] Set up connection pooling
  - [ ] Add reconnection logic

- [ ] Thread Management
  - [ ] Implement thread caching
  - [ ] Handle persistence
  - [ ] Manage state transitions
  - [ ] Error recovery

### 3. Assistant Integration [ONGOING]
- [ ] Configure grade-level assistants
  - [ ] Map document namespaces
  - [ ] Set up context handling
  - [ ] Implement state sync
  - [ ] Add error boundaries

## Implementation Checklist

### Remaining UX Tasks
```javascript
// Tab Navigation Fix
class MeritPageNavigation {
  constructor() {
    this.sections = document.querySelectorAll('.section');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.footer = document.querySelector('.client-footer');
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleNavigation(link.dataset.section);
      });
    });
  }

  handleNavigation(sectionId) {
    // Update active section
    this.sections.forEach(section => {
      section.classList.toggle('active', section.dataset.section === sectionId);
    });

    // Update footer state
    this.updateFooterState(sectionId);

    // Update URL without reload
    history.pushState({}, '', `#${sectionId}`);
  }
}
```

### Redis Integration
```javascript
class RedisClient {
  constructor(config) {
    this.config = {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_AUTH,
      tls: true, // VPC requirement
      maxRetriesPerRequest: 3,
      ttl: 3600 // 1 hour default
    };
  }

  async cacheThread(threadId, messages, userId) {
    const key = `chat:thread:${userId}:${threadId}`;
    await this.client.set(key, JSON.stringify(messages));
    await this.client.expire(key, this.config.ttl);
  }
}
```

### Assistant Context Management
```javascript
class AssistantManager {
  static getAssistantConfig(gradeLevel) {
    return {
      assistantId: `asst_grade_${gradeLevel}`,
      model: "gpt-4-turbo",
      name: `Grade ${gradeLevel} Merit Assistant`,
      threadTTL: 3600 // 1 hour
    };
  }
}
```

## Testing Requirements

### 1. UX Validation
- [ ] Tab Navigation
  - [ ] Section transitions smooth
  - [ ] Footer state synced
  - [ ] History management working
  - [ ] Loading states visible

- [ ] Form Behavior
  - [ ] Validation immediate
  - [ ] Error messages clear
  - [ ] Submit enabled correctly
  - [ ] State preserved

- [ ] Responsive Design
  - [ ] Mobile layout correct
  - [ ] Tablet layout correct
  - [ ] Touch targets adequate
  - [ ] Keyboard navigation works

### 2. Integration Testing
- [ ] Redis Connection
  - [ ] VPC access working
  - [ ] Authentication successful
  - [ ] Reconnection handles failures
  - [ ] TTL settings correct

- [ ] Assistant Integration
  - [ ] Grade level mapping works
  - [ ] Context preserved
  - [ ] Document access verified
  - [ ] Error handling proper

## Next Steps

### Immediate (24 Hours)
1. Complete tab navigation fixes
2. Implement form validation flow
3. Test responsive design
4. Add loading states

### Documentation (48 Hours)
1. Creative Director Guide
   ```markdown
   # Merit Design System Guide
   
   ## Overview
   Merit represents our new design direction for instructional interfaces.
   This guide documents key design decisions and patterns.
   
   ## Core Design Principles
   - Clean, focused interfaces
   - Progressive disclosure
   - Consistent interaction patterns
   - Accessibility-first design
   
   ## Component Library
   - Form elements
   - Navigation patterns
   - Chat interface
   - Loading states
   
   ## Design Tokens
   - Color system
   - Typography
   - Spacing
   - Animation
   ```

2. Frontend Implementation Guide
   ```markdown
   # Merit Frontend Implementation Guide
   
   ## Overview
   Merit serves as our canonical example for instructional page implementation.
   
   ## Key Features
   - Tab-based navigation
   - Form validation patterns
   - Chat integration
   - Redis persistence
   
   ## Implementation Example
   Using ELPL Merit as a concrete example:
   1. Form initialization
   2. Navigation system
   3. State management
   4. Chat integration
   
   ## Code Structure
   - Instructional flow handler
   - Component initialization
   - Event management
   - Error boundaries
   ```

3. Update Layout Template
   - Publish updated @merit-page-layout-template.md
   - Include new navigation patterns
   - Document state management
   - Add accessibility guidelines

### Short-term (72 Hours)
1. Set up Redis handshake
2. Configure VPC access
3. Implement thread caching
4. Test assistant mapping

### Medium-term (1 Week)
1. Enhance error handling
2. Add analytics
3. Optimize performance
4. Complete documentation

## Notes
- Focus on completing UX/UI MVP first
- Use updated Redis VPC and TTL settings
- Follow frontend team's handshake doc
- Test thoroughly before deployment

## Contact
- Frontend UX Team
- Redis Integration Team
- Platform Architecture
- Security Team 