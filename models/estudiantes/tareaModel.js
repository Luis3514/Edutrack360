const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tareaSchema = new Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  fechaEntrega: { type: Date, required: true },
  estudiantesEntregaron: [{ type: Schema.Types.ObjectId, ref: 'Estudiante' }],
  // Additional fields as needed
});

const Tarea = mongoose.model('Tarea', tareaSchema);

module.exports = Tarea;
