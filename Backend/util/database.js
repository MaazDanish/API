const Sequelize = require('sequelize');

const sequelize = new Sequelize('api', 'root', 'maazdanish', { dialect: 'mysql', host: "localhost" });

module.exports = sequelize;