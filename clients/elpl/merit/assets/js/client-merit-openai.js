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
        
        // API Configuration - Development endpoint
        this.baseUrl = 'https://api.recursivelearning.app/dev';
        this.retryAttempts = 3;
        this.currentAttempt = 0;
        
        // Required fields for all requests
        this.config = {
            org_id: 'recdg5Hlm3VVaBA2u',
            assistant_id: this.assistantId,
            schema_version: '04102025.B01',
            project_id: 'proj_V4lrL1OSfydWCFW0zjgwrFRT'
        };
        
        this.headers = {
            'Content-Type': 'application/json',
            'Origin': 'https://recursivelearning.app'
        };

        this.state = {
            isLoading: false,
            hasError: false,
            errorMessage: null,
            projectPaired: false
        };

        console.log('[Merit Flow] OpenAI client initialized');
        console.log('[Merit Flow] Using development endpoint:', this.baseUrl);
        console.log('[Merit Flow] Assistant ID:', this.assistantId);
        console.log('[Merit Flow] Project ID:', this.config.project_id);
        console.log('[Merit Flow] Organization:', this.config.org_id);
    }

    /**
     * Creates a new thread
     * @returns {Promise<string>} Thread ID
     */
    async createThread() {
        try {
            console.log(`[Merit Flow] Creating new thread (Attempt ${this.currentAttempt + 1}/${this.retryAttempts})`);
            
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    action: 'create_thread',
                    ...this.config
                })
            });

            if (!response.ok) {
                const error = await response.json();
                if (error.statusCode === 403) {
                    this.state.projectPaired = false;
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
            
            // Retry logic for network issues
            if (this.currentAttempt < this.retryAttempts) {
                this.currentAttempt++;
                console.log(`[Merit Flow] Retrying thread creation (Attempt ${this.currentAttempt}/${this.retryAttempts})`);
                return this.createThread();
            }
            
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
