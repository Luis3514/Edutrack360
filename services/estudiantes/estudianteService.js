const Estudiante = require('../../models/estudiantes/estudianteModel');
const Asistencia = require('../../models/estudiantes/asistenciaModel'); // Assuming this model exists
const Rendimiento = require('../../models/estudiantes/rendimientoModel'); // Assuming this model exists

exports.getAllEstudiantes = async () => {
    try {
        return await Estudiante.find();
    } catch (error) {
        throw new Error('Error al obtener estudiantes: ' + error.message);
    }
};

exports.getEstudianteById = async (id) => {
    try {
        return await Estudiante.findById(id);
    } catch (error) {
        throw new Error('Error al obtener estudiante: ' + error.message);
    }
};

const bcrypt = require('bcrypt');

exports.createEstudiante = async (estudianteData) => {
    try {
        // Hash password before saving
        if (estudianteData.password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(estudianteData.password, saltRounds);
            estudianteData.password = hashedPassword;
        }
        const estudiante = new Estudiante(estudianteData);
        return await estudiante.save();
    } catch (error) {
        throw new Error('Error al crear estudiante: ' + error.message);
    }
};

exports.updateEstudiante = async (id, estudianteData) => {
    try {
        return await Estudiante.findByIdAndUpdate(id, estudianteData, { new: true });
    } catch (error) {
        throw new Error('Error al actualizar estudiante: ' + error.message);
    }
};

exports.deleteEstudiante = async (id) => {
    try {
        return await Estudiante.findByIdAndDelete(id);
    } catch (error) {
        throw new Error('Error al eliminar estudiante: ' + error.message);
    }
};

const Salon = require('../../models/salonModel');

exports.getPerformanceData = async (studentId) => {
    try {
        // Find salons where the student is enrolled
        const salons = await Salon.find({ alumnos: studentId });
        if (!salons || salons.length === 0) {
            return { labels: [], data: [] };
        }
        // For simplicity, group rendimiento by salon bloque or location
        const rendimientoMap = {};
        salons.forEach(salon => {
            const key = salon.bloque || salon.ubicacion || 'Desconocido';
            if (!rendimientoMap[key]) {
                rendimientoMap[key] = [];
            }
            rendimientoMap[key].push(salon.rendimiento || 0);
        });
        const labels = Object.keys(rendimientoMap);
        const data = labels.map(label => {
            const values = rendimientoMap[label];
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            return Math.round(avg);
        });
        return { labels, data };
    } catch (error) {
        throw new Error('Error al obtener datos de rendimiento: ' + error.message);
    }
};

exports.getAttendanceData = async (studentId) => {
    try {
        // No attendance data model found, returning dummy data
        const labels = ['Presente', 'Ausente'];
        const data = [0, 0];
        return { labels, data };
    } catch (error) {
        throw new Error('Error al obtener datos de asistencia: ' + error.message);
    }
};
