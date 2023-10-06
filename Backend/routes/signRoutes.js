const express = require('express');

const router = express.Router();

const controller = require('../controllers/signController');



router.post('/signUp', controller.postSignUp);
router.post('/signIn', controller.verifyUser);

module.exports = router;