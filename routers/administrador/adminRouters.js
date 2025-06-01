const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/administrador/adminController');
const userLogin = require('../../middlewares/comun/userLogin'); 


// Servir archivos estáticos
router.use('/assets', express.static('public/assets'));

// Rutas para las vistas
router.get('/', (req, res) => res.redirect('/admin/dashboard'));
router.get('/dashboard', adminController.renderAdminDashboard);
router.get('/salones', userLogin, adminController.renderAdminDashboard);
router.get('/estudiantes', userLogin, adminController.renderAdminDashboard);
router.get('/docentes', userLogin, adminController.renderAdminDashboard);

// Rutas para salones
router.get('/api/salones', userLogin, adminController.getAllSalones);
router.post('/api/salones', userLogin, adminController.createSalon);
router.get('/api/salones/:id', userLogin, adminController.getSalonById);
router.put('/api/salones/:id', userLogin, adminController.updateSalon);
router.delete('/api/salones/:id', userLogin, adminController.deleteSalon);
router.get('/api/salones/rendimiento', userLogin, adminController.getSalonesRendimiento);

// Rutas para la asignación de docentes y estudiantes a salones
router.post('/api/salones/:id/docente', userLogin, adminController.assignOrUnassignDocente);
router.post('/api/salones/:id/estudiantes', userLogin, adminController.assignEstudianteToSalon);
router.delete('/api/salones/:id/estudiantes/:estudianteId', userLogin, adminController.unassignEstudianteFromSalon);

// Rutas para estudiantes
router.get('/api/estudiantes', userLogin, adminController.getAllEstudiantes);
router.get('/api/estudiantes/disponibles', userLogin, adminController.getAvailableEstudiantes);
router.post('/api/estudiantes', userLogin, adminController.createEstudiante);
router.get('/api/estudiantes/:id', userLogin, adminController.getEstudianteById);
router.put('/api/estudiantes/:id', userLogin, adminController.updateEstudiante);

module.exports = router;