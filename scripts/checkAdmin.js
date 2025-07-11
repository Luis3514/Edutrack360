const mongoose = require('mongoose');
const Admin = require('../models/adminModel');

mongoose.connect('mongodb+srv://usuario:123@cluster0.odwwqtn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Conexión exitosa a MongoDB Atlas');
    
    try {
        // Buscar el administrador
        const admin = await Admin.findOne({ correo: 'admin@edutrack360.com' });
        
        if (admin) {
            console.log('Administrador encontrado:');
            console.log('ID:', admin._id);
            console.log('Correo:', admin.correo);
            console.log('Contraseña:', admin.password);
            console.log('Nombre:', admin.nombre);
            console.log('Apellido:', admin.apellido);
        } else {
            console.log('No se encontró el administrador');
        }
    } catch (error) {
        console.error('Error al buscar el administrador:', error);
    } finally {
        mongoose.connection.close();
    }
}).catch(err => {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
});
