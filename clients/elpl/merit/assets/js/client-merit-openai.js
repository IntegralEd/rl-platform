/**
 * @component MeritOpenAIClient
 * @description Handles OpenAI Assistant interactions for Merit chat
 * @version 1.0.15
 */
class MeritOpenAIClient {
    constructor() {
        this.threadId = null;
        this.assistantId = 'asst_QoAA395ibbyMImFJERbG2hKT';
        this.baseUrl = '/api/openai';
        
        // Required by client-layout-structure-behavior
        this.state = {
            isLoading: false,
            hasError: false,
            errorMessage: null,
            isPreloaded: false,
            context: null
        };
    }

    /**
     * Creates a new thread and optionally preloads context
     * @param {Object} context User context (grade, curriculum)
     * @returns {Promise<string>} Thread ID
     */
    async createThread(context = null) {
        try {
            this.state.isLoading = true;
            console.log('[Merit Flow] Creating new thread');

            const response = await fetch(`${this.baseUrl}/threads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error('Failed to create thread');
            
            const { threadId } = await response.json();
            this.threadId = threadId;
            
            console.log('[Merit Flow] Thread created:', threadId);

            // Stage 1: Preload context if provided
            if (context) {
                await this.preloadContext(context);
            } else {
                console.log('[Merit Flow] No context loaded (Stage 0)');
            }

            return threadId;

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
            
            const preloadMessage = `Hi, I'm your guide. I'll be helping with ${context.curriculum.toUpperCase()} for ${context.gradeLevel}. I understand the curriculum requirements and can assist with lesson planning, student support, and teaching strategies.`;
            
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
     * Sends a message to the assistant and gets response
     * @param {string} content User message
     * @param {Object} options Message options
     * @returns {Promise<Object>} Assistant response
     */
    async sendMessage(content, options = { visible: true }) {
        try {
            if (!this.threadId) {
                await this.createThread();
            }

            this.state.isLoading = true;
            console.log('[Merit Flow] Sending message');

            const response = await fetch(`${this.baseUrl}/threads/${this.threadId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    content,
                    visible: options.visible 
                })
            });

            if (!response.ok) throw new Error('Failed to send message');
            
            const result = await response.json();
            console.log('[Merit Flow] Message sent and response received');
            
            return result;

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
     * Gets the current context state
     * @returns {Object} Current context state
     */
    getState() {
        return {
            ...this.state,
            threadId: this.threadId,
            hasThread: !!this.threadId
        };
    }

    /**
     * Cleans up resources when component is destroyed
     */
    destroy() {
        this.threadId = null;
        this.state.isLoading = false;
        this.state.hasError = false;
        this.state.errorMessage = null;
        this.state.isPreloaded = false;
        this.state.context = null;
        console.log('[Merit Flow] OpenAI client cleaned up');
    }
}

export default MeritOpenAIClient; 