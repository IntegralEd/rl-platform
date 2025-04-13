/**
 * Chat Loader for Recursive Learning Platform
 * 
 * Handles asynchronous loading of chat components based on URL patterns
 * and manages message persistence and component initialization.
 */

import { resolveUrl, hasClientAccess } from './url-resolver.js';
import { secureFetch, getClientIdFromUrl } from './api-client.js';
import { log, recordMetric, recordTiming } from './cloudwatch-integration.js';

// Configuration
const CHAT_CONFIG = {
  CHAT_API_ENDPOINT: '/api/v1/chat',
  STORAGE_KEY_PREFIX: 'rl_chat_',
  RECONNECT_INTERVAL: 5000, // 5 seconds
  MAX_RECONNECT_ATTEMPTS: 5,
  ENCRYPTION_KEY: window.location.hostname, // Simple encryption seed
  DEBUG: false
};

// Chat component registry
const chatComponents = new Map();
// Active chat sessions
const activeSessions = new Map();
// Connection status
let connectionStatus = 'disconnected';
let reconnectAttempts = 0;

/**
 * Initialize the chat loader
 */
async function init() {
  try {
    // Detect chat components in the page
    discoverChatComponents();
    
    // Initialize discovered components
    await initializeComponents();
    
    // Set up connection monitoring
    setupConnectionMonitoring();
    
    debug('Chat loader initialized');
  } catch (error) {
    console.error('Failed to initialize chat loader:', error);
    log('Chat loader initialization failed', { error: error.message }, 'error');
  }
}

/**
 * Discover chat components in the page by data attributes
 */
function discoverChatComponents() {
  // Find elements with data-chat-component attribute
  const elements = document.querySelectorAll('[data-chat-component]');
  
  elements.forEach(element => {
    const componentId = element.getAttribute('data-chat-component');
    const componentType = element.getAttribute('data-chat-type') || 'default';
    const sessionId = element.getAttribute('data-chat-session') || 'default';
    
    chatComponents.set(componentId, {
      element,
      componentType,
      sessionId,
      initialized: false,
      state: 'discovered'
    });
    
    debug(`Discovered chat component: ${componentId}, type: ${componentType}`);
  });
}

/**
 * Initialize all discovered chat components
 */
async function initializeComponents() {
  const currentUrl = window.location.pathname;
  
  // Resolve current URL to get resource configuration
  const resource = await resolveUrl(currentUrl);
  if (!resource) {
    debug(`No resource configuration found for URL: ${currentUrl}`);
    return;
  }
  
  // Check if client has access to this resource
  const clientId = getClientIdFromUrl();
  if (!hasClientAccess(clientId, resource)) {
    debug(`Client ${clientId} does not have access to URL: ${currentUrl}`);
    return;
  }
  
  // Initialize each component
  const initPromises = [];
  for (const [componentId, component] of chatComponents.entries()) {
    // Skip already initialized components
    if (component.initialized) continue;
    
    // Set component to loading state
    updateComponentState(componentId, 'loading');
    
    // Initialize component
    initPromises.push(
      initializeChatComponent(componentId, component, resource)
        .then(() => {
          updateComponentState(componentId, 'ready');
        })
        .catch(error => {
          console.error(`Failed to initialize chat component ${componentId}:`, error);
          updateComponentState(componentId, 'error');
        })
    );
  }
  
  // Wait for all components to initialize
  await Promise.allSettled(initPromises);
}

/**
 * Initialize a single chat component
 * @param {string} componentId - Component ID
 * @param {Object} component - Component configuration
 * @param {Object} resource - Resource configuration
 */
async function initializeChatComponent(componentId, component, resource) {
  // Get chat configuration for this component
  const config = await getChatConfiguration(component, resource);
  
  // Create or restore session
  const sessionId = component.sessionId;
  let session = activeSessions.get(sessionId);
  
  if (!session) {
    // Create new session
    session = {
      id: sessionId,
      messages: [],
      participants: [],
      status: 'new',
      lastActivity: Date.now()
    };
    
    // Restore messages from storage if available
    const storedMessages = getStoredMessages(sessionId);
    if (storedMessages && storedMessages.length > 0) {
      session.messages = storedMessages;
      session.status = 'restored';
    }
    
    activeSessions.set(sessionId, session);
  }
  
  // Render component
  await renderChatComponent(component, config, session);
  
  // Connect to chat API
  await connectChat(sessionId, config);
  
  // Mark as initialized
  component.initialized = true;
  component.config = config;
  
  // Record metric
  recordMetric('ChatComponentLoaded', 1, 'Count', {
    ComponentType: component.componentType,
    SessionType: session.status
  });
}

/**
 * Get chat configuration for a component
 * @param {Object} component - Component configuration
 * @param {Object} resource - Resource configuration
 * @returns {Promise<Object>} Chat configuration
 */
async function getChatConfiguration(component, resource) {
  try {
    // Extract chat config from URL resource, if available
    const urlParams = new URLSearchParams(window.location.search);
    const contextId = urlParams.get('context') || resource.params.contextId;
    
    const response = await secureFetch(`${CHAT_CONFIG.CHAT_API_ENDPOINT}/config`, {
      method: 'POST',
      body: JSON.stringify({
        componentType: component.componentType,
        clientId: getClientIdFromUrl(),
        pageContext: {
          url: window.location.pathname,
          resourceType: resource.resourceType,
          contextId: contextId
        }
      })
    });
    
    debug(`Retrieved chat configuration for component type: ${component.componentType}`);
    return response;
  } catch (error) {
    console.error('Failed to get chat configuration:', error);
    // Return default configuration
    return {
      chatTitle: 'Chat',
      features: {
        fileSharing: false,
        notifications: false,
        history: true
      },
      ui: {
        theme: 'light',
        position: 'bottom-right'
      }
    };
  }
}

/**
 * Render chat component on the page
 * @param {Object} component - Component configuration
 * @param {Object} config - Chat configuration
 * @param {Object} session - Chat session
 */
async function renderChatComponent(component, config, session) {
  const { element } = component;
  
  // Set loading state in UI
  element.innerHTML = `
    <div class="chat-container" data-chat-status="${session.status}">
      <div class="chat-header">
        <h3>${config.chatTitle || 'Chat'}</h3>
        <div class="chat-status" data-status="${connectionStatus}"></div>
      </div>
      <div class="chat-messages"></div>
      <div class="chat-input">
        <textarea placeholder="Type a message..."></textarea>
        <button class="chat-send">Send</button>
      </div>
    </div>
  `;
  
  // Render existing messages
  const messagesContainer = element.querySelector('.chat-messages');
  session.messages.forEach(message => {
    renderMessage(messagesContainer, message);
  });
  
  // Add event listeners
  setupChatEventListeners(element, session.id);
  
  // Set ready state
  element.classList.add('chat-ready');
}

/**
 * Connect to chat API for a session
 * @param {string} sessionId - Session ID
 * @param {Object} config - Chat configuration
 */
async function connectChat(sessionId, config) {
  try {
    connectionStatus = 'connecting';
    updateConnectionStatus();
    
    // Connect to chat API
    const response = await secureFetch(`${CHAT_CONFIG.CHAT_API_ENDPOINT}/connect`, {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        clientId: getClientIdFromUrl(),
        config
      })
    });
    
    if (response.success) {
      connectionStatus = 'connected';
      reconnectAttempts = 0;
      
      // Update session with API response data
      const session = activeSessions.get(sessionId);
      if (session) {
        session.participants = response.participants || [];
        session.config = response.config || config;
        activeSessions.set(sessionId, session);
      }
    } else {
      connectionStatus = 'error';
      console.error('Failed to connect to chat API:', response.error);
    }
  } catch (error) {
    connectionStatus = 'error';
    console.error('Error connecting to chat API:', error);
    
    // Attempt reconnect
    handleReconnect();
  } finally {
    updateConnectionStatus();
  }
}

/**
 * Handle reconnection to chat API
 */
function handleReconnect() {
  if (reconnectAttempts >= CHAT_CONFIG.MAX_RECONNECT_ATTEMPTS) {
    debug('Max reconnect attempts reached, giving up');
    return;
  }
  
  reconnectAttempts++;
  
  // Exponential backoff
  const delay = CHAT_CONFIG.RECONNECT_INTERVAL * Math.pow(1.5, reconnectAttempts - 1);
  
  debug(`Scheduling reconnect attempt ${reconnectAttempts} in ${delay}ms`);
  
  setTimeout(() => {
    debug(`Attempting to reconnect (${reconnectAttempts}/${CHAT_CONFIG.MAX_RECONNECT_ATTEMPTS})`);
    
    // Reconnect all active sessions
    activeSessions.forEach((session, sessionId) => {
      connectChat(sessionId, session.config);
    });
  }, delay);
}

/**
 * Set up event listeners for a chat component
 * @param {HTMLElement} element - Chat component element
 * @param {string} sessionId - Session ID
 */
function setupChatEventListeners(element, sessionId) {
  const input = element.querySelector('textarea');
  const sendButton = element.querySelector('.chat-send');
  
  // Send message on button click
  sendButton.addEventListener('click', () => {
    const text = input.value.trim();
    if (text) {
      sendMessage(sessionId, text);
      input.value = '';
    }
  });
  
  // Send message on Enter (but new line on Shift+Enter)
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendButton.click();
    }
  });
  
  // Focus input when container is clicked
  element.querySelector('.chat-container').addEventListener('click', () => {
    input.focus();
  });
}

/**
 * Send a message
 * @param {string} sessionId - Session ID
 * @param {string} text - Message text
 */
async function sendMessage(sessionId, text) {
  const session = activeSessions.get(sessionId);
  if (!session) return;
  
  // Create message object
  const message = {
    id: generateMessageId(),
    sessionId,
    text,
    sender: 'user',
    timestamp: new Date().toISOString(),
    status: 'pending'
  };
  
  // Add to local session
  session.messages.push(message);
  session.lastActivity = Date.now();
  
  // Store messages
  storeMessages(sessionId, session.messages);
  
  // Update UI for all components with this session
  updateChatUI(sessionId);
  
  try {
    // Send to API
    const response = await recordTiming('ChatMessageSend', () => 
      secureFetch(`${CHAT_CONFIG.CHAT_API_ENDPOINT}/message`, {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          message: {
            id: message.id,
            text: message.text,
            clientId: getClientIdFromUrl()
          }
        })
      })
    );
    
    // Update message with server response
    const updatedMessage = {
      ...message,
      id: response.messageId || message.id,
      timestamp: response.timestamp || message.timestamp,
      status: 'sent'
    };
    
    // Update in session
    const messageIndex = session.messages.findIndex(m => m.id === message.id);
    if (messageIndex >= 0) {
      session.messages[messageIndex] = updatedMessage;
      storeMessages(sessionId, session.messages);
    }
    
    // Update UI
    updateChatUI(sessionId);
  } catch (error) {
    console.error('Failed to send message:', error);
    
    // Mark message as failed
    const messageIndex = session.messages.findIndex(m => m.id === message.id);
    if (messageIndex >= 0) {
      session.messages[messageIndex].status = 'failed';
      storeMessages(sessionId, session.messages);
    }
    
    // Update UI
    updateChatUI(sessionId);
  }
}

/**
 * Update chat UI for a session
 * @param {string} sessionId - Session ID
 */
function updateChatUI(sessionId) {
  const session = activeSessions.get(sessionId);
  if (!session) return;
  
  // Find all components using this session
  chatComponents.forEach((component) => {
    if (component.sessionId === sessionId) {
      const messagesContainer = component.element.querySelector('.chat-messages');
      if (!messagesContainer) return;
      
      // Clear messages container
      messagesContainer.innerHTML = '';
      
      // Render all messages
      session.messages.forEach(message => {
        renderMessage(messagesContainer, message);
      });
      
      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  });
}

/**
 * Render a message in the chat UI
 * @param {HTMLElement} container - Messages container
 * @param {Object} message - Message object
 */
function renderMessage(container, message) {
  const messageElement = document.createElement('div');
  messageElement.className = `chat-message ${message.sender} ${message.status}`;
  messageElement.dataset.messageId = message.id;
  
  // Format timestamp
  const timestamp = new Date(message.timestamp);
  const timeString = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Create message content
  messageElement.innerHTML = `
    <div class="message-content">
      <div class="message-text">${escapeHtml(message.text)}</div>
      <div class="message-meta">
        <span class="message-time">${timeString}</span>
        <span class="message-status"></span>
      </div>
    </div>
  `;
  
  container.appendChild(messageElement);
}

/**
 * Update component state and UI
 * @param {string} componentId - Component ID
 * @param {string} state - New state
 */
function updateComponentState(componentId, state) {
  const component = chatComponents.get(componentId);
  if (!component) return;
  
  component.state = state;
  component.element.dataset.chatState = state;
  
  debug(`Component ${componentId} state changed to ${state}`);
}

/**
 * Update connection status UI
 */
function updateConnectionStatus() {
  const statusElements = document.querySelectorAll('.chat-status');
  statusElements.forEach(element => {
    element.dataset.status = connectionStatus;
  });
}

/**
 * Set up connection monitoring
 */
function setupConnectionMonitoring() {
  // Check connection status periodically
  setInterval(() => {
    if (connectionStatus !== 'connected' && activeSessions.size > 0) {
      handleReconnect();
    }
  }, CHAT_CONFIG.RECONNECT_INTERVAL);
  
  // Handle window online/offline events
  window.addEventListener('online', () => {
    debug('Window online event triggered');
    if (connectionStatus !== 'connected') {
      reconnectAttempts = 0; // Reset counter on manual reconnect
      handleReconnect();
    }
  });
  
  window.addEventListener('offline', () => {
    debug('Window offline event triggered');
    connectionStatus = 'disconnected';
    updateConnectionStatus();
  });
}

/**
 * Store messages in local storage
 * @param {string} sessionId - Session ID
 * @param {Array} messages - Array of messages
 */
function storeMessages(sessionId, messages) {
  try {
    const storageKey = `${CHAT_CONFIG.STORAGE_KEY_PREFIX}${sessionId}`;
    const encrypted = simpleEncrypt(JSON.stringify(messages));
    localStorage.setItem(storageKey, encrypted);
  } catch (error) {
    console.error('Failed to store messages:', error);
  }
}

/**
 * Get stored messages from local storage
 * @param {string} sessionId - Session ID
 * @returns {Array} Array of messages
 */
function getStoredMessages(sessionId) {
  try {
    const storageKey = `${CHAT_CONFIG.STORAGE_KEY_PREFIX}${sessionId}`;
    const encrypted = localStorage.getItem(storageKey);
    
    if (!encrypted) return [];
    
    const decrypted = simpleDecrypt(encrypted);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Failed to retrieve messages:', error);
    return [];
  }
}

/**
 * Simple string encryption (not for sensitive data)
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted text
 */
function simpleEncrypt(text) {
  const key = CHAT_CONFIG.ENCRYPTION_KEY;
  let result = '';
  
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  
  return btoa(result);
}

/**
 * Simple string decryption
 * @param {string} encrypted - Encrypted text
 * @returns {string} Decrypted text
 */
function simpleDecrypt(encrypted) {
  const key = CHAT_CONFIG.ENCRYPTION_KEY;
  const text = atob(encrypted);
  let result = '';
  
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  
  return result;
}

/**
 * Generate a unique message ID
 * @returns {string} Message ID
 */
function generateMessageId() {
  return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} html - HTML string
 * @returns {string} Escaped HTML
 */
function escapeHtml(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Debug logging
 * @param {string} message - Debug message
 */
function debug(message) {
  if (CHAT_CONFIG.DEBUG) {
    console.debug(`[ChatLoader] ${message}`);
  }
}

// Export public API
export {
  init,
  sendMessage,
  discoverChatComponents
}; 