const Salon = require('../../models/salonModel');
const Docente = require('../../models/docentes/docenteModel');
const Estudiante = require('../../models/estudiantes/estudianteModel');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// --- Renderizado Vistas ---
exports.renderAdminDashboard = async (req, res) => {
    try {
        // Obtener la sección activa de la URL
        const path = req.path;
        let activeSection = 'dashboard';

        if (path.includes('/salones')) {
            activeSection = 'salones';
        } else if (path.includes('/estudiantes')) {
            activeSection = 'estudiantes';
        } else if (path.includes('/docentes')) {
            activeSection = 'docentes';
        }

        // Fetch data from DB
        const salones = await Salon.find().lean();
        const estudiantes = await Estudiante.find().lean();
        const docentes = await Docente.find().lean();

        // Calculate statistics
        const totalSalones = salones.length;
        const totalEstudiantes = estudiantes.length;
        const averageRendimiento = salones.reduce((acc, s) => acc + (s.rendimiento || 0), 0) / (totalSalones || 1);
        const totalCapacity = salones.reduce((acc, s) => acc + (s.capacidad || 0), 0);
        const totalAlumnos = salones.reduce((acc, s) => acc + (s.alumnos ? s.alumnos.length : 0), 0);
        const occupancy = totalCapacity ? (totalAlumnos / totalCapacity) * 100 : 0;

        // Renderizar la vista con la sección activa, datos y estadísticas
        res.render('administrador/administrador', {
            activeSection,
            user: {
                role: req.session.userRole,
                email: req.session.email,
                name: req.session.userName || 'Usuario'
            },
            salones,
            estudiantes,
            docentes,
            totalSalones,
            totalEstudiantes,
            averageRendimiento,
            occupancy
        });
    } catch (error) {
        console.error("Error al renderizar el dashboard:", error);
        res.status(500).send("Error interno del servidor.");
    }
};

// --- API Salones ---
exports.getAllSalones = async (req, res) => {
    try {
        const salones = await Salon.find()
            .populate('docente', 'nombre apellido')
            .populate('alumnos', 'nombre apellidos')
            .lean();

        res.status(200).json(salones);
    } catch (error) {
        console.error('Error obteniendo salones:', error);
        res.status(500).json({ message: 'Error interno al obtener salones.' });
    }
};

exports.getSalonById = async (req, res) => {
    try {
        const salon = await Salon.findById(req.params.id)
            .populate('docente', 'nombre apellido')
            .populate('alumnos', 'nombre apellidos');

        if (!salon) {
            return res.status(404).json({ message: 'Salón no encontrado.' });
        }

        res.json(salon);
    } catch (error) {
        console.error('Error obteniendo salón:', error);
        res.status(500).json({ message: 'Error interno al obtener salón.' });
    }
};

exports.createSalon = async (req, res) => {
    try {
        const { nombre, capacidad, bloque, ubicacion } = req.body;

        if (!nombre || !capacidad || !bloque || !ubicacion) {
            return res.status(400).json({ message: 'Todos los campos son requeridos.' });
        }

        const salon = new Salon({
            nombre,
            capacidad: parseInt(capacidad),
            bloque,
            ubicacion
        });

        await salon.save();
        res.status(201).json({ message: 'Salón creado exitosamente.', salon });
    } catch (error) {
        console.error('Error creando salón:', error);
        res.status(500).json({ message: 'Error interno al crear salón.' });
    }
};

exports.updateSalon = async (req, res) => {
    try {
        const { nombre, capacidad, bloque, ubicacion } = req.body;

        if (!nombre || !capacidad || !bloque || !ubicacion) {
            return res.status(400).json({ message: 'Todos los campos son requeridos.' });
        }

        const salon = await Salon.findByIdAndUpdate(
            req.params.id,
            {
                nombre,
                capacidad: parseInt(capacidad),
                bloque,
                ubicacion
            },
            { new: true }
        );

        if (!salon) {
            return res.status(404).json({ message: 'Salón no encontrado.' });
        }

        res.json({ message: 'Salón actualizado exitosamente.', salon });
    } catch (error) {
        console.error('Error actualizando salón:', error);
        res.status(500).json({ message: 'Error interno al actualizar salón.' });
    }
};

exports.deleteSalon = async (req, res) => {
    try {
        const salon = await Salon.findByIdAndDelete(req.params.id);

        if (!salon) {
            return res.status(404).json({ message: 'Salón no encontrado.' });
        }

        res.json({ message: 'Salón eliminado exitosamente.' });
    } catch (error) {
        console.error('Error eliminando salón:', error);
        res.status(500).json({ message: 'Error interno al eliminar salón.' });
    }
};

exports.getSalonesRendimiento = async (req, res) => {
    try {
        const salones = await Salon.find().select('nombre rendimiento').lean();
        res.json({
            labels: salones.map(s => s.nombre),
            data: salones.map(s => s.rendimiento || 0)
        });
    } catch (error) {
        console.error('Error obteniendo rendimiento de salones:', error);
        res.status(500).json({ message: 'Error interno al obtener rendimiento.' });
    }
};

// --- API Docentes ---
exports.getAllDocentes = async (req, res) => {
    try {
        const docentes = await Docente.find().lean();
        res.json(docentes);
    } catch (error) {
        console.error('Error obteniendo docentes:', error);
        res.status(500).json({ message: 'Error interno al obtener docentes.' });
    }
};

exports.getDocenteById = async (req, res) => {
    try {
        const docente = await Docente.findById(req.params.id);
        if (!docente) {
            return res.status(404).json({ message: 'Docente no encontrado.' });
        }
        res.json(docente);
    } catch (error) {
        console.error('Error obteniendo docente:', error);
        res.status(500).json({ message: 'Error interno al obtener docente.' });
    }
};

exports.createDocente = async (req, res) => {
    try {
        const { nombre, apellido, email, password } = req.body;

        if (!nombre || !apellido || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos son requeridos.' });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const docente = new Docente({
            nombre,
            apellido,
            email,
            password: hashedPassword
        });

        await docente.save();
        res.status(201).json({ message: 'Docente creado exitosamente.', docente });
    } catch (error) {
        console.error('Error creando docente:', error);
        res.status(500).json({ message: 'Error interno al crear docente.' });
    }
};

exports.updateDocente = async (req, res) => {
    try {
        const { nombre, apellido, email } = req.body;

        if (!nombre || !apellido || !email) {
            return res.status(400).json({ message: 'Todos los campos son requeridos.' });
        }

        const docente = await Docente.findByIdAndUpdate(
            req.params.id,
            { nombre, apellido, email },
            { new: true }
        );

        if (!docente) {
            return res.status(404).json({ message: 'Docente no encontrado.' });
        }

        res.json({ message: 'Docente actualizado exitosamente.', docente });
    } catch (error) {
        console.error('Error actualizando docente:', error);
        res.status(500).json({ message: 'Error interno al actualizar docente.' });
    }
};

exports.deleteDocente = async (req, res) => {
    try {
        const docente = await Docente.findByIdAndDelete(req.params.id);

        if (!docente) {
            return res.status(404).json({ message: 'Docente no encontrado.' });
        }

        res.json({ message: 'Docente eliminado exitosamente.' });
    } catch (error) {
        console.error('Error eliminando docente:', error);
        res.status(500).json({ message: 'Error interno al eliminar docente.' });
    }
};

// --- API Estudiantes ---
exports.getAllEstudiantes = async (req, res) => {
    try {
        const estudiantes = await Estudiante.find().lean();
        res.json(estudiantes);
    } catch (error) {
        console.error('Error obteniendo estudiantes:', error);
        res.status(500).json({ message: 'Error interno al obtener estudiantes.' });
    }
};

exports.getEstudianteById = async (req, res) => {
    try {
        const estudiante = await Estudiante.findById(req.params.id);
        if (!estudiante) {
            return res.status(404).json({ message: 'Estudiante no encontrado.' });
        }
        res.json(estudiante);
    } catch (error) {
        console.error('Error obteniendo estudiante:', error);
        res.status(500).json({ message: 'Error interno al obtener estudiante.' });
    }
};

exports.createEstudiante = async (req, res) => {
    try {
        const { nombre, apellidos, email, password } = req.body;

        if (!nombre || !apellidos || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos son requeridos.' });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const estudiante = new Estudiante({
            nombre,
            apellidos,
            email,
            password: hashedPassword
        });

        await estudiante.save();
        res.status(201).json({ message: 'Estudiante creado exitosamente.', estudiante });
    } catch (error) {
        console.error('Error creando estudiante:', error);
        res.status(500).json({ message: 'Error interno al crear estudiante.' });
    }
};

exports.updateEstudiante = async (req, res) => {
    try {
        const { nombre, apellidos, email } = req.body;

        if (!nombre || !apellidos || !email) {
            return res.status(400).json({ message: 'Todos los campos son requeridos.' });
        }

        const estudiante = await Estudiante.findByIdAndUpdate(
            req.params.id,
            { nombre, apellidos, email },
            { new: true }
        );

        if (!estudiante) {
            return res.status(404).json({ message: 'Estudiante no encontrado.' });
        }

        res.json({ message: 'Estudiante actualizado exitosamente.', estudiante });
    } catch (error) {
        console.error('Error actualizando estudiante:', error);
        res.status(500).json({ message: 'Error interno al actualizar estudiante.' });
    }
};

exports.deleteEstudiante = async (req, res) => {
    try {
        const estudiante = await Estudiante.findByIdAndDelete(req.params.id);

        if (!estudiante) {
            return res.status(404).json({ message: 'Estudiante no encontrado.' });
        }

        res.json({ message: 'Estudiante eliminado exitosamente.' });
    } catch (error) {
        console.error('Error eliminando estudiante:', error);
        res.status(500).json({ message: 'Error interno al eliminar estudiante.' });
    }
};

// --- API Asignaciones ---
exports.assignOrUnassignDocente = async (req, res) => {
    try {
        const { salonId, docenteId } = req.body;

        if (!salonId || !docenteId) {
            return res.status(400).json({ message: 'Se requiere el ID del salón y del docente.' });
        }

        const salon = await Salon.findById(salonId);
        if (!salon) {
            return res.status(404).json({ message: 'Salón no encontrado.' });
        }

        const docente = await Docente.findById(docenteId);
        if (!docente) {
            return res.status(404).json({ message: 'Docente no encontrado.' });
        }

        salon.docente = salon.docente && salon.docente.equals(docenteId) ? null : docenteId;
        await salon.save();

        res.json({
            message: salon.docente ? 'Docente asignado exitosamente.' : 'Docente desasignado exitosamente.',
            salon
        });
    } catch (error) {
        console.error('Error en la asignación/desasignación de docente:', error);
        res.status(500).json({ message: 'Error interno en la operación.' });
    }
};

exports.assignEstudianteToSalon = async (req, res) => {
    try {
        const { salonId, estudianteId } = req.body;

        if (!salonId || !estudianteId) {
            return res.status(400).json({ message: 'Se requiere el ID del salón y del estudiante.' });
        }

        const salon = await Salon.findById(salonId);
        if (!salon) {
            return res.status(404).json({ message: 'Salón no encontrado.' });
        }

        const estudiante = await Estudiante.findById(estudianteId);
        if (!estudiante) {
            return res.status(404).json({ message: 'Estudiante no encontrado.' });
        }

        if (salon.alumnos.includes(estudianteId)) {
            return res.status(400).json({ message: 'El estudiante ya está asignado a este salón.' });
        }

        salon.alumnos.push(estudianteId);
        await salon.save();

        res.json({ message: 'Estudiante asignado exitosamente.', salon });
    } catch (error) {
        console.error('Error asignando estudiante:', error);
        res.status(500).json({ message: 'Error interno al asignar estudiante.' });
    }
};

exports.unassignEstudianteFromSalon = async (req, res) => {
    try {
        const { salonId, estudianteId } = req.params;

        const salon = await Salon.findById(salonId);
        if (!salon) {
            return res.status(404).json({ message: 'Salón no encontrado.' });
        }

        const estudianteIndex = salon.alumnos.indexOf(estudianteId);
        if (estudianteIndex === -1) {
            return res.status(400).json({ message: 'El estudiante no está asignado a este salón.' });
        }

        salon.alumnos.splice(estudianteIndex, 1);
        await salon.save();

        res.json({ message: 'Estudiante desasignado exitosamente.', salon });
    } catch (error) {
        console.error('Error desasignando estudiante:', error);
        res.status(500).json({ message: 'Error interno al desasignar estudiante.' });
    }
};

exports.getAvailableEstudiantes = async (req, res) => {
    try {
        const salon = await Salon.findById(req.query.salonId);
        if (!salon) {
            return res.status(404).json({ message: 'Salón no encontrado.' });
        }

        const estudiantes = await Estudiante.find({
            _id: { $nin: salon.alumnos }
        }).lean();

        res.json(estudiantes);
    } catch (error) {
        console.error('Error obteniendo estudiantes disponibles:', error);
        res.status(500).json({ message: 'Error interno al obtener estudiantes disponibles.' });
    }
};
