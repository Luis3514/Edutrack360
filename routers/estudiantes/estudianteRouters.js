const express = require('express');
const router = express.Router();
const userLogin = require('../../middlewares/comun/userLogin');
const tareaRouters = require('./tareaRouters');

// Route to render student dashboard
router.get('/dashboard', userLogin, (req, res) => {
    if (req.session.userRole !== 'Estudiante') {
        return res.status(403).send('Acceso denegado');
    }
    res.render('estudiantes/estudiantes', {
        user: {
            id: req.session.userId,
            role: req.session.userRole,
            email: req.session.email
        }
    });
});

// Mount tarea routers for tasks API
router.use('/tareas', userLogin, tareaRouters);

// Stub route for cursos
router.get('/cursos', userLogin, async (req, res) => {
  try {
    // TODO: Replace with real DB query filtered by logged-in estudiante
    const sampleCursos = [
      { _id: '1', Nombre: 'Matemáticas', bloque: 'A', ubicacion: 'Aula 101', docente: { Nombre: 'Juan', Apellido: 'Perez' } },
      { _id: '2', Nombre: 'Historia', bloque: 'B', ubicacion: 'Aula 102', docente: { Nombre: 'Maria', Apellido: 'Lopez' } }
    ];
    res.json(sampleCursos);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo cursos' });
  }
});

// Stub route for seguimiento academico
const estudianteController = require('../../controllers/estudiantes/estudianteController');

router.get('/seguimiento', userLogin, estudianteController.getSeguimientoData);

// Stub route for asistencia
router.get('/asistencia', userLogin, async (req, res) => {
  try {
    // TODO: Replace with real data
    const sampleAsistencia = [
      { _id: '1', fecha: new Date(), cursoNombre: 'Matemáticas', estado: 'Presente' },
      { _id: '2', fecha: new Date(), cursoNombre: 'Historia', estado: 'Ausente' }
    ];
    res.json(sampleAsistencia);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo asistencia' });
  }
});

module.exports = router;
