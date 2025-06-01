const Estudiante = require('../../models/estudiantes/estudianteModel');
const estudianteService = require('../../services/estudiantes/estudianteService');

exports.getAllEstudiantes = async (req, res) => {
    try {
        const estudiantes = await estudianteService.getAllEstudiantes();
        res.json(estudiantes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getEstudianteById = async (req, res) => {
    try {
        const estudiante = await estudianteService.getEstudianteById(req.params.id);
        if (!estudiante) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }
        res.json(estudiante);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createEstudiante = async (req, res) => {
    try {
        const estudiante = await estudianteService.createEstudiante(req.body);
        res.status(201).json(estudiante);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateEstudiante = async (req, res) => {
    try {
        const estudiante = await estudianteService.updateEstudiante(req.params.id, req.body);
        if (!estudiante) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }
        res.json(estudiante);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteEstudiante = async (req, res) => {
    try {
        const result = await estudianteService.deleteEstudiante(req.params.id);
        if (!result) {
            return res.status(404).json({ error: 'Estudiante no encontrado' });
        }
        res.json({ message: 'Estudiante eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSeguimientoData = async (req, res) => {
    try {
        const studentId = req.session.userId;
        const rendimiento = await estudianteService.getPerformanceData(studentId);
        const asistencia = await estudianteService.getAttendanceData(studentId);
        res.json({ rendimiento, asistencia });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
