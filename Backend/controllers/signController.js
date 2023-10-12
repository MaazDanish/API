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

        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(userPassword, user.password);
        console.log(user.id,'USER ID ');
        if (passwordMatch) {
            let token = await jwt.sign({ _id: user.id }, 'secretkey');
            console.log('Generated Token:', token);
            return res.status(200).json({ success: true, message: 'User login successful', token:token });
        } else {
            return res.status(401).json({ success: false, message: 'Email or Password is incorrect' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error occurred while verifying the user' });
    }
};

// User infrmation after logging in
// exports.getUserInformation = async (req, res) => {
//     try {
//         const userId = req.user;
//         console.log(userId,'USER ID');
//         const user = await User.findOne({ _id: userId });
//         // console.log(user._id,'id');
//         if (!user) {
//             return res.status(404).send('User not found');
//         }

//         console.log(user);
//         res.status(200).json({ success: true, message: 'OK', data: user })
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ success: false, message: 'Error occured while getting user information' })
//     }
// }
exports.getUserInformation = async (req, res) => {
    try {
      const userId = req.user ? req.user.id : null;
  
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User ID not found in token' });
      }
  
      const user = await User.findOne({ _id: userId });
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      console.log(user);
      res.status(200).json({ success: true, message: 'OK', data: user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error occurred while getting user information' });
    }
  };
  