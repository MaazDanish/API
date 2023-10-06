const express = require('express');
const cors = require('cors');

const app = express();

const User = require('./model/user');
const forgotPassword = require('./model/resetPassword');
const sequelize = require('./util/database');

const userRoutes = require('./routes/signRoutes');
const forgptPasswordRoutes = require('./routes/resetPassword');

app.use(cors());
app.use(express.json());

app.use('/user', userRoutes);
app.use('/password', forgptPasswordRoutes);



User.hasMany(forgotPassword);
forgotPassword.belongsTo(User);

sequelize.sync().then(res => {
    app.listen(4000);
}).catch(err => {
    console.log(err);
});