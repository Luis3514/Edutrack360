const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('../models/adminModel');

// Conectar a MongoDB
mongoose.connect('mongodb+srv://perodrigoalonso:123@edutrack360.l3yhxcf.mongodb.net/edutrack360?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Conexión exitosa a MongoDB Atlas');
}).catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
});

// Datos del administrador
const adminData = {
    nombre: 'Admin',
    apellido: 'Principal',
    correo: 'admin@edutrack360.com',
    password: 'admin123',
    telefono: '123456789',
    direccion: 'Dirección Principal'
};

// Crear el administrador
async function createAdmin() {
    try {
        // Verificar si ya existe un admin con ese correo
        const existingAdmin = await Admin.findOne({ correo: adminData.correo });
        if (existingAdmin) {
            console.log('Ya existe un administrador con ese correo.');
            process.exit(0);
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        adminData.password = hashedPassword;

        // Crear el nuevo administrador
        const admin = new Admin(adminData);
        await admin.save();

        console.log('Administrador creado exitosamente.');
        console.log('Correo:', adminData.correo);
        console.log('Contraseña:', 'admin123');
    } catch (error) {
        console.error('Error al crear el administrador:', error);
    } finally {
        mongoose.connection.close();
    }
}

createAdmin();
