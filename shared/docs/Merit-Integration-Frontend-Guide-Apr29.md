# Merit Frontend Integration Guide
**Last Updated: April 29, 2025**

## ⚠️ IMPORTANT: API Endpoint Update (April 29, 2025)
Due to CORS configuration issues with the dev endpoint, we are temporarily swapping to use the prod endpoint as primary:

```javascript
// UPDATED API Configuration
window.env = {
    // Swapped endpoints - prod is now primary
    RL_API_GATEWAY_ENDPOINT: 'https://29wtfiieig.execute-api.us-east-2.amazonaws.com/prod',
    RL_API_FALLBACK_ENDPOINT: 'https://3ba2utz7y2.execute-api.us-east-2.amazonaws.com/dev',
    SCHEMA_VERSION: '04102025.B01',
    BUILD_ID: 'merit-20250423-1349',
    
    // Feature Flags
    ENABLE_MOCK_MODE: false,
    SKIP_API_VALIDATION: false
};
```

### Context Recovery Configuration
In case of chat history loss from backend, ensure these configurations are maintained:

```javascript
// Required Session Storage Keys
sessionStorage.setItem('merit_thread_id', '[thread_id]');  // From API response
sessionStorage.setItem('merit_session_id', 'merit-${Date.now()}');
sessionStorage.setItem('merit_context_version', '04102025.B01');

// Required Local Storage for Persistence
localStorage.setItem('merit_user_preferences', JSON.stringify({
    grade_level: sessionStorage.getItem('merit_grade_level'),
    curriculum: 'ela',
    last_active: new Date().toISOString()
}));
```

## Required Headers
All API requests must include these headers:

```javascript
const headers = {
    'Content-Type': 'application/json',
    'x-api-key': '0z6mNoPYRz5Z2rzU9FdJc2FFT4onoEOf1gxWUGL1',
    'X-Organization-ID': 'recdg5Hlm3VVaBA2u',
    'X-Project-ID': 'proj_V4lrL1OSfydWCFW0zjgwrFRT',
    'X-Assistant-ID': 'asst_QoAA395ibbyMImFJERbG2hKT',
    'X-Source-Token': 'merit-chat',
    'X-User-ID': 'usr_temp_123',  // For new users
    'X-Source-URL': window.location.origin,  // IMPORTANT: Must match deployment domain
    'X-Entry-Point': 'merit'
};
```

## Integration Steps

### 1. Initial Context Creation
```javascript
// First request to create context/thread
const createContext = async () => {
    const response = await fetch('${window.env.RL_API_GATEWAY_ENDPOINT}/api/v1/context', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            action: 'create_thread',
            schema_version: window.env.SCHEMA_VERSION
        })
    });
    
    const data = await response.json();
    // Store thread_id if returned
    if (data.thread_id) {
        sessionStorage.setItem('merit_thread_id', data.thread_id);
    }
    return data;
};
```

### 2. Sending Messages
```javascript
// Subsequent messages don't need schema_version
const sendMessage = async (content) => {
    const response = await fetch('${window.env.RL_API_GATEWAY_ENDPOINT}/api/v1/context', {
        method: 'POST',
        headers: {
            ...headers,
            'X-Thread-ID': sessionStorage.getItem('merit_thread_id')
        },
        body: JSON.stringify({
            message: content
        })
    });
    return await response.json();
};
```

## Error Handling

### Common Error Responses
```javascript
// Missing Headers
{
    "error": "Missing required headers",
    "missing": ["x-user-id", "x-source-url", "x-entry-point"],
    "timestamp": "2025-04-29T19:19:31.194Z",
    "build": "merit-20250423-1349"
}

// Invalid Schema Version
{
    "error": "Invalid schema version",
    "expected": "04102025.B01",
    "timestamp": "2025-04-29T19:19:49.139Z",
    "build": "merit-20250423-1349"
}
```

### Error Handler Implementation
```javascript
const handleApiError = (error) => {
    if (error.missing) {
        console.error('Missing headers:', error.missing);
        // Add missing headers to request
        return;
    }
    
    if (error.expected) {
        console.error('Schema version mismatch. Expected:', error.expected);
        // Update schema version
        return;
    }
    
    // Generic error handling
    console.error('API Error:', error);
};
```

## CORS Configuration
The API supports requests from:
- https://recursivelearning.app
- https://integraled.github.io

Allowed methods:
- GET
- POST
- OPTIONS

## Endpoints
```javascript
const ENDPOINTS = {
    PROD: {
        base: 'https://29wtfiieig.execute-api.us-east-2.amazonaws.com/prod',
        context: '/api/v1/context',
        thread: '/api/v1/thread',
        health: '/api/v1/health'
    },
    DEV: {
        base: 'https://3ba2utz7y2.execute-api.us-east-2.amazonaws.com/dev',
        context: '/api/v1/context',
        thread: '/api/v1/thread',
        health: '/api/v1/health'
    }
};
```

## Implementation Example

### HTML Configuration
```html
<meta name="api-config" content='{
    "apiEndpoint": "https://3ba2utz7y2.execute-api.us-east-2.amazonaws.com/dev",
    "fallbackEndpoint": "https://29wtfiieig.execute-api.us-east-2.amazonaws.com/prod",
    "apiKey": "0z6mNoPYRz5Z2rzU9FdJc2FFT4onoEOf1gxWUGL1",
    "projectId": "proj_V4lrL1OSfydWCFW0zjgwrFRT",
    "orgId": "recdg5Hlm3VVaBA2u",
    "assistantId": "asst_QoAA395ibbyMImFJERbG2hKT",
    "schemaVersion": "04102025.B01",
    "buildId": "merit-20250423-1349"
}'>
```

### JavaScript Implementation
```javascript
class MeritClient {
    constructor() {
        this.config = JSON.parse(document.querySelector('meta[name="api-config"]').content);
        this.headers = {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey,
            'X-Organization-ID': this.config.orgId,
            'X-Project-ID': this.config.projectId,
            'X-Assistant-ID': this.config.assistantId,
            'X-Source-Token': 'merit-chat',
            'X-Entry-Point': 'merit',
            'X-Source-URL': window.location.origin
        };
    }

    async initialize() {
        try {
            const response = await this.createContext();
            if (response.thread_id) {
                sessionStorage.setItem('merit_thread_id', response.thread_id);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Merit initialization failed:', error);
            return false;
        }
    }

    async createContext() {
        return this.sendRequest({
            action: 'create_thread',
            schema_version: this.config.schemaVersion
        });
    }

    async sendMessage(content) {
        return this.sendRequest({
            message: content
        });
    }

    async sendRequest(body) {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/api/v1/context`, {
                method: 'POST',
                headers: {
                    ...this.headers,
                    'X-Thread-ID': sessionStorage.getItem('merit_thread_id') || ''
                },
                body: JSON.stringify(body)
            });
            
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            return data;
        } catch (error) {
            console.error('Merit API Error:', error);
            throw error;
        }
    }
}

// Usage
const meritClient = new MeritClient();
await meritClient.initialize();
const response = await meritClient.sendMessage('Hello assistant');
```

## Testing
```javascript
// Health Check
curl -X GET "${ENDPOINTS.PROD.base}/health" \
  -H "x-api-key: 0z6mNoPYRz5Z2rzU9FdJc2FFT4onoEOf1gxWUGL1"

// Create Context
curl -X POST "${ENDPOINTS.PROD.base}/api/v1/context" \
  -H "Content-Type: application/json" \
  -H "x-api-key: 0z6mNoPYRz5Z2rzU9FdJc2FFT4onoEOf1gxWUGL1" \
  -H "X-Organization-ID: recdg5Hlm3VVaBA2u" \
  -H "X-Project-ID: proj_V4lrL1OSfydWCFW0zjgwrFRT" \
  -H "X-Assistant-ID: asst_QoAA395ibbyMImFJERbG2hKT" \
  -H "X-Source-Token: merit-chat" \
  -H "X-User-ID: usr_temp_123" \
  -H "X-Source-URL: https://recursivelearning.app" \
  -H "X-Entry-Point: merit" \
  -d '{"action":"create_thread", "schema_version":"04102025.B01"}'
```

## Troubleshooting

### Common Issues
1. 403 Forbidden
   - Check API key
   - Verify all required headers
   - Confirm CORS origin matches exactly
   - Ensure X-Source-URL matches window.location.origin

2. CORS Errors
   - Verify deployment domain is allowed
   - Check for exact origin match
   - Ensure OPTIONS preflight succeeds
   - Confirm all required headers are allowed

3. Context Recovery
   - Always store thread_id in sessionStorage
   - Maintain user preferences in localStorage
   - Keep schema_version consistent
   - Log all context changes

4. Thread Creation Failed
   - Verify schema_version and action in body
   - Check all required headers
   - Confirm API endpoint is correct
   - Try fallback endpoint if primary fails

### Endpoint Health Checks
```javascript
const checkEndpointHealth = async (endpoint) => {
    try {
        const response = await fetch(`${endpoint}/health`, {
            headers: {
                'x-api-key': headers['x-api-key'],
                'X-Organization-ID': headers['X-Organization-ID']
            }
        });
        return response.ok;
    } catch (error) {
        console.error(`[Merit API] Health check failed for ${endpoint}:`, error);
        return false;
    }
};

// Usage
if (!await checkEndpointHealth(window.env.RL_API_GATEWAY_ENDPOINT)) {
    console.log('[Merit API] Switching to fallback endpoint');
    window.env.RL_API_GATEWAY_ENDPOINT = window.env.RL_API_FALLBACK_ENDPOINT;
}
```

### Context Recovery Process
If chat history is lost:

1. Attempt to recreate thread:
```javascript
const recoverContext = async () => {
    try {
        // Create new thread
        const response = await createContext();
        if (response.thread_id) {
            sessionStorage.setItem('merit_thread_id', response.thread_id);
            
            // Restore user preferences
            const preferences = JSON.parse(localStorage.getItem('merit_user_preferences'));
            if (preferences) {
                await sendMessage(`I am a ${preferences.grade_level} teacher working with the ${preferences.curriculum} curriculum.`);
            }
            
            return true;
        }
        return false;
    } catch (error) {
        console.error('[Merit API] Context recovery failed:', error);
        return false;
    }
};
```

2. Maintain critical data:
```javascript
// Store after each successful operation
const updateContextState = (data) => {
    if (data.thread_id) {
        sessionStorage.setItem('merit_thread_id', data.thread_id);
    }
    if (data.context_version) {
        sessionStorage.setItem('merit_context_version', data.context_version);
    }
    localStorage.setItem('merit_last_update', new Date().toISOString());
};
```

## Support
For integration support, contact:
- Technical: david@recursivelearning.app
- Admin: cara@recursivelearning.app

## Deployment Checklist
- [ ] Update API endpoint configuration
- [ ] Verify CORS settings for deployment domain
- [ ] Test health check endpoints
- [ ] Confirm all required headers
- [ ] Validate context recovery process
- [ ] Test fallback endpoint functionality
- [ ] Monitor error rates after deployment
