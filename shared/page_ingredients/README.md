# Shared Page Ingredients

This directory contains reusable web components and modules that can be imported and used across different pages in the Recursive Learning platform.

## Usage

Components can be imported using the HTML Import feature or custom element registration. Each component follows the same pattern:

```html
<!-- Import the component -->
<link rel="import" href="/shared/page_ingredients/component-name/component-name.html">

<!-- Use the component -->
<rl-component-name attribute="value"></rl-component-name>
```

## Component Structure

Each component should be placed in its own directory with the following structure:

```
component-name/
├── component-name.html      # Main component definition
├── component-name.css       # Optional separate stylesheet
├── component-name.js        # Optional separate JavaScript
└── README.md                # Component documentation
```

## Available Components

### Layout Components
- `layout/header` - Standard header with navigation
- `layout/footer` - Standard footer with links
- `layout/sidebar` - Collapsible sidebar navigation

### Activity Components
- `activities/multiple-choice` - Multiple choice question
- `activities/drag-drop` - Drag and drop interaction
- `activities/sort` - Sorting activity

### Form Components
- `forms/text-input` - Text input field with validation
- `forms/radio-group` - Radio button group
- `forms/checkbox-group` - Checkbox group

### Chat Components
- `chat/message-thread` - Threaded chat messages
- `chat/input-area` - Chat input with attachments

### Iframe Components
- `iframe/iframe` - Responsive iframe with loading states
- `iframe/iframe-viewer` - Advanced iframe with toolbar

### Toggle Component
- `toggle/toggle` - Live/Temp version switcher

### Reviewer Panel Component
- `reviewer-panel/reviewer-panel` - Session information display with six fields:
  - `user_id` - Reviewer identifier
  - `qcid` - Quality control identifier
  - `start_date` - Review start date
  - `end_date` - Review end date
  - `role` - Reviewer role
  - `tickets_entered` - Count of tickets/comments submitted

## Development Guidelines

### Component Requirements
1. All components must be self-contained with no external dependencies
2. Use Shadow DOM for style encapsulation
3. Follow the custom element naming convention with `rl-` prefix
4. Include comprehensive documentation
5. Provide accessibility features

### Styling
- Use CSS variables for theming
- Provide both light and dark mode support
- Ensure responsive behavior

### JavaScript
- Use ES6+ features
- Follow module pattern
- Document all public methods and properties
- Handle error states gracefully

### Testing
- Test in all supported browsers
- Verify mobile compatibility
- Check accessibility with screen readers

## Implementation Example

```html
<!-- Import the component -->
<link rel="import" href="/shared/page_ingredients/iframe/iframe.html">

<!-- Use the component -->
<rl-iframe 
  src="https://example.com" 
  title="Example Content"
  height="500px">
</rl-iframe>
```

## Reviewer Panel Implementation Example

```html
<!-- Import the reviewer panel component -->
<link rel="import" href="/shared/page_ingredients/reviewer-panel/reviewer-panel.html">

<!-- Add reviewer panel below qipu comment bar -->
<rl-reviewer-panel
  user-id="reviewer123"
  qcid="QC20250407001"
  start-date="2025-04-07"
  end-date="2025-04-14"
  role="client_sme"
  tickets-entered="0">
</rl-reviewer-panel>
```

The reviewer panel will automatically update the ticket count when new comments are added through the qipu comment system. 