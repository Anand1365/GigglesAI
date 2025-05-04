document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const avatarSelect = document.getElementById('avatar-select');
    
    // Function to add a message to the chat
    function addMessage(text, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to send message to backend
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessage(message, true);
        userInput.value = '';

        // Show loading indicator
        const loadingId = 'loading-message';
        const loadingDiv = document.createElement('div');
        loadingDiv.id = loadingId;
        loadingDiv.classList.add('message', 'bot-message');
        loadingDiv.textContent = 'Thinking...';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            // Use the full URL to ensure proper connection
            const backendUrl = window.location.origin + '/ask';
            console.log("Sending request to:", backendUrl);
            
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    query: message,
                    avatar: avatarSelect.value
                })
            });

            console.log("Response status:", response.status);
            
            // Remove loading indicator
            const loadingMessage = document.getElementById(loadingId);
            if (loadingMessage) {
                loadingMessage.remove();
            }

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Response is not JSON');
            }

            const data = await response.json();
            console.log("Data received:", data);
            
            if (data.error) {
                addMessage('Error: ' + data.error, false);
            } else {
                addMessage(data.response, false);
            }
        } catch (error) {
            console.error('Error details:', error);
            
            // Remove loading indicator if it still exists
            const loadingMessage = document.getElementById(loadingId);
            if (loadingMessage) {
                loadingMessage.remove();
            }
            
            addMessage('Error connecting to server. Please try again. (Details: ' + error.message + ')', false);
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Add initial greeting
    addMessage('Hello! How can I help you today?', false);
});