const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
  nombre: String,
  apellido: String,
  correo: {
    type: String,
    required: true,
    unique: true, 
    trim: true,    
  },
  password: {
    type: String,
    required: true
  },
  telefono: String,
  direccion: String,
  fecha_creacion: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: Number,
    default: 1 
  }
});

const Admin = mongoose.model('administradores', adminSchema, 'UsuarioAdministrador');
module.exports = Admin;