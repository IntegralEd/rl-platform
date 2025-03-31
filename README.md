# Recursive Learning Platform

## Client Review Pattern
The platform uses a consistent URL pattern for managing review versions of client pages:

```
{feature}_review.html -> {feature}.html (with review features)
```

This pattern enables:
- Clean feature toggling
- Consistent codebase
- Safe production deploys
- Clear client review process

See [Client Review Checklist](docs/client-review-checklist.mdc) for detailed implementation.

## Directory Structure
```
/
├── clients/              # Client-specific code
│   └── {client}/
│       ├── index.html
│       ├── {feature}.html     # Main template
│       ├── {feature}_review.html  # Review entry
│       └── assets/
├── shared/              # Shared components
│   ├── templates/       # Base templates
│   └── assets/         # Shared assets
└── docs/               # Documentation
    └── client-review-checklist.mdc
```

## Feature Detection
Features like Qipu commenting are controlled by URL patterns rather than code changes:
- Review features always present in code
- Activated based on referrer path
- Consistent dependencies
- Single source of truth

## Development
1. Create main template with all features
2. Add review entry point
3. Use auth.js for feature detection
4. Test both paths independently

## Production
1. Deploy complete template
2. Control features via URL
3. No code changes needed
4. Safe rollback available 