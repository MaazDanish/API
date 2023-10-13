const express = require('express');

const router = express.Router();

const controller = require('../controllers/signController');
const RPcontroller = require('../controllers/resetPassword')
const authenticateToken = require('../middleware/middle')



router.post('/signup', controller.postSignUp);
router.post('/signin', controller.verifyUser);
router.get('/user_data',authenticateToken,controller.getUserInformation);
router.patch('/edit-data',authenticateToken,controller.editUser);

router.get('/password/forgotpassword/:email',RPcontroller.forgotPasswd)

router.get('/password/resetpassword/:uuidd',RPcontroller.resetPassword)

router.post('/password/resettingPassword',RPcontroller.changingPasswd)


module.exports = router;