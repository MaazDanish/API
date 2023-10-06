const bcrypt = require("bcrypt");
const { createTransport } = require('nodemailer')
var sib = require("sib-api-v3-sdk");
const { v4: uuidv4 } = require('uuid')
const fs = require('fs');
const path = require('path')
const sequelize = require('../util/database')

//importing models
const User = require('../model/user');
const forgotPassword = require('../model/resetPassword');


exports.forgotPasswd = async (req, res, next) => {
    try {
        const result = await User.findOne({
            where: {
                email: req.params.email
            }
        })
        console.log(result.id,'TESTING USER ID  in passwod js forgt');
        const uuid = uuidv4();
        // console.log(uuid);
        if (result !== null) {

            const obj = {
                userId: result.id,
                isActive: true,
                uuid: uuid,
            }
            // console.log(obj);
            const forgotResult = await forgotPassword.create(obj);

            const defaultClient = sib.ApiClient.instance;
            const apiKey = defaultClient.authentications['api-key'];
            apiKey.apiKey = process.env.API_KEY;
            // console.log(process.env.API_KEY);
            const transporter = createTransport({
                host: "smtp-relay.brevo.com",
                port: 587,
                auth: {
                    user: "dk599318@gmail.com",
                    pass: process.env.PASS_ID,
                },
            });
            // // 
            const mailOptions = {
                from: 'dk599318@gmail.com',
                to: req.params.email,
                subject: `Your subject`,
                text: `Your reset link is -  http://localhost:4000/password/resetpassword/${uuid}       
        This is valid for 1 time only.`
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    res.status(500).json({ message: ' something went wrong' })
                } else {
                    // console.log('Email sent: ' + info.response);
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
    // console.log(uuidd,'TESTING UUID IN RESET PASSWORD USING PARAMS')

    forgotPassword.findOne({ where: { uuid: uuidd, isActive: true } })
        .then(result => {

            if (result) {
                fs.readFile(path.join(__dirname, '../', '../setPassword.html'), 'utf8', (err, html) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('An error occurred.');
                    } else {
                        // Replace <%= uuidd %> with the actual uuidd value
                        const updatedHtml = html.replace('<%= uuidd %>', uuidd);

                        // Send the HTML content with the form and JavaScript
                        res.send(updatedHtml);
                        //   res.end(updatedHtml)
                    }
                });
            } else {
                res.status(404).json({ message: 'link is not valid', success: false })
            }
        }).catch(err => {
            console.log(err);
            // res.json()
        })
}

exports.changingPasswd = async (req, res, next) => {
    const uuidd = req.body.uuidd;
    const paswd = req.body.password;
    // console.log(uuidd,'TESTING UUID IN CHANGING PASSWORD');
    const t = await sequelize.transaction();
    try {


        const fp = await forgotPassword.findOne({ where: { uuid: uuidd, isActive: true }, transaction: t })

        const user = await User.findOne({ where: { id: fp.userId }, transaction: t });
        console.log(fp.userId,'testing user id in chnaging password of forgot ps -->>>>>>>>>>>>>>>>>>>>')
        await fp.update({ isActive: false }, { transaction: t })

        bcrypt.hash(paswd, 10, async (err, hash) => {
            user.update({ password: hash }, { transaction: t }).then(async result => {
                await t.commit()

                 return res.status(200).json({ message: 'your password is updated , now go to login page and login again', success: 'ok' })

            })
        })
    } catch (err) {
        await t.rollback()
        console.log(err)
        console.log('something went wrong')
        res.status(503).json('got error while updating')
    }


}







