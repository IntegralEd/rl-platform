# Iframe Component

A reusable iframe component for the RL Platform that handles loading states, errors, and accessibility.

## Components

### 1. Core Iframe Component (`iframe.html`)
Handles the basic iframe functionality with loading states and error handling.

### 2. Iframe Viewer Tool (`iframe-viewer.html`)
A visual tool for previewing and generating iframe embed codes.

## Features

- Responsive container
- Loading state indicator
- Error handling
- Accessibility support (ARIA live regions)
- Cross-origin security controls
- Auto-resize capability
- Dark mode support
- URL validation
- Embed code generation
- Preview functionality

## Usage

### Basic Component
```html
<link rel="import" href="/shared/page_ingredients/iframe/iframe.html">
<rl-iframe 
  src="https://example.com" 
  title="Content Frame"
  sandbox="allow-scripts allow-same-origin">
</rl-iframe>
```

### Viewer Tool
Add to your admin page:
```html
<link rel="import" href="/shared/page_ingredients/iframe/iframe-viewer.html">
<iframe-viewer></iframe-viewer>
```

## Attributes

- `src` (required): URL to load in the iframe
- `title` (required): Accessible title for the iframe
- `sandbox` (optional): Security restrictions for the iframe

## Examples

### Basic Usage
```html
<rl-iframe 
  src="/clients/st/goalsetter/preview.html" 
  title="Goalsetter Preview">
</rl-iframe>
```

### With Sandbox Restrictions
```html
<rl-iframe 
  src="https://external-content.com" 
  title="External Content"
  sandbox="allow-scripts">
</rl-iframe>
```

## CSS Variables

Customize appearance with CSS variables:
```css
rl-iframe {
  --border-color: #e0e0e0;
  --border-radius: 4px;
  --bg-color: #ffffff;
  --error-color: #dc3545;
}
```

## Events

- `load`: Fired when iframe content loads successfully
- `error`: Fired when iframe fails to load

## Security Notes

1. Always use appropriate sandbox restrictions for external content
2. Review cross-origin policies when embedding external sites
3. Consider content security policies (CSP) for your application
4. Use the viewer tool's URL validation to ensure safe sources

## Version History

- v1.0.1 (2024-04-05): Added iframe viewer tool
- v1.0.0 (2024-04-05): Initial release 