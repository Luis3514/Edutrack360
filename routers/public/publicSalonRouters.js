const express = require('express');
const router = express.Router();
const salonController = require('../../controllers/comun/salonController');

// Public route to get salones without authentication
router.get('/', salonController.getPublicSalones);

module.exports = router;
