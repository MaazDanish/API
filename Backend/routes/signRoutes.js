const express = require('express');

const router = express.Router();

const controller = require('../controllers/signController');
const authenticateToken = require('../middleware/middle')



router.post('/signup', controller.postSignUp);
router.post('/signin', controller.verifyUser);
router.get('/user_data',authenticateToken,controller.getUserInformation);

module.exports = router;