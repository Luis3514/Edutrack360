const Docente = require('../../models/docentes/docenteModel')

class DocenteService {
    constructor() {}

    async getAll() {
        const docentes = await Docente.find({})
        return docentes
    }

    async filterById(id) {
        const docente = await Docente.findById(id) 
        return docente
    }

    // Nueva función para filtrar docentes
    async filterByParams(filters) {
        const query = {};

        if (filters.nombre) {
            query.nombre = { $regex: filters.nombre, $options: 'i' }; // Búsqueda insensible a mayúsculas/minúsculas
        }

        if (filters.apellido) {
            query.apellido = { $regex: filters.apellido, $options: 'i' };
        }

        if (filters.estado) {
            query.estado = filters.estado === '1' ? 'Activo' : 'Inactivo';
        }

        if (filters.grado_academico) {
            query.grado_academico = filters.grado_academico;
        }

        if (filters.materia) {
            query.materia = { $regex: filters.materia, $options: 'i' };
        }

        if (filters.salon_asignado) {
            query.salon_asignado = { $regex: filters.salon_asignado, $options: 'i' };
        }

    

        const docentes = await Docente.find(query);
        return docentes;
    }

    async update(id, data) {
        return await Docente.findByIdAndUpdate(id, data, { new: true })
    }

    async delete(id) {
        return await Docente.deleteOne({ _id: id })
    }

    async create(data) {
        const docente = new Docente(data)
        return await docente.save()
    }
}

module.exports = DocenteService
