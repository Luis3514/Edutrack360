const ChatMessage = require('../models/ChatMessage');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const mammoth = require("mammoth");

exports.sendMessage = async (req, res) => {
    try {
        const { userName, message } = req.body;

        // Guardar mensaje del usuario
        await ChatMessage.create({
            userName,
            message,
            sender: 'user'
        });

        // Obtener respuesta desde Ollama con contexto de la empresa
        const botResponse = await getBotResponseFromOllama(message, userName);

        // Guardar respuesta del bot
        await ChatMessage.create({
            userName,
            message: botResponse,
            sender: 'bot'
        });

        res.json({ response: botResponse });
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        res.status(500).json({ error: 'Error al procesar el mensaje' });
    }
};

// Función que llama a Ollama para generar la respuesta
async function getBotResponseFromOllama(message, userName) {
    try {
        // Leer el archivo con la información de la empresa y convertirlo a texto
        const infoPath = path.join(__dirname, '../edutrack_docs/EduTrack360.docx');
        const companyData = await readDocxFile(infoPath);

        // Limitar el tamaño del contexto para evitar exceso de tokens
        const maxContextLength = 2000; // Ajusta según necesidad
        const trimmedCompanyData = companyData.slice(0, maxContextLength);

        // Crear el prompt con el contexto
        const fullPrompt = `
Esta es la información sobre la empresa EduTrack360:
${trimmedCompanyData}

Usuario: ${userName}
Pregunta del usuario: ${message}

Responde como si fueras un representante experto de EduTrack360.
Da una respuesta clara, concisa y detallada, pero sin extenderte demasiado. 
Proporciona solo la información esencial que ayude a resolver la consulta. 
Usa un tono amable y profesional.
`;

        // Logs para depurar
        console.log("Longitud del prompt:", fullPrompt.length);
        console.log("Primeros 300 caracteres del prompt:", fullPrompt.slice(0, 300));

        // Crear instancia de Axios con timeout mayor
        const axiosInstance = axios.create({ timeout: 60000 }); // 60 segundos

        // Llamar al servicio de Ollama para obtener la respuesta
        const response = await axiosInstance.post('http://localhost:11434/api/generate', {
            model: "llama3",
            prompt: fullPrompt,
            stream: false
        });

        if (response.data.response) {
            console.log('Respuesta generada (longitud):', response.data.response.length);
        } else {
            console.warn('No se recibió respuesta del modelo.');
        }

        return response.data.response || 'No se recibió respuesta del modelo.';
    } catch (err) {
        console.error("Error conectando con Ollama:", err.response?.data || err.message);
        return 'Lo siento, no pude generar una respuesta en este momento.';
    }
}

// Función para leer el archivo .docx y convertirlo a texto
async function readDocxFile(filePath) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const { value } = await mammoth.extractRawText({ buffer: fileBuffer });
        return value;
    } catch (err) {
        console.error("Error al leer el archivo .docx:", err.message);
        throw new Error("No se pudo leer la información de la empresa.");
    }
}
