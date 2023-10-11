const express = require('express');

const router = express.Router();

const controller = require('../controllers/signController');



router.post('/signup', controller.postSignUp);
router.post('/signin', controller.verifyUser);

module.exports = router;