const Chat = {
    messages: [],
    
    init: function() {
        this.chatWindow = document.querySelector('.chat-content');
        this.setupEventListeners();
    },

    setupEventListeners: function() {
        const form = document.querySelector('.chat-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = form.querySelector('input[type="text"]');
                if (input.value.trim()) {
                    this.addMessage('user', input.value);
                    input.value = '';
                }
            });
        }
    },

    addMessage: function(role, content) {
        const message = { role, content, timestamp: new Date() };
        this.messages.push(message);
        
        const messageEl = document.createElement('div');
        messageEl.className = `message ${role}`;
        messageEl.textContent = content;
        this.chatWindow.appendChild(messageEl);
        
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Chat.init();
}); 