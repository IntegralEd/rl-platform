# Cursor Frontend Ruleset (April 2025)
last update: 04132025.0339am.david@frontend_cursor
agent: claude@cursor_frontend_v3.5

## Version Control [merit.html/04132025.09:28am.v.1.15]
This ruleset follows Merit versioning standards:
- Format: `{project}.html/MMDDYYYY.HH:MMam/pm.v.{version}`
- Time Zone: America/Chicago (Central)
- Current Build: merit.html/04132025.09:28am.v.1.15

## Update Protocol
1. Add your update signature in format:
   `last update: MMDDYYYY.HHMMam/pm.username@team_cursor`
2. Include agent signature if using AI assistance
3. Maintain version alignment with Merit standards
4. Document all rule changes in changelog

## Overview
This document serves as the master ruleset for frontend development in the Recursive Learning platform. It combines layout patterns, state management, and integration rules to ensure consistent implementation across all components.

## Core Principles

### 1. Layout Structure
- Follow established layout patterns for both admin and client pages
- Maintain consistent component organization
- Use standardized navigation patterns
- Implement proper responsive design

### 2. State Management
- Use consistent state patterns across components
- Implement proper lifecycle management
- Clean up resources appropriately
- Preserve necessary state between transitions

### 3. Performance
- Lazy load content when appropriate
- Cache resources effectively
- Optimize images and assets
- Minimize reflows/repaints

### 4. Security
- Validate content sources
- Sanitize dynamic content
- Verify permissions
- Protect against XSS

## Layout Rules

### Client Pages
```html
<div class="client-layout">
    <header class="client-header">...</header>
    <main class="client-content">...</main>
    <footer class="client-footer">...</footer>
</div>
```

#### Required CSS Variables
```css
:root {
    /* Layout */
    --header-height: 60px;
    --footer-height: 40px;
    --client-bg: #ffffff;
    --client-text: #2c3e50;
    --client-border: #e1e4e8;
    --content-width: 1200px;
    
    /* Typography */
    --client-font-h1: var(--base-font-h1);
    --client-font-h2: var(--base-font-h2);
    --client-font-body: var(--base-font-body);
    --client-font-size-h1: 2.5rem;
    --client-font-size-h2: 2rem;
    --client-font-size-body: 1rem;
}
```

### Admin Pages
```html
<div class="admin-layout">
    <header class="admin-header">...</header>
    <nav class="admin-page-nav">...</nav>
    <main class="admin-content">...</main>
</div>
```

#### Required Meta Tags
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## Directory Structure

### Client Pages
```
/clients/{client}/{project}/
    ├── project.html
    └── assets/
        ├── js/
        │   └── client-project-logic.js
        ├── css/
        │   └── client-project.css
        └── images/
            └── client-project-*.{svg,png}
```

### Admin Pages
```
/admin/
    ├── assets/
    │   ├── js/
    │   ├── css/
    │   └── images/
    ├── components/
    └── pages/{client}/{project}/
```

### Shared Resources
```
/shared/
    ├── page_ingredients/
    │   └── {ingredient}/
    │       ├── README.md
    │       └── ingredient.{js,css}
    ├── assets/
    └── templates/
```

## State Management Rules

### Component Lifecycle
1. Initialize state in constructor
2. Load persisted state if available
3. Set up event listeners
4. Handle cleanup on destroy

### State Persistence
```javascript
class ComponentController {
    #persistState() {
        localStorage.setItem(
            this.#config.persistence.key,
            JSON.stringify(this.#state)
        );
    }

    #loadPersistedState() {
        const stored = localStorage.getItem(this.#config.persistence.key);
        if (stored) {
            this.#state = { ...this.#state, ...JSON.parse(stored) };
        }
    }
}
```

### Error Boundaries
```javascript
class ErrorBoundary {
    handleError(error) {
        console.error('[Component] Error:', error);
        this.showErrorState();
        this.logErrorMetrics();
    }

    showErrorState() {
        this.container.innerHTML = `
            <div class="error-message" role="alert">
                <p>Something went wrong. Please try:</p>
                <button onclick="window.location.reload()">Refresh Page</button>
            </div>
        `;
    }
}
```

## Redis Integration Rules

### Key Naming Convention
```javascript
const keyPattern = `{client}:{project}:{type}:{id}`;
const contextKey = `context:{org}:{user}:{field}`;
const threadKey = `threads:{org}:{user}:{thread_id}`;
```

### Caching Strategy
```javascript
class RedisManager {
    async cacheData(key, value, ttl = 3600) {
        await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    }

    async getCachedData(key) {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
    }
}
```

## Component Implementation Rules

### Loading States
```javascript
class ComponentController {
    showLoadingState() {
        this.container.innerHTML = `
            <div class="loading-indicator" role="status">
                <span>Loading...</span>
                <div class="loading-animation"></div>
            </div>
        `;
    }
}
```

### Navigation
```javascript
class NavigationController {
    handleNavigation(section) {
        // Update state
        this.#state.currentSection = section;
        
        // Update UI
        this.#updateSectionVisibility(section);
        this.#updateNavigationState(section);
        
        // Update URL
        history.pushState({ section }, '', `#${section}`);
    }
}
```

## Testing Requirements

### Component Testing
- Unit tests for core functionality
- Integration tests for state management
- Accessibility testing
- Performance benchmarks

### Validation Points
- Form validation
- Navigation state
- Error handling
- Loading states
- Responsive design

## Documentation Requirements

### Component Documentation
```javascript
/**
 * @component ComponentName
 * @description Brief description of the component
 * @version 1.0.0
 * 
 * @example
 * <component-name data-option="value"></component-name>
 */
```

### README Requirements
- Component overview
- Installation steps
- Usage examples
- API documentation
- Testing instructions

## Accessibility Requirements

### ARIA Attributes
```html
<button 
    aria-label="Action description"
    aria-expanded="false"
    role="button">
    Action Text
</button>
```

### Keyboard Navigation
- Support Tab navigation
- Implement focus management
- Handle Escape key
- Support arrow key navigation

## Mobile Responsiveness

### Breakpoints
```css
/* Mobile */
@media (max-width: 768px) {
    .component {
        /* Mobile styles */
    }
}

/* Tablet */
@media (max-width: 1024px) {
    .component {
        /* Tablet styles */
    }
}
```

### Touch Targets
- Minimum size: 44x44px
- Adequate spacing
- Clear hit states
- Proper feedback

## Performance Guidelines

### Loading Optimization
- Use lazy loading
- Implement code splitting
- Optimize asset delivery
- Cache appropriate resources

### Runtime Performance
- Minimize DOM operations
- Use requestAnimationFrame
- Debounce event handlers
- Optimize reflows/repaints

## Security Guidelines

### Content Security
- Validate input
- Sanitize output
- Escape HTML
- Prevent XSS

### Data Protection
- Secure storage
- Safe transmission
- Proper encryption
- Access control

## Deployment Rules

### Build Process
1. Lint code
2. Run tests
3. Build assets
4. Generate documentation
5. Create deployment package

### Environment Configuration
- Development
- Staging
- Production
- Testing

## Maintenance

### Code Reviews
- Follow checklist
- Verify standards
- Check performance
- Test accessibility

### Updates
- Document changes
- Update dependencies
- Maintain changelog
- Version appropriately

## Contact & Support

### Teams
- Frontend Development
- UX/UI Design
- Platform Architecture
- Quality Assurance

### Documentation
- Implementation guides
- API references
- Style guides
- Best practices 