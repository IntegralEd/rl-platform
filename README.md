# Recursive Learning Platform

A context-aware multitenant chatbot platform for education.

## Project Structure

```
/
├── clients/                 # Client-specific implementations
│   ├── st/                 # StriveTogether
│   │   └── goalsetter/     # GoalSetter activity
│   ├── bhb/                # B'more Healthy Babies
│   ├── elpl/               # Early Learning Policy Lab
│   └── integral-ed/        # Integral Education
├── shared/                 # Shared resources
│   ├── admin/             # Admin-specific resources
│   │   ├── css/
│   │   ├── js/
│   │   └── assets/
│   └── templates/         # Common templates
└── admin/                 # Admin interface
    └── pages/            # Admin pages by client
        ├── st/
        ├── bhb/
        └── elpl/
```

## URL Structure

See [URL Alignment Rules](docs/url-alignment-rules.mdc) for detailed guidelines on:
- Client page URLs
- Admin panel URLs
- Shared resource locations
- File organization rules

## Key Features

- Context-aware chat interface
- Multitenant architecture
- Admin dashboard for each client
- Version control (review/live/embed)
- Lead capture and management

## Development

1. Clone the repository
2. Install dependencies
3. Run development server
4. Follow URL alignment rules for new features

## Documentation

- [URL Alignment Rules](docs/url-alignment-rules.mdc)
- [Learning Layout](docs/learning-layout.mdc)
- [GoalSetter Checklist](docs/goalsetter-build-checklist.mdc)
- [Client Review Checklist](docs/client-review-checklist.mdc) 