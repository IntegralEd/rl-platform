# Merit HTML Integration Checklist

## 1. Preparation Phase
- [X] Back up current `merit.html` file
- [ ] Review all placeholder assets in the 5 HTML files and create a list of required replacements
- [ ] Ensure all new assets follow naming convention (`client-elpl-*`)
- [ ] Verify all new assets are placed in correct directories according to rules:
  - Images in `/clients/elpl/assets/images/`
  - CSS in `/clients/elpl/assets/css/`
  - JS in `/clients/elpl/assets/js/`

## Layout Analysis
### Structure Overview
- Grid-based layout with:
  - Sidebar: 200px fixed width
  - Header: auto height (52px)
  - Main content: flexible 1fr
  - Footer: fixed height (50px)

### Required CSS Files
- [x] `/clients/elpl/assets/css/client-elpl-variables.css` (already in place)
- [x] `/clients/elpl/assets/css/client-elpl.css` (already in place)

### Style Modifications Needed
1. Background color needs review:
   - Layout uses `#E6F6FA`
   - Need to verify against client variables
2. Grid layout differences:
   - New: `grid-template-columns: 200px 1fr`
   - New: `grid-template-rows: auto 1fr auto`
   - Need to merge with existing merit.html layout

### Component Includes
1. Sidebar: `{% include 'sidebar.html' %}`
2. Header: `{% include 'header.html' %}`
3. Main Chat: `{% include 'chat-main.html' %}`
4. Footer: `{% include 'footer.html' %}`

### Integration Tasks
- [ ] Merge grid layout with existing merit.html structure
- [ ] Verify CSS variable usage
- [ ] Implement responsive design considerations
- [ ] Maintain existing component loading system
- [ ] Preserve current script imports

## Header Analysis
### Structure Overview
- Main elements:
  - Chat title
  - New chat button
  - Profile section with avatar and name

### Placeholder Assets
1. Images:
   - [ ] `/clients/elpl/assets/images/avatar-leslie.png` (needs replacement)

### CSS Variables Used
- [ ] `--client-font-body`
- [ ] `--primary-color` (currently #c6123f)
- [ ] `--text-color` (currently #2b2b2b)

### Style Modifications Needed
1. Background color alignment:
   - Header uses `#E6F6FA` (same as layout)
   - Border color uses `#ccc` (should use variable)
2. Button hover state:
   - Uses hardcoded color `#a50e33`
   - Should derive from primary color variable

### Integration Tasks
- [ ] Replace placeholder avatar image
- [ ] Convert hardcoded colors to variables
- [ ] Ensure class names follow client naming convention:
  - Consider prefixing with `client-elpl-`
  - Avoid potential class conflicts
- [ ] Add required accessibility attributes
- [ ] Implement responsive design for mobile
- [ ] Add data-test-id attributes for testing

### Class Name Updates Needed
Current -> Proposed
- `chat-header` -> `client-elpl-chat-header`
- `chat-title` -> `client-elpl-chat-title`
- `chat-controls` -> `client-elpl-chat-controls`
- `new-chat-btn` -> `client-elpl-new-chat-btn`
- `chat-profile` -> `client-elpl-chat-profile`
- `profile-avatar` -> `client-elpl-profile-avatar`
- `profile-name` -> `client-elpl-profile-name`

## Chat Main Analysis
### Structure Overview
- Main elements:
  - Chat container (860px × 645px)
  - Message window with day dividers
  - Message blocks with avatars
  - Input container with actions

### Placeholder Assets
1. UI Elements:
   - [ ] Default avatar placeholders (40px × 40px)
   - [ ] Emoji button placeholder (😊)
   - [ ] Attach button placeholder (📎)
   - [ ] Send button placeholder (➤)

### CSS Variables Used
- [ ] `--text-color` (fallback: #2b2b2b)
- [ ] `--primary-color` (fallback: #c6123f)

### Hardcoded Values to Convert
1. Colors:
   - Background: #E6F6FA
   - Border: #e1e4e8, #ddd
   - Text: #999, #888, #aaa
   - Input background: #f9f9f9
2. Dimensions:
   - Container: 860px × 645px
   - Avatar: 40px × 40px
   - Input height: 36px
   - Border radius: 12px, 16px
   - Padding/margins: 24px, 18px, 14px, etc.

### Style Modifications Needed
1. Message styling:
   - Convert hardcoded colors to variables
   - Standardize spacing values
   - Review shadow values
2. Input container:
   - Standardize border colors
   - Review button styling
   - Consider hover state standardization

### Integration Tasks
- [ ] Convert emoji buttons to proper icon system
- [ ] Implement proper avatar handling
- [ ] Add loading states for messages
- [ ] Add error states
- [ ] Add accessibility attributes:
  - Role attributes for chat elements
  - ARIA labels for buttons
  - Screen reader support for timestamps
- [ ] Add data-test-id attributes
- [ ] Implement message status indicators

### Class Name Updates Needed
Current -> Proposed
- `chat-main` -> `client-elpl-chat-main`
- `chat-container` -> `client-elpl-chat-container`
- `chat-window` -> `client-elpl-chat-window`
- `day-divider` -> `client-elpl-day-divider`
- `message-block` -> `client-elpl-message-block`
- `avatar` -> `client-elpl-avatar`
- `message` -> `client-elpl-message`
- `timestamp` -> `client-elpl-timestamp`
- `chat-input-container` -> `client-elpl-chat-input-container`
- `chat-input` -> `client-elpl-chat-input`
- `chat-actions` -> `client-elpl-chat-actions`

### Required Features to Add
1. Message Components:
   - Proper avatar system
   - Message status indicators
   - Error handling
   - Loading states
   - Retry mechanism
2. Input Features:
   - File attachment handling
   - Emoji picker integration
   - Input validation
   - Character counter
   - Loading states

### CSS Variables to Add
```css
:root {
  --chat-container-width: 860px;
  --chat-container-height: 645px;
  --chat-avatar-size: 40px;
  --chat-input-height: 36px;
  --chat-border-radius: 12px;
  --chat-message-radius: 16px;
  --chat-padding-large: 24px;
  --chat-padding-medium: 18px;
  --chat-padding-small: 14px;
  --chat-gap-large: 18px;
  --chat-gap-medium: 12px;
  --chat-gap-small: 8px;
  --chat-border-color: #e1e4e8;
  --chat-text-muted: #888;
  --chat-text-lighter: #999;
  --chat-background-light: #f9f9f9;
}
```

## Sidebar Analysis
### Structure Overview
- Main elements:
  - Header with logo and subtitle
  - Navigation list with icons
  - Active state indicators

### Placeholder Assets
1. Images:
   - [ ] `/clients/elpl/assets/images/logo.png`
   - [ ] `/clients/elpl/assets/icons/dashboard.svg`
   - [ ] `/clients/elpl/assets/images/chat-icon.svg`

### CSS Variables Used
- [ ] `--primary-color`
- [ ] `--text-color`

### Hardcoded Values to Convert
1. Colors:
   - Background: #ffffff
   - Active indicator: #1D75DD
   - Active background: rgba(29, 117, 221, 0.08)
2. Dimensions:
   - Width: 200px
   - Logo width: 120px
   - Icon size: 20px
   - Active indicator width: 4px
   - Border radius: 12px, 8px
3. Spacing:
   - Padding: 24px
   - Margins: 32px, 4px
   - Gaps: 12px, 10px

### Style Modifications Needed
1. Navigation styling:
   - Convert hardcoded blue (#1D75DD) to variable
   - Standardize active state styling
   - Review shadow values
2. Layout:
   - Verify sidebar width matches layout spec
   - Review responsive behavior
   - Standardize spacing values

### Integration Tasks
- [ ] Move icons to proper directory structure:
  - Dashboard icon to `/clients/elpl/assets/icons/`
  - Chat icon to `/clients/elpl/assets/icons/`
- [ ] Add proper logo file
- [ ] Add accessibility attributes:
  - Role="navigation" for nav
  - aria-current for active item
  - aria-label for icons
- [ ] Add data-test-id attributes
- [ ] Implement proper active state handling

### Class Name Updates Needed
Current -> Proposed
- `sidebar` -> `client-elpl-sidebar`
- `sidebar-header` -> `client-elpl-sidebar-header`
- `client-logo` -> `client-elpl-sidebar-logo`
- `sidebar-subtitle` -> `client-elpl-sidebar-subtitle`
- `sidebar-nav` -> `client-elpl-sidebar-nav`
- `nav-item` -> `client-elpl-nav-item`
- `nav-icon` -> `client-elpl-nav-icon`

### CSS Variables to Add
```css
:root {
  --sidebar-width: 200px;
  --sidebar-padding: 24px;
  --sidebar-logo-width: 120px;
  --sidebar-icon-size: 20px;
  --sidebar-active-indicator-width: 4px;
  --sidebar-border-radius: 12px;
  --sidebar-item-radius: 8px;
  --sidebar-active-color: #1D75DD;
  --sidebar-active-bg: rgba(29, 117, 221, 0.08);
  --sidebar-shadow: 2px 0 6px rgba(0, 0, 0, 0.05);
  --sidebar-gap-large: 32px;
  --sidebar-gap-medium: 12px;
  --sidebar-gap-small: 10px;
}
```

### Required Features to Add
1. Navigation:
   - Active state management
   - Route handling
   - Deep linking support
2. Responsive:
   - Collapse/expand behavior
   - Mobile view
   - Touch support

## Footer Analysis
### Structure Overview
- Main elements:
  - Left section with logo
  - Center section with copyright
  - Right section with social icons
  - Responsive mobile layout

### Placeholder Assets
1. Images:
   - [ ] `/clients/elpl/assets/images/logo-placeholder-purple.png`
   - [ ] `/clients/elpl/assets/icons/linkedin.svg`
   - [ ] `/clients/elpl/assets/icons/instagram.svg`
   - [ ] `/clients/elpl/assets/icons/facebook.svg`
   - [ ] `/clients/elpl/assets/icons/x.svg`

### CSS Variables Used
- [ ] `--client-font-body`
- [ ] `--text-color` (fallback: #2b2b2b)

### Hardcoded Values to Convert
1. Colors:
   - Background: #E6F6FA
2. Dimensions:
   - Logo height: 24px
   - Social icons: 20px × 20px
   - Padding: 20px 24px
   - Gaps: 12px, 16px
3. Text:
   - Font size: 14px
4. Breakpoints:
   - Mobile: 600px

### Style Modifications Needed
1. Layout:
   - Standardize padding values
   - Review gap spacing
   - Verify responsive breakpoints
2. Assets:
   - Update logo placeholder
   - Standardize social icon sizes
   - Consider SVG color management

### Integration Tasks
- [ ] Replace placeholder logo
- [ ] Update copyright text with actual platform name
- [ ] Configure social media links
- [ ] Move social icons to proper directory:
  - All icons to `/clients/elpl/assets/icons/`
- [ ] Add data-test-id attributes
- [ ] Enhance accessibility attributes

### Class Name Updates Needed
Current -> Proposed
- `footer` -> `client-elpl-footer`
- `footer-left` -> `client-elpl-footer-left`
- `footer-center` -> `client-elpl-footer-center`
- `footer-right` -> `client-elpl-footer-right`
- `footer-logo` -> `client-elpl-footer-logo`
- `footer-text` -> `client-elpl-footer-text`
- `social-icon` -> `client-elpl-social-icon`

### CSS Variables to Add
```css
:root {
  --footer-height: 64px;
  --footer-padding-x: 24px;
  --footer-padding-y: 20px;
  --footer-logo-height: 24px;
  --footer-icon-size: 20px;
  --footer-gap-large: 16px;
  --footer-gap-small: 12px;
  --footer-font-size: 14px;
  --footer-mobile-breakpoint: 600px;
}
```

### Required Features to Add
1. Social Links:
   - Configurable URLs
   - Icon hover states
   - Click tracking
2. Responsive:
   - Mobile layout
   - Logo scaling
   - Text wrapping

## Asset Inventory (Updated)
### Images to Replace
1. `avatar-leslie.png`:
   - Current: Placeholder profile image
   - Needed: Default avatar system
   - Location: `/clients/elpl/assets/images/`
2. `logo.png`:
   - Current: EL Education Logo
   - Needed: Official logo file
   - Location: `/clients/elpl/assets/images/`
3. `dashboard.svg`:
   - Current: Welcome Icon
   - Location: Move to `/clients/elpl/assets/icons/`
4. `chat-icon.svg`:
   - Current: Chat Icon
   - Location: Move to `/clients/elpl/assets/icons/`
5. `logo-placeholder-purple.png`:
   - Current: Platform Logo
   - Needed: Official footer logo
   - Location: `/clients/elpl/assets/images/`
6. Social Icons:
   - LinkedIn SVG
   - Instagram SVG
   - Facebook SVG
   - X (Twitter) SVG
   - Location: Move all to `/clients/elpl/assets/icons/`

### Colors to Standardize (Updated)
1. Primary: #c6123f
2. Primary Hover: #a50e33
3. Background: #E6F6FA
4. Border: #ccc
5. Text: #2b2b2b
6. Active: #1D75DD
7. Active Background: rgba(29, 117, 221, 0.08)

### Text to Update
1. Copyright notice:
   - Current: "© 2025 Platform Name"
   - Needed: Actual platform name and current year
   - Consider dynamic year update

## Questions/Issues to Resolve (Updated)
1. Template syntax (`{% include %}`) needs to be replaced with appropriate component loading
2. Verify if background color `#E6F6FA` should be added to variables
3. Review sidebar width (200px) against existing design system
4. Should profile functionality be a separate component?
5. Need to verify if avatar images should be served from CDN
6. Consider adding loading state for avatar image
7. Review button hover state calculation method
8. Should icons be SVG sprites or individual files?
9. Consider sidebar collapse behavior
10. Review active state color scheme
11. Verify logo dimensions and format
12. Should social icons be colored or monochrome?
13. Consider dynamic copyright year
14. Review mobile breakpoint against design system
15. Verify social media links and tracking requirements

## Progress Tracking
- Preparation Phase: 25%
- Component Integration: 40%
- Asset Replacement: 15%
- Testing Phase: 0%
- Final Verification: 0% 