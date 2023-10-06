const express = require('express');

const controller = require('../controller/password');

const route = express.Router();

route.get('/forgotpassword/:email',controller.forgotPasswd)

route.get('/resetpassword/:uuidd',controller.resetPassword)

route.post('/resettingPassword',controller.changingPasswd)


module.exports = route;