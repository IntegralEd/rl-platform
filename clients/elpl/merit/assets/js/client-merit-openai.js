/**
 * @component MeritOpenAIClient
 * @description Handles OpenAI Assistant interactions for Merit chat (Stage 0: Baseline)
 * @version 1.0.15
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
            schema_version: '04102025.B01'
        };
        
        // Stage 0: Basic state tracking
        this.state = {
            isLoading: false,
            hasError: false,
            errorMessage: null,
            lastRequest: null,
            lastResponse: null,
            isPreloaded: false,
            context: null
        };

        console.log('[Merit Flow] OpenAI client initialized for Stage 0');
        console.log('[Merit Flow] Using API endpoint:', this.baseUrl);
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
            const response = await fetch(`${this.baseUrl}/thread/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Organization-ID': this.config.org_id,
                    'X-Schema-Version': this.config.schema_version
                },
                body: JSON.stringify({
                    assistant_id: this.assistantId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.threadId = data.thread_id;
            console.log('[Merit Flow] Thread created:', this.threadId);
            return this.threadId;
        } catch (error) {
            console.error('[Merit Flow] Thread creation error:', error);
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
            throw new Error('No active thread');
        }

        try {
            console.log('[Merit Flow] Sending message to thread:', this.threadId);
            const response = await fetch(`${this.baseUrl}/thread/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Organization-ID': this.config.org_id,
                    'X-Schema-Version': this.config.schema_version
                },
                body: JSON.stringify({
                    thread_id: this.threadId,
                    message: message,
                    ...options
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('[Merit Flow] Message sent successfully');
            return data;
        } catch (error) {
            console.error('[Merit Flow] Message sending error:', error);
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
            context: null
        };
        console.log('[Merit Flow] Client destroyed');
    }
}

export default MeritOpenAIClient; 