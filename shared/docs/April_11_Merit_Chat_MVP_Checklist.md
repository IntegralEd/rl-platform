# Merit Chat MVP Checklist - April 11, 2025

## Overview
This document outlines the MVP requirements for implementing the Merit chat interface with a hardcoded assistant. The implementation follows the client layout structure and behavior rules.

## Critical Rules & Restrictions
- ⚠️ DO NOT modify production files without authorization
- ⚠️ DO NOT create new assets or files before asking - they exist on another path
- ✅ Development focused on `/clients/elpl/merit/merit.html`
- ✅ Follow client layout structure rules
- ✅ Maintain consistent UX patterns
- [X] Standardized header implementation across platform (landing, admin, merit)
  - [X] Logo placement and sizing
  - [X] Version display format
  - [X] Time display integration
  - [X] Consistent styling variables
- [X] Public landing page implementation
  - [X] Subtle footer CTA
  - [X] Admin portal access
  - [X] Proper asset paths
  - [X] Platform branding

## Phase 1: UX Implementation

### Directory Structure Changes
```bash
# Current Structure
/clients/elpl/
  ├── assets/                    # Client-wide assets
  │   ├── js/                   # Shared client JavaScript
  │   │   ├── client-auth.js    # Client authentication (stays here)
  │   │   └── client-router.js  # Client routing (stays here)
  │   ├── css/                  # Client-wide styles (stays here)
  │   └── images/              # Shared client images
  └── merit/                    # Merit project directory
      ├── assets/              # Merit-specific assets
      │   ├── js/             # Merit JavaScript files
      │   │   ├── client-merit-logic.js
      │   │   ├── client-merit-chat.js
      │   │   └── client-merit-form.js
      │   ├── css/            # Merit-specific styles
      │   └── images/         # Merit-specific images
      └── merit.html
```

### Asset Mapping Checklist
- [ ] Move Merit-specific JS files to `/clients/elpl/merit/assets/js/`
  - [ ] client-merit-logic.js
  - [ ] client-merit-chat.js
  - [ ] client-merit-form.js
- [ ] Map all Merit-specific assets:
  - [ ] Icons and SVGs
    - [ ] noun-next-5654311-FFFFFF.svg
    - [ ] noun-send-7149925-FFFFFF.png
    - [ ] loading-indicator.svg
    - [ ] error-icon.svg
    - [ ] success-icon.svg
  - [ ] UI Elements
    - [ ] chat-bubble-bg.svg
    - [ ] form-elements.svg
    - [ ] button-states.svg
  - [ ] Animations
    - [ ] typing-indicator.svg
    - [ ] transition-effects.svg

### UX State Management
- [ ] Responsive States
  - [ ] Chat bar responsive layout
  - [ ] Send button states (idle, loading, success, error)
  - [ ] Form validation visual feedback
  - [ ] Loading state animations
  - [ ] Error state displays
  - [ ] Success confirmations

### Required Components
1. User Intake Form
   - [ ] Grade level selection (required)
   - [ ] Curriculum input (required)
   - [ ] Form validation
   - [ ] Error handling
   - [ ] Responsive layout

2. Chat Interface
   - [ ] Message input
   - [ ] Send button with states
   - [ ] Message history
   - [ ] Loading states
   - [ ] Responsive design

3. Dynamic Footer
   - [ ] Chat bar for interactive pages
   - [ ] Playbar for content pages
   - [ ] Responsive behavior

### Critical UI Fixes (Priority Order)

#### 1. Layout Structure Issues
- [T] Add sidebar with tabs
  - [X] Implement "Welcome" and "Chat" tabs
  - [X] Style tabs according to design system
  - [T] Add tab switching functionality
  - [T] Ensure proper responsive behavior

#### 2. Footer Implementation
- [T] Add consistent footer div
  - [T] Implement chatbar for chat tab
  - [T] Implement playbar for welcome tab
  - [T] Add proper positioning and styling
  - [T] Ensure footer stays at bottom
  - [T] Add dynamic switching based on active tab

#### 3. Button Visibility and Styling
- [X] Fix "Next" button visibility
  - [X] Add proper background color (#211651)
  - [X] Ensure icon is visible and properly sized
  - [X] Add hover states
- [T] Fix chat "Send" button visibility
  - [T] Add proper background color (#211651)
  - [T] Implement send icon from assets
  - [T] Add hover and active states

#### 4. Header and Branding
- [X] Add logo to header
  - [X] Implement proper logo sizing
  - [X] Add correct positioning
  - [X] Ensure responsive behavior
- [X] Fix version display
  - [X] Update version format to match spec
  - [X] Add proper padding and positioning
  - [X] Implement auto-updating time display

#### 5. Color Scheme Corrections
- [ ] Audit and fix color hues
  - [ ] Update primary color to #211651
  - [ ] Ensure consistent button colors
  - [ ] Fix header background color
  - [ ] Update text colors for contrast
  - [ ] Verify hover state colors

### Implementation Priority Order
1. Layout Structure (Sidebar + Tabs)
2. Footer Implementation
3. Button Visibility
4. Header and Logo
5. Color Scheme

## Phase 1.5: Rule Validation Infrastructure

### Husky Git Hooks Setup
- [ ] Install and configure Husky
  ```bash
  npm install husky --save-dev
  npx husky install
  ```
- [ ] Create pre-commit hook structure
  ```bash
  .husky/
    ├── pre-commit                 # Main hook runner
    └── scripts/
        ├── check-rules.js        # Rule validation
        ├── lint-rules.js         # Rule file linting
        └── enforce-structure.js  # Directory structure
  ```

### Rule Validation Implementation
- [ ] Basic Rule Checking
  - [ ] Parse MDC frontmatter
  - [ ] Match files against globs
  - [ ] Log validation attempts
  - [ ] Report violations

- [ ] Directory Structure Validation
  - [ ] Verify page-specific JS location
  - [ ] Check shared asset placement
  - [ ] Validate file naming conventions
  - [ ] Ensure proper imports

- [ ] Style Rule Validation
  - [ ] Check CSS variable usage
  - [ ] Verify color values
  - [ ] Validate layout structure
  - [ ] Check responsive patterns

### Automated Testing Integration
- [ ] Pre-commit Validation
  - [ ] Block commits with violations
  - [ ] Show helpful error messages
  - [ ] Provide fix suggestions
  - [ ] Allow manual override with reason

- [ ] CI/CD Pipeline
  - [ ] Add rule validation step
  - [ ] Generate compliance reports
  - [ ] Track violation trends
  - [ ] Alert on pattern changes

### Documentation
- [ ] Rule Validation Guide
  - [ ] Setup instructions
  - [ ] Override procedures
  - [ ] Common fixes
  - [ ] Best practices

## Phase 2: Assistant Integration

### Hardcoded Configuration
```javascript
const MERIT_ASSISTANT = {
  id: "asst_QoAA395ibbyMImFJERbG2hKT",  // Production assistant ID
  model: "gpt-4-turbo",
  name: "Merit Education Assistant",
  instructions: "You are an educational assistant helping teachers..."
};
```

### Message Flow
1. User submits intake form
2. System validates inputs
3. Chat interface appears
4. Welcome message displays
5. User can start chatting

### Error States
- Form validation errors
- Asset loading failures
- Assistant connection issues
- Message send failures

## Testing Requirements

### UX Validation
- [T] HTML structure follows standards
- [T] CSS properly scoped
- [T] JavaScript behaviors working
- [T] Assets loading correctly

### Form Testing
- [T] Required field validation
- [T] Error message display
- [T] Submit button behavior
- [T] Form reset functionality

### Chat Testing
- [T] Message sending
- [T] Loading states
- [T] Error handling
- [T] UI responsiveness
- [T] Assistant ID verification (asst_QoAA395ibbyMImFJERbG2hKT)
- [T] Model compatibility check

### Integration Testing
- [T] Assistant configuration matches OpenAI settings
- [T] Model settings aligned with Assistant configuration
- [T] Error handling for model/assistant mismatch
- [T] Fallback behavior for API issues

## Implementation Checklist

### 1. Base Setup
- [ ] Verify file structure
- [ ] Check asset paths
- [ ] Validate HTML
- [ ] Test CSS loading

### 2. Form Implementation
- [ ] Build intake form
- [ ] Add validation
- [ ] Style elements
- [ ] Test submission

### 3. Chat Interface
- [ ] Create chat container
- [ ] Add message display
- [ ] Implement send functionality
- [ ] Add loading states

### 4. Integration
- [ ] Connect components
- [ ] Test flow
- [ ] Add error handling
- [ ] Validate against rules

## Validation Commands
```bash
# Structure validation
tree clients/elpl/merit/
tree clients/elpl/assets/

# HTML validation
html-validate clients/elpl/merit/*.html

# CSS validation
stylelint clients/elpl/assets/css/*.css

# JavaScript linting
eslint clients/elpl/assets/js/*.js
```

## Current Status (April 11, 2025)
- [x] Basic form structure
- [x] Initial styling
- [x] Form validation
- [x] Chat interface layout
- [x] Directory structure reorganization
- [x] Client-wide asset organization
- [x] JavaScript modularization
- [x] Assistant ID configuration (asst_9GkHpGa5t50Yw74uzonh6FAz)
- [x] CSS implementation and paths
- [ ] Assistant integration
- [ ] Error handling
- [ ] Full testing

## Next Steps (Priority Order)
1. Chat Interface Implementation
   - [ ] Initialize chat container
   - [ ] Add message display
   - [ ] Implement typing indicators
   - [ ] Add loading states

2. Form Submission Flow
   - [ ] Add form validation
   - [ ] Implement submission handling
   - [ ] Add success/error states
   - [ ] Handle transition to chat

3. State Management
   - [ ] Implement tab state persistence
   - [ ] Add form data caching
   - [ ] Handle chat history
   - [ ] Manage loading states

4. Testing & Validation
   - [ ] Test form submission
   - [ ] Validate chat functionality
   - [ ] Check responsive design
   - [ ] Verify accessibility

## Notes
- [x] Reorganized directory structure following client layout rules
- [x] Moved shared assets to client-wide directory
- [x] Updated assistant ID to use file search enabled version
- [x] Modularized JavaScript into separate components
- [x] Using existing CSS files (no new files needed)
- [x] Updated HTML to use correct CSS paths

## Contact
For questions or issues:
- Frontend Team Lead
- Platform Architecture Team
- QA Team Lead 

## Implementation Notes

### Asset Organization Rules
1. **Project-Specific Assets**
   - Must be located in project directory: `/clients/{client}/{project}/assets/`
   - Includes project-specific JS, images, and CSS
   - Example: Merit chat interface assets

2. **Client-Wide Assets**
   - Must be in client assets directory: `/clients/{client}/assets/`
   - Includes shared functionality like auth and routing
   - Example: Client authentication, global styles

3. **Shared Assets**
   - Must be in shared directory: `/shared/assets/`
   - Used across multiple clients
   - Example: Common components, utilities

### JavaScript Organization
1. **Project-Specific JS**
   - Location: `/clients/{client}/{project}/assets/js/`
   - Naming: `client-{project}-{feature}.js`
   - Example: `client-merit-logic.js`

2. **Client-Level JS**
   - Location: `/clients/{client}/assets/js/`
   - Naming: `client-{feature}.js`
   - Example: `client-auth.js`

3. **Shared JS**
   - Location: `/shared/assets/js/`
   - Naming: `{feature}.js`
   - Example: `component-loader.js` 

## Directory Structure Rules Clarification

### Page-Specific Files
- Page-specific JavaScript files MUST stay with their HTML page:
  ```
  /clients/elpl/merit/
    ├── merit.html
    └── assets/
        └── js/
            └── client-merit-logic.js  # Controls merit.html specifically
  ```

### Shared Client Assets
- Shared assets used across multiple pages go in client assets:
  ```
  /clients/elpl/assets/  # Shared across all ELPL pages
    ├── js/             # Shared JavaScript (auth, routing, etc)
    ├── css/            # Shared styles
    ├── images/         # Shared images, icons, SVGs
    └── variables.css   # Client-wide variables
  ``` 

## Phase 2.5: Rule Validation & Page Tree Templating

### Husky Git Hooks Setup
- [ ] Install and configure Husky
  ```bash
  npm install husky --save-dev
  npx husky install
  ```
- [ ] Create hook structure
  ```bash
  .husky/
    ├── pre-commit                    # Main hook runner
    ├── scripts/
    │   ├── check-rules.js           # Rule validation
    │   ├── lint-rules.js            # Rule file linting
    │   ├── enforce-structure.js      # Directory structure
    │   └── template-tools/          # Page templating tools
    │       ├── create-page-tree.js  # Page tree generator
    │       └── validate-tree.js     # Tree structure checker
    ```

### Page Tree Templating Script
```javascript
// .husky/scripts/template-tools/create-page-tree.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PAGE_VARIANTS = ['admin', 'review', 'live', 'temp'];
const REQUIRED_STRUCTURE = {
  assets: {
    js: ['client-{page}-logic.js'],
    css: ['{page}-theme.css'],
    images: []
  }
};

async function createPageTree(sourcePage, targetName, clientId) {
  const sourceDir = path.dirname(sourcePage);
  const pageName = path.basename(sourcePage, '.html');
  
  // Create base directories for each variant
  for (const variant of PAGE_VARIANTS) {
    const targetPath = path.join(
      'clients',
      clientId,
      targetName,
      `${targetName}-${variant}`
    );

    // Create directory structure
    execSync(`mkdir -p ${targetPath}/assets/{js,css,images}`);

    // Copy and rename files
    for (const [dir, files] of Object.entries(REQUIRED_STRUCTURE)) {
      for (const file of files) {
        const sourceFile = path.join(
          sourceDir,
          'assets',
          dir,
          file.replace('{page}', pageName)
        );
        const targetFile = path.join(
          targetPath,
          'assets',
          dir,
          file.replace('{page}', `${targetName}-${variant}`)
        );
        
        if (fs.existsSync(sourceFile)) {
          // Copy and rename file
          fs.copyFileSync(sourceFile, targetFile);
          
          // Update imports and references in the file
          let content = fs.readFileSync(targetFile, 'utf8');
          content = content.replace(
            new RegExp(pageName, 'g'),
            `${targetName}-${variant}`
          );
          fs.writeFileSync(targetFile, content);
        }
      }
    }

    // Copy and modify HTML
    const targetHtml = path.join(targetPath, `${targetName}-${variant}.html`);
    let htmlContent = fs.readFileSync(sourcePage, 'utf8');
    
    // Update paths and references
    htmlContent = htmlContent
      .replace(
        new RegExp(`/${clientId}/${pageName}/`, 'g'),
        `/${clientId}/${targetName}/${targetName}-${variant}/`
      )
      .replace(
        new RegExp(pageName, 'g'),
        `${targetName}-${variant}`
      );
    
    fs.writeFileSync(targetHtml, htmlContent);
  }

  // Create shared assets at client level if they don't exist
  const sharedAssetPath = path.join('clients', clientId, 'assets');
  execSync(`mkdir -p ${sharedAssetPath}/{js,css,images}`);

  console.log(`
✅ Created page tree for ${targetName}:
   - Admin:  clients/${clientId}/${targetName}/${targetName}-admin
   - Review: clients/${clientId}/${targetName}/${targetName}-review
   - Live:   clients/${clientId}/${targetName}/${targetName}-live
   - Temp:   clients/${clientId}/${targetName}/${targetName}-temp
  `);
}

// Example usage:
// node create-page-tree.js \
//   clients/elpl/merit/merit.html \
//   goalsetter \
//   elpl
```

### Rule Validation Implementation
- [ ] Basic Rule Checking
  - [ ] Parse MDC frontmatter
  - [ ] Match files against globs
  - [ ] Log validation attempts
  - [ ] Report violations

- [ ] Directory Structure Validation
  - [ ] Verify page-specific JS location
  - [ ] Check shared asset placement
  - [ ] Validate file naming conventions
  - [ ] Ensure proper imports

- [ ] Style Rule Validation
  - [ ] Check CSS variable usage
  - [ ] Verify color values
  - [ ] Validate layout structure
  - [ ] Check responsive patterns

### Usage Example
```bash
# Create new page tree from merit template
node .husky/scripts/template-tools/create-page-tree.js \
  clients/elpl/merit/merit.html \
  goalsetter \
  elpl

# This creates:
clients/elpl/goalsetter/
  ├── goalsetter-admin/
  │   ├── goalsetter-admin.html
  │   └── assets/
  │       ├── js/
  │       │   └── client-goalsetter-admin-logic.js
  │       ├── css/
  │       │   └── goalsetter-admin-theme.css
  │       └── images/
  ├── goalsetter-review/
  ├── goalsetter-live/
  └── goalsetter-temp/
``` 

## Phase 3: Admin & Review Implementation

### Merit Review Page (merit-review.html)
- [ ] Qipu Comment System Integration
  - [ ] Add iframe wrapper over merit.html
  - [ ] Implement footer comment bar
  - [ ] Add user type switching (IE_All_Users range)
  - [ ] Integrate screenshot functionality
  - [ ] Add comment persistence
  - [ ] Implement IE_Central_Team access controls

### Merit Admin Page (merit-admin.html)
- [ ] Admin Interface Implementation
  - [ ] Create admin layout structure
  - [ ] Add configuration panels
  - [ ] Implement user management
  - [ ] Add analytics dashboard
  - [ ] Create logging interface

### Qipu Comment System
- [ ] Core Comment Features
  - [ ] Comment creation and editing
  - [ ] Screenshot attachment
  - [ ] User type context
  - [ ] Thread management
  - [ ] Notification system

### Admin Features
- [ ] User Management
  - [ ] Role assignment
  - [ ] Access control
  - [ ] Usage tracking
  - [ ] Activity logs
- [ ] Configuration
  - [ ] System settings
  - [ ] Feature toggles
  - [ ] Integration settings
  - [ ] Backup/restore

### Testing Requirements
- [T] Review Interface
  - [T] iframe responsiveness
  - [T] Comment functionality
  - [T] Screenshot capture
  - [T] User type switching
- [T] Admin Interface
  - [T] Configuration persistence
  - [T] User management
  - [T] Analytics accuracy
  - [T] Log completeness 

## Phase 4: Platform Form Enhancement

### Curious Form Migration
- [ ] Import styled form from frontend repo
  - [ ] Match platform typography
  - [ ] Implement platform color scheme
  - [ ] Add responsive breakpoints
  - [ ] Ensure accessibility compliance

### Form Components
- [ ] Input field styling
  - [ ] Text inputs with floating labels
  - [ ] Dropdown with custom styling
  - [ ] Checkbox and radio components
  - [ ] Error state visualization

### Animation & Interaction
- [ ] Add micro-interactions
  - [ ] Field focus states
  - [ ] Button hover effects
  - [ ] Form submission feedback
  - [ ] Loading states

### Validation & Feedback
- [ ] Client-side validation
  - [ ] Real-time field validation
  - [ ] Custom error messages
  - [ ] Form completion check
  - [ ] Success state handling

## Next T Review Items to Check
1. Chat Interface Progress
   - [ ] Message display implementation
   - [ ] Chat container styling
   - [ ] Loading state indicators
   - [ ] Error handling

2. Form Integration
   - [ ] Grade level selection working
   - [ ] Curriculum input validation
   - [ ] Form submission flow
   - [ ] Transition animations

3. Navigation
   - [ ] Tab switching functionality
   - [ ] State preservation
   - [ ] URL handling
   - [ ] History management

4. Error Boundaries
   - [ ] Component error catching
   - [ ] Fallback UI implementation
   - [ ] Error reporting
   - [ ] Recovery options

## Phase 5: Analytics & Monitoring

### Usage Tracking
- [ ] Implement form analytics
  - [ ] Track completion rates
  - [ ] Monitor drop-off points
  - [ ] Capture user paths
  - [ ] Measure response times

### Performance Metrics
- [ ] Monitor load times
  - [ ] Asset loading
  - [ ] API response times
  - [ ] Client-side rendering
  - [ ] Cache effectiveness

### Error Tracking
- [ ] Set up error logging
  - [ ] Client-side errors
  - [ ] API failures
  - [ ] Validation issues
  - [ ] Performance problems

## Phase 6: A/B Testing Infrastructure

### Test Framework
- [ ] Set up testing infrastructure
  - [ ] Version control
  - [ ] Feature flags
  - [ ] User segmentation
  - [ ] Analytics integration

### Test Cases
- [ ] Define initial tests
  - [ ] Form layout variants
  - [ ] CTA messaging
  - [ ] Button placement
  - [ ] Color schemes

## Next Steps (Priority Order)
1. Chat Interface Implementation
   - [ ] Initialize chat container
   - [ ] Add message display
   - [ ] Implement typing indicators
   - [ ] Add loading states

2. Form Submission Flow
   - [ ] Add form validation
   - [ ] Implement submission handling
   - [ ] Add success/error states
   - [ ] Handle transition to chat

3. State Management
   - [ ] Implement tab state persistence
   - [ ] Add form data caching
   - [ ] Handle chat history
   - [ ] Manage loading states

4. Testing & Validation
   - [ ] Test form submission
   - [ ] Validate chat functionality
   - [ ] Check responsive design
   - [ ] Verify accessibility

## Notes
- [x] Reorganized directory structure following client layout rules
- [x] Moved shared assets to client-wide directory
- [x] Updated assistant ID to use file search enabled version
- [x] Modularized JavaScript into separate components
- [x] Using existing CSS files (no new files needed)
- [x] Updated HTML to use correct CSS paths

## Contact
For questions or issues:
- Frontend Team Lead
- Platform Architecture Team
- QA Team Lead 

## Implementation Notes

### Asset Organization Rules
1. **Project-Specific Assets**
   - Must be located in project directory: `/clients/{client}/{project}/assets/`
   - Includes project-specific JS, images, and CSS
   - Example: Merit chat interface assets

2. **Client-Wide Assets**
   - Must be in client assets directory: `/clients/{client}/assets/`
   - Includes shared functionality like auth and routing
   - Example: Client authentication, global styles

3. **Shared Assets**
   - Must be in shared directory: `/shared/assets/`
   - Used across multiple clients
   - Example: Common components, utilities

### JavaScript Organization
1. **Project-Specific JS**
   - Location: `/clients/{client}/{project}/assets/js/`
   - Naming: `client-{project}-{feature}.js`
   - Example: `client-merit-logic.js`

2. **Client-Level JS**
   - Location: `/clients/{client}/assets/js/`
   - Naming: `client-{feature}.js`
   - Example: `client-auth.js`

3. **Shared JS**
   - Location: `/shared/assets/js/`
   - Naming: `{feature}.js`
   - Example: `component-loader.js` 

## Directory Structure Rules Clarification

### Page-Specific Files
- Page-specific JavaScript files MUST stay with their HTML page:
  ```
  /clients/elpl/merit/
    ├── merit.html
    └── assets/
        └── js/
            └── client-merit-logic.js  # Controls merit.html specifically
  ```

### Shared Client Assets
- Shared assets used across multiple pages go in client assets:
  ```
  /clients/elpl/assets/  # Shared across all ELPL pages
    ├── js/             # Shared JavaScript (auth, routing, etc)
    ├── css/            # Shared styles
    ├── images/         # Shared images, icons, SVGs
    └── variables.css   # Client-wide variables
  ``` 

## Phase 2.5: Rule Validation & Page Tree Templating

### Husky Git Hooks Setup
- [ ] Install and configure Husky
  ```bash
  npm install husky --save-dev
  npx husky install
  ```
- [ ] Create hook structure
  ```bash
  .husky/
    ├── pre-commit                    # Main hook runner
    ├── scripts/
    │   ├── check-rules.js           # Rule validation
    │   ├── lint-rules.js            # Rule file linting
    │   ├── enforce-structure.js      # Directory structure
    │   └── template-tools/          # Page templating tools
    │       ├── create-page-tree.js  # Page tree generator
    │       └── validate-tree.js     # Tree structure checker
    ```

### Page Tree Templating Script
```javascript
// .husky/scripts/template-tools/create-page-tree.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PAGE_VARIANTS = ['admin', 'review', 'live', 'temp'];
const REQUIRED_STRUCTURE = {
  assets: {
    js: ['client-{page}-logic.js'],
    css: ['{page}-theme.css'],
    images: []
  }
};

async function createPageTree(sourcePage, targetName, clientId) {
  const sourceDir = path.dirname(sourcePage);
  const pageName = path.basename(sourcePage, '.html');
  
  // Create base directories for each variant
  for (const variant of PAGE_VARIANTS) {
    const targetPath = path.join(
      'clients',
      clientId,
      targetName,
      `${targetName}-${variant}`
    );

    // Create directory structure
    execSync(`mkdir -p ${targetPath}/assets/{js,css,images}`);

    // Copy and rename files
    for (const [dir, files] of Object.entries(REQUIRED_STRUCTURE)) {
      for (const file of files) {
        const sourceFile = path.join(
          sourceDir,
          'assets',
          dir,
          file.replace('{page}', pageName)
        );
        const targetFile = path.join(
          targetPath,
          'assets',
          dir,
          file.replace('{page}', `${targetName}-${variant}`)
        );
        
        if (fs.existsSync(sourceFile)) {
          // Copy and rename file
          fs.copyFileSync(sourceFile, targetFile);
          
          // Update imports and references in the file
          let content = fs.readFileSync(targetFile, 'utf8');
          content = content.replace(
            new RegExp(pageName, 'g'),
            `${targetName}-${variant}`
          );
          fs.writeFileSync(targetFile, content);
        }
      }
    }

    // Copy and modify HTML
    const targetHtml = path.join(targetPath, `${targetName}-${variant}.html`);
    let htmlContent = fs.readFileSync(sourcePage, 'utf8');
    
    // Update paths and references
    htmlContent = htmlContent
      .replace(
        new RegExp(`/${clientId}/${pageName}/`, 'g'),
        `/${clientId}/${targetName}/${targetName}-${variant}/`
      )
      .replace(
        new RegExp(pageName, 'g'),
        `${targetName}-${variant}`
      );
    
    fs.writeFileSync(targetHtml, htmlContent);
  }

  // Create shared assets at client level if they don't exist
  const sharedAssetPath = path.join('clients', clientId, 'assets');
  execSync(`mkdir -p ${sharedAssetPath}/{js,css,images}`);

  console.log(`
✅ Created page tree for ${targetName}:
   - Admin:  clients/${clientId}/${targetName}/${targetName}-admin
   - Review: clients/${clientId}/${targetName}/${targetName}-review
   - Live:   clients/${clientId}/${targetName}/${targetName}-live
   - Temp:   clients/${clientId}/${targetName}/${targetName}-temp
  `);
}

// Example usage:
// node create-page-tree.js \
//   clients/elpl/merit/merit.html \
//   goalsetter \
//   elpl
```

### Rule Validation Implementation
- [ ] Basic Rule Checking
  - [ ] Parse MDC frontmatter
  - [ ] Match files against globs
  - [ ] Log validation attempts
  - [ ] Report violations

- [ ] Directory Structure Validation
  - [ ] Verify page-specific JS location
  - [ ] Check shared asset placement
  - [ ] Validate file naming conventions
  - [ ] Ensure proper imports

- [ ] Style Rule Validation
  - [ ] Check CSS variable usage
  - [ ] Verify color values
  - [ ] Validate layout structure
  - [ ] Check responsive patterns

### Usage Example
```bash
# Create new page tree from merit template
node .husky/scripts/template-tools/create-page-tree.js \
  clients/elpl/merit/merit.html \
  goalsetter \
  elpl

# This creates:
clients/elpl/goalsetter/
  ├── goalsetter-admin/
  │   ├── goalsetter-admin.html
  │   └── assets/
  │       ├── js/
  │       │   └── client-goalsetter-admin-logic.js
  │       ├── css/
  │       │   └── goalsetter-admin-theme.css
  │       └── images/
  ├── goalsetter-review/
  ├── goalsetter-live/
  └── goalsetter-temp/
``` 

## Phase 3: Admin & Review Implementation

### Merit Review Page (merit-review.html)
- [ ] Qipu Comment System Integration
  - [ ] Add iframe wrapper over merit.html
  - [ ] Implement footer comment bar
  - [ ] Add user type switching (IE_All_Users range)
  - [ ] Integrate screenshot functionality
  - [ ] Add comment persistence
  - [ ] Implement IE_Central_Team access controls

### Merit Admin Page (merit-admin.html)
- [ ] Admin Interface Implementation
  - [ ] Create admin layout structure
  - [ ] Add configuration panels
  - [ ] Implement user management
  - [ ] Add analytics dashboard
  - [ ] Create logging interface

### Qipu Comment System
- [ ] Core Comment Features
  - [ ] Comment creation and editing
  - [ ] Screenshot attachment
  - [ ] User type context
  - [ ] Thread management
  - [ ] Notification system

### Admin Features
- [ ] User Management
  - [ ] Role assignment
  - [ ] Access control
  - [ ] Usage tracking
  - [ ] Activity logs
- [ ] Configuration
  - [ ] System settings
  - [ ] Feature toggles
  - [ ] Integration settings
  - [ ] Backup/restore

### Testing Requirements
- [T] Review Interface
  - [T] iframe responsiveness
  - [T] Comment functionality
  - [T] Screenshot capture
  - [T] User type switching
- [T] Admin Interface
  - [T] Configuration persistence
  - [T] User management
  - [T] Analytics accuracy
  - [T] Log completeness 