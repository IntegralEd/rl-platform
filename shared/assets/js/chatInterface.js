// Existing code...

// Construct URL with updated parameters
const params = new URLSearchParams({
  User_ID: userId,
  Org_ID: orgId,
  Thread_ID: threadId,
  Source: 'chat',
  Action_ID: actionId,
});

const LAMBDA_URL = 'https://tixnmh1pe8.execute-api.us-east-2.amazonaws.com/prod/IntegralEd-Main?' + params.toString();

// Add saveConversation function if not already present
function saveConversation() {
    // Same implementation as in chat.js
    // Collect context data and call sendDataToWebhook
}

// Adjust triggers accordingly
function endChatSession() {
    // Existing code to end chat session...

    // Invoke saveConversation upon ending the chat
    saveConversation();
}

// Existing code... 