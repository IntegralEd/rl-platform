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
            errorMessage: null
        };
    }

    /**
     * Creates a new thread for chat interaction
     * @returns {Promise<string>} Thread ID
     */
    async createThread() {
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
     * Sends a message to the assistant and gets response
     * @param {string} content User message
     * @returns {Promise<Object>} Assistant response
     */
    async sendMessage(content) {
        try {
            if (!this.threadId) {
                await this.createThread();
            }

            this.state.isLoading = true;
            console.log('[Merit Flow] Sending message');

            const response = await fetch(`${this.baseUrl}/threads/${this.threadId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
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
     * Cleans up resources when component is destroyed
     */
    destroy() {
        this.threadId = null;
        this.state.isLoading = false;
        this.state.hasError = false;
        this.state.errorMessage = null;
        console.log('[Merit Flow] OpenAI client cleaned up');
    }
}

export default MeritOpenAIClient; 