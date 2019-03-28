const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let validRoles = {
    values: ['CLIENT_ROLE', 'AGENT_ROLE'],
    message: '{VALUE} no es un rol válido'
};

let Schema = mongoose.Schema;


let userSchema = new Schema({
    name: {
        type: String
    },
    systemId: {
        type: String,
        unique: true,
        required: [true, 'El id del sistema es requerido']
    },
    socketId: {
        type: String,
        required: [true, 'El id de la conexión con el socket es requerido']
    },
    online:{
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: validRoles
    },
    lastConnection: {
        type: Date
    },

});


userSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });


module.exports = mongoose.model('User', userSchema);
