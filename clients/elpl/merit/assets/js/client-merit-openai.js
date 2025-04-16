/**
 * @component MeritOpenAIClient
 * @description Handles OpenAI Assistant interactions for Merit chat
 * @version 1.0.19
 */
class MeritOpenAIClient {
    constructor() {
        // Core configuration
        this.threadId = null;
        this.assistantId = 'asst_QoAA395ibbyMImFJERbG2hKT'; // Merit Assistant
        this.userId = 'default_user';

        // API Configuration - Single source of truth for endpoint
        const ENDPOINTS = {
            lambda: process.env.LAMBDA_ENDPOINT || 'https://api.recursivelearning.app',
            contextPrefix: 'merit:ela:context',
            threadPrefix: 'merit:ela:thread'
        };
        
        this.baseUrl = ENDPOINTS.lambda;
        this.config = {
            org_id: 'recdg5Hlm3VVaBA2u',
            assistant_id: this.assistantId,
            model: 'gpt-4o',
            schema_version: '04102025.B01',
            project_id: 'proj_V4lrL1OSfydWCFW0zjgwrFRT',
            ttl: {
                session: 3600, // 1 hour for MVP phase
                cache: 3600,
                temp: 3600
            }
        };
        
        this.headers = {
            'Content-Type': 'application/json',
            'X-Project-ID': this.config.project_id
        };

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

        console.log('[Merit Flow] OpenAI client initialized');
        console.log('[Merit Flow] Using lambda endpoint:', this.baseUrl);
        console.log('[Merit Flow] Project ID:', this.config.project_id);
    }

    /**
     * Creates a new thread
     * @returns {Promise<string>} Thread ID
     */
    async createThread() {
        try {
            console.log('[Merit Flow] Creating new thread');
            console.log('[Merit Flow] Using lambda endpoint:', this.baseUrl);
            
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    action: 'create_thread',
                    project_id: this.config.project_id,
                    ...this.config
                })
            });

            if (!response.ok) {
                const error = await response.json();
                if (error.statusCode === 403) {
                    throw new Error('OpenAI project pairing required');
                }
                throw new Error(error.error || 'Thread creation failed');
            }

            const data = await response.json();
            this.threadId = `threads:${this.config.org_id}:${this.userId}:${data.thread_id}`;
            this.state.projectPaired = true;
            console.log('[Merit Flow] Thread created:', this.threadId);
            return this.threadId;

        } catch (error) {
            console.error('[Merit Flow] Thread creation error:', error);
            console.error('[Merit Flow] Error details:', {
                endpoint: this.baseUrl,
                headers: this.headers,
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
        if (!this.state.projectPaired) {
            await this.createThread();
        }

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    message,
                    thread_id: this.threadId,
                    ...this.config
                })
            });

            if (!response.ok) {
                const error = await response.json();
                if (error.statusCode === 403) {
                    this.state.projectPaired = false;
                    throw new Error('OpenAI project pairing lost');
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
