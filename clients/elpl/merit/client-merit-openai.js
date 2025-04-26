/*
 * @component MeritOpenAIClient
 * @description Handles OpenAI Assistant interactions for Merit chat
 * @version 1.0.21
 */

class MeritOpenAIClient {
  #config = {
    apiEndpoint: window.env?.RL_API_GATEWAY_ENDPOINT,
    apiFallback: window.env?.RL_API_FALLBACK_ENDPOINT,
    apiKey: window.env?.RL_API_KEY,
    assistantId: window.env?.MERIT_ASSISTANT_ID,
    projectId: window.env?.OPENAI_PROJECT_ID,
    orgId: window.env?.MERIT_ORG_ID,
    mockMode: window.env?.ENABLE_MOCK_MODE || false,
    schemaVersion: window.env?.SCHEMA_VERSION,
    timeout: window.env?.RL_API_TIMEOUT || 30000,
    retryAttempts: window.env?.RL_API_RETRY_ATTEMPTS || 3
  };

  #state = {
    threadId: null,
    messages: [],
    isProcessing: false,
    hasError: false,
    errorMessage: null,
    retryCount: 0,
    lastEndpoint: null
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

    const endpoints = [this.#config.apiEndpoint];
    if (this.#config.apiFallback) {
      endpoints.push(this.#config.apiFallback);
    }

    for (const endpoint of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.#config.timeout);

        // New API: POST /v1/threads
        const response = await fetch(`${endpoint}/v1/threads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.#config.apiKey,
            'X-Project-ID': this.#config.projectId,
            'X-Assistant-ID': this.#config.assistantId,
            'X-Organization-ID': this.#config.orgId,
            'X-Request-ID': `merit-${Date.now()}`
          },
          body: JSON.stringify({ metadata: {} }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        this.#state.threadId = data.id;
        this.#state.lastEndpoint = endpoint;
        return { id: this.#state.threadId };

      } catch (error) {
        console.error(`[OpenAI Client] Thread creation failed for endpoint ${endpoint}:`, error);
        if (endpoint === endpoints[endpoints.length - 1]) {
          this.#state.hasError = true;
          this.#state.errorMessage = error.message;
          throw error;
        }
        continue;
      }
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
      const endpoint = this.#state.lastEndpoint || this.#config.apiEndpoint;
      // 1. Add user message: POST /v1/threads/{thread_id}/messages
      const msgRes = await fetch(`${endpoint}/v1/threads/${this.#state.threadId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.#config.apiKey,
          'X-Request-ID': `merit-${Date.now()}`
        },
        body: JSON.stringify({ role: 'user', content: [content] })
      });
      if (!msgRes.ok) throw new Error(`Message API error: ${msgRes.status}`);
      const msgData = await msgRes.json();
      this.#state.messages.push({ role: 'user', content });
      // 2. Run the thread: POST /v1/threads/{thread_id}/runs
      const runRes = await fetch(`${endpoint}/v1/threads/${this.#state.threadId}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.#config.apiKey,
          'X-Request-ID': `merit-${Date.now()}`
        },
        body: JSON.stringify({ assistant_id: this.#config.assistantId })
      });
      if (!runRes.ok) throw new Error(`Run API error: ${runRes.status}`);
      // Wait for run to complete (polling for MVP, no streaming)
      let runCompleted = false;
      let assistantMessage = null;
      for (let i = 0; i < 30 && !runCompleted; i++) {
        await new Promise(r => setTimeout(r, 1000));
        // Fetch messages for the thread
        const messagesRes = await fetch(`${endpoint}/v1/threads/${this.#state.threadId}/messages`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.#config.apiKey
          }
        });
        if (!messagesRes.ok) continue;
        const messagesData = await messagesRes.json();
        const assistantMsg = messagesData.data?.find(m => m.role === 'assistant');
        if (assistantMsg) {
          assistantMessage = assistantMsg.content?.[0] || '';
          runCompleted = true;
        }
      }
      this.#state.retryCount = 0;
      return {
        role: 'assistant',
        content: assistantMessage || 'No assistant response received.'
      };
    } catch (error) {
      console.error('[OpenAI Client] Message send failed:', error);
      if (this.#state.retryCount < this.#config.retryAttempts) {
        this.#state.retryCount++;
        console.log(`[OpenAI Client] Retrying message send (${this.#state.retryCount}/${this.#config.retryAttempts})`);
        return await this.sendMessage(content);
      }
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