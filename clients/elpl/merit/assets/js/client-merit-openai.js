/**
 * @component MeritOpenAIClient
 * @description Handles OpenAI Assistant interactions for Merit chat (Stage 0: Baseline)
 * @version 1.0.17
 * 
 * @questions
 * - Q1: Should we implement retry logic for 429 rate limit responses?
 * - Q2: What's the expected timeout for thread creation (currently set to default)?
 * - Q3: Should we cache thread IDs in localStorage for session recovery?
 */
class MeritOpenAIClient {
    constructor() {
        this.threadId = null;
        this.assistantId = 'asst_QoAA395ibbyMImFJERbG2hKT';  // Merit Assistant
        this.userId = 'default_user';  // Hardcoded for MVP per checklist
        this.baseUrl = 'https://api.recursivelearning.app/dev';
        this.fallbackUrl = 'https://api.recursivelearning.app';  // Fallback without /dev
        this.retryAttempts = 3;
        this.currentAttempt = 0;
        this.config = {
            org_id: 'recdg5Hlm3VVaBA2u',  // EL Education
            assistant_id: 'asst_QoAA395ibbyMImFJERbG2hKT',  // Merit Assistant
            model: 'gpt-4o', // Declared model from the OpenAI dashboard
            schema_version: '04102025.B01',
            project_id: 'proj_V4lrL1OSfydWCFW0zjgwrFRT'  // OpenAI project pairing
        };
        
        this.headers = {
            'Content-Type': 'application/json',
            'Origin': 'https://recursivelearning.app',
            'X-Project-ID': this.config.project_id
        };

        // Stage 0: Basic state tracking
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

        console.log('[Merit Flow] OpenAI client initialized for Stage 0');
        console.log('[Merit Flow] Using API endpoint:', this.baseUrl);
        console.log('[Merit Flow] Project ID:', this.config.project_id);
    }

    /**
     * Creates a new thread (Stage 0: Clean thread creation)
     * @returns {Promise<string>} Thread ID
     * 
     * @questions
     * - Q4: What's the expected thread TTL for Stage 0?
     * - Q5: Should we implement thread cleanup for abandoned sessions?
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
            this.threadId = data.thread_id;
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
     * 
     * @questions
     * - Q6: Should we implement message queue for rate limiting?
     * - Q7: What's the expected message size limit?
     */
    async sendMessage(message, options = {}) {
        console.log('[Merit Flow] Sending message:', { message, threadId: this.threadId, userId: this.userId });
        
        if (!this.state.projectPaired) {
            throw new Error('OpenAI project must be paired before sending messages');
        }

        try {
            // For new users or no thread, create one with the first message
            if (!this.threadId) {
                console.log('[Merit Flow] No thread found, creating new thread with initial message');
            }

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
     * 
     * @questions
     * - Q8: Should we implement state persistence between page reloads?
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Cleans up client resources
     * 
     * @questions
     * - Q9: Should we notify backend of client destruction?
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