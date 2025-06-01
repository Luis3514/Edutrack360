const express = require('express');
const router = express.Router();
const tareaController = require('../../controllers/estudiantes/tareaController');
const userLogin = require('../../middlewares/comun/userLogin');

// Get all tasks for logged-in student
router.get('/', userLogin, tareaController.getTasksForStudent);

// Get task details by id
router.get('/:id', userLogin, tareaController.getTaskById);

// Submit task by id
router.post('/:id/submit', userLogin, tareaController.submitTask);

module.exports = router;
