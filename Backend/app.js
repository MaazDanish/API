const express = require('express');
const cors = require('cors');
require('dotenv').config();
const helmet = require('helmet')
const compression = require('compression')

const app = express();

const { connectToMongoDB } = require('./util/database'); // Adjust the path to your database file

const userRoutes = require('./routes/signRoutes');

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

app.use('/user', userRoutes);

connectToMongoDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log('Server is running on port 4000');
    });
}).catch(error => {
    console.error('Error connecting to MongoDB:', error);
});