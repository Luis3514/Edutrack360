const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Estudiante = require('../models/estudiantes/estudianteModel');
const { db } = require('../config');

async function hashPasswords() {
  try {
    await mongoose.connect(db.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const estudiantes = await Estudiante.find();
    console.log(`Found ${estudiantes.length} estudiantes`);

    for (const estudiante of estudiantes) {
      // Check if password is already hashed (bcrypt hashes start with $2)
      if (!estudiante.password.startsWith('$2')) {
        const hashedPassword = await bcrypt.hash(estudiante.password, 10);
        estudiante.password = hashedPassword;
        await estudiante.save();
        console.log(`Hashed password for estudiante: ${estudiante.correo}`);
      } else {
        console.log(`Password already hashed for estudiante: ${estudiante.correo}`);
      }
    }

    console.log('Password hashing migration completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error hashing passwords:', error);
    process.exit(1);
  }
}

hashPasswords();
