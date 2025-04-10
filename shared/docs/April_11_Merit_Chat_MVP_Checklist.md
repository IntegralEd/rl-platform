# Merit Chat MVP Checklist - April 11, 2025

## Overview
This document outlines the MVP requirements for implementing the Merit chat interface with a hardcoded assistant. The implementation follows the client layout structure and behavior rules.

## Critical Rules & Restrictions
- ⚠️ DO NOT modify production files without authorization
- ⚠️ DO NOT create new assets or files before asking - they exist on another path
- ✅ Development focused on `/clients/elpl/merit/merit.html`
- ✅ Follow client layout structure rules
- ✅ Maintain consistent UX patterns

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
  - [T] Implement "Welcome" and "Chat" tabs
  - [T] Style tabs according to design system
  - [ ] Add tab switching functionality
  - [ ] Ensure proper responsive behavior

#### 2. Footer Implementation
- [T] Add consistent footer div
  - [T] Implement chatbar for chat tab
  - [T] Implement playbar for welcome tab
  - [T] Add proper positioning and styling
  - [T] Ensure footer stays at bottom
  - [T] Add dynamic switching based on active tab

#### 3. Button Visibility and Styling
- [ ] Fix "Next" button visibility
  - [ ] Add proper background color (#211651)
  - [ ] Ensure icon is visible and properly sized
  - [ ] Add hover states
- [ ] Fix chat "Send" button visibility
  - [ ] Add proper background color (#211651)
  - [ ] Implement send icon from assets
  - [ ] Add hover and active states

#### 4. Header and Branding
- [ ] Add logo to header
  - [ ] Implement proper logo sizing
  - [ ] Add correct positioning
  - [ ] Ensure responsive behavior
- [ ] Fix version display
  - [ ] Update version format to match spec
  - [ ] Add proper padding and positioning
  - [ ] Implement auto-updating time display

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
- [ ] HTML structure follows standards
- [ ] CSS properly scoped
- [ ] JavaScript behaviors working
- [ ] Assets loading correctly

### Form Testing
- [ ] Required field validation
- [ ] Error message display
- [ ] Submit button behavior
- [ ] Form reset functionality

### Chat Testing
- [ ] Message sending
- [ ] Loading states
- [ ] Error handling
- [ ] UI responsiveness
- [ ] Assistant ID verification (asst_QoAA395ibbyMImFJERbG2hKT)
- [ ] Model compatibility check

### Integration Testing
- [ ] Assistant configuration matches OpenAI settings
- [ ] Model settings aligned with Assistant configuration
- [ ] Error handling for model/assistant mismatch
- [ ] Fallback behavior for API issues

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

## Next Steps
1. Implement Assistant Integration
   - Connect to assistant API
   - Add proper error handling
   - Implement loading states
   - Add console logging for debugging

2. Error Handling
   - Add form validation error states
   - Add chat error handling
   - Implement loading states
   - Add network error recovery

3. Testing & Validation
   - Run HTML validation
   - Test CSS scoping
   - Verify JavaScript modules
   - Test assistant integration
   - Validate accessibility
   - Check responsive design

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