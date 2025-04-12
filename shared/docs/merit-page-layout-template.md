# Merit Page Layout Template

## Intent & Purpose
This template defines a rigid, consistent layout structure that enables:
1. Seamless transitions between tabs (not pages) for fluid UX
2. Coherent blending of chat and storyline experiences
3. Predictable component dimensions for stable navigation
4. Standardized interaction patterns across all states

## Core Layout Dimensions

### Viewport Structure
```
┌─────────────────────────────────┐
│ Header (60px)                   │
├─────────┬───────────────────────┤
│         │                       │
│         │                       │
│ Sidebar │     Content Area      │
│ (200px) │   (flex, centered)    │
│         │                       │
│         │                       │
├─────────┴───────────────────────┤
│ Footer (80px)                   │
└─────────────────────────────────┘
```

### Fixed Dimensions
- Header Height: `60px`
- Sidebar Width: `200px`
- Footer Height: `80px`
- Content Max-Width: `1200px`
- Content Padding: `2rem`
- Component Spacing: `1rem`

### Responsive Breakpoints
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

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