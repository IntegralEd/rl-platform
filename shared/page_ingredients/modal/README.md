# Platform Modal Component

## Overview
A standardized modal component for the Recursive Learning platform. This component provides a consistent modal experience across all platform interfaces.

## Version
1.0.0

## Features
- Customizable header with title and close button
- Click-outside-to-close functionality (optional)
- Animated transitions
- Responsive design
- Event dispatching for open/close events
- Accessibility support
- Z-index management

## Installation
1. Import the required files:
```html
<!-- In your HTML head -->
<link rel="stylesheet" href="/shared/page_ingredients/modal/modal.css">
```

```javascript
// In your JavaScript file
import Modal from '/shared/page_ingredients/modal/modal.js';
```

## Usage
```javascript
// Create a new modal
const modal = new Modal({
    id: 'my-modal',                // Optional: Custom ID
    title: 'Modal Title',          // Optional: Header title
    content: 'Modal content...',    // Optional: Initial content
    closeOnOverlay: true,          // Optional: Close when clicking outside
    showCloseButton: true,         // Optional: Show close button in header
    customClass: 'my-modal',       // Optional: Additional CSS class
    zIndex: 200                    // Optional: Custom z-index
});

// Open the modal
modal.open();

// Close the modal
modal.close();

// Update content
modal.setContent('New content');

// Update title
modal.setTitle('New Title');

// Clean up
modal.destroy();
```

## Event Handling
```javascript
// Listen for modal events
modal.element.addEventListener('modal:opened', () => {
    console.log('Modal opened');
});

modal.element.addEventListener('modal:closed', () => {
    console.log('Modal closed');
});
```

## CSS Variables
The modal uses these CSS variables with fallbacks:
- `--background-color`: Modal background (default: #ffffff)
- `--border-radius-lg`: Border radius (default: 12px)
- `--border-color`: Border color (default: #e1e4e8)
- `--text-color`: Text color (default: #2c3e50)
- `--text-muted`: Muted text color (default: #6c757d)
- `--font-size-lg`: Large font size (default: 1.25rem)

## Accessibility
- Traps focus within modal when open
- Supports keyboard navigation
- Uses semantic HTML structure
- ARIA attributes for screen readers

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes
- Modal content can include HTML
- Maximum width is 600px by default
- Animations use CSS transitions
- Z-index defaults to 200 