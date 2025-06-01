
const Admin = require('../../models/administrador/adminModel');
const Estudiante = require('../../models/estudiantes/estudianteModel');
const Docente = require('../../models/docentes/docenteModel');
const bcrypt = require('bcrypt');

exports.showLoginForm = (req, res) => {
    if (req.session && req.session.userId) {
        // User already logged in, redirect to their dashboard
        const role = req.session.userRole || 'comun';
        const redirectUrl = role === 'Administrador' ? '/admin' : `/${role.toLowerCase()}/dashboard`;
        return res.redirect(redirectUrl);
    }
    console.log('Renderizando el formulario de inicio de sesión.');
    res.render('comun/login');
};

exports.logout = (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.error('Error al cerrar sesión:', err);
                return res.status(500).send('Error al cerrar sesión');
            }
            res.clearCookie('connect.sid');
            res.redirect('/login');
        });
    } else {
        res.redirect('/login');
    }
};

exports.processLogin = async (req, res) => {
    const { email, password, userRole } = req.body;
    let user;
    let errorMessage = 'Credenciales inválidas.';

    console.log('Intento de inicio de sesión para:', userRole, 'con email:', email);

    try {
        switch (userRole) {
            case 'Administrador':
                console.log('Buscando administrador con email:', email);
                user = await Admin.findOne({ correo: email });
                break;
            case 'Estudiante':
                console.log('Buscando estudiante con email:', email);
                user = await Estudiante.findOne({ correo: email });
                break;
            case 'Docente':
                console.log('Buscando docente con email:', email);
                user = await Docente.findOne({ correo: email });
                break;
            default:
                console.log('Rol de usuario inválido:', userRole);
                return res.status(400).send('Rol de usuario inválido.');
        }

        console.log('Usuario encontrado (antes de comparar contraseña):', user);

        if (!user) {
            console.log('Usuario no encontrado para el email:', email, 'y rol:', userRole);
            return res.render('comun/login', { errorMessage });
        }

        console.log('Contraseña ingresada:', password);
        console.log('Contraseña hash almacenada:', user.password);

        const isPasswordValid = await bcrypt.compare(password, user.password); 
        console.log('Resultado de la comparación de contraseñas:', isPasswordValid);

        if (isPasswordValid) {
            req.session.userId = user._id;
            req.session.userRole = userRole;
            req.session.email = user.correo;  // Set email in session for rendering views
            let redirectUrl = `/${userRole.toLowerCase()}/dashboard`; 

            if (userRole === 'Administrador') {
                redirectUrl = '/admin';  
            }

            console.log('Inicio de sesión exitoso para', userRole, 'con ID:', user._id, '. Redirigiendo a:', redirectUrl);
            return res.redirect(redirectUrl);
        } else {
            console.log('Contraseña incorrecta para el usuario:', email, 'y rol:', userRole);
            return res.render('comun/login', { errorMessage });
        }
    } catch (error) {
        console.error("Error durante el inicio de sesión:", error);
        errorMessage = 'Ocurrió un error durante el inicio de sesión.';
        return res.render('comun/login', { errorMessage });
    }
};