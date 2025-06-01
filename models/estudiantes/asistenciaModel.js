const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const asistenciaSchema = new Schema({
  estudianteId: {
    type: Schema.Types.ObjectId,
    ref: 'Estudiante',
    required: true
  },
  fecha: {
    type: Date,
    required: true
  },
  estado: {
    type: String,
    enum: ['Presente', 'Ausente', 'Tarde', 'Justificado'],
    required: true
  }
});

const Asistencia = mongoose.model('Asistencia', asistenciaSchema, 'Asistencia');

module.exports = Asistencia;
