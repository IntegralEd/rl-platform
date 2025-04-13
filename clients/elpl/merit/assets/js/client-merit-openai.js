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
        this.assistantId = 'asst_QoAA395ibbyMImFJERbG2hKT';
        this.baseUrl = 'https://tixnmh1pe8.execute-api.us-east-2.amazonaws.com/prod/IntegralEd-Main';
        
        // Stage 0: Basic state tracking
        this.state = {
            isLoading: false,
            hasError: false,
            errorMessage: null,
            lastRequest: null,
            lastResponse: null
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
            this.state.lastRequest = {
                type: 'createThread',
                timestamp: new Date().toISOString(),
                version: 'merit.html/04132025.09:28am.v.1.15'
            };

            console.log('[Merit Flow] Creating new thread');
            console.log('[Merit Flow] Stage 0: Attempting Lambda endpoint connection');

            // Add protocol if missing
            const endpoint = this.baseUrl.startsWith('http') ? 
                this.baseUrl : 
                `https://${this.baseUrl}`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-merit-version': 'merit.html/04132025.09:28am.v.1.15'
                },
                body: JSON.stringify({
                    assistantId: this.assistantId,
                    threadId: null,
                    message: 'Initialize thread'
                })
            });

            if (!response.ok) {
                console.error('[Merit Flow] Thread creation failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    endpoint: endpoint
                });
                throw new Error('Failed to create thread');
            }
            
            const data = await response.json();
            this.state.lastResponse = {
                type: 'createThread',
                timestamp: new Date().toISOString(),
                status: response.status,
                threadId: data.Thread_ID,
                version: 'merit.html/04132025.09:28am.v.1.15'
            };

            if (!data.Thread_ID) {
                console.error('[Merit Flow] Invalid thread response:', data);
                throw new Error('Invalid thread response');
            }
            
            this.threadId = data.Thread_ID;
            console.log('[Merit Flow] Thread created:', this.threadId);
            console.log('[Merit Flow] No context loaded (Stage 0)');
            console.log('[Merit Flow] Default onboarding active');

            return this.threadId;

        } catch (error) {
            // Enhanced error handling for Stage 0
            const errorDetails = {
                type: error.name,
                message: error.message,
                timestamp: new Date().toISOString(),
                version: 'merit.html/04132025.09:28am.v.1.15',
                endpoint: this.baseUrl
            };

            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                console.error('[Merit Flow] Network error:', {
                    ...errorDetails,
                    suggestion: 'Check Lambda endpoint configuration and network connectivity'
                });
            } else {
                console.error('[Merit Flow] Thread creation error:', errorDetails);
            }

            this.state.hasError = true;
            this.state.errorMessage = 'Failed to start chat session';
            this.state.lastError = errorDetails;

            // Add user-friendly error message to chat window
            const chatWindow = document.getElementById('chat-window');
            if (chatWindow) {
                const errorMessage = document.createElement('div');
                errorMessage.className = 'message error';
                errorMessage.textContent = 'Unable to connect to chat service. Please try again later.';
                chatWindow.appendChild(errorMessage);
            }

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
     * Sends a message to the assistant (Stage 0: Default behavior)
     * @param {string} message User message
     * @returns {Promise<Object>} Assistant response
     * 
     * @questions
     * - Q6: Should we implement message queue for rate limiting?
     * - Q7: What's the expected message size limit?
     */
    async sendMessage(message) {
        if (!this.threadId) {
            console.error('[Merit Flow] No active thread');
            throw new Error('No active chat session');
        }

        try {
            this.state.isLoading = true;
            this.state.lastRequest = {
                type: 'sendMessage',
                timestamp: new Date().toISOString(),
                threadId: this.threadId,
                message: message
            };

            console.log('[Merit Flow] Sending message:', message);

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assistantId: this.assistantId,
                    threadId: this.threadId,
                    message: message
                })
            });

            if (!response.ok) {
                console.error('[Merit Flow] Message failed:', response.status);
                throw new Error('Failed to send message');
            }

            const data = await response.json();
            this.state.lastResponse = {
                type: 'sendMessage',
                timestamp: new Date().toISOString(),
                status: response.status,
                messageId: data.message_id
            };

            console.log('[Merit Flow] Response received');
            return data;

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
        this.state.isLoading = false;
        this.state.hasError = false;
        this.state.errorMessage = null;
        console.log('[Merit Flow] Client destroyed');
    }
}

export default MeritOpenAIClient; 