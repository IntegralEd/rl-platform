# Merit Chat Redis Integration Handshake
April 11, 2024

## Quick Start

### Endpoints
- Base URL: `https://api.recursivelearning.app/dev`
- Method: `POST`
- Content-Type: `application/json`

### Required Headers
```javascript
{
  "Content-Type": "application/json",
  "Origin": "https://recursivelearning.app"
}
```

### Required Fields (All Requests)
```javascript
{
  "org_id": "recdg5Hlm3VVaBA2u",  // EL Education
  "assistant_id": "asst_QoAA395ibbyMImFJERbG2hKT",  // Merit Assistant
  "schema_version": "04102025.B01"
}
```

## Flow: Two-Step Chat

### 1. Create Thread
```javascript
// Request
POST /
{
  "action": "create_thread",
  "org_id": "recdg5Hlm3VVaBA2u",
  "assistant_id": "asst_QoAA395ibbyMImFJERbG2hKT",
  "schema_version": "04102025.B01"
}

// Response
{
  "thread_id": "thread_xyz123",
  "assistant_id": "asst_QoAA395ibbyMImFJERbG2hKT"
}
```

### 2. Send Message
```javascript
// Request
POST /
{
  "message": "Can you help me with a curriculum question?",
  "thread_id": "thread_xyz123",  // From create thread response
  "org_id": "recdg5Hlm3VVaBA2u",
  "assistant_id": "asst_QoAA395ibbyMImFJERbG2hKT",
  "schema_version": "04102025.B01"
}

// Response
{
  "thread_id": "thread_xyz123",
  "message": "I understand you're asking about curriculum...",
  "role": "assistant"
}
```

## Implementation Notes

### MVP Limitations
1. Simple message response (no OpenAI yet)
2. No user context required
3. Messages persist for 1 hour (TTL: 3600s)
4. Basic error handling

### Error Responses
```javascript
// Invalid Request
{
  "statusCode": 400,
  "error": "Invalid request",
  "received": {
    // Echo of received data for debugging
  }
}

// Server Error
{
  "statusCode": 500,
  "error": "Internal server error"
}

// Missing Fields
{
  "statusCode": 400,
  "error": "Missing required fields",
  "required": ["org_id", "assistant_id", "schema_version"]
}
```

## Example Implementation

```javascript
class MeritChat {
  constructor() {
    this.baseUrl = 'https://api.recursivelearning.app/dev';
    this.config = {
      org_id: 'recdg5Hlm3VVaBA2u',
      assistant_id: 'asst_QoAA395ibbyMImFJERbG2hKT',
      schema_version: '04102025.B01'
    };
    this.headers = {
      'Content-Type': 'application/json',
      'Origin': 'https://recursivelearning.app'
    };
  }

  async createThread() {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          action: 'create_thread',
          ...this.config
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Thread creation failed');
      }
      return response.json();
    } catch (error) {
      console.error('Create thread error:', error);
      throw error;
    }
  }

  async sendMessage(thread_id, message) {
    if (!thread_id) {
      throw new Error('thread_id is required');
    }
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          message,
          thread_id,
          ...this.config
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Message send failed');
      }
      return response.json();
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }
}

// Usage Example
async function startChat() {
  const chat = new MeritChat();
  
  try {
    // 1. Create thread
    const { thread_id } = await chat.createThread();
    
    // 2. Send message
    const response = await chat.sendMessage(
      thread_id,
      "Can you help me with a curriculum question?"
    );
    
    console.log('Assistant:', response.message);
  } catch (error) {
    console.error('Chat error:', error.message);
    // Handle error appropriately
  }
}
```

## Testing Notes

1. CORS is configured for recursivelearning.app
2. All responses include CORS headers
3. Preflight (OPTIONS) requests are supported
4. Messages persist for 1 hour
5. Thread IDs should be stored client-side

### Local Testing
For local development, we provide a test portal:
```bash
# Setup
npm install express cors

# Run
node tests/integration/server.js

# Access
http://localhost:3000/redis-test-portal.html
```

The test portal provides:
- Real-time test status
- Visual success/failure tracking
- Automatic TTL testing
- Error case validation

## Next Steps

1. Test basic chat flow
2. Verify message persistence
3. Test error handling
4. Report any issues via Slack

## Support
- Slack: #redis-integration
- Contact: David
- Documentation: This memo + Apr-11-redis-integration 