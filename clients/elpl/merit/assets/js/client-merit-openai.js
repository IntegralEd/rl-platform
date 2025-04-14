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
        this.baseUrl = 'https://api.recursivelearning.app/dev';
        this.config = {
            org_id: 'recdg5Hlm3VVaBA2u',  // EL Education
            assistant_id: 'asst_QoAA395ibbyMImFJERbG2hKT',  // Merit Assistant
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
            console.log('[Merit Flow] Creating new thread');
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
        if (!this.threadId) {
            throw new Error('thread_id is required');
        }

        if (!this.state.projectPaired) {
            throw new Error('OpenAI project must be paired before sending messages');
        }

        try {
            console.log('[Merit Flow] Sending message to thread:', this.threadId);
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    message,
                    thread_id: this.threadId,
                    project_id: this.config.project_id,  // Required for project pairing
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