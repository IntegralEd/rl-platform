// Chat core functionality
const ChatCore = {
    threadId: null,
    messageHistory: [],

    async initialize(config = {}) {
        this.config = {
            endpoint: config.endpoint || 'https://api.recursivelearning.app/chat',
            assistantId: config.assistantId || 'asst_default',
            orgId: config.orgId || 'default'
        };
    },

    async send(message) {
        try {
            const response = await fetch(this.config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    thread_id: this.threadId,
                    assistant_id: this.config.assistantId,
                    org_id: this.config.orgId
                })
            });

            const data = await response.json();
            this.threadId = data.thread_id;
            this.messageHistory.push({
                role: 'user',
                content: message
            });
            this.messageHistory.push({
                role: 'assistant',
                content: data.message
            });

            return data.message;
        } catch (error) {
            console.error('Chat error:', error);
            throw error;
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    window.chatCore = ChatCore;
}); 