const express = require('express');
const router = express.Router();
const userLogin = require('../../middlewares/comun/userLogin');
const docenteController = require('../../controllers/docentes/docenteController');

// Route to render docente dashboard
router.get('/dashboard', userLogin, (req, res) => {
if (req.session.userRole !== 'Docente') {
return res.status(403).send('Acceso denegado');
}
res.render('docentes/docentes', {
user: {
id: req.session.userId,
role: req.session.userRole,
email: req.session.email
}
});
});

// API route to get courses for logged-in docente
router.get('/cursos', userLogin, docenteController.getCoursesForDocente);

// Add route to get all docentes
router.get('/', userLogin, docenteController.getAllDocentes);

// Add route to create docente
router.post('/', userLogin, docenteController.createDocente);

const salonController = require('../../controllers/comun/salonController');

const Salon = require('../../models/salonModel');

// Get all cursos for logged-in docente
router.get('/cursos/all', userLogin, async (req, res) => {
  try {
    const docenteId = req.session.userId;
    const cursos = await Salon.find({ docente: docenteId }).populate('docente').lean();
    res.json(cursos);
  } catch (error) {
    console.error('Error obteniendo cursos:', error);
    res.status(500).json({ message: 'Error obteniendo cursos', error: error.message });
  }
});

// Get curso by id
router.get('/cursos/:id', userLogin, salonController.getSalonById);

// Create curso
router.post('/cursos', userLogin, salonController.createSalon);

// Update curso
router.put('/cursos/:id', userLogin, salonController.updateSalon);

// Delete curso
router.delete('/cursos/:id', userLogin, salonController.deleteSalon);

module.exports = router;
