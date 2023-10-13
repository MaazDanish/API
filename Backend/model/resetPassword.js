const mongoose = require('mongoose');
const User = require('./user');

const userDataSchema = new mongoose.Schema({
    uuid: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: 'User', 
        required: true,
    }
});

const ForGotPassword = mongoose.model('ForGotPassword', userDataSchema);

module.exports = ForGotPassword;

