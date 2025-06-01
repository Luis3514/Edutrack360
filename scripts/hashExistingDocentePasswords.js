const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Docente = require('../models/docentes/docenteModel');
const { db } = require('../config');

async function hashPasswords() {
  try {
    await mongoose.connect(db.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const docentes = await Docente.find();
    console.log(`Found ${docentes.length} docentes`);

    for (const docente of docentes) {
      // Check if password is already hashed (bcrypt hashes start with $2)
      if (!docente.password.startsWith('$2')) {
        const hashedPassword = await bcrypt.hash(docente.password, 10);
        docente.password = hashedPassword;
        await docente.save();
        console.log(`Hashed password for docente: ${docente.correo}`);
      } else {
        console.log(`Password already hashed for docente: ${docente.correo}`);
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
