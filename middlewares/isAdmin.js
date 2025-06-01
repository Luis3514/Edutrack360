const isAdmin = (req, res, next) => {
    // Verificar si existe la sesión y si la propiedad userRole es 'Administrador'
    if (req.session && req.session.userRole === 'Administrador') {
        // Si el rol es 'Administrador', permitir el acceso al siguiente middleware o ruta
        next();
    } else {
        // Si el rol no es 'Administrador' o no hay sesión, denegar el acceso con un código de estado 403 (Forbidden)
        return res.status(403).json({ message: 'Acceso no autorizado para administradores' });
    }
};

module.exports = isAdmin;