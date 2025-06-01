const express = require('express');
const router = express.Router();
const estudianteController = require('../../controllers/estudiantes/estudianteController');

// Public route to get all estudiantes without authentication
router.get('/', estudianteController.getAllEstudiantes);

module.exports = router;
