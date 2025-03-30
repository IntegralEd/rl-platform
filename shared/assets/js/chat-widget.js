(function() {
    const client = document.currentScript.getAttribute('data-client') || 'IECentral';
    // Load styles
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://yourdomain.com/assets/css/chat-widget.css';
    document.head.appendChild(link);

    // Create chat container
    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-widget';
    document.body.appendChild(chatContainer);

    // Initialize chat
    initializeChat(client, {}); // Assume initializeChat is globally accessible or adjust accordingly
})(); 