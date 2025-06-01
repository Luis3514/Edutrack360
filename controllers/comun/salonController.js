const Salon = require('../../models/salonModel');

// Obtener todos los salones
exports.getSalones = async (req, res) => {
    try {
        const salones = await Salon.find().populate('docente');
        res.json(salones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los salones', error: error.message });
    }
};

// Obtener un salón por ID
exports.getSalonById = async (req, res) => {
    try {
        const salon = await Salon.findById(req.params.id).populate('docente');
        if (!salon) {
            return res.status(404).json({ message: 'Salón no encontrado' });
        }
        res.json(salon);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el salón', error: error.message });
    }
};

// Crear un nuevo salón
exports.createSalon = async (req, res) => {
    try {
        const salon = new Salon(req.body);
        await salon.validate(); // Validar contra el schema
        const nuevoSalon = await salon.save();
        res.status(201).json(nuevoSalon);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Error de validación', error: error.message });
        }
        res.status(500).json({ message: 'Error al crear el salón', error: error.message });
    }
};

// Actualizar un salón
exports.updateSalon = async (req, res) => {
    try {
        const salon = await Salon.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!salon) {
            return res.status(404).json({ message: 'Salón no encontrado' });
        }
        res.json(salon);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Error de validación', error: error.message });
        }
        res.status(500).json({ message: 'Error al actualizar el salón', error: error.message });
    }
};

exports.deleteSalon = async (req, res) => {
    try {
        const salon = await Salon.findByIdAndDelete(req.params.id);
        if (!salon) {
            return res.status(404).json({ message: 'Salón no encontrado' });
        }
        res.json({ message: 'Salón eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el salón', error: error.message });
    }
};

exports.getPublicSalones = async (req, res) => {
    try {
        const salones = await Salon.find()
            .populate('docente', 'nombre apellido')
            .populate('alumnos', 'nombre apellidos')
            .lean();

        res.status(200).json(salones);
    } catch (error) {
        console.error('Error obteniendo salones públicos:', error);
        res.status(500).json({ message: 'Error interno al obtener salones públicos.' });
    }
};
