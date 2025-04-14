// Chat Core Configuration
const LAMBDA_ENDPOINT = 'https://tixnmh1pe8.execute-api.us-east-2.amazonaws.com/prod/IntegralEd-Main';

// State Management
let messageCount = 0;
let selectedGrade = null;

// Initialize chat session
function initChat() {
    if (!window.ASSISTANT_ID) {
        console.error('No ASSISTANT_ID provided. Set window.ASSISTANT_ID before initializing chat.');
        return;
    }
    window.threadId = localStorage.getItem('threadId') || null;
    console.log(`Chat initialized: ${messageCount} messages, ${window.threadId ? `thread ${window.threadId}` : 'no thread'}`);
    console.log(`Using assistant: ${window.ASSISTANT_ID}`);
}

function sanitizeResponse(text) {
    try {
        // Remove non-printable characters except newlines
        text = text.replace(/[^\x20-\x7E\n]/g, '');
        // Remove multiple spaces
        text = text.replace(/\s+/g, ' ');
        // Remove multiple newlines
        text = text.replace(/\n+/g, '\n');
        return text.trim();
    } catch (e) {
        console.error('Error sanitizing response:', e);
        return 'I apologize, but I received an invalid response. Please try again.';
    }
}

// Message handling
function sendMessage(input, options = {}) {
    if (!window.ASSISTANT_ID) {
        throw new Error('No ASSISTANT_ID provided. Set window.ASSISTANT_ID before sending messages.');
    }
    if (input.trim() === "") return;
    
    messageCount++;
    
    const requestBody = {
        message: input,
        assistantId: window.ASSISTANT_ID,
        debug: true,
        ...(options.grade && { grade: options.grade }),
        ...(window.threadId && { threadId: window.threadId })
    };
    
    console.log(`Message ${messageCount} request:`, {
        assistantId: requestBody.assistantId,
        grade: requestBody.grade,
        threadId: requestBody.threadId,
        message: input.substring(0, 50) + (input.length > 50 ? '...' : '')
    });
    
    return fetch(LAMBDA_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    })
    .then(response => {
        console.log('Response headers:', response.headers);
        return response.json();
    })
    .then(data => {
        console.log(`Message ${messageCount} raw response:`, data);
        
        if (!data.response) {
            throw new Error('No response received from assistant');
        }
        
        // Sanitize the response
        data.response = sanitizeResponse(data.response);
        
        console.log(`Message ${messageCount} sanitized response:`, {
            threadId: data.Thread_ID,
            responsePreview: data.response.substring(0, 50) + '...'
        });
        
        return data;
    })
    .catch(error => {
        console.error('Error in message handling:', error);
        throw new Error('Failed to process the message. Please try again.');
    });
}

// Session management
function resetSession() {
    window.threadId = null;
    localStorage.removeItem('threadId');
    messageCount = 0;
    console.log('Chat session reset');
}

// Grade selection (for embed version)
function setGrade(grade) {
    selectedGrade = grade;
    localStorage.setItem('selectedGrade', grade);
    console.log(`Grade set to: ${grade}`);
}

function getGrade() {
    return localStorage.getItem('selectedGrade');
}

// Export functions
window.chatCore = {
    init: initChat,
    send: sendMessage,
    reset: resetSession,
    setGrade,
    getGrade
}; 