# Page Ingredients Library

A curated collection of HTML partials for building consistent learning platform pages. These components are used by both the admin panel and Cursor for page assembly.

## Directory Structure

```
page_ingredients/
├── navigation/
│   ├── sidebar.html       # Left navigation component
│   ├── header.html       # Top header bar
│   └── footer.html       # Footer with branding
├── interaction/
│   ├── chatbar.html      # Chat input interface
│   ├── playbar.html      # Next/action buttons
│   └── loading.html      # Loading states
├── welcome/
│   ├── affirmations.html # Terms acceptance
│   ├── grade_select.html # Education level picker
│   └── intake_form.html  # User data collection
└── chat/
    ├── container.html    # Chat window wrapper
    ├── message.html      # Message bubble template
    └── input.html        # Message input area

## Usage

These HTML partials are:
1. Never served directly to clients
2. Used as building blocks for page assembly
3. Follow our learning layout rules
4. Include necessary ARIA labels
5. Use CSS variables for theming

## Naming Conventions

- Files use lowercase with underscores
- Semantic prefixes for type:
  - `nav_` for navigation elements
  - `form_` for input collections
  - `ui_` for interface components

## Integration Points

1. Admin Panel:
   - Used for visual page builder
   - Component selection and arrangement
   - Property configuration

2. Cursor Development:
   - Reference for consistent implementations
   - Copy-paste templates for new features
   - Documentation of patterns

## CSS Variables

All components use these standard variables:
```css
:root {
    /* Layout */
    --nav-width: 20%;
    --content-width: 80%;
    --header-height: 40px;
    --footer-height: 60px;
    
    /* Colors */
    --primary-color: #425563;
    --secondary-color: #E87722;
    --background-color: #f9f9f9;
    
    /* Typography */
    --font-body: Arial, sans-serif;
    --font-size-body: 16px;
}
```

## Validation

Components should:
- Use semantic HTML
- Include ARIA attributes
- Support keyboard navigation
- Follow BEM naming
- Use CSS variables 