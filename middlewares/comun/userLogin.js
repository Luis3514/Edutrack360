const Admin = require('../../models/administrador/adminModel');
const Estudiante = require('../../models/estudiantes/estudianteModel');
const Docente = require('../../models/docentes/docenteModel');

module.exports = async (req, res, next) => {
    // If request is for API route, respond with JSON error instead of redirect
    const isApiRequest = req.originalUrl.startsWith('/api/');
    if (!req.session.userId) {
        console.log('No hay sesión activa.');
        if (isApiRequest) {
            return res.status(401).json({ error: 'No autenticado' });
        } else {
            return res.redirect('/login');
        }
    }

    try {
        let user;
        switch (req.session.userRole) {
            case 'Administrador':
                user = await Admin.findById(req.session.userId);
                break;
            case 'Estudiante':
                user = await Estudiante.findById(req.session.userId);
                break;
            case 'Docente':
                user = await Docente.findById(req.session.userId);
                break;
            default:
                console.log('Rol de usuario inválido:', req.session.userRole);
                if (isApiRequest) {
                    return res.status(403).json({ error: 'Rol inválido' });
                } else {
                    return res.redirect('/login');
                }
        }

        if (!user) {
            console.log('Usuario no encontrado en la base de datos.');
            if (isApiRequest) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            } else {
                return res.redirect('/login');
            }
        }

        // Agregar información del usuario a la solicitud
        req.user = user;
        next();
    } catch (error) {
        console.error('Error en middleware de autenticación:', error);
        if (isApiRequest) {
            res.status(500).json({ error: 'Error interno del servidor' });
        } else {
            res.redirect('/login');
        }
    }
};
