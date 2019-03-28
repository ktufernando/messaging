const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let messageSchema = new Schema({
    date: {
        type: Date,
        required: [true, 'La fecha es requerida'],
        default: new Date()
    },
    sender: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: [true, 'El sender es requerido']
    },
    receiver: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: [true, 'El receiver es requerido']
    },
    message: {
        type: String, 
        required: [true, 'El mensaje es requerido']
    },
    sent: { type: Boolean, required: true, default: true },
    delivered: { type: Boolean, required: true, default: false },
    seen: { type: Boolean, required: true, default: false },
    parentId: {type: String}

});

module.exports = mongoose.model('Message', messageSchema);
