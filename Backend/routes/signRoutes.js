const express = require('express');

const router = express.Router();

const controller = require('../controllers/signController');
const authenticateToken = require('../middleware/middle')



router.post('/signup', controller.postSignUp);
router.post('/signin', controller.verifyUser);
router.get('/user_data',authenticateToken,controller.getUserInformation);
router.patch('/edit-data',authenticateToken,controller.editUser);
router.post('/forgot-password',controller.forgotPassword);
router.post('/reset-password',controller.resetPassword);


module.exports = router;