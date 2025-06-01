/*const mongoose=require('mongoose')
const {db}=require('../config')
const connection=mongoose.connect(`mongodb://${db.host}:${db.port}/${db.database}`)

.then(()=>{
console.log('conexion exitosa')
}).catch(()=>{
    console.log('error al conectarse')
})
module.exports=connection       */

const mongoose = require('mongoose');
const { db } = require('../config');

const connectWithRetry = () => {
    return mongoose.connect(db.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Conexión exitosa a MongoDB Atlas');
    })
    .catch((error) => {
        console.error('Error al conectarse a MongoDB Atlas:', error.message);
        console.log('Reintentando conexión en 5 segundos...');
        setTimeout(connectWithRetry, 5000);
    });
};

const connection = connectWithRetry();

module.exports = connection;
