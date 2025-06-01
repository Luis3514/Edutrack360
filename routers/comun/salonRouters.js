const express = require('express');
const router = express.Router();
const salonController = require('../../controllers/comun/salonController');

// Rutas CRUD para salones
router.get('/', salonController.getSalones);
router.get('/:id', salonController.getSalonById);
router.post('/', salonController.createSalon);
router.put('/:id', salonController.updateSalon);
router.delete('/:id', salonController.deleteSalon);

module.exports = router;
