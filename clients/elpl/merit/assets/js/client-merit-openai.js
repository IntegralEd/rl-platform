/**
 * @component MeritOpenAIClient
 * @description Handles OpenAI Assistant interactions for Merit chat
 * @version 1.0.23
 */
export class MeritOpenAIClient {
    constructor() {
        // Validate required environment variables
        this.validateConfig();
        
        // Initialize core configuration
        this.assistant_id = window.env.MERIT_ASSISTANT_ID;
        this.project_id = window.env.OPENAI_PROJECT_ID;
        this.org_id = window.env.MERIT_ORG_ID;
        
        // API Configuration
        this.baseUrl = `${window.env.RL_API_GATEWAY_ENDPOINT}/api/v1`;
        this.headers = {
            'Content-Type': 'application/json',
            'x-api-key': window.env.RL_API_KEY
        };
        
        // Error tracking
        this.errorCount = 0;
        this.maxRetries = 3;
        this.retryDelay = 1000; // ms

        // Core configuration
        this.threadId = null;
        this.userId = null;

        // Project configuration
        this.config = {
            org_id: this.org_id,
            assistant_id: this.assistant_id,
            project_id: this.project_id,
            schema_version: window.env.SCHEMA_VERSION,
            ttl: {
                session: 3600,
                cache: 3600,
                temp: 3600
            }
        };

        // Context fields structure
        this.contextFields = {
            intake: {
                grade_level: null,
                curriculum: 'ela'
            },
            system: {
                schema_version: this.config.schema_version,
                thread_id: null
            }
        };

        // State management
        this.state = {
            isLoading: false,
            hasError: false,
            errorMessage: null,
            lastRequest: null,
            lastResponse: null,
            isPreloaded: false,
            context: null,
            projectPaired: false
        };

        console.log('[Merit Flow] OpenAI client initialized', {
            assistant: this.assistant_id,
            project: this.project_id,
            endpoint: this.baseUrl
        });
    }

    validateConfig() {
        const required = [
            'MERIT_ASSISTANT_ID',
            'OPENAI_PROJECT_ID',
            'MERIT_ORG_ID',
            'RL_API_GATEWAY_ENDPOINT',
            'RL_API_KEY'
        ];
        
        const missing = required.filter(key => !window.env[key]);
        if (missing.length > 0) {
            throw new Error(`Missing required configuration: ${missing.join(', ')}`);
        }
    }

    /**
     * Creates a new thread
     * @returns {Promise<string>} Thread ID
     */
    async createThread(retryCount = 3) {
        try {
            console.log('[Merit Flow] Creating new thread');
            console.log('[Merit Flow] Using production endpoint:', this.baseUrl);
            
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: this.headers,
                mode: 'cors',
                credentials: 'same-origin',
                body: JSON.stringify({
                    action: 'create_thread',
                    org_id: this.config.org_id,
                    assistant_id: this.config.assistant_id,
                    schema_version: this.config.schema_version,
                    project_id: this.config.project_id
                })
            });

            if (!response.ok) {
                const error = await response.json();
                if (error.statusCode === 403) {
                    throw new Error('API authentication failed - please check your API key');
                }
                throw new Error(error.error || 'Thread creation failed');
            }

            const data = await response.json();
            this.threadId = `${this.config.org_id}:${data.thread_id}`;
            this.contextFields.system.thread_id = this.threadId;
            this.state.projectPaired = true;
            console.log('[Merit Flow] Thread created:', this.threadId);
            return this.threadId;

        } catch (error) {
            console.error('[Merit Flow] Thread creation error:', error);
            console.error('[Merit Flow] Error details:', {
                endpoint: this.baseUrl,
                headers: { ...this.headers, 'Authorization': '[REDACTED]' },
                error: error.message
            });

            // Enhanced retry logic with exponential backoff
            if (retryCount > 0) {
                if (error.message === 'Failed to fetch' || error.message.includes('CORS')) {
                    const delay = Math.pow(2, 4 - retryCount) * 1000; // Exponential backoff
                    console.log(`[Merit Flow] CORS/Network error, retrying in ${delay}ms... (${retryCount} attempts remaining)`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return this.createThread(retryCount - 1);
                }
            }

            this.state.hasError = true;
            this.state.errorMessage = this.#formatErrorMessage(error);
            throw error;
        }
    }

    /**
     * Formats error messages for user display
     * @private
     */
    #formatErrorMessage(error) {
        if (error.message.includes('CORS')) {
            return 'Network connection issue. Please check your connection and try again.';
        }
        if (error.message.includes('authentication failed')) {
            return 'Authentication failed. Please refresh the page and try again.';
        }
        if (error.message === 'Failed to fetch') {
            return 'Unable to connect to the server. Please check your connection.';
        }
        return error.message || 'An unexpected error occurred';
    }

    /**
     * Preloads context for the conversation
     * @param {Object} context - The context object containing grade level and curriculum
     */
    async preloadContext(context) {
        try {
            console.log('[Merit Flow] Preloading context');
            const preloadMessage = `Hi, I'm your guide. I'll be helping with ${context.curriculum.toUpperCase()} for ${context.grade_level}.`;
            await this.sendMessage(preloadMessage, { visible: false });
            this.state.isPreloaded = true;
            this.state.context = context;
            this.contextFields.intake = {
                ...this.contextFields.intake,
                ...context
            };
            console.log('[Merit Flow] Context preloaded:', context);
        } catch (error) {
            console.error('[Merit Flow] Context preload error:', error);
            this.state.hasError = true;
            this.state.errorMessage = error.message;
            this.errors.cache.push({
                timestamp: new Date().toISOString(),
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Sends a message to the assistant
     * @param {string} message User message
     * @param {Object} options Additional options
     * @returns {Promise<Object>} Assistant response
     */
    async sendMessage(message, options = {}) {
        if (!this.state.projectPaired || !this.threadId) {
            await this.createThread();
        }

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    action: 'send_message',
                    message,
                    thread_id: this.threadId,
                    org_id: this.config.org_id,
                    assistant_id: this.config.assistant_id,
                    schema_version: this.config.schema_version,
                    project_id: this.config.project_id,
                    context: this.contextFields,
                    ...options
                })
            });

            if (!response.ok) {
                const error = await response.json();
                if (error.statusCode === 403) {
                    this.state.projectPaired = false;
                    throw new Error('API authentication failed');
                }
                throw new Error(error.error || 'Message send failed');
            }

            const data = await response.json();
            this.state.lastRequest = message;
            this.state.lastResponse = data;
            console.log('[Merit Flow] Message sent successfully');
            return data;
        } catch (error) {
            console.error('[Merit Flow] Message sending error:', error);
            this.state.hasError = true;
            this.state.errorMessage = error.message;
            this.errors.validation.push({
                timestamp: new Date().toISOString(),
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Gets the current state of the client
     * @returns {Object} Current state
     */
    getState() {
        return {
            ...this.state,
            context: this.contextFields,
            errors: this.errors
        };
    }

    /**
     * Destroys the client instance
     */
    destroy() {
        this.threadId = null;
        this.contextFields.system.thread_id = null;
        this.state = {
            isLoading: false,
            hasError: false,
            errorMessage: null,
            lastRequest: null,
            lastResponse: null,
            isPreloaded: false,
            context: null,
            projectPaired: false
        };
        this.errors = {
            validation: [],
            cache: [],
            schema: []
        };
        console.log('[Merit Flow] Client destroyed');
    }
} 
