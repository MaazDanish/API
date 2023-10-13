const bcrypt = require("bcrypt");
require('dotenv').config();
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport');
var sib = require("sib-api-v3-sdk");
const { v4: uuidv4 } = require('uuid')
const fs = require('fs');
const path = require('path');


//importing models
const User = require('../model/user');
const forGotPassword = require('../model/resetPassword');


exports.forgotPasswd = async (req, res, next) => {
    const { email } = req.params;
    try {
        const result = await User.findOne({ email });

        const uuid = uuidv4();
        console.log(uuid, 'uuid testing ->>>>>>>>> in 20 ');
        if (result !== null) {

            const obj = {
                userId: result.id,
                isActive: true,
                uuid: uuid,
            }
            const forgotResult = await forGotPassword.create(obj);

            const defaultClient = sib.ApiClient.instance;
            const apiKey = defaultClient.authentications['api-key'];
            apiKey.apiKey = process.env.API_KEY;

            const transporter = nodemailer.createTransport(smtpTransport({
                host: "smtp-relay.brevo.com",
                port: 587,
                auth: {
                    user: "dk599318@gmail.com",
                    pass: process.env.PASS_ID,
                },
            }));

            const mailOptions = {
                from: 'dk599318@gmail.com',
                to: req.params.email,
                subject: `Your subject`,
                text: `Your reset link is -  http://localhost:4000/user/password/resetpassword/${uuid}       
        This is valid for 1 time only.`
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    res.status(500).json({ message: ' something went wrong' })
                } else {
                    console.log('Email sent: ' + info.response);
                    res.json({ message: "A reset link send to your email id", success: true, msg: 'ok' })
                }
            });
        }
        else {
            res.json({ message: "Invalid email id", status: 501 });
        }
    } catch (error) {
        console.log(error);
    }
}

exports.resetPassword = (req, res, next) => {

    const uuidd = req.params.uuidd;

    forGotPassword.findOne({ uuid: uuidd, isActive: true })
        .then(result => {

            if (result) {
                fs.readFile(path.join(__dirname, '../', '../setPassword.html'), 'utf8', (err, html) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('An error occurred.');
                    } else {
                        const updatedHtml = html.replace('<%= uuidd %>', uuidd);

                        res.send(updatedHtml);
                    }
                });
            } else {
                res.status(404).json({ message: 'link is not valid', success: false })
            }
        }).catch(err => {
            console.log(err);
        })
}

exports.changingPasswd = async (req, res, next) => {
    const uuidd = req.body.uuidd;
    const paswd = req.body.password;

    try {
        const fp = await forGotPassword.findOne({ uuid: uuidd, isActive: true });
        const user = await User.findById(fp.userId);

        await fp.updateOne({ isActive: false });

        bcrypt.hash(paswd, 10, async (err, hash) => {
            await user.updateOne({ password: hash });
            res.status(200).json({ message: 'Your password is updated, now go to the login page and login again', success: 'ok' });
        });
    } catch (err) {
        console.log(err);
        res.status(503).json({ message: 'Got an error while updating', success: false });
    }
};






