const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rendimientoSchema = new Schema({
  estudianteId: {
    type: Schema.Types.ObjectId,
    ref: 'Estudiante',
    required: true
  },
  materia: {
    type: String,
    required: true
  },
  calificacion: {
    type: Number,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

const Rendimiento = mongoose.model('Rendimiento', rendimientoSchema, 'Rendimiento');

module.exports = Rendimiento;
