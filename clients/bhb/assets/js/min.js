// BHB-specific min.js script
(function() {
    // Create and display the chat bubble
    const chatBubble = document.createElement('div');
    chatBubble.id = 'chat-bubble';
    chatBubble.style.position = 'fixed';
    chatBubble.style.bottom = '20px';
    chatBubble.style.right = '20px';
    chatBubble.style.width = '50px';
    chatBubble.style.height = '50px';
    chatBubble.style.backgroundColor = '#007bff';
    chatBubble.style.borderRadius = '50%';
    chatBubble.style.cursor = 'pointer';
    chatBubble.style.zIndex = '1000';
    chatBubble.setAttribute('aria-label', 'Open chat with BA');
    document.body.appendChild(chatBubble);

    // Function to open the chat modal
    function openChat() {
        try {
            // (where do we want to send them for support)
            window.open('https://integral-mothership.softr.app/chat', '_blank');
        } catch (error) {
            console.error('Failed to open chat:', error);
        }
    }

    // Add hover effect
    chatBubble.addEventListener('mouseover', function() {
        chatBubble.style.backgroundColor = '#0056b3';
    });

    chatBubble.addEventListener('mouseout', function() {
        chatBubble.style.backgroundColor = '#007bff';
    });

    // Add click event to the chat bubble
    chatBubble.addEventListener('click', openChat);
})(); 