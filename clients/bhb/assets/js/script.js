// Place all your JavaScript code here
// ...JavaScript code from <script> section... 

// Initialize chat interface
document.addEventListener('DOMContentLoaded', function() {
    const messagesDiv = document.getElementById('messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Tool panel functionality
    const menuButton = document.getElementById('menu-button');
    const toolPanel = document.getElementById('tool-panel');

    menuButton.addEventListener('click', function() {
        toolPanel.classList.toggle('visible');
    });

    // Handle tool panel links
    document.getElementById('settings-link').addEventListener('click', function(event) {
        event.preventDefault();
        alert('Settings feature is under development.');
    });

    document.getElementById('faq-link').addEventListener('click', function(event) {
        event.preventDefault();
        alert('FAQs feature is under development.');
    });

    document.getElementById('upload-link').addEventListener('click', function(event) {
        event.preventDefault();
        alert('Upload feature is under development.');
    });

    // Emoji picker setup
    const picker = new EmojiButton.EmojiButton();
    const emojiButton = document.getElementById('emoji-button');

    picker.on('emoji', emoji => {
        userInput.value += emoji;
    });

    emojiButton.addEventListener('click', () => {
        picker.togglePicker(emojiButton);
    });

    // Send message on button click
    sendButton.addEventListener('click', function() {
        const message = userInput.value.trim();
        if (message !== '') {
            sendMessage(message);
            userInput.value = '';
        }
    });

    // Send message on Enter key
    userInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });

    // Display welcome message
    displayAssistantMessage('Hello! How can I assist you today?');

    function sendMessage(message) {
        displayUserMessage(message);

        const payload = {
            User_ID: 'anonymous',
            Assistant_ID: 'asst_IA5PsJxdShVPTAv2xeXTr4Ma', // Adjust as needed
            Org_ID: 'recjUGiOT65lwgBtm', // Adjust as needed
            message: message,
            Thread_ID: null,
            source: 'BHB_assets_chat',
        };

        fetch('https://your-api-endpoint', { // Replace with your actual API endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.response) {
                displayAssistantMessage(data.response);
                // Update Thread_ID if provided
                if (data.Thread_ID) {
                    payload.Thread_ID = data.Thread_ID;
                }
            } else {
                displayAssistantMessage('Sorry, I did not understand that.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            displayAssistantMessage('An error occurred. Please try again later.');
        });
    }

    function displayUserMessage(message) {
        const messageElement = createMessageElement('You', message, 'user');
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function displayAssistantMessage(message) {
        const messageElement = createMessageElement('Assistant', message, 'assistant');
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function createMessageElement(sender, text, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', type);

        const senderElement = document.createElement('div');
        senderElement.classList.add('message-sender');
        senderElement.innerText = sender;

        const textElement = document.createElement('div');
        textElement.classList.add('message-text');
        textElement.innerText = text;

        const timeElement = document.createElement('div');
        timeElement.classList.add('message-time');
        timeElement.innerText = new Date().toLocaleTimeString();

        messageElement.appendChild(senderElement);
        messageElement.appendChild(textElement);
        messageElement.appendChild(timeElement);

        return messageElement;
    }
}); 