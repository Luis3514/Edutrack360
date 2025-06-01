// Estado del chatbot
let chatbotActive = false;
let userName = '';
let chatContainer = null;

// Función para mostrar el chatbot
function showChatbot() {
    // Verificar si el botón existe
    const button = document.getElementById('chatbot-toggle');
    if (!button) {
        console.error('Botón de chatbot no encontrado');
        return;
    }

    // Crear el contenedor del chat
    chatContainer = document.createElement('div');
    chatContainer.className = 'chatbot-container';
    chatContainer.style.display = 'none';

    // Agregar el contenedor al body
    document.body.appendChild(chatContainer);

    // Mostrar el chat
    chatContainer.style.display = 'block';

    // Crear estructura del chat
    chatContainer.innerHTML = `
        <div class="chat-header">
            <h3>Chatbot EduTrack360</h3>
            <button class="close-button">×</button>
        </div>
        <div class="chat-messages" id="chat-messages">
            <div class="message bot">
                <p>¡Hola! Antes de comenzar, ¿podrías decirme tu nombre?</p>
            </div>
        </div>
        <div class="chat-input-container">
            <input type="text" id="user-name" placeholder="Ingresa tu nombre..." required>
            <button class="start-button">Comenzar</button>
        </div>
    `;

    // **Agregar estilos para scroll en el contenedor de mensajes**
    const messagesDiv = chatContainer.querySelector('#chat-messages');
    messagesDiv.style.height = '300px';          // altura fija
    messagesDiv.style.overflowY = 'auto';        // scroll vertical
    messagesDiv.style.padding = '10px';           // opcional para mejor estética
    messagesDiv.style.border = '1px solid #ccc'; // opcional para definir límite visual

    // Event listeners
    const closeButton = chatContainer.querySelector('.close-button');
    const startButton = chatContainer.querySelector('.start-button');
    const userNameInput = chatContainer.querySelector('#user-name');

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            chatContainer.remove();
            chatbotActive = false;
            chatContainer = null; // Limpiar la referencia al contenedor
        });
    }

    if (startButton) {
        startButton.addEventListener('click', () => {
            handleNameInput(userNameInput.value);
        });
    }

    if (userNameInput) {
        userNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleNameInput(userNameInput.value);
            }
        });
    }

    chatbotActive = true;
}

// Función para manejar el nombre del usuario
function handleNameInput(name) {
    if (!name) return;

    // Verificar si el chat está activo
    if (!chatbotActive) {
        console.error('El chat no está activo');
        return;
    }

    userName = name;
    const messagesDiv = chatContainer.querySelector('#chat-messages');
    if (!messagesDiv) {
        console.error('No se encontró el contenedor de mensajes');
        return;
    }

    // Agregar mensaje del usuario
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.innerHTML = `<p>${name}</p>`;
    messagesDiv.appendChild(userMessage);

    // Agregar respuesta del bot
    const botMessage = document.createElement('div');
    botMessage.className = 'message bot';
    botMessage.innerHTML = `<p>¡Hola ${name}! ¿En qué puedo ayudarte hoy?</p>`;
    messagesDiv.appendChild(botMessage);

    // Hacer scroll hasta el final
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Cambiar el input para mensajes normales
    chatContainer.querySelector('.chat-input-container').innerHTML = `
        <input type="text" id="user-message" placeholder="Escribe tu mensaje..." required>
        <button id="send-message" class="send-button">Enviar</button>
    `;

    // Event listeners para el nuevo input
    const sendButton = chatContainer.querySelector('#send-message');
    const messageInput = chatContainer.querySelector('#user-message');

    if (sendButton) {
        sendButton.addEventListener('click', handleSendMessage);
    }

    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });
    }
}

// Manejar el envío de mensajes
async function handleSendMessage() {
    const messageInput = chatContainer.querySelector('#user-message');
    const message = messageInput.value.trim();

    if (message) {
        addMessage('user', message);
        messageInput.value = '';
        
        try {
            const response = await fetch('/api/chatbot/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userName,
                    message
                })
            });

            const data = await response.json();
            addMessage('bot', data.response);
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
            addMessage('bot', 'Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo.');
        }
    }
}

// Agregar mensaje al chat
function addMessage(sender, text) {
    if (!chatContainer) return;

    const messagesDiv = chatContainer.querySelector('#chat-messages');
    if (!messagesDiv) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `<p>${text}</p>`;
    
    messagesDiv.appendChild(messageDiv);
    
    // Hacer scroll hasta el final
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Event listener para el botón de chatbot
document.addEventListener('DOMContentLoaded', () => {
    const chatbotButton = document.getElementById('chatbot-toggle');
    if (chatbotButton) {
        chatbotButton.addEventListener('click', (e) => {
            e.preventDefault();
            showChatbot();
            console.log('Botón de chatbot clickeado');
        });
    } else {
        console.error('Botón de chatbot no encontrado en el DOM');
    }
});
