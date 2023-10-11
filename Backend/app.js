const express = require('express');
const cors = require('cors');

const app = express();

const User = require('./model/user');
const connectToMongoDB = require('./util/database');

const userRoutes = require('./routes/signRoutes');


app.use(cors());
app.use(express.json());

app.use('/user', userRoutes);

connectToMongoDB.sync().then(res => {
    app.listen(4000);
}).catch(err => {
    console.log(err);
});