# Chat Component

This directory contains reusable chat interface components for the education platform.

## Files

- `chat.html` - Full-featured chat component with accessibility and dark mode support
- `container.html` - Basic chat container layout for simpler implementations

## Features

- Dark/light theme toggle with system preference detection
- Accessibility optimized for keyboard navigation and screen readers
- Responsive design for all screen sizes
- Support for attachments and typing indicators
- High contrast mode support for users with visual impairments

## Usage

### Basic Implementation

```html
<!-- Include the theme CSS files -->
<link rel="stylesheet" href="/admin/assets/css/themes/light.css">
<link rel="stylesheet" href="/admin/assets/css/themes/dark.css">
<link rel="stylesheet" href="/admin/assets/css/components/chat.css">

<!-- Include the chat component -->
<div id="chat-wrapper">
  <!-- Component will be loaded here -->
</div>

<script>
  // Load the chat component
  fetch('/shared/page_ingredients/chat/chat.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('chat-wrapper').innerHTML = html;
    });
</script>
```

### API Integration

The chat component can be connected to a backend API by handling form submissions:

```javascript
document.addEventListener('DOMContentLoaded', function() {
  const chatForm = document.getElementById('chat-form');
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  
  chatForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const message = userInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessage('user', message);
    
    // Clear input
    userInput.value = '';
    
    // Show typing indicator
    document.getElementById('typing-indicator').removeAttribute('hidden');
    
    // Send to API (replace with your endpoint)
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })
    .then(response => response.json())
    .then(data => {
      // Hide typing indicator
      document.getElementById('typing-indicator').setAttribute('hidden', true);
      
      // Add response to chat
      addMessage('assistant', data.response);
    });
  });
  
  function addMessage(role, content) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${content}</p>
        <div class="message-time">${time}</div>
      </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});
``` 