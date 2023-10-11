const express = require('express');
const cors = require('cors');

const app = express();

const User = require('./model/user');
const { connectToMongoDB, mongoose } = require('./util/database'); // Adjust the path to your database file

const userRoutes = require('./routes/signRoutes');


app.use(cors());
app.use(express.json());

app.use('/user', userRoutes);

connectToMongoDB().then(() => {
    app.listen(4000, () => {
        console.log('Server is running on port 4000');
    });
}).catch(error => {
    console.error('Error connecting to MongoDB:', error);
});