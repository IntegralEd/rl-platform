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
        console.log('[Merit Flow] Using Lambda endpoint:', this.baseUrl);
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
            this.state.isLoading = true;
            console.log('[Merit Flow] Creating new thread');

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Origin': 'https://recursivelearning.app'
                },
                body: JSON.stringify({
                    action: 'create_thread',
                    assistant_id: this.assistantId,
                    ...this.config
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create thread');
            }
            
            const data = await response.json();
            if (!data.thread_id) {
                throw new Error('Invalid thread response');
            }
            
            this.threadId = data.thread_id;
            console.log('[Merit Flow] Thread created:', this.threadId);
            console.log('[Merit Flow] No context loaded (Stage 0)');

            return this.threadId;

        } catch (error) {
            console.error('[Merit Flow] Thread creation error:', error);
            this.state.hasError = true;
            this.state.errorMessage = 'Failed to start chat session';
            throw error;
        } finally {
            this.state.isLoading = false;
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
    async sendMessage(message, options = { visible: true }) {
        if (!this.threadId) {
            console.error('[Merit Flow] No active thread');
            throw new Error('No active chat session');
        }

        try {
            this.state.isLoading = true;
            console.log('[Merit Flow] Sending message:', message);

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Origin': 'https://recursivelearning.app'
                },
                body: JSON.stringify({
                    message,
                    thread_id: this.threadId,
                    assistant_id: this.assistantId,
                    ...this.config
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();
            this.state.lastResponse = data;

            return {
                type: 'message',
                role: 'assistant',
                content: data.message
            };

        } catch (error) {
            console.error('[Merit Flow] Message error:', error);
            this.state.hasError = true;
            this.state.errorMessage = 'Failed to send message';
            throw error;
        } finally {
            this.state.isLoading = false;
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