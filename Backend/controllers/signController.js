const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../model/user');

exports.postSignUp = (req, res, next) => {
    const { name, email, password } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        User.create({
            name: name,
            email: email,
            password: hash
        }).then(data => {
            console.log('Successfully posted in db and sign up is done');
            return res.json(data);
        }).catch(err => console.log(err));
    })
}

exports.verifyUser = async (req, res, next) => {
    const { userEmail, userPassword } = req.body;
    User.findOne({ where: { email: userEmail } })
        .then(user => {
            if (user !== null) {
                bcrypt.compare(userPassword, user.password, async function (err, result) {
                    if (result == true) {
                        let token = await jwt.sign(user.id, 'secretkey')
                        return res.json({ success: true, msg: 'User login successful' })
                    }
                    else {
                        res.status(401).json({ success: false, msg: 'User not authorized' })
                    }
                })
            } else {
                res.status(404).json({ success: false, msg: 'User not found' })
            }
        })
        .catch(err => {
            res.status(500).json({ success: false, msg: 'Error occured while verifying the user' })
        })
}