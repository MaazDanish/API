const { mongoose, connectToMongoDB } = require('../util/database');

const userData = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: {
        type: String,
        required: true
    },
    resetTokenExpiry: {
        type: Date,
        required: true
    }


});

const ResetPassword = mongoose.model('ResetPassword', userData);

module.exports = ResetPassword;