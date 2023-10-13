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
            res.status(400).json({ error: 'Account already exists. Please Log In' })
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
        console.log(user.id, 'USER ID IN 47 LINE OF VERIFY USER');
        const payload = { userId: user._id };
        if (passwordMatch) {
            let token = await jwt.sign(payload, 'secretkey');
            console.log('Generated Token:', token);
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

// editing infromation
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

// Forgot password function
exports.forgotPassword = async (req, res) => {
    const { userEmail } = req.body;

    try {
        // Check if the user exists with the provided email



        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found with this email' });
        }

        const API_KEY = process.env.SENDINBLUE_API_KEY;
        console.log(API_KEY, ' API KEY  --- >>>>>>>>>>');
        const pass_id = process.env.SENDINBLUE_PASS_ID;
        console.log(pass_id, ' PASS ID ');


        const sendinblue = new SibApiV3Sdk.TransactionalEmailsApi();
        sendinblue.setApiKey(SibApiV3Sdk.ApiKeyAuth.fromValue('API_KEY'));


        // Generate a unique token for password reset
        const resetToken = uuidv4();
        console.log(resetToken, 'TESTING RESET TOKEN IN 132 -->>>>>>>');

        // Save the reset token and expiration time to the user in the database
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000; // Set to expire in 1 hour
        await user.save();

        // Send an email to the user with a link containing the reset token
        const resetLink = `http://localhost:4000/user/reset-password?token=${resetToken}`;

        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail({
            to: [{ email: user.email }],
            templateId: pass_id,
            params: { resetLink: resetLink },
        });

        await sendinblue.sendTransacEmail(sendSmtpEmail);

        res.status(200).json({ success: true, message: 'Password reset email sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error sending password reset email' });
    }
};
// reset password

exports.resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;

    try {
        // Find the user with the provided reset token and ensure it's not expired
        const user = await User.findOne({
            resetToken: resetToken,
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }

        // Update the user's password and clear the reset token fields
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error resetting password' });
    }
};
