const BACKEND_URL = 'https://felixcanosa1.pythonanywhere.com/chatbot';

kontra.init();

let eye = kontra.Sprite({
    x: 200,
    y: 100,
    radius: 50,
    pupilColor: 'black',
    talking: false,
    render() {
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.context.fillStyle = 'white';
        this.context.fill();
        this.context.strokeStyle = 'black';
        this.context.lineWidth = 2;
        this.context.stroke();

        // Pupila
        this.context.beginPath();
        this.context.arc(this.pupilX || this.x, this.pupilY || this.y, this.radius / 2, 0, Math.PI * 2);
        this.context.fillStyle = this.pupilColor;
        this.context.fill();

        if (this.talking) {
            // Dibujar boca
            this.context.beginPath();
            this.context.arc(this.x, this.y + this.radius / 2, this.radius / 3, 0, Math.PI);
            this.context.strokeStyle = 'black';
            this.context.lineWidth = 2;
            this.context.stroke();
        }
    },
    update() {
        if (!this.talking) {
            let dx = kontra.pointer.x - this.x;
            let dy = kontra.pointer.y - this.y;
            let angle = Math.atan2(dy, dx);
            let distance = Math.min(this.radius / 4, Math.sqrt(dx * dx + dy * dy));
            this.pupilX = this.x + Math.cos(angle) * distance;
            this.pupilY = this.y + Math.sin(angle) * distance;
        } else {
            this.pupilX = this.x;
            this.pupilY = this.y;
        }
    }
});

let loop = kontra.GameLoop({
    update() {
        eye.update();
    },
    render() {
        eye.render();
    }
});

loop.start();

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
        
        // Activar el modo "hablando" del ojo
        eye.talking = true;
        eye.pupilColor = 'red';

        appendMessage('Chatbot', data.response);

        // Desactivar el modo "hablando" después de 2 segundos
        setTimeout(() => {
            eye.talking = false;
            eye.pupilColor = 'black';
        }, 2000);

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