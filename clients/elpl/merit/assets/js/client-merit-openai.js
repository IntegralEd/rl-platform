/**
 * @component MeritOpenAIClient
 * @description Handles OpenAI Assistant interactions for Merit chat
 * @version 1.0.21
 */
class MeritOpenAIClient {
    constructor() {
        // OpenAI Configuration
        const OPENAI_CONFIG = {
            assistant: {
                id: 'asst_QoAA395ibbyMImFJERbG2hKT',
                project: 'proj_V4lrL1OSfydWCFW0zjgwrFRT',
                model: 'gpt-4o'
            }
        };

        // API Configuration - Single source of truth for endpoint
        const ENDPOINTS = {
            prod: 'https://api.recursivelearning.app/prod',
            contextPrefix: 'merit:ela:context',
            threadPrefix: 'merit:ela:thread'
        };
        
        // Core state
        this.threadId = null;
        this.userId = null;
        this.baseUrl = ENDPOINTS.prod;
        
        // Project configuration
        this.config = {
            org_id: 'recdg5Hlm3VVaBA2u',
            assistant_id: OPENAI_CONFIG.assistant.id,
            project_id: OPENAI_CONFIG.assistant.project,
            model: OPENAI_CONFIG.assistant.model,
            schema_version: '04102025.B01',
            ttl: {
                session: 3600, // 1 hour for MVP phase
                cache: 3600,
                temp: 3600
            }
        };
        
        // Request headers
        this.headers = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.MERIT_API_KEY || 'qoCr1UHh8A9IDFA55NDdO4CYMaB9LvL66Rmrga3J',
            'X-Project-ID': OPENAI_CONFIG.assistant.project,
            'X-Assistant-ID': OPENAI_CONFIG.assistant.id
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
            assistant: OPENAI_CONFIG.assistant.id,
            project: OPENAI_CONFIG.assistant.project,
            endpoint: this.baseUrl
        });
    }

    /**
     * Creates a new thread
     * @returns {Promise<string>} Thread ID
     */
    async createThread() {
        try {
            console.log('[Merit Flow] Creating new thread');
            console.log('[Merit Flow] Using production endpoint:', this.baseUrl);
            
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    action: 'create_thread',
                    org_id: this.config.org_id,
                    assistant_id: this.config.assistant_id,
                    schema_version: this.config.schema_version
                })
            });

            if (!response.ok) {
                const error = await response.json();
                if (error.statusCode === 403) {
                    throw new Error('API authentication failed');
                }
                throw new Error(error.error || 'Thread creation failed');
            }

            const data = await response.json();
            this.threadId = data.thread_id;
            this.state.projectPaired = true;
            console.log('[Merit Flow] Thread created:', this.threadId);
            return this.threadId;

        } catch (error) {
            console.error('[Merit Flow] Thread creation error:', error);
            console.error('[Merit Flow] Error details:', {
                endpoint: this.baseUrl,
                headers: { ...this.headers, 'x-api-key': '[REDACTED]' },
                error: error.message
            });
            this.state.hasError = true;
            this.state.errorMessage = error.message;
            throw error;
        }
    }

    /**
     * Sends a message to the assistant
     * @param {string} message User message
     * @returns {Promise<Object>} Assistant response
     */
    async sendMessage(message) {
        // Check project pairing before proceeding
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
                    schema_version: this.config.schema_version
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
            console.log('[Merit Flow] Message sent successfully');
            return data;
        } catch (error) {
            console.error('[Merit Flow] Message sending error:', error);
            this.state.hasError = true;
            this.state.errorMessage = error.message;
            throw error;
        }
    }
}

export default MeritOpenAIClient; 
