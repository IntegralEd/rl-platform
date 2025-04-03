# Recursive Learning Platform

A context-aware learning environment for personalized education.

## Project Structure

```
rl-platform/
├── shared/           # Shared assets and components
│   ├── admin/       # Admin interface
│   └── assets/      # Common assets
├── clients/         # Client-specific implementations
│   ├── st/          # StriveTogether
│   ├── elpl/        # ELPL Professional Learning
│   ├── bhb/         # Bright Healthy Babies
│   └── integral-ed/ # Integral Education
└── docs/            # Documentation
```

## Recent Updates

### Frontend Improvements (April 2024)
- Cleaned up landing pages for consistent branding
- Removed vestigial admin controls
- Implemented version switching for client implementations
- Added review overlay functionality
- Improved error handling for undefined user data

### Integration Learnings
- Scripts must be served from public URLs (GitHub Pages)
- Correct MIME types are crucial for script loading
- Header span pattern effective for data persistence
- Role validation working as expected
- Graceful handling of undefined user data implemented

### Client Implementation Checklist
- [x] StriveTogether Goal Setter
  - [x] Version switching (prod/review/temp)
  - [x] Review overlay with comments
  - [x] Production router
- [x] ELPL Merit System
  - [x] Version switching
  - [x] Review interface
  - [x] Production deployment
- [ ] Bright Healthy Babies
  - [ ] Initial setup
  - [ ] Core implementation
  - [ ] Review interface

## Development

### Prerequisites
- Node.js 18+
- Git

### Setup
1. Clone the repository
2. Install dependencies
3. Configure environment variables
4. Start development server

### Deployment
- Frontend: GitHub Pages
- Admin: Softr integration
- Assets: CDN distribution

## License

Copyright © 2024 Integral Education. All rights reserved. 