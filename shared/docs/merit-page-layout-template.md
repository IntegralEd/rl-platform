# Merit Page Layout Template

## Intent & Purpose
This template defines a rigid, consistent layout structure that enables:
1. Seamless transitions between tabs (not pages) for fluid UX
2. Coherent blending of chat and storyline experiences
3. Predictable component dimensions for stable navigation
4. Standardized interaction patterns across all states

## Canonical Structure & Nomenclature (Based on @client-layout-structure-behavior.mdc & Current Implementation)

```html
<div class="client-layout" data-client-component="merit-page">
  <!-- Overall flex column container -->
  <header class="client-header" role="banner">
    <!-- Top fixed bar -->
    <div class="header-content">
      <!-- ... logo, version ... -->
    </div>
  </header>

  <main class="client-content" role="main">
    <!-- Main flex row container -->
    
    <nav class="sidebar expanded" role="navigation" aria-label="Main navigation">
      <!-- Navigation panel -->
      <div class="sidebar-content">
        <div class="sidebar-nav">
          <a href="#welcome" class="nav-link active" data-section="welcome" aria-current="page">...</a>
          <a href="#chat" class="nav-link" data-section="chat">...</a>
        </div>
      </div>
    </nav>

    <button id="sidebarToggle" class="sidebar-toggle" aria-expanded="true" aria-label="Toggle Sidebar">
      <!-- Visually collapses/expands sidebar -->
      <span class="toggle-icon">◀</span>
    </button>

    <div class="content-area" role="region" aria-label="Main content">
      <!-- Main area where sections are displayed -->
      <div class="section active" data-section="welcome" role="tabpanel" aria-labelledby="welcome-tab">
        <!-- Contains .welcome-form -->
      </div>
      <div class="section" data-section="chat" role="tabpanel" aria-labelledby="chat-tab" hidden>
        <!-- Contains .chat-container -->
      </div>
    </div>
  </main>

  <footer class="client-footer" role="contentinfo">
    <!-- Bottom fixed bar -->
    <div class="footer-content">
      <!-- Centering/max-width wrapper -->
      <div class="playbar" id="playbar">
        <!-- Shown when welcome section active -->
        <button class="next-button" id="next-button" disabled aria-label="Continue to chat">...</button>
      </div>
      <div class="chatbar" id="chatbar" hidden>
        <!-- Shown when chat section active -->
        <div class="chat-input-container">
          <textarea class="chat-input" id="chat-input">...</textarea>
          <button class="send-button" id="send-button">...</button>
        </div>
      </div>
    </div>
  </footer>
</div>
```

**Key Elements:**
*   **Sidebar Panel:** `nav.sidebar`
*   **Sidebar Toggle Button:** `button#sidebarToggle`
*   **Main Content Area:** `div.content-area`
*   **Switchable Views:** `div.section` (identified by `data-section="<name>"`)
*   **Bottom Fixed Bar:** `footer.client-footer`
*   **Conditional Footer Bars:** `div#playbar`, `div#chatbar`
*   **Gating Button:** `button#next-button`
*   **Chat Send Button:** `button#send-button`
*   **Navigation Links:** `a.nav-link`

## Behavior Summary
*   Clicking `.nav-link` updates active state, shows corresponding `.section`, toggles `#playbar`/`#chatbar`.
*   Clicking `#sidebarToggle` visually collapses/expands `.sidebar`.
*   Form changes enable/disable `#next-button`.
*   Clicking enabled `#next-button` shows chat `.section` and `#chatbar`.

## Current Implementation Status [T]
- [X] Basic layout structure matches canonical structure.
- [X] Header with logo and version.
- [X] Form exists and is visible in welcome section.
- [X] Footer with conditional playbar/chatbar states.
- [X] Basic tab navigation via sidebar links.
- [X] Sidebar toggle functionality implemented.
- [ ] Full responsive design testing needed.
- [ ] Complete accessibility features audit needed.
- [ ] Gating logic beyond form validity (chat/quiz interaction) TBD.

## File Structure
```
clients/elpl/merit/
├── merit.html                     # Main entry point
├── assets/
│   ├── js/
│   │   ├── client-merit-logic.js  # Core page logic (Sidebar, Nav, Form state)
│   │   ├── client-merit-form.js   # Handles form interactions (potentially could be merged into logic?)
│   │   └── client-merit-chat.js   # Chat functionality (UI, message handling)
│   ├── css/
│   │   └── client-merit-chat.css  # Page-specific styles (mostly chat?)
│   └── images/                    # Page-specific images (if any)
└── components/                    # Future: Not used currently

clients/elpl/assets/              # Shared ELPL client assets
├── css/
│   ├── client-elpl-variables.css # CSS variables
│   └── client-elpl.css           # Client-wide styles
├── js/
│   ├── client-auth.js            # Authentication (Currently ELPL specific)
│   └── client-router.js          # Routing logic (Currently non-existent)
└── images/                       # Shared images (logos, icons)

shared/assets/                    # Platform-Shared assets
├── js/
│   └── client-component-loader.js # Component Loader (Currently non-existent)
└── ...
```

## Core Layout Dimensions

### Viewport Structure
```
┌─────────────────────────────────┐
│ Header (60px)                   │
├─────────┬───────────────────────┤
│         │                       │
│         │                       │
│ Sidebar │     Content Area      │
│ (20%)   │      (Flex 1)         │
│         │                       │
│         │                       │
├─────────┴───────────────────────┤
│ Footer (80px)                   │
└─────────────────────────────────┘
```

### Fixed Dimensions
- Header Height: `var(--elpl-header-height, 60px)`
- Sidebar Width: `20%` (collapsible to 0%)
- Footer Height: `var(--elpl-footer-height, 80px)`
- Content Max-Width: `var(--elpl-content-width, 1200px)`
- Content Padding: `1rem` (in `.client-content`)
- Content Area Padding: `2rem` (in `.content-area`)
- Component Spacing: `1rem` (general gap)

## Styling and Accessibility Priorities

### Review with Creative Director
- [ ] Review current implementation
- [ ] Validate color scheme
- [ ] Confirm typography choices
- [ ] Approve spacing and proportions
- [ ] Sign off on interaction patterns

### CSS Organization
1. Variables and Theming
   - [X] Client variables in `/clients/elpl/assets/css/client-elpl-variables.css`
   - [ ] Document color system fully
   - [ ] Define animation constants

2. Layout Structure
   - [X] Flexbox for main layout (`.client-content`)
   - [X] Responsive breakpoints defined (need testing)
   - [ ] Create more utility classes?

3. Component Styling
   - [X] Basic form element styling
   - [ ] Chat bubble styling (in `client-merit-chat.css`?)
   - [ ] Loading states (need implementation)
   - [X] Basic transitions for sidebar

4. Accessibility Enhancements
   - [ ] Focus styles review needed
   - [X] Basic ARIA attributes added (roles, labels)
   - [ ] Screen reader text for dynamic changes (partially added for sidebar)
   - [ ] Test color contrast

5. Responsive Design
   - [ ] Mobile-first approach review
   - [X] Basic Tablet/Mobile adaptations in place (needs testing)
   - [ ] Print styles (low priority)

## Testing Checklist [T]
- [X] Form visible on welcome tab
- [X] Next button disabled by default
- [X] Next button enables with form validity
- [X] Playbar visible on welcome tab
- [X] Chatbar visible on chat tab
- [X] Tab navigation working
- [X] Basic layout structure in place
- [X] Sidebar toggle functionality working
- [ ] Full responsive testing (mobile, tablet)
- [ ] Accessibility audit (keyboard nav, screen reader)

## Component References
(Future concept - not currently implemented)

### > header.html
- Fixed height: 60px
- Logo + Version display
- Consistent across all states

### > sidebar.html
- Width: 20%
- Tab navigation
- Controls footer state via JS
- Collapses via JS

### > footer.html
- Fixed height: 80px
- Two states: Playbar / Chatbar
- State transitions via JS

### > content-area.html
- Centered, max-width 1200px (via `.client-content`)
- Flexible height
- Contains `.section` elements

## State Management
1. Welcome State
   - Active: Welcome section
   - Footer: Playbar visible
   - Sidebar: Link active
2. Chat State
   - Active: Chat section
   - Footer: Chatbar visible
   - Sidebar: Link active
3. Sidebar State
   - `expanded` / `collapsed` classes on `.sidebar`
   - `sidebar-collapsed` class on `.client-content`
   - Managed by `SidebarManager`, persisted in `localStorage`

## Interaction Patterns
1. Tab Navigation
   - Click/tap `.nav-link`
   - Keyboard navigation (basic via tab, needs refinement)
   - State preservation (active link, current section)
2. Footer Interaction
   - Next button click (Playbar)
   - Chat input + Send button (Chatbar)
   - Submit actions (via JS)
3. Sidebar Toggle
   - Click `#sidebarToggle`
   - Escape key (closes if expanded)
   - State preservation (`localStorage`)

## Accessibility Requirements
- ARIA roles for regions (banner, navigation, main, contentinfo)
- Keyboard navigation (needs thorough testing)
- Focus management (needs testing, esp. after section change)
- Screen reader support (basic announcements added)

## Performance Targets
- Tab switch: < 100ms
- State transition: < 300ms (current CSS)
- Input response: < 50ms
- Scroll performance: 60fps 