const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization;

    jwt.verify(token, 'secretkey', function (err, decoded) {
        if (err) {
            console.log(err);
        }
        req.user = decoded;
        next();
    })

};

module.exports = authenticateToken;
