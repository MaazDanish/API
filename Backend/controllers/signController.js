const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../model/user');

exports.postSignUp = async (req, res, next) => {
    try {

        const { firstName, lastName, email, number, password } = req.body;

        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            res.status(400).json({ error: 'Account already exists. Please Log In' })
        }

        const hash = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            number: number,
            password: hash
        });
        console.log('Successfully posted in db and sign up is done');
        return res.status(200).json(newUser);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server error' });
    }
}

exports.verifyUser = async (req, res, next) => {
    const { userEmail, userPassword } = req.body;
    try {

        console.log('User email:', userEmail);

        const user = await User.findOne({ email: userEmail });

        console.log('User from database:', user);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        console.log('User password from request:', userPassword);
        console.log('User password from database:', user.password);

        const passwordMatch = await bcrypt.compare(userPassword, user.password);

        if (passwordMatch) {
            let token = await jwt.sign({ userId: user.id }, 'secretkey');
            return res.status(200).json({ success: true, message: 'User login successful', token });
        } else {
            return res.status(401).json({ success: false, message: 'Email or Password is incorrect' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error occurred while verifying the user' });
    }
};
