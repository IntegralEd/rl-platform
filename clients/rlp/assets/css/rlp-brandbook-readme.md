# Recursive Learning Platform (RLP) Brand Overview

Welcome to the **Recursive Learning Platform (RLP)** design system.  
This README outlines the visual identity, styling philosophy, and cascading CSS architecture that power the RLP interface—starting with the `Curious Intake Form`.

> "In Recursive Learning, the interface is the pedagogy. The form is a mirror; it reflects your context, not confines it."

---

## ✨ Brand Identity Keywords

- **Context-Aware**
- **Human-Centered**
- **Frameless Design**
- **Curiosity-Driven**
- **Modular & Multi-Tenant**
- **Recursive DNA**
- **Open-Ended Interaction**
- **Visual Dialogue**
- **Self-Checking Interfaces**
- **Semantic Styling**

## 🧠 Design Philosophy

Every element in our interface is a quiet invitation to participate in your own transformation. Our design system ensures:

- **Platform Consistency**: Core DNA patterns that unify the experience
- **Feature Flexibility**: Modular components that adapt to context
- **Tenant Adaptability**: Custom layers that respect client identity

### Design Principles

1. **Minimal UI, Maximum Context**
   - Reduce visual noise
   - Amplify meaningful interactions
   - Context-aware components

2. **Built to Evolve**
   - Adaptive layouts
   - Progressive enhancement
   - Contextual feedback

3. **Quiet Confidence**
   - Subtle animations
   - Thoughtful spacing
   - Intentional typography

---

## 🎨 Core Colors

| Token                | Hex       | Description                       |
|---------------------|-----------|-----------------------------------|
| `--rlp-color-primary`   | `#204060` | Deep knowledge / foundation       |
| `--rlp-color-secondary` | `#9BAEC8` | Navigation / subtle clarity       |
| `--rlp-color-highlight` | `#FFE066` | Emphasis / curiosity / delight    |

### Extended Color System
```css
:root {
  /* Primary Palette */
  --rlp-color-primary-light: #2D5A8B;
  --rlp-color-primary-dark: #152D44;
  
  /* Secondary Palette */
  --rlp-color-secondary-light: #C8D5E6;
  --rlp-color-secondary-dark: #7B8EA8;
  
  /* Accent Colors */
  --rlp-color-accent-success: #4CAF50;
  --rlp-color-accent-warning: #FFC107;
  --rlp-color-accent-error: #F44336;
}
```

---

## 🧬 Recursive DNA Twist

We represent the **"recursive"** idea visually through:
- A subtle **diagonal twist pattern** (`--rlp-line-twist`) used in form sections and left-edge indicators
- Soft, organic **shadows and curves** (via `--rlp-radius`, `--rlp-shadow`)
- **One-sided highlights** that break borders intentionally—evoking the feeling of stepping beyond the fourth wall

### Implementation
```css
:root {
  /* Recursive DNA Variables */
  --rlp-line-twist: linear-gradient(45deg, var(--rlp-color-secondary) 0%, transparent 100%);
  --rlp-radius: 8px;
  --rlp-radius-large: 12px;
  --rlp-shadow: 0 2px 8px rgba(32, 64, 96, 0.12);
  --rlp-shadow-hover: 0 4px 12px rgba(32, 64, 96, 0.16);
}
```

---

## 📦 Cascading CSS Structure

RLP supports a **multi-tenant layout system** where styles are layered as follows:

```html
<link rel="stylesheet" href="/css/rl-platform.css">  <!-- Platform base -->
<link rel="stylesheet" href="/css/rl-curious.css">   <!-- Feature/module styles -->
<link rel="stylesheet" href="/css/rl-custom.css">    <!-- Client-specific override -->
```

### CSS Architecture

1. **Platform Base (`rl-platform.css`)**
   - Core variables
   - Reset styles
   - Grid system
   - Typography
   - Common components

2. **Feature Modules (`rl-{feature}.css`)**
   - Feature-specific styles
   - Component variations
   - State management
   - Animations

3. **Client Overrides (`rl-custom.css`)**
   - Client branding
   - Custom components
   - Layout adjustments
   - Special cases

---

## 📐 Layout & Spacing

### Grid System
```css
:root {
  /* Grid */
  --rlp-grid-columns: 12;
  --rlp-grid-gap: 24px;
  --rlp-container-max: 1200px;
  
  /* Spacing Scale */
  --rlp-space-xs: 4px;
  --rlp-space-sm: 8px;
  --rlp-space-md: 16px;
  --rlp-space-lg: 24px;
  --rlp-space-xl: 32px;
}
```

### Breakpoints
```css
/* Mobile First Approach */
--rlp-bp-sm: 576px;   /* Small devices */
--rlp-bp-md: 768px;   /* Medium devices */
--rlp-bp-lg: 992px;   /* Large devices */
--rlp-bp-xl: 1200px;  /* Extra large devices */
```

---

## 🔤 Typography

```css
:root {
  /* Font Families */
  --rlp-font-primary: 'Inter', system-ui, sans-serif;
  --rlp-font-mono: 'JetBrains Mono', monospace;
  
  /* Font Sizes */
  --rlp-text-xs: 12px;
  --rlp-text-sm: 14px;
  --rlp-text-md: 16px;
  --rlp-text-lg: 18px;
  --rlp-text-xl: 24px;
  
  /* Line Heights */
  --rlp-leading-tight: 1.2;
  --rlp-leading-normal: 1.5;
  --rlp-leading-loose: 1.8;
}
```

---

## 🎯 Usage Guidelines

### Component Best Practices

1. **Forms & Inputs**
   ```css
   .rlp-input {
     border-radius: var(--rlp-radius);
     border: 1px solid var(--rlp-color-secondary);
     padding: var(--rlp-space-sm) var(--rlp-space-md);
     transition: all 0.2s ease;
   }
   ```

2. **Buttons & CTAs**
   ```css
   .rlp-button {
     background: var(--rlp-color-primary);
     color: white;
     border-radius: var(--rlp-radius);
     padding: var(--rlp-space-sm) var(--rlp-space-lg);
     box-shadow: var(--rlp-shadow);
   }
   ```

3. **Cards & Containers**
   ```css
   .rlp-card {
     background: white;
     border-radius: var(--rlp-radius-large);
     padding: var(--rlp-space-lg);
     box-shadow: var(--rlp-shadow);
   }
   ```

---

## 🔄 Version Control & Updates

This brandbook is versioned alongside the codebase. Major updates will be documented here with corresponding CSS changes.

### Current Version: 1.0.0
- Initial brand system implementation
- Core variable structure
- Base component styles
- Curious form styling

---

## 📚 Additional Resources

- [RLP Design System (Figma)](https://figma.com/rlp-design-system)
- [Component Library Documentation](https://docs.rlp.dev/components)
- [CSS Architecture Guide](https://docs.rlp.dev/css-architecture)

---

## 🤝 Contributing

When adding new styles or components:

1. Follow the existing naming conventions
2. Use CSS variables for consistency
3. Document any new patterns
4. Test across all breakpoints
5. Validate accessibility compliance

For questions or contributions, contact the RLP Design Team.

## 🧪 The Curious Intake Form

Our first application of the RLP brand showcases our design principles in action. The form embodies:

### Core Features
- ✅ **Accessible by Design**
  - ARIA-enhanced components
  - Keyboard navigation
  - Screen reader optimized

- 🧠 **Minimal UI, Maximum Context**
  - Clean layout structure
  - Progressive disclosure
  - Contextual helper text

- 🧬 **RLP DNA Integration**
  - `.rlp-card` base styling
  - Signature twist pattern
  - Organic interactions

- 💬 **Enhanced Communication**
  - Styled helper text
  - Inline callouts
  - Contextual feedback

- 🌱 **Evolution-Ready**
  - Adapts to responses
  - Scales with content
  - Grows with user

### Implementation Files

```text
clients/rlp/
├── assets/
│   ├── css/
│   │   ├── rl-platform.css     # Global variables, card layout, DNA twist
│   │   ├── rl-curious.css      # Curious form styling
│   │   └── rl-custom.css       # Optional tenant overrides
│   └── js/
│       └── client-curious.js   # Form behavior and interactions
└── curious/
    └── curious.html           # Full form markup using all layers
```

### Example Component: Curious Form Card

```css
.rlp-curious-card {
  /* Inherit RLP DNA */
  @extend .rlp-card;
  
  /* Form-specific enhancements */
  --card-padding: var(--rlp-space-xl);
  --helper-text-color: var(--rlp-color-secondary-dark);
  
  padding: var(--card-padding);
  position: relative;
  
  /* Progressive animation */
  opacity: 0;
  transform: translateY(10px);
  animation: cardEntrance 0.4s ease forwards;
}

/* Helper text styling */
.rlp-curious-helper {
  color: var(--helper-text-color);
  font-size: var(--rlp-text-sm);
  margin-top: var(--rlp-space-xs);
  opacity: 0.8;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
}
```

## 🎭 Component Personas

Each component in our system has a distinct personality and purpose:

### Form Fields
- **Role**: Guide & Listener
- **Voice**: Clear, encouraging
- **Behavior**: Responsive, patient

### Buttons
- **Role**: Enabler & Validator
- **Voice**: Confident, direct
- **Behavior**: Decisive, reliable

### Cards
- **Role**: Container & Contextualizer
- **Voice**: Organized, structured
- **Behavior**: Adaptive, protective

## 📏 Spacing Philosophy

Our spacing system follows a "breathing room" principle:

```css
:root {
  /* Intimate space - For tight relationships */
  --rlp-space-intimate: 4px;
  
  /* Personal space - For related elements */
  --rlp-space-personal: 8px;
  
  /* Social space - For grouped components */
  --rlp-space-social: 16px;
  
  /* Public space - For major sections */
  --rlp-space-public: 24px;
  
  /* Expansive space - For page-level divisions */
  --rlp-space-expansive: 32px;
}
```

## 🎨 Animation Guidelines

Animations should feel natural and purposeful:

```css
:root {
  /* Timing */
  --rlp-duration-instant: 100ms;
  --rlp-duration-quick: 200ms;
  --rlp-duration-natural: 300ms;
  --rlp-duration-relaxed: 400ms;
  
  /* Easing */
  --rlp-ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --rlp-ease-decelerate: cubic-bezier(0, 0, 0.2, 1);
  --rlp-ease-accelerate: cubic-bezier(0.4, 0, 1, 1);
}
```

## 🔍 Quality Assurance

### Accessibility Checklist
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigation tested
- [ ] Screen reader optimized
- [ ] Color contrast verified
- [ ] Focus states visible

### Performance Metrics
- [ ] First contentful paint < 1.5s
- [ ] Time to interactive < 3.0s
- [ ] Bundle size < 100KB
- [ ] Animation performance 60fps

### Browser Support
- [ ] Chrome/Edge (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] iOS Safari (latest)
- [ ] Chrome for Android (latest)

## 📱 Responsive Strategy

Our mobile-first approach ensures:

1. **Base Experience**
   - Core functionality
   - Essential content
   - Minimal layout

2. **Progressive Enhancement**
   - Added features
   - Rich interactions
   - Complex layouts

3. **Adaptive Content**
   - Context-aware
   - Device-optimized
   - Bandwidth-conscious
