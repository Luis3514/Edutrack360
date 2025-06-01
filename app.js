const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');

const docenteRouters = require('./routers/docentes/docenteRouters');
const chatbotController = require('./controllers/chatbotController');


// Importar middlewares
const userLogin = require('./middlewares/comun/userLogin');

// Importar controladores
const loginController = require('./controllers/comun/loginController');

// Importar conexión a la base de datos
const connection = require('./database/connection');

// Configuración del motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para logging
app.use(morgan('dev'));

// Middlewares para procesar solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesión
app.use(session({
    secret: 'EduTrack360_SecretKey_2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Configuración de flash messages
app.use(flash());

// Variables globales para las vistas
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Ruta para la página principal
app.get('/', (req, res) => {
    res.render('comun/index', {
        title: 'EduTrack360',
        message: 'Bienvenido a EduTrack360',
        showMessage: true
    });
});

app.post('/logout', loginController.logout);
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.path}`);
    next();
  });


// Rutas de autenticación
app.get('/login', loginController.showLoginForm);
app.post('/login', loginController.processLogin);

// Rutas del administrador (protegidas por middleware de autenticación)
app.use('/admin', userLogin, require('./routers/administrador/adminRouters'));

// API Routes
app.use('/api/docentes', userLogin, require('./routers/docentes/docenteRouters'));
app.use('/api/estudiantes', userLogin, require('./routers/estudiantes/estudianteRouters'));
app.use('/api/salones', userLogin, require('./routers/comun/salonRouters'));

// Chatbot Routes
app.post('/api/chatbot/send-message', chatbotController.sendMessage);

app.use('/api/public/salones', require('./routers/public/publicSalonRouters'));
app.use('/api/public/estudiantes', require('./routers/public/publicEstudianteRouters'));

// Route for student dashboard
app.use('/estudiante', require('./routers/estudiantes/estudianteRouters'));

// Route for docente dashboard
app.use('/docente', userLogin, docenteRouters);

app.listen(3000, () => {
    console.log('Aplicación con express ejecutándose en el puerto http://localhost:3000');
});
