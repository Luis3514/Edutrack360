// models/salonModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const salonSchema = new Schema({
    // Id_Salon: Si necesitas un ID numérico separado además del _id de MongoDB.
    // Si no, puedes omitir esto y usar el _id automático.
    salonIdentifier: { // Usando un nombre más descriptivo
        type: Number,
        // unique: true, // Descomenta si debe ser único
        // required: true // Descomenta si es obligatorio
    },
    bloque: {
        type: String,
        required: [true, 'El bloque del salón es requerido']
    },
    docente: {
        type: Schema.Types.ObjectId,
        ref: 'Docente'
    },
    ubicacion: {
        type: String,
        required: [true, 'La ubicación del salón es requerida']
    },
    // Campos adicionales que podrían ser útiles (basados en el EJS/JS anterior)
    capacidad: { // Añadido basado en el formulario EJS
        type: Number,
        required: [true, 'La capacidad es requerida'],
        min: [15, 'La capacidad debe ser al menos 1']
    },
    rendimiento: { // Añadido basado en la tabla EJS
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    
    alumnos: [{ type: Schema.Types.ObjectId, ref: 'Estudiante' }]

}, { timestamps: true }); // timestamps añade createdAt y updatedAt automáticamente

const Salon = mongoose.model('Salon', salonSchema);

module.exports = Salon;
