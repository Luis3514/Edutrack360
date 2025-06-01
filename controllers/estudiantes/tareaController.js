const Tarea = require('../../models/estudiantes/tareaModel');

exports.getTasksForStudent = async (req, res) => {
  try {
    const studentId = req.session.userId;
    if (!studentId) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    // Find all tasks, mark if student has delivered
    const tareas = await Tarea.find().lean();
    const tareasConEstado = tareas.map(tarea => {
      const entregado = tarea.estudiantesEntregaron.some(id => id.toString() === studentId.toString());
      return {
        ...tarea,
        entregado
      };
    });
    res.json(tareasConEstado);
  } catch (error) {
    console.error('Error obteniendo tareas:', error);
    res.status(500).json({ message: 'Error obteniendo tareas' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const tareaId = req.params.id;
    const tarea = await Tarea.findById(tareaId).lean();
    if (!tarea) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    res.json(tarea);
  } catch (error) {
    console.error('Error obteniendo tarea:', error);
    res.status(500).json({ message: 'Error obteniendo tarea' });
  }
};

exports.submitTask = async (req, res) => {
  try {
    const tareaId = req.params.id;
    const studentId = req.session.userId;
    if (!studentId) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    const tarea = await Tarea.findById(tareaId);
    if (!tarea) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    // Check if already submitted
    if (tarea.estudiantesEntregaron.includes(studentId)) {
      return res.status(400).json({ message: 'Tarea ya entregada' });
    }
    tarea.estudiantesEntregaron.push(studentId);
    await tarea.save();
    res.json({ message: 'Tarea entregada correctamente' });
  } catch (error) {
    console.error('Error entregando tarea:', error);
    res.status(500).json({ message: 'Error entregando tarea' });
  }
};
