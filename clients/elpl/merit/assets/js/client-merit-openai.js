/**
 * @component MeritOpenAIClient
 * @description Handles OpenAI Assistant interactions for Merit chat
 * @version 1.0.17
 */
class MeritOpenAIClient {
    constructor() {
        // Core configuration
        this.threadId = null;
        this.assistantId = 'asst_QoAA395ibbyMImFJERbG2hKT';
        this.userId = 'default_user';
        
        // API Configuration
        const ENDPOINTS = {
            PROD: 'https://tixnmh1pe8.execute-api.us-east-2.amazonaws.com/prod/IntegralEd-Main',
            DEV: 'https://api.recursivelearning.app/dev',
            contextPrefix: 'merit:ela:context',
            threadPrefix: 'merit:ela:thread'
        };
        
        this.baseUrl = ENDPOINTS.PROD;
        this.fallbackUrl = ENDPOINTS.PROD;
        this.retryAttempts = 3;
        this.currentAttempt = 0;
        
        this.config = {
            org_id: 'recdg5Hlm3VVaBA2u',
            assistant_id: this.assistantId,
            model: 'gpt-4o',
            schema_version: '04102025.B01',
            project_id: 'proj_V4lrL1OSfydWCFW0zjgwrFRT',
            ttl: {
                session: 86400,
                cache: 3600,
                temp: 900
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

        this.contextFields = {
            intake: {
                grade_level: null,
                curriculum: 'ela',
                user_context: null
            },
            system: {
                schema_version: this.config.schema_version,
                thread_id: null
            }
        };

        this.errors = {
            validation: [],
            cache: [],
            schema: []
        };

        console.log('[Merit Flow] OpenAI client initialized');
        console.log('[Merit Flow] Using API endpoint:', this.baseUrl);
        console.log('[Merit Flow] Project ID:', this.config.project_id);
    }

    /**
     * Creates a new thread
     * @returns {Promise<string>} Thread ID
     */
    async createThread() {
        try {
            console.log('[Merit Flow] Creating new thread (Attempt ${this.currentAttempt + 1}/${this.retryAttempts})');
            console.log('[Merit Flow] Using endpoint:', this.baseUrl);
            
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
            
            // Check if it's a DNS error and we have retries left
            if (error.message.includes('ERR_NAME_NOT_RESOLVED') && this.currentAttempt < this.retryAttempts) {
                this.currentAttempt++;
                console.log('[Merit Flow] DNS resolution failed, trying fallback endpoint');
                this.baseUrl = this.fallbackUrl;
                return this.createThread();  // Retry with fallback URL
            }
            
            // Log detailed error info
            console.error('[Merit Flow] Error details:', {
                endpoint: this.baseUrl,
                attempt: this.currentAttempt,
                headers: this.headers,
                error: error.message
            });
            
            this.state.hasError = true;
            this.state.errorMessage = error.message;
            throw error;
        }
    }

    /**
     * Preloads context into the thread (Stage 1)
     * @param {Object} context User context
     * @returns {Promise<void>}
     */
    async preloadContext(context) {
        try {
            console.log('[Merit Flow] Preloading context');
            
            const preloadMessage = `Hi, I'm your guide. I'll be helping with ${context.curriculum.toUpperCase()} for ${context.gradeLevel}.`;
            await this.sendMessage(preloadMessage, { visible: false });
            
            this.state.isPreloaded = true;
            this.state.context = context;
            
            console.log('[Merit Flow] Context preloaded:', context);
        } catch (error) {
            console.error('[Merit Flow] Context preload error:', error);
            this.state.hasError = true;
            this.state.errorMessage = error.message;
            throw error;
        }
    }

    /**
     * Sends a message to the assistant (Stage 0: Default behavior)
     * @param {string} message User message
     * @returns {Promise<Object>} Assistant response
     */
    async sendMessage(message, options = {}) {
        console.log('[Merit Flow] Sending message:', { message, threadId: this.threadId, userId: this.userId });
        
        // 1. If we haven't paired yet, go ahead and create a thread
        if (!this.state.projectPaired || !this.threadId) {
            console.log('[Merit Flow] No thread found, creating new thread...');
            await this.createThread();
            // createThread() would set this.threadId and this.state.projectPaired = true
        }

        // 2. At this point, we should be "paired"
        if (!this.state.projectPaired) {
            throw new Error('OpenAI project must be paired before sending messages');
        }

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    message,
                    thread_id: this.threadId || null,  // Null for new thread creation
                    user_id: this.userId,  // Always send user_id
                    project_id: this.config.project_id,
                    ...this.config,
                    ...options
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
            // If this was a new thread, capture the thread_id from response
            if (!this.threadId && data.thread_id) {
                this.threadId = data.thread_id;
                console.log('[Merit Flow] New thread created:', this.threadId);
            }
            console.log('[Merit Flow] Message sent successfully');
            return data;
        } catch (error) {
            console.error('[Merit Flow] Message sending error:', error);
            this.state.hasError = true;
            this.state.errorMessage = error.message;
            throw error;
        }
    }

    /**
     * Gets current client state including request/response history
     * @returns {Object} Current state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Cleans up client resources
     */
    destroy() {
        this.threadId = null;
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
        console.log('[Merit Flow] Client destroyed');
    }
}

export default MeritOpenAIClient; 
