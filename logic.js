const BACKEND_URL = 'https://felixcanosa1.pythonanywhere.com/chatbot';

async function sendMessage() {
    const userInput = document.getElementById('userInput').value;
    const chatbox = document.getElementById('chatbox');

    appendMessage('Tú', userInput);

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userInput })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        appendMessage('Chatbot', data.response);
    } catch (error) {
        console.error('Error:', error);
        appendMessage('Error', 'No se pudo conectar con el chatbot.');
    }

    document.getElementById('userInput').value = '';
}

function appendMessage(sender, message) {
    const chatbox = document.getElementById('chatbox');
    const messageElement = document.createElement('div');
    messageElement.className = sender.toLowerCase() === 'tú' ? 'user-message' : 'ai-message';

    const formattedMessage = sender === 'Chatbot' ? marked.parse(message) : escapeHtml(message);

    messageElement.innerHTML = `<strong>${sender}:</strong> ${formattedMessage}`;
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});