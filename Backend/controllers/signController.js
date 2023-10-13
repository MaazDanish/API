const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createTransport } = require('nodemailer')
var sib = require("sib-api-v3-sdk");
const { v4: uuidv4 } = require('uuid')
const sequelize = require('../util/database')

const User = require('../model/user');


exports.postSignUp = async (req, res, next) => {
    try {

        const { firstName, lastName, email, number, password } = req.body;

        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            res.status(400).json({ message: 'Account already exists. Please Log In', success: false })
        } else {
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
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server error' });
    }
}

exports.verifyUser = async (req, res, next) => {

    const { userEmail, userPassword } = req.body;

    try {

        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(userPassword, user.password);

        const payload = { userId: user._id };

        if (passwordMatch) {

            let token = jwt.sign(payload, process.env.SECRET_KEY);
            
            return res.status(200).json({ success: true, message: 'User login successful', token: token });
        } else {
            return res.status(401).json({ success: false, message: 'Email or Password is incorrect' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error occurred while verifying the user' });
    }
};

exports.getUserInformation = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'User ID not found in token' });
        }

        const user = await User.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'OK', data: user });
    } catch (error) {

        res.status(500).json({ success: false, message: 'Error occurred while getting user information' });
    }
};

exports.editUser = async (req, res) => {
    try {

        const userId = req.user.userId; // Assuming the user information is stored in the decoded token

        const { newFirstName, newLastName, newEmail, newNumber, newPassword } = req.body;
        // Assuming you have a User model with a findByIdAndUpdate method

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                firstName: newFirstName,
                lastName: newLastName,
                email: newEmail,
                number: newNumber
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating user' });
    }
};
