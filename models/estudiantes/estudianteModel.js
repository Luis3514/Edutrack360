const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const estudianteSchema = new Schema({
  password: {
    type: String,
    required: true
  },
  Nombre: {
    type: String,
    required: true
  },
  Edad: String,
  Apellidos: {
    type: String,
    required: true
  },
  Direccion: String,
  Telefono: String,
  Estado: String,
  Salon: String,
  documentos: String,
  correo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  fecha_creacion: {
    type: Date,
    default: Date.now
  }
});

const Estudiante = mongoose.model('Estudiante', estudianteSchema, 'UsuarioEstudiante');

module.exports = Estudiante;