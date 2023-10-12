const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization;

    jwt.verify(token,'secretkey',(err,encrypt) => {
        if(err){
            res.status(500).json({success:false});
        }
        req.user = encrypt;
        // console.log('RED.ID IN AUTH ',req.id);
        // console.log(typeof(req.id));
        // console.log(req.id,'ID IN AUTH JS ');
        next();
    })
};

module.exports = authenticateToken;
