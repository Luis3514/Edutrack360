const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const docenteSchema = new Schema({
    password: { 
    type: String,
    required: true
  },
  Nombre: {
    type: String,
    required: true
  },
  Apellido: String,
  Edad: String,
  Telefono: String,
  Estado: String,
  GradoAcademico: String,
  correo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  fecha_creacion: {
    type: Date,
    default: Date.now
  }
});

const Docente = mongoose.model('Docente', docenteSchema, 'UsuarioDocente');
module.exports = Docente;
