# Merit Page Layout Template

## Intent & Purpose
This template defines a rigid, consistent layout structure that enables:
1. Seamless transitions between tabs (not pages) for fluid UX
2. Coherent blending of chat and storyline experiences
3. Predictable component dimensions for stable navigation
4. Standardized interaction patterns across all states

## Current Implementation Status [T]
- [T] Basic layout structure implemented
- [T] Header with logo and version
- [T] Form exists and is visible
- [T] Footer with playbar/chatbar states
- [T] Basic tab navigation
- [ ] Sidebar toggle functionality
- [ ] Full responsive design
- [ ] Complete accessibility features

## File Structure
```
clients/elpl/merit/
├── merit.html                     # Main entry point
├── assets/
│   ├── js/
│   │   ├── client-merit-logic.js  # Core page logic
│   │   ├── client-merit-form.js   # Form handling
│   │   └── client-merit-chat.js   # Chat functionality
│   ├── css/
│   │   └── merit-theme.css        # Page-specific styles
│   └── images/                    # Page-specific images
└── components/                    # Future partial HTML files
    ├── header.html               # Header partial
    ├── sidebar.html              # Sidebar partial
    ├── footer.html              # Footer partial
    └── content.html             # Content area partial

clients/elpl/assets/              # Shared client assets
├── css/
│   ├── variables.css            # CSS variables
│   └── custom.css               # Client-wide styles
├── js/
│   ├── client-auth.js          # Authentication
│   └── client-router.js        # Routing logic
└── images/                     # Shared images
```

## Current HTML Structure
```html
<div id="container">
    <div id="header-bar">
        <!-- Logo and version -->
    </div>
    <div class="main-content">
        <div id="sidebar">
            <!-- Navigation tabs -->
        </div>
        <div id="content">
            <div class="section active">
                <!-- Welcome form -->
            </div>
            <div class="section">
                <!-- Chat interface -->
            </div>
        </div>
    </div>
    <div class="interaction-container">
        <div class="interaction-bar playbar">
            <!-- Next button -->
        </div>
        <div class="interaction-bar chatbar">
            <!-- Chat input -->
        </div>
    </div>
</div>
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
│ (20%)   │      (80%)           │
│         │                       │
│         │                       │
├─────────┴───────────────────────┤
│ Footer (80px)                   │
└─────────────────────────────────┘
```

### Fixed Dimensions
- Header Height: `60px`
- Sidebar Width: `20%` (collapsible to 0%)
- Footer Height: `80px`
- Content Max-Width: `1200px`
- Content Padding: `2rem`
- Component Spacing: `1rem`

## 5. Styling and Accessibility Priorities

### Review with Creative Director
- [ ] Review current implementation
- [ ] Validate color scheme
- [ ] Confirm typography choices
- [ ] Approve spacing and proportions
- [ ] Sign off on interaction patterns

### CSS Organization
1. Variables and Theming
   - [ ] Move all variables to variables.css
   - [ ] Create theme variations
   - [ ] Document color system
   - [ ] Define animation constants

2. Layout Structure
   - [ ] Implement CSS Grid for main layout
   - [ ] Add flexbox for component layouts
   - [ ] Define responsive breakpoints
   - [ ] Create utility classes

3. Component Styling
   - [ ] Style form elements
   - [ ] Design chat bubbles
   - [ ] Create loading states
   - [ ] Add transitions

4. Accessibility Enhancements
   - [ ] Add focus styles
   - [ ] Implement ARIA attributes
   - [ ] Add screen reader text
   - [ ] Test color contrast

5. Responsive Design
   - [ ] Mobile-first approach
   - [ ] Tablet adaptations
   - [ ] Desktop optimizations
   - [ ] Print styles

### Current Console Logging
```javascript
// Tab state logging
function showSection(index) {
    console.log(`Activating tab: ${index}`);
    console.log(`Previous active tab: ${document.querySelector('.section.active').dataset.index}`);
    
    // Toggle sections
    const sections = document.querySelectorAll('.section');
    sections.forEach((section, i) => {
        section.classList.toggle('active', i === index);
    });

    // Toggle footer state
    const playbar = document.querySelector('.playbar');
    const chatbar = document.querySelector('.chatbar');
    
    if (index === 0) {
        console.log('Showing playbar, hiding chatbar');
        playbar.style.display = 'flex';
        chatbar.style.display = 'none';
    } else {
        console.log('Showing chatbar, hiding playbar');
        playbar.style.display = 'none';
        chatbar.style.display = 'flex';
    }
}

// Next button gating
function checkAffirmations() {
    const checkboxes = document.querySelectorAll('#teacher-context input[type="checkbox"]');
    const nextButton = document.getElementById('next-button');
    let anyChecked = false;

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) anyChecked = true;
    });

    console.log(`Next button ${anyChecked ? 'enabled' : 'disabled'}`);
    nextButton.disabled = !anyChecked;
    nextButton.classList.toggle('enabled', anyChecked);
}
```

## Testing Checklist [T]
- [T] Form visible on welcome tab
- [T] Next button disabled by default
- [T] Next button enables with checkbox selection
- [T] Playbar visible on welcome tab
- [T] Chatbar visible on chat tab
- [T] Tab navigation working
- [T] Basic layout structure in place
- [ ] Sidebar toggle functionality
- [ ] Full responsive testing
- [ ] Accessibility audit

## Component References
Each component is referenced with `>` to indicate future partial inclusion:

### > header.html
- Fixed height: 60px
- Logo + Version display
- Consistent across all states
- Shadow depth: 4px

### > sidebar.html [Priority 2]
- Fixed width: 200px
- Tab navigation
- Controls footer state
- Collapses to top bar on mobile

### > footer.html [Priority 1]
- Fixed height: 80px
- Two states:
  1. Playbar (default)
  2. Chatbar (when active)
- Smooth state transitions

### > content-area.html
- Centered, max-width 1200px
- Flexible height
- Maintains scroll position
- Padding: 2rem

## State Management
1. Welcome State
   - Active: Welcome tab
   - Footer: Playbar
   - Content: Form

2. Chat State
   - Active: Chat tab
   - Footer: Chatbar
   - Content: Chat history

## Interaction Patterns
1. Tab Navigation
   - Click/tap tabs
   - Keyboard navigation
   - State preservation

2. Footer Interaction
   - Next button (Playbar)
   - Chat input (Chatbar)
   - Submit actions

## Accessibility Requirements
- ARIA roles for regions
- Keyboard navigation
- Focus management
- Screen reader support

## Performance Targets
- Tab switch: < 100ms
- State transition: < 200ms
- Input response: < 50ms
- Scroll performance: 60fps 