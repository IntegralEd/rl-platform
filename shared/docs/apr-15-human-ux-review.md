# Human-AI Code Review & Update Protocol

**Objective:** Systematically update HTML pages and asset paths while maintaining clear Git visibility for human review. AI handles code updates and Git commands, humans verify visual changes and approve commits.

## AI Assistant Rules
- [ai] Only modify HTML/CSS code, no documentation updates unless requested
- [x] Update build datetime tags to show fixed build time (not live clock)
- [x] Wait for human confirmation of tracked changes before committing
- [x] Use format: `"Update {component} - {change} [MMDDhhmm.YYYY]"` for commits
- [x] Handle precise git commands to prevent typos
- [x] Focus on one file at a time to maintain clear diffs
- [!] CRITICAL: AI cannot save files in Cursor - only humans can save changes
- [!] AI cannot detect unsaved changes in Cursor editor
- [!] AI can only see changes after human saves them to disk
- [!] AI will add "🛑 STOP AND READ" after each file change

## Human Reviewer Rules
- [hu] Verify visual changes in browser before approving
- [x] Confirm Git status shows expected file changes
- [x] Watch for unintended cascade effects in styling
- [x] Note any new issues discovered during review
- [x] Lead decisions on folder restructuring
- [x] Handle quick file renames through IDE
- [x] Always save files after making changes (unsaved changes are lost if tab is closed)
- [x] Look for the dot indicator in tabs to identify unsaved changes
- [x] Verify 'M' appears in file tree after saving to confirm git tracking
- [!] ENABLE AUTO-SAVE: Open Cursor CLI and enable auto-save setting

🛑 STOP AND READ: Don't close any tabs until you've saved all changes! Enable auto-save in Cursor CLI to prevent data loss.

## Cursor Save/Sync Behavior Notes
- Changes in editor are not written to disk until explicitly saved
- Unsaved changes show as a dot next to the file tab name
- Closing a tab with unsaved changes will lose those changes
- Git cannot see changes until they are saved to disk
- 'M' indicator in file tree confirms changes are saved and tracked
- Always save before git operations to ensure changes are tracked
- Multiple unsaved files can cause confusing git states
- Save one file at a time to maintain clear git history

## Today's Process
1. AI proposes code change
2. Human verifies in browser
3. Human confirms tracked changes visible
4. AI handles git commands
5. Both verify commit success
6. Repeat for next change

## Apr15 Build Protocol
- Current integration blocked by authentication issues on main site
- 404 errors for platform JavaScript files preventing proper initialization
- Admin portal login modifications in progress but need asset migration
- Primary focus on resolving auth flow before proceeding with Merit MVP
- Required changes documented in punch list below

## Apr14 840pm punch list UX and Console items
### Site Tour Observations
#### Root Landing Page (https://recursivelearning.app/)
- **Console Errors:**
  - [x] 404 errors for JavaScript files:
    - [T] GET https://recursivelearning.app/shared/platform/js/platform-component-loader.js
      - Fix: Update import path in index.html to use correct platform path
      - Implementation: Add script with type="module" to head section
      - Commit: "Fix platform JS imports [04142025.2210.recursivelearning.app/index.html]"
    - [T] GET https://recursivelearning.app/shared/platform/js/platform-auth.js
      - Fix: Verify file exists in platform js directory
      - Implementation: Update auth module import path
      - Commit: "Update auth module path [04142025.2211.recursivelearning.app/index.html]"
    - [T] GET https://recursivelearning.app/shared/platform/js/platform-url-resolver.js
      - Fix: Ensure resolver module is in correct location
      - Implementation: Update resolver import path
      - Commit: "Fix URL resolver path [04142025.2212.recursivelearning.app/index.html]"
    
- **UI/UX Issues:**
  - [T] Admin button positioning
    - Fix: Adjust z-index and bottom margin
    - Path: /shared/platform/css/platform-core.css
    - Implementation: Update .admin-button class
    - Commit: "Fix admin button position [04142025.2213.recursivelearning.app/]"
    
  - [T] Version number format
    - Fix: Replace dynamic time with build datetime
    - Path: /shared/platform/js/platform-version.js
    - Implementation: Add build timestamp constant
    - Commit: "Update version display [04142025.2214.recursivelearning.app/]"
    
  - [T] Account icon dropdown
    - Fix: Implement hover/click dropdown menu
    - Path: /shared/platform/js/platform-nav.js
    - Implementation: Add dropdown event handlers
    - Commit: "Add account dropdown [04142025.2215.recursivelearning.app/]"
    
  - [T] Account icon logout shortcut
    - Fix: Add direct logout on icon click
    - Path: /shared/platform/js/platform-auth.js
    - Implementation: Add temporary logout shortcut
    - Commit: "Add logout shortcut [04142025.2216.recursivelearning.app/]"
    
  - [x] Session duration
    - Fix: Verify 24hr session timeout
    - Path: /admin/assets/js/admin-auth.js
    - Implementation: Confirm SESSION_DURATION constant
    - Commit: "Verify session timeout [04142025.2217.recursivelearning.app/admin/]"
    
  - [T] Header logo path
    - Fix: Update horizontal logo src attribute
    - Path: index.html
    - Implementation: Set correct platform image path
    - Commit: "Fix logo path [04142025.2218.recursivelearning.app/]"
    
  - [T] Logo container spacing
    - Fix: Add containing div with padding
    - Path: index.html and platform-core.css
    - Implementation: Add .logo-container with 5px padding
    - Commit: "Add logo container [04142025.2219.recursivelearning.app/]"

#### Admin Login Page (https://recursivelearning.app/admin/index.html)
- **Console Output:**
  - [x] [Admin Vault] v1.0.17 - Initialized
    - Verified in console log
    - No changes needed
  - [x] [Admin Vault] Login screen active with portal animations
    - Verified in console log
    - No changes needed
  - [x] [Admin Vault] SVG assets constrained with dimensions
    - Verified in console log
    - No changes needed

- **UI/UX Issues:**
  - [T] SVG rendering enhancement
    - Fix: Improve background effects for portal animations
    - Path: /admin/assets/css/admin-portal.css
    - Implementation: Update portal animation keyframes
    - Commit: "Enhance portal animations [04142025.2220.recursivelearning.app/admin/]"
    
  - [T] Password entry theming
    - Fix: Apply vault theme to password input
    - Path: /admin/index.html and /admin/assets/css/admin-portal.css
    - Implementation: Add themed input styles
    - Commit: "Update password input theme [04142025.2221.recursivelearning.app/admin/]"
    
  - [T] Interactive animation sequence
    - Fix: Add user interaction triggers to portal sequence
    - Path: /admin/assets/js/admin-portal.js
    - Implementation: Enhance animation triggers
    - Commit: "Add interactive portal animations [04142025.2222.recursivelearning.app/admin/]"
    
  - [T] Version number positioning
    - Fix: Adjust v1.0.17 display position
    - Path: /admin/index.html and /admin/assets/css/admin-portal.css
    - Implementation: Update version display positioning
    - Commit: "Fix version number position [04142025.2223.recursivelearning.app/admin/]"

#### Merit Page (https://recursivelearning.app/clients/elpl/merit/merit.html#welcome)
- **Console Output:**
  - [x] [Merit Flow] All validations passed for MVP testing
  - [x] [Merit Flow] Note: Proper validation will be implemented in v1.0.16
  - [x] [Merit Flow] Form validation hardcoded to pass for testing
  - [x] [Merit Flow] Navigation validation hardcoded to pass for testing
  - [x] 404 Error: `GET https://recursivelearning.app/clients/elpl/assets/elpl-security.js net::ERR_ABORTED 404 (Not Found)`
  - [x] [Merit Flow] Build version: merit.html/04142025.09:58pm.v.1.16
  - [x] OpenAI integration initializing with:
    - API endpoint: https://tixnmh1pe8.execute-api.us-east-2.amazonaws.com/prod/IntegralEd-Main
    - Project ID: proj_V4lrL1OSfydWCFW0zjgwrFRT
  - [x] Chat flow critical errors:
    - Thread creation error: `POST https://tixnmh1pe8.execute-api.us-east-2.amazonaws.com/prod/IntegralEd-Main net::ERR_NAME_NOT_RESOLVED`
    - Detailed error: `TypeError: Failed to fetch at MeritOpenAIClient.createThread`
    - Error occurs despite retry attempts (configured for 3 retries)

- **State Management Observations:**
  - [x] Proper state tracking in console:
    ```
    [Merit Flow] Action state updated: {nextButton: true, sendButton: true, chatInput: true, chatReady: false, formValid: false, …}
    [Merit Flow] Navigated to welcome {section: 'welcome', formValid: false, gradeLevel: null, curriculum: 'ela', chatReady: false}
    [Merit Flow] Chat system initialized for new user session
    [Merit Flow] Initialization complete {section: 'welcome', formValid: false, gradeLevel: null, curriculum: 'ela', chatReady: true}
    ```
  - [x] Selection state properly tracked through navigation
  - [x] Form data preserved between sections

- **UI/UX Issues:**
  - [ ] Button states need improvement ("funky" states)
  - [ ] Icons need to be significantly larger
  - [ ] Remove blue overlay background (was meant as overlay only)
  - [ ] Focus on hover states and active indicators
  - [ ] Chat functionality shows errors when attempting to send messages
  - [ ] Form dropdown selections need visual refinement
  - [ ] Next button styling needs to match platform standards

- **Priority Fixes:**
  - [ ] Fix 404 error for elpl-security.js by renaming to client-security.js
  - [ ] Resolve OpenAI API domain resolution issues:
    - Verify API gateway endpoint is active and correctly configured
    - Check for correct DNS resolution on server
    - Add exponential backoff to retry logic
    - Implement offline mode fallback for testing
  - [ ] Fix form input validation with proper UX feedback
  - [ ] Increase icon sizes across the interface
  - [ ] Improve button state visual indicators
  - [ ] Implement proper error handling with user-friendly messages 
  - [ ] Add console logging to show which assistant is being called:
    - Log assistant ID/model in initialization
    - Add verbose logging for API requests
    - Include assistant information in state tracking
    - Add configuration logging on page load
  - [ ] Fix user identification issue:
    - Remove hardcoded "default_user" ID for new users
    - Set userId to null until properly assigned by Airtable
    - Implement proper user registration flow
    - Add user context logging for debugging

## Ideas for UX fixes

### Admin Login Enhancements
- [ ] **Admin Login Asset Renaming:**
  - [ ] Rename treasure chest: `noun-treasure-chest-7723996-2C3E50.svg` → `platform-vault-chest-icon.svg`
  - [ ] Rename helm: `noun-helm-3999893-2C3E50.svg` → `platform-vault-helm-icon.svg`
  - [ ] Rename scroll: `noun-scroll-7757299-2C3E50.svg` → `platform-vault-scroll-input.svg`
  - [ ] Rename background: `portal-beam.png` → `platform-vault-background-water.png`
  - [ ] Move all assets to `/shared/platform/images/` directory

- [ ] **Treasure Chest Interaction (Primary Focus):**
  - [ ] Position treasure chest SVG at bottom of login screen
  - [ ] Add subtle glow effect around chest
  - [ ] Implement click handler to trigger chest animation
  - [ ] Create chest opening animation (simple transform/rotate)
  - [ ] Display scroll with password field after chest opens
  - [ ] Add "Enter Vault" button styled to match theme

- [ ] **Scroll Password Implementation:**
  - [ ] Overlay password input on scroll SVG
  - [ ] Style input field to blend with scroll design
  - [ ] Create unfurling animation for scroll appearance
  - [ ] Add subtle text glow on focus
  - [ ] Implement validation with visual feedback

- [ ] **Login Authentication Updates:**
  - [ ] Add email input field alongside password on scroll
  - [ ] Implement email/password pair validation
  - [ ] Add console logging for validation attempts
  - [ ] Allow access for any *@integral-ed.com email address
  - [ ] Update AdminAuth.js to check for valid domain
  - [ ] Store validated email in session storage
  - [ ] Add visual feedback for validation success/failure
  - [ ] Preserve existing password-only fallback for testing

- [ ] **Background Animation:**
  - [ ] Keep high-res watercolor png background as primary visual
  - [ ] Add simple bubble animations (3-8px varied sizes)
  - [ ] Implement subtle floating motion for bubbles
  - [ ] Add minimal squiggle animations to suggest underwater movement
  - [ ] Ensure all animated elements maintain very low opacity

- [ ] **Portal Opening Animation:**
  - [ ] Preserve current portal effect on successful login
  - [ ] Add helm icon rotation on password verification
  - [ ] Create transition sequence to dashboard
  - [ ] Add console logging for animation state changes
  - [ ] Ensure smooth rendering on all supported browsers

## SVG Conversion Issues & UX Fixes (04.15.2024)

### Asset Format Problems
- [x] Identified issue with AI converting PNGs to SVGs incorrectly
- [x] Fixed platform assets by restoring original PNG files:
  - `platform-logo-horizontal-white.png`
  - `platform-account-icon-white.png`
  - `platform-dev-icon-white.png`
  - `platform-dna-icon-white.png`
- [x] Added warning to ORB style system documentation
- [x] Established rule: Only use SVGs from verified vector sources

### Header UX Improvements
- [x] Fixed dropdown menu visibility and animation
- [x] Updated account icon alt text to match functionality
- [x] Improved hover states and transitions
- [x] Ensured consistent styling across platform

### Development Authentication Notes
- [x] Identified token handling in development mode:
  - Using simplified auth bypass for local development
  - Default admin permissions for testing
  - Token validation always returns true in dev
- [x] Need to implement proper auth flow for production
- [x] Added to future security audit checklist

### Testing Process Learnings
- [x] Created temporary test file (index_2.html) to verify fixes
- [x] Confirmed PNG assets render correctly
- [x] Validated UX improvements before applying to main file
- [x] Documented process for future reference

### Action Items
- [ ] Implement proper authentication flow
- [ ] Create asset management guidelines
- [ ] Update platform documentation with format requirements
- [ ] Add format validation to build process

## Admin Dashboard Review (04.15.2024)
### URL: https://recursivelearning.app/admin/dashboard.html

#### Component Loading Issues
- [ ] Fix duplicate component registration - CONFIRMED:
  ```
  [Admin] Registered component: admin-page
  [Admin] Registered component: admin-nav
  [Admin] Initialized component: admin-page
  [Admin] Component loader initialized
  [Admin] Registered component: admin-page (duplicate)
  [Admin] Registered component: admin-nav (duplicate)
  [Admin] Initialized component: admin-page
  [Admin] Component loader initialized
  ```
- [ ] Resolve component initialization sequence - CRITICAL
- [ ] Add error boundaries for component loading failures
- [ ] Prevent double initialization of admin components
- [ ] Fix component loader re-initialization

#### Navigation State Management
- [ ] Fix "Navigation items loaded: 0" console error - CONFIRMED
- [ ] Implement proper state tracking for navigation components
- [ ] Add loading state indicators for navigation items
- [ ] Verify navigation item registration process
- [ ] Fix empty components table in console output

#### Gem Status Tracking
- [ ] Fix "Unknown" labels in gem status logs - CONFIRMED:
  ```
  [Admin Dashboard] Gem status for Unknown: ready
  [Admin Dashboard] Gem status for Unknown: progress
  [Admin Dashboard] Gem status for Unknown: attention
  ```
- [ ] Implement proper card title detection
- [ ] Add visual indicators for status changes
- [ ] Ensure gem status persistence across page loads
- [ ] Fix gem status observer initialization timing

#### Version Management
- [ ] Standardize version display format - CRITICAL:
  ```
  Header shows: v1.0.0 (04.15.2024)
  Console shows: v1.0.17
  ```
- [ ] Implement centralized version management
- [ ] Add build timestamp to version display
- [ ] Create version history tracking
- [ ] Fix incorrect year in version display (shows 2025 instead of 2024)

#### Console Logging Improvements
- [ ] Implement structured logging format
- [ ] Add log levels (INFO, WARN, ERROR)
- [ ] Include timestamps in all log messages
- [ ] Add component context to logs
- [ ] Create logging standards documentation
- [ ] Fix duplicate initialization messages
- [ ] Add error tracking for component loading failures

#### Performance Optimization
- [ ] Reduce duplicate component initialization
- [ ] Implement lazy loading for dashboard sections
- [ ] Add performance monitoring
- [ ] Optimize gem status observer
- [ ] Implement component caching where appropriate
- [ ] Fix multiple initialization cycles

#### Console Output Analysis (Latest)
```javascript
[Admin] Registered component: admin-page
[Admin] Registered component: admin-nav
[Admin] Initialized component: admin-page
[Admin] Component loader initialized
[Admin] Registered component: admin-page (duplicate)
[Admin] Registered component: admin-nav (duplicate)
[Admin] Initialized component: admin-page
[Admin] Component loader initialized
[Admin Dashboard] v1.0.17 - Initialized
[Admin Dashboard] Current focus: Merit - Dashboard Overview
[Admin Dashboard] Gem status initialized - Merit: ready, Goalsetter: progress, BHB: attention
[Admin Dashboard] Active tab: merit - dashboard
[Admin Dashboard] Navigation items loaded: 0
[Admin Dashboard] Available components:
[Admin Dashboard] Dashboard initialization complete
[Admin Dashboard] Observing 3 status gems
[Admin Dashboard] Gem status for Unknown: ready
[Admin Dashboard] Gem status for Unknown: progress
[Admin Dashboard] Gem status for Unknown: attention
```

#### Implementation Priority (Updated)
1. Fix version inconsistency and incorrect year display
2. Resolve component duplication and re-initialization
3. Implement proper navigation state and fix empty components
4. Add proper gem status tracking with card title detection
5. Enhance console logging with structured format
6. Optimize performance and prevent multiple initialization cycles

#### Next Steps (Updated)
- [ ] Create centralized version management system
- [ ] Implement component registration deduplication
- [ ] Add navigation state persistence
- [ ] Create gem status management service
- [ ] Establish logging standards
- [ ] Set up performance monitoring
- [ ] Add error boundaries for component loading
- [ ] Fix year display in version numbers
- [ ] Implement proper card title detection for gems
- [ ] Add component initialization lifecycle tracking

## Merit Page Review (04.15.2024)
### URL: https://recursivelearning.app/clients/elpl/merit/merit.html#welcome

#### Security Module Issue
- [ ] Fix 404 error for security module:
  ```
  GET https://recursivelearning.app/clients/elpl/assets/elpl-security.js net::ERR_ABORTED 404 (Not Found)
  ```
  - Required Fix: Create missing security module
  - Path: `/clients/elpl/assets/elpl-security.js`
  - Implementation: Add CORS and embed protection

#### Version Display Inconsistency
- [ ] Current display: `merit.html/04152025.03:55pm.v.1.16`
- [ ] Format issues:
  - Year shows as 2025 instead of 2024
  - Version format differs from admin (v1.0.0 vs v.1.16)
  - Build timestamp needs standardization

#### Validation States
Current console output shows temporary validation bypasses:
```javascript
[Merit Flow] All validations passed for MVP testing
[Merit Flow] Note: Proper validation will be implemented in v1.0.16
[Merit Flow] Form validation hardcoded to pass for testing
[Merit Flow] Navigation validation hardcoded to pass for testing
```
Required fixes:
- [ ] Implement proper form validation
- [ ] Add navigation state validation
- [ ] Remove hardcoded validation passes
- [ ] Add validation error handling

#### OpenAI Integration
Current initialization shows:
```javascript
[Merit Flow] OpenAI client initialized
[Merit Flow] Using API endpoint: https://tixnmh1pe8.execute-api.us-east-2.amazonaws.com/prod/IntegralEd-Main
[Merit Flow] Project ID: proj_V4lrL1OSfydWCFW0zjgwrFRT
```
Required fixes:
- [ ] Move API endpoint to configuration
- [ ] Add error handling for API failures
- [ ] Implement retry logic
- [ ] Add offline mode fallback

#### State Management
Current state tracking shows:
```javascript
[Merit Flow] Action state updated: {
  nextButton: true, 
  sendButton: true, 
  chatInput: true, 
  chatReady: false, 
  formValid: false
}
[Merit Flow] Navigated to welcome {
  section: 'welcome',
  formValid: false,
  gradeLevel: null,
  curriculum: 'ela',
  chatReady: false
}
```
Required fixes:
- [ ] Add proper state persistence
- [ ] Implement form validation
- [ ] Add loading states for chat readiness
- [ ] Fix initial state management

#### Implementation Priority
1. Security Module Creation
   - Create elpl-security.js
   - Implement CORS protection
   - Add embed validation

2. Form Validation
   - Remove hardcoded passes
   - Implement proper validation
   - Add error states
   - Add loading indicators

3. State Management
   - Fix initial states
   - Add persistence
   - Implement proper transitions

4. Version Display
   - Fix year display
   - Standardize format
   - Add build tracking

5. OpenAI Integration
   - Add configuration
   - Implement error handling
   - Add retry logic
   - Create offline mode

#### Required Files
```plaintext
/clients/elpl/assets/
  ├── elpl-security.js (new)
  ├── js/
  │   ├── client-merit-validation.js (new)
  │   ├── client-merit-state.js (new)
  │   └── client-merit-config.js (new)
  └── css/
      └── client-merit-states.css (new)
```

#### Next Steps
1. Create security module with proper CORS
2. Implement form validation system
3. Add proper state management
4. Fix version display format
5. Enhance OpenAI integration
6. Add error boundaries and loading states