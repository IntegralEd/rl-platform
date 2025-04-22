/*
 * @component MeritOpenAIClient
 * @description Handles OpenAI Assistant interactions for Merit chat
 * @version 1.0.21
 */

class MeritOpenAIClient {
  #config = {
    apiEndpoint: window.env?.RL_API_GATEWAY_ENDPOINT,
    apiKey: window.env?.RL_API_KEY,
    assistantId: window.env?.MERIT_ASSISTANT_ID,
    projectId: window.env?.OPENAI_PROJECT_ID,
    orgId: window.env?.MERIT_ORG_ID,
    mockMode: window.env?.ENABLE_MOCK_MODE || false,
    schemaVersion: window.env?.SCHEMA_VERSION
  };

  #state = {
    threadId: null,
    messages: [],
    isProcessing: false,
    hasError: false,
    errorMessage: null
  };

  constructor() {
    // Validate configuration
    this.validateConfig();

    // Log initialization
    console.log('[OpenAI Client] Initialized:', {
      endpoint: this.#config.apiEndpoint,
      assistantId: this.#config.assistantId,
      projectId: this.#config.projectId,
      schemaVersion: this.#config.schemaVersion,
      mockMode: this.#config.mockMode
    });
  }

  validateConfig() {
    const required = [
      'apiEndpoint',
      'apiKey',
      'assistantId',
      'projectId',
      'orgId',
      'schemaVersion'
    ];

    const missing = required.filter(key => !this.#config[key]);
    if (missing.length > 0) {
      const error = `Missing required configuration: ${missing.join(', ')}`;
      console.error('[OpenAI Client] Configuration error:', error);
      this.#state.hasError = true;
      this.#state.errorMessage = error;
      this.#config.mockMode = true;
    }
  }

  async createThread() {
    if (this.#config.mockMode) {
      this.#state.threadId = 'mock-thread-' + Date.now();
      return { id: this.#state.threadId };
    }

    try {
      const response = await fetch(`${this.#config.apiEndpoint}/api/v1/context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.#config.apiKey,
          'X-Project-ID': this.#config.projectId,
          'X-Assistant-ID': this.#config.assistantId,
          'X-Organization-ID': this.#config.orgId
        },
        body: JSON.stringify({
          schema_version: this.#config.schemaVersion
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      this.#state.threadId = data.thread_id;
      return { id: this.#state.threadId };

    } catch (error) {
      console.error('[OpenAI Client] Thread creation failed:', error);
      this.#state.hasError = true;
      this.#state.errorMessage = error.message;
      throw error;
    }
  }

  getState() {
    return {
      threadId: this.#state.threadId,
      hasError: this.#state.hasError,
      errorMessage: this.#state.errorMessage,
      isProcessing: this.#state.isProcessing,
      mockMode: this.#config.mockMode
    };
  }

  async sendMessage(content) {
    if (!this.#state.threadId) {
      throw new Error('Thread not initialized');
    }

    if (this.#state.isProcessing) {
      throw new Error('Message processing in progress');
    }

    if (this.#config.mockMode) {
      return this.#handleMockResponse(content);
    }

    this.#state.isProcessing = true;

    try {
      const response = await fetch(`${this.#config.apiEndpoint}/api/v1/mock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.#config.apiKey
        },
        body: JSON.stringify({
          thread_id: this.#state.threadId,
          content: content
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      this.#state.messages.push({
        role: 'user',
        content: content
      });

      return {
        role: 'assistant',
        content: data.response
      };

    } catch (error) {
      console.error('[OpenAI Client] Message send failed:', error);
      return {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting to the server. Please try again in a moment.'
      };
    } finally {
      this.#state.isProcessing = false;
    }
  }

  #handleMockResponse(content) {
    const mockResponses = [
      'I understand you\'re asking about {content}. Let me help with that.',
      'That\'s an interesting question about {content}. Here\'s what I think...',
      'When it comes to {content}, there are several things to consider...'
    ];

    const response = mockResponses[Math.floor(Math.random() * mockResponses.length)]
      .replace('{content}', content.substring(0, 20) + '...');

    return {
      role: 'assistant',
      content: response
    };
  }

  get threadId() {
    return this.#state.threadId;
  }

  get messages() {
    return [...this.#state.messages];
  }
}

export default MeritOpenAIClient;