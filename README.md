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

## Interaction Log Table

The Interaction Log Table stores interaction details and relates to the Qipu comment schema.

### Fields
- **Interaction_Log_ID**: Unique interaction ID
- **User_ID**: Links to Users table
- **Resource_URL**: URL of the reviewed resource
- **Raw_JSON_output**: Compressed JSON payload of the full ticket

### Relationships
- Connects with Users, Tech_Tickets, and Tech_Ticket_Annotations tables

### Usage
- Stores comprehensive interaction data
- Facilitates tracking and analysis of review sessions

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

## Status Indicators

The admin dashboard uses a three-dot status system to monitor the health of each learning activity:

### API Integration Status (Left Dot)
- 🟢 **Active** - API is connected and responding within expected latency (<300ms)
- 🟡 **Warning** - API is responding but with high latency (>300ms)
- 🔴 **Error** - API connection failed or timeout

### Form Validation Status (Middle Dot)
- 🟢 **Active** - All form submissions passing validation (>95%)
- 🟡 **Warning** - Some form validation failures (85-95% pass rate)
- 🔴 **Error** - High form validation failure rate (<85% pass rate)

### User Sessions Status (Right Dot)
- 🟢 **Active** - Normal user session activity
- 🟡 **Warning** - Elevated error rates in user sessions (>5%)
- 🔴 **Error** - Critical user session issues or system errors (>10%)

### Implementation
Each admin page broadcasts these statuses using the postMessage API:

```javascript
window.parent.postMessage({
    type: 'status',
    activity: 'goalsetter', // or 'merit', 'bhb'
    status: [
        {state: 'active', message: 'API: 245ms response time'},
        {state: 'warning', message: 'Forms: 92% validation rate'},
        {state: 'error', message: 'Sessions: 15% error rate'}
    ]
}, '*');
```

Status updates are sent:
1. On page load
2. Every 30 seconds
3. After significant events (form submission, API calls) 