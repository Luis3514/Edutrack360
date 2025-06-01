const DocenteService = require('../../services/docentes/docenteService')
const docenteService = new DocenteService()

exports.getAllDocentes = async (req, res) => {
  try {
      const docentes = await docenteService.getAll();
      console.log(docentes); // Log para ver los datos
      res.status(200).json(docentes); // Responde con los datos correctamente
  } catch (error) {
      console.error('Error al obtener docentes:', error);
      res.status(500).json({ "error": error.message });
  }
};


exports.getDocente = async (req, res) => {
  try {
      const id = req.params.id;
      const docente = await docenteService.filterById(id);
      if (!docente) {
          return res.status(404).json({ 'message': 'Docente no encontrado' });
      }
      res.status(200).json(docente); 
  } catch (error) {
      console.error('Error al obtener el docente:', error); 
      res.status(500).json({ "error": error.message }); 
  }
};

exports.createDocente = async (req, res) => {
    try {
        const { correo, Nombre, Apellido, edad, telefono, GradoAcademico, materia, salon_asignado, password } = req.body;

        // const existingDocente = await docenteService.filterByCorreo(correo);
        // if (existingDocente) {
        //     return res.status(400).json({ "message": "El correo ya está registrado por otro docente." });
        // }

        const docenteData = { correo, Nombre, Apellido, edad, telefono, GradoAcademico, materia, salon_asignado, password };
        const createdDocente = await docenteService.create(docenteData);
        res.status(201).json(createdDocente);
    } catch (error) {
        console.error('Error en createDocente:', error);
        res.status(500).json({ "error": error.message });
    }
};

exports.updateDocente = async (req, res) => {
    const { correo, Nombre, Apellido, edad, telefono, GradoAcademico, materia, salon_asignado, password } = req.body;
    const id = req.params.id;

    try {
        const docente = await docenteService.filterById(id);
        if (!docente) {
            return res.status(400).json({ 'message': "Docente no encontrado" });
        }

        // const existingDocente = await docenteService.filterByCorreo(correo);
        // if (existingDocente && existingDocente._id !== id) {
        //     return res.status(400).json({ "message": "El correo ya está registrado por otro docente." });
        // }

        const updatedDocente = { correo, Nombre, Apellido, edad, telefono, GradoAcademico, materia, salon_asignado, password };
        const updated = await docenteService.update(id, updatedDocente);
        res.status(200).json(updated);
    } catch (error) {
        console.error('Error al actualizar el docente:', error);
        res.status(500).json({ "error": error.message });
    }
};



exports.deleteDocente = async (req, res) => {
    const id = req.params.id
    const docente = await docenteService.filterById(id)
    if (!docente) {
        return res.status(400).json({ 'message': "docente no encontrado" })
    }
    await docenteService.delete(id)
    res.status(201).send({ 'message': "docente eliminado" })
}

exports.filterDocentes = async (req, res) => {
  try {
      
      const { nombre, apellido, estado, grado_academico, materia } = req.query;

      const docentes = await docenteService.filter({
          nombre,
          apellido,
          estado,
          grado_academico,
          materia
      });

      if (!docentes || docentes.length === 0) {
          return res.status(404).json({ 'message': "No se encontraron docentes con esos filtros" });
      }

      res.status(200).json(docentes);
  } catch (error) {
      res.status(500).json({ "error": error.message });
  }
};

const Salon = require('../../models/salonModel');

exports.getCoursesForDocente = async (req, res) => {
  try {
    const docenteId = req.session.userId;
    if (!docenteId) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    const cursos = await Salon.find({ docente: docenteId }).populate('docente').lean();
    res.json(cursos);
  } catch (error) {
    console.error('Error obteniendo cursos:', error);
    res.status(500).json({ message: 'Error obteniendo cursos' });
  }
};
