// API Client for Recursive Learning Platform
const APIClient = {
    config: {
        endpoint: null,
        apiKey: null,
        orgId: null
    },

    init(config) {
        this.config = { ...this.config, ...config };
        if (!this.config.endpoint || !this.config.apiKey) {
            throw new Error('API endpoint and key are required');
        }
    },

    async sendMessage(params) {
        const { message, userId, assistantId, threadId = null, metadata = {} } = params;
        
        try {
            const response = await fetch(this.config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': this.config.apiKey
                },
                body: JSON.stringify({
                    user_id: userId,
                    org_id: this.config.orgId,
                    assistant_id: assistantId,
                    thread_id: threadId,
                    message,
                    url: window.location.href,
                    metadata
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'API request failed');
            }

            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Retry logic for failed requests
    async withRetry(fn, retries = 3, delay = 1000) {
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
        }
    }
}; 