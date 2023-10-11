const mongoose = require('mongoose');

const connectToMongoDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/API');
    console.log('Connected to MongoDB');
  } catch (error) {
    throw new Error(`Unable to connect to MongoDB: ${error.message}`);
  }
};

module.exports = {
  mongoose,
  connectToMongoDB,
};
