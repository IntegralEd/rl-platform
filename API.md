# Recursive Learning API Protocol

## Overview
This document defines the protocol for communication between frontend clients and the Lambda backend. Authentication and authorization are handled entirely on the frontend side - the Lambda processes all incoming requests.

## Required Fields
The only required field is `org_id` in the request body. This serves as a basic validation token.

## Handshake Protocol
Additional headers (all optional):

```json
{
  "user_id": "string",
  "thread_id": "string",
  "assistant_id": "string",
  "ts": "timestamp"
}
```

## Example Payloads

### Minimal Valid Request
```json
// Body
{
  "message": "Hello, I need help",
  "org_id": "st"
}
```

### Authenticated Goalsetter Request
```json
// Headers (optional)
{
  "user_id": "user_abc123",
  "thread_id": "thread_xyz789",
  "assistant_id": "asst_9GkHpGa5t50Yw74uzonh6FAz",
  "ts": "2024-03-31T12:00:00Z"
}

// Body
{
  "message": "Let's set some goals",
  "org_id": "st",  // Required
  "context": {
    "standards": {
      "has_standards": true,
      "link": "https://example.com/standards",
      "details": "Focus on math standards"
    },
    "reflection": {
      "has_reflection": false
    }
  }
}
```

### Lambda Response
```json
{
  "status": "success",
  "message": "I'll help you...",
  "thread_id": "thread_xyz789", // if provided in request
  "ts": "2024-03-31T12:00:01Z"
}
```

## Error Responses
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_ORG",
    "message": "Missing org_id in request body"
  }
}
```

## Implementation Notes
1. Lambda requires org_id in request body
2. Frontend handles all other auth/validation logic
3. Additional headers are optional enrichment data
4. Thread IDs are maintained if provided
5. Assistant IDs are client-specific and optional

## Client-Specific Assistant IDs
- ST Goalsetter: `asst_9GkHpGa5t50Yw74uzonh6FAz`
- BHB Support: `asst_IA5PsJxdShVPTAv2xeXTr4Ma`
- ELPL Chat: `asst_xyz123` (replace with actual ID)
- Integral Ed: `asst_abc456` (replace with actual ID) 